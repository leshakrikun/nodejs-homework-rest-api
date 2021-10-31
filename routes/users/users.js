const express = require('express')
const router = express.Router()
const { signup, login, logout, current, uploadAvatar } = require('../../controllers/ourusers')
const guard = require('../../helpers/guard')
const loginLimit = require('../../helpers/rate-limit-login')
const wrapError = require('../../helpers/errorHandler')
const { validateUser } = require('./validation')
const upload = require('../../helpers/upload')

router.post('/signup', validateUser, wrapError(signup))
router.post('/login', loginLimit, login)
router.get('/current', guard, current)
router.post('/logout', guard, logout)
router.patch('/avatar', guard, upload.single('avatar'),  uploadAvatar)

module.exports = router