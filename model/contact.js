const { Schema, model, SchemaTypes }  = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')

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
    owner: {
        type: SchemaTypes.ObjectId,
        ref: 'user',
     }
    },
    { versionKey: false, timestamps: true, toJSON: {virtuals: true, transform: function (doc, ret) {
        delete ret._id
        return ret
    },
} },
)
contactSchema.path('name').validate(function (value) {
    const re = /[A-Z]\w+/
    return re.test(String(value))
  })


contactSchema.plugin(mongoosePaginate)

const Contact = model('contact', contactSchema)

module.exports = Contact