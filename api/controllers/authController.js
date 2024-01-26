const User = require('../models/User')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { errorHandler } = require('../utils/errorHandler')

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

// @desc Sign In middleware
// @route POST /sign-in
// @access Public
const signIn = async (req, res, next) => {
    const { email, password } = req.body

    try {
        const validUser = await User.findOne({ email })
        if (!validUser) return next(errorHandler(404, 'User Not Found')) // this next middleware called and passed 'error' to default error handler middleware of server.js

        const validPassword = bcryptjs.compareSync(password, validUser.password)
        if (!validPassword) return next(errorHandler(401, 'Wrong Password')) // this next middleware called and passed 'error' to default error handler middleware of server.js

        // Generate JWT token
        const token = jwt.sign({ userId: validUser._id, username: validUser.username }, process.env.JWT_SECRETE)

        // Remove validUser's password
        const { password: pass, ...rest } = validUser._doc

        res.cookie('token', token)   // cookie('access_token', token, { httpOnly: true })
            .status(200)
            .json(rest)

    } catch (error) {
        next(error)
    }
}

// @desc User SignOut middleware
// @route GET /signout
// @access Public
const signout = async (req, res, next) => {
    try {
        res.cookie('token', '')
        res.status(200).json('User has been logout.')
    } catch (error) {
        next(error)
    }
}

module.exports = {
    signUp,
    signIn,
    signout,
}