// Custom Error Handler
const errorHandler = (statusCode, message) => {
    const error = new Error() // Using error constructor
    error.statusCode = statusCode
    error.message = message
    return error
}

module.exports = { errorHandler }