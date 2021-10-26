const { Schema, model}  = require('mongoose')
const { Subscription } = require('../config/constant')
const bcrypt = require ('bcryptjs')
const SALT_FACTOR = 6

function toLower(v) {
    return v.toLowerCase();
}

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Set name for user']
    },
    email: { type: String, set: toLower, unique: true, required: [true, 'Set email for user'], validate(value) {
        const re = /\S+@\S+.\S+/
        return re.test(String(value))
    }},
    password: {
        type: String,
        required: [true, 'Set password for user']
    },
    subscription: {
        type: String,
        enum: {
            values: [Subscription.STARTER, Subscription.PRO, Subscription.BUSINESS],
        },
        default: Subscription.STARTER,
      },
      token: {
          type: String,
          default: null,
      }
    },
    { versionKey: false, timestamps: true, toJSON: {virtuals: true, transform: function (doc, ret) {
        delete ret._id
        return ret
    },
} },
)
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(SALT_FACTOR)
        this.password = await bcrypt.hash(this.password, salt)
    }
    next()
})
userSchema.methods.isValidPassword = async function (password) {
    return bcrypt.compare(password, this.password)
}

const User = model('user', userSchema)

module.exports = User