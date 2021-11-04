const express = require('express')
const router = express.Router()
const { signup, login, logout, current, uploadAvatar, verifyUser, repeatEmailForVerifyUser, } = require('../../controllers/ourusers')
const guard = require('../../helpers/guard')
const loginLimit = require('../../helpers/rate-limit-login')
const wrapError = require('../../helpers/errorHandler')
const { validateUser, validateMail } = require('./validation')
const upload = require('../../helpers/upload')

router.post('/signup', validateUser, wrapError(signup))
router.post('/login', loginLimit, login)
router.get('/current', guard, current)
router.post('/logout', guard, logout)
router.patch('/avatar', guard, upload.single('avatar'),  uploadAvatar)

router.get('/verify/:token', wrapError(verifyUser))
router.post('/verify', validateMail, repeatEmailForVerifyUser)

module.exports = router