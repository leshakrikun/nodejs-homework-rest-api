const Joi = require('joi')
const { ValidInfoContact } =require('../../config/constant')
Joi.objectId = require('joi-objectid')(Joi)
const patternName = /^\w+(?:\s+\w+)*$/


const schemaUser = Joi.object({
    name:  Joi.string().min(ValidInfoContact.MIN_LENGHT).max(ValidInfoContact.MAX_LENGHT).pattern(new RegExp(patternName)).required(),
    email: Joi.string().email().required(),
    password: Joi.string().alphanum().required(),
    subscription: Joi.boolean().optional(),
})

const validate = async (schema, obj, res, next) => {
    try {
        await schema.validateAsync(obj)
        next()
    } catch (err) { 
        res
        .status(400)
        .json({ status: 'error', code: 400, message: 'Error from Joy or other validation library' })
    }
}

module.exports.validateUser = async (req, res, next) => {
    return await validate(schemaUser, req.body, res, next)
}