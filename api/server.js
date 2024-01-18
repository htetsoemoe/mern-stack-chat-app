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

mongoose.connection.once('open', () => {
    console.log("Connected to MongoDB Atlas")
    app.listen(PORT, () => console.log(`Server running on port: ${PORT}`))
})