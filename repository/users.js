const User = require('../model/user')

const findByEmail = async (email) => {
    return await User.findOne({ email })
}

const findById = async (id) => {
    return await User.findById(id)
}

const create = async (options) => {
    const user = new User(options)
    return await user.save()
}

const updateToken = async (id, token) => {
    return await User.updateOne({ _id: id }, { token })
}

const getToken = async (token) => {
    return await User.findOne({ token })
}

const updateAvatar = async (id, avatar, idUserCloud = null) => {
    return await User.updateOne({ _id: id }, { avatar, idUserCloud })
  }
  
module.exports = { findById, findByEmail, create, updateToken, getToken, updateAvatar }