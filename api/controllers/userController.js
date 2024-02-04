const User = require('../models/User')

// @desc Get Users Middleware
// @route GET /
// @access Public
const getUsers = async (req, res, next) => {
    try {
        const users = await User.find({})
        return res.status(200).json(users)
    } catch (error) {
        next(error)
    }
}

module.exports = { getUsers }