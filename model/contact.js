const { Schema, model}  = require('mongoose')

function toLower(v) {
    return v.toLowerCase();
}

const contactSchema = new Schema({
    name: {
        type: String,
        unique: true,
        required: [true, 'Set name for contact']
    },
    email: { type: String, set: toLower },
    phone: {
            type: String,
        validate: {
        validator: function(v) {
            return /^\(\d{3}\) \d{3}-\d{4}$/.test(v);
        },
        message: props => `${props.value} is not a valid phone number!`
        },
        required: [true, 'User phone number required']
    },
    favorite: {
        type: Boolean,
        default: false,
      },
    },
    { versionKey: false, timestamps: true, toJSON: {virtuals: true, transform: function (doc, ret) {
        delete ret._id
        return ret
    },
} },
)
const Contact = model('contact', contactSchema)

module.exports = Contact