require('dotenv').config()
const mongoose = require('mongoose')
const express = require('express')
const connectDB = require('./config/dbConn')
const app = express()

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
    app.listen(PORT, () => console.log(`Server running on port: ${PORT}`))
})

mongoose.connection.on('error', err => {
    console.log(err)
})