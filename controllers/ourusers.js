const jwt = require('jsonwebtoken')
const Users = require('../repository/users')
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
        if(!id) {
            return res.status(HttpCode.UNAUTHORIZED).json({
                code: HttpCode.UNAUTHORIZED,
                message: 'Not authorized',
            })
        }
        await Users.updateToken(id, null)
        return res.status(HttpCode.NO_CONTENT).json({test: 'test' })
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
}