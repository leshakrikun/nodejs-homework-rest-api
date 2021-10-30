const jwt = require('jsonwebtoken')
const fs = require('fs/promises')
 /* const path = require('path')
 const mkdirp = require('mkdirp') */
const Users = require('../repository/users')
// const UploadService = require('../services/file-upload')
const UploadService = require('../services/cloud-upload')
const { HttpCode}  = require('../config/constant')
require('dotenv').config()
const SECRET_KEY = process.env.JWT_SECRET_KEY

const signup = async (req, res, next) => {
    const { name, email, password, subscription } = req.body
    const user = await Users.findByEmail(email)
    if (user) {
        return res
            .status(HttpCode.CONFLICT)
            .json({
                status: 'conflict',
                code: HttpCode.CONFLICT,
                message: 'Email in use',
            })
    }
    try {
        const newUser = await Users.create({ name, email, password, subscription})
        return res.status(HttpCode.CREATED).json({
            status: 'success',
            code: HttpCode.CREATED,
            user: {
                email: newUser.email,
                subscription: newUser.subscription,
                avatar: newUser.avatar
            },
        })
    } catch (e){
        next(e)
    }
}

const login = async (req, res, next) => {
    const { email, password } = req.body
    const user = await Users.findByEmail(email)
    const isValidPassword = await user?.isValidPassword(password)
    if (!user || !isValidPassword) {
      return res.status(HttpCode.UNAUTHORIZED).json({
        status: 'error',
        code: HttpCode.UNAUTHORIZED,
        message: 'Email or password is wrong',
      })
    }
    const id = user._id
    const payload = { id }
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1d' })
    await Users.updateToken(id, token)
    return res.status(HttpCode.OK).json({
      status: 'success',
      code: HttpCode.OK,
      date: {
        token,
        "user": {
            "email": user.email,
            "subscription": user.subscription
          }
      },
    })
  }

const logout = async (req, res, next) => {
    const id = req.user._id
    
    await Users.updateToken(id, null)
    return res.status(HttpCode.NO_CONTENT).json({test: 'test' })
}

/* const uploadAvatar = async (req, res, next) => {
    const id = String(req.user._id)
    const file = req.file
    const AVATAR_OF_USERS = process.env.AVATAR_OF_USERS
    const destination = path.join(AVATAR_OF_USERS, id)
    await mkdirp(destination)
    const uploadService = new UploadService(destination)
    const avatarUrl = await uploadService.save(file, id)
    await Users.updateAvatar(id, avatarUrl)

    return res.status(HttpCode.OK).json({
        status: 'success',
        code: HttpCode.OK,
        date: {
        avatar: avatarUrl,
        },
    })
} */


// Cloud storage
const uploadAvatar = async (req, res, next) => {
    const { id, idUserCloud } = req.user
    const file = req.file
  
    const destination = 'Avatars'
    const uploadService = new UploadService(destination)
    const { avatarUrl, returnIdUserCloud } = await uploadService.save(
      file.path,
      idUserCloud,
    )
  
    await Users.updateAvatar(id, avatarUrl, returnIdUserCloud)
    try {
      await fs.unlink(file.path)
    } catch (error) {
    }
    return res.status(HttpCode.OK).json({
      status: 'success',
      code: HttpCode.OK,
      date: {
        avatar: avatarUrl,
      },
    })
  }

const current = async (req, res, next) => {
    const token = req.get('Authorization')?.split(' ')[1]
    if(!token) {
        return res.status(HttpCode.UNAUTHORIZED).json({
            code: HttpCode.UNAUTHORIZED,
            message: 'Not authorized',
        })
    }

    const user = await Users.getToken(token)
    return res.status(HttpCode.OK).json({
    status: 'success',
    code: HttpCode.OK,
    ResponseBody: {
        "email": user.email,
        "subscription": user.subscription
    },
    })
}


module.exports = {
    signup,
    login,
    logout,
    current,
    uploadAvatar,
}