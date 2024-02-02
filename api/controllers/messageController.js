const Message = require('../models/Message')
const jwt = require('jsonwebtoken')

// @desc Get Messages Middleware
// @route GET /:userId
// @access Public
const getMessages = async (req, res, next) => {
    try {
        const { userId } = req.params   // selectedUserId
        console.log("userId: ", userId)
        const userData = req.userData
        console.log(userData)
        const ourUserId = userData.userId
        console.log(ourUserId)

        const messages = await Message.find({
            sender: { $in: [userId, ourUserId] }, // if sender is 'selectedUserId' or 'ourUserId'
            recipient: { $in: [userId, ourUserId] } // if recipient is 'selectedUserId' or 'ourUserId'
        }).sort({ createdAt: 1 })

        res.json(messages)

    } catch (error) {
        next(error)
    }
}

module.exports = { getMessages }
