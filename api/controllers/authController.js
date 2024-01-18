const User = require('../models/User')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')

// @desc Sign Up middleware
// @route POST /signup
// @access Public
const signUp = async (req, res, next) => {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
        res.status(400).json('All Fields are required!')
    }

    // Check duplicate username
    const duplicate = await User.findOne({ username })
        .collation({ locale: 'en', strength: 2 })
        .lean().exec()

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate Username!' })
    }

    const hashedPassword = bcryptjs.hashSync(password, 10)
    const newUser = new User({
        username,
        email,
        password: hashedPassword,
    })

    try {
        await newUser.save()
        res.status(201).json('User created successfully!')
    } catch (error) {
        next(error)
    }
}

module.exports = {
    signUp,
}