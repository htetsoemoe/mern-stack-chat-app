require('dotenv').config()
const mongoose = require('mongoose')
const express = require('express')
const connectDB = require('./config/dbConn')
const app = express()
const ws = require('ws')
const jwt = require('jsonwebtoken')

const jwtSecret = process.env.JWT_SECRETE
const PORT = process.env.PORT || 3500
console.log(process.env.NODE_ENV)
connectDB()

app.use(express.json())
app.use('/chatty/v1/auth', require('./routes/authRoute'))

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

// Create Web Socket Server
const webSocketServer = new ws.WebSocketServer({ server })
webSocketServer.on('connection', (connection, req) => {
    console.log('Connected to Web Socket Server...')
    // connection.send("Hello from client to web socket server!")

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
    connection.on('message', (message) => {
        const messageData = JSON.parse(message.toString())
        const { recipient, text } = messageData
        if (recipient && text) {
            [...webSocketServer.clients]
                .filter(c => c.userId === recipient)
                .forEach(c => c.send(JSON.stringify({text})))
        }
    });

    // all clients of web socket server
    //console.log([...webSocketServer.clients].map(client => client.username))
    [...webSocketServer.clients].forEach(client => {
        client.send(JSON.stringify({
            online: [...webSocketServer.clients].map(c => ({
                userId: c.userId,
                username: c.username
            }))
        }))
    })
})