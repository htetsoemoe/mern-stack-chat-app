const express = require('express')
const router = express.Router()
const verifyUserInToken = require('../utils/verifyUserInToken')
const messageController = require('../controllers/messageController')

router.get('/:userId', verifyUserInToken, messageController.getMessages)

module.exports = router