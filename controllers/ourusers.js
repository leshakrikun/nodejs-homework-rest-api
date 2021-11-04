const jwt = require('jsonwebtoken')
const fs = require('fs/promises')
const Users = require('../repository/users')
const UploadService = require('../services/cloud-upload')
const { HttpCode}  = require('../config/constant')
const EmailService = require('../services/email/service')
const CreateSenderSendGrid = require('../services/email/sender')

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
    const emailService = new EmailService(
      process.env.NODE_ENV,
      new CreateSenderSendGrid(),
    )
    const statusEmail = await emailService.sendVerifyEmail(
      newUser.email,
      newUser.name,
      newUser.verificationToken,      
    )
    return res.status(HttpCode.CREATED).json({
      status: 'success',
      code: HttpCode.CREATED,
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
        avatar: newUser.avatar,
        successEmail: statusEmail,
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
  if (!user || !isValidPassword || !user?.verify) {
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
    
    const email = req.user.email
    const subscription = req.user.subscription
    
    return res.status(HttpCode.OK).json({
    status: 'success',
    code: HttpCode.OK,
    ResponseBody: {
        "email": email,
        "subscription": subscription
    },
    })
}
const verifyUser = async (req, res, next) => {
  const user = await Users.findUserByVerifyToken(req.params.token)
  if (user) {
    await Users.updateTokenVerify(user._id, true, null)
    return res.status(HttpCode.OK).json({
      status: 'success',
      code: HttpCode.OK,
      data: {
        message: 'Verification successful',
      },
    })
  }
  return res.status(HttpCode.BAD_REQUEST).json({
    status: 'error',
    code: HttpCode.BAD_REQUEST,
    message: 'User not found',
  })
}

const repeatEmailForVerifyUser = async (req, res, next) => {
  const { email } = req.body
  if (!email){
    return res.status(HttpCode.BAD_REQUEST).json({
      status: 'error',
      code: HttpCode.BAD_REQUEST,
      data: {
        message: 'missing required field email',
      },
    })
  }
  const user = await Users.findByEmail(email)
  if (user) {
    const { email, name, verificationToken, verify } = user
    if(verify) {
      return res.status(HttpCode.BAD_REQUEST).json({
        status: 'success',
        code: HttpCode.BAD_REQUEST,
        data: {
          message: 'Verification has already been passed',
        },
      })
    }
    const emailService = new EmailService(
    process.env.NODE_ENV,
    new CreateSenderSendGrid(),
    )
    await emailService.sendVerifyEmail(
      email,
      name,
      verificationToken,
    )
  }
  return res.status(HttpCode.OK).json({
    status: 'success',
    code: HttpCode.OK,
    data: {
      message: 'Verification email sent',
    },
  })
}

module.exports = {
  signup,
  login,
  logout,
  current,
  uploadAvatar,
  repeatEmailForVerifyUser,
  verifyUser,
}