const jwt = require('jsonwebtoken')
const errorHandler = require('../utils/errorHandler')
const jwtSecret = process.env.JWT_SECRETE

const verifyUserInToken = (req, res, next) => {
   const token = req.cookies.token

   if (!token) return next(errorHandler(401, 'Unauthorized'))

   jwt.verify(token, jwtSecret, (error, userData) => {
    if (error) return next(errorHandler(403, 'Forbidden'))

    console.log(userData)
    req.userData = userData
    next()
   })
}

module.exports = verifyUserInToken