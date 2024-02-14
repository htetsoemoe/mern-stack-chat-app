require('dotenv').config()
const mongoose = require('mongoose')
const express = require('express')
const connectDB = require('./config/dbConn')
const app = express()
const ws = require('ws')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const Message = require('./models/Message')
const fs = require('fs')
const fsPromises = require('fs').promises
const path = require('path')

const jwtSecret = process.env.JWT_SECRETE
const PORT = process.env.PORT || 3500
console.log(process.env.NODE_ENV)
connectDB()

app.use(express.json())
app.use(cookieParser())
app.use('/api/uploads', express.static(__dirname + '/uploads'))

app.use('/chatty/v1/auth', require('./routes/authRoute'))
app.use('/chatty/v1/message', require('./routes/messageRoute'))
app.use('/chatty/v1/users', require('./routes/userRoute'))

// default error handler middleware
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500
    const message = err.message || 'Internal Server Error'

    return res.status(statusCode).json({
        text: 'default error handler from server.js',
        success: false,
        statusCode,
        message,
    })
})

mongoose.connection.once('open', () => {
    console.log("Connected to MongoDB Atlas")
})

mongoose.connection.on('error', err => {
    console.log(err)
})

let server = app.listen(PORT, () => console.log(`Server running on port: ${PORT}`))

// This is a file upload 
const saveFile = async (userFilePath, filename, bufferData) => {
    try {
        await fsPromises.writeFile(path.join(userFilePath, filename), bufferData)
    } catch (error) {
        console.log(error)
    }
}

// Create Web Socket Server
const webSocketServer = new ws.WebSocketServer({ server })
webSocketServer.on('connection', (connection, req) => {
    console.log('Connected to Web Socket Server...')
    // connection.send("Hello from client to web socket server!")

    // all clients of web socket server
    //console.log([...webSocketServer.clients].map(client => client.username))
    const notifyAboutOnlinePeople = () => {
        [...webSocketServer.clients].forEach(client => {
            client.send(JSON.stringify({
                online: [...webSocketServer.clients].map(c => ({
                    userId: c.userId,
                    username: c.username
                }))
            }))
        })
    }

    connection.isAlive = true

    // to check offline people and terminate the offline people's connection
    connection.timer = setInterval(() => {
        connection.ping()   // client ping to server in every 5 seconds

        connection.deathTimer = setTimeout(() => { // If server cannot respond 'pong'
            connection.isAlive = false
            clearInterval(connection.timer)
            connection.terminate()
            notifyAboutOnlinePeople()
            console.log("Someone is offline")
        }, 1000)

    }, 5000)

    // If server can respond to client 'pong', no need to connection terminate
    connection.on('pong', () => {
        clearTimeout(connection.deathTimer)
    })

    // Get cookie of a specified connection and decode userId and username from cookie
    const cookie = req.headers.cookie
    if (cookie) {
        const tokenCookieString = cookie.split(';').find(str => str.startsWith('token'))
        if (tokenCookieString) {
            const token = tokenCookieString.split('=')[1]
            if (token) {
                jwt.verify(token, jwtSecret, {}, (err, userData) => {
                    if (err) throw err
                    const { userId, username } = userData
                    // set userId and username to a specified connection
                    connection.userId = userId
                    connection.username = username
                })
            }
        }
    }

    // if web socket server is receiving the message from client
    connection.on('message', async (message) => {
        const messageData = JSON.parse(message.toString())
        const { recipient, text, file } = messageData

        let filename = null
        if (file) {
            const parts = file.name.split('.')
            const ext = parts[parts.length - 1] // get file extension
            filename = Date.now() + '.' + ext   // rename file's name
            const userFilePath = __dirname + '/uploads/'
            const bufferData = new Buffer.from(file.data.split(',')[1], 'base64')

            saveFile(userFilePath, filename, bufferData)
            console.log(`File Saved : ${userFilePath}${filename}`)
        }

        if (recipient && (text || file)) {
            // Save Message to MongoDB
            const messageDoc = await Message.create({
                sender: connection.userId,
                recipient,
                text,
                file: file ? filename : null
            });

            [...webSocketServer.clients]
                .filter(c => c.userId === recipient)
                .forEach(c => c.send(JSON.stringify({
                    text,
                    sender: connection.userId,
                    recipient,
                    file: file ? filename : null,
                    id: messageDoc._id
                })))
        }
    });

    // notify everyone about online people (when someone connects)
    notifyAboutOnlinePeople()
})