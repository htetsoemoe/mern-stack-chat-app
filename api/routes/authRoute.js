const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')

router.route('/sign-up')
    .post(authController.signUp)

router.route('/sign-in')
    .post(authController.signIn)

router.route('/sign-out')
    .get(authController.signout)

module.exports = router
