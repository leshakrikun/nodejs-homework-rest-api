const Joi = require('joi')
const { ValidInfoContact } =require('../../config/constant')
Joi.objectId = require('joi-objectid')(Joi)
const patternPhone = '\\(\\d{3}\\) \\d{3}-\\d{4}'
const patternName = /^\w+(?:\s+\w+)*$/


const schemaContact = Joi.object({
    name:  Joi.string().min(ValidInfoContact.MIN_LENGHT).max(ValidInfoContact.MAX_LENGHT).pattern(new RegExp(patternName)).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(new RegExp(patternPhone)).required(),
    favorite: Joi.boolean().optional(),
})

const schemaPatchContact = Joi.object({
    name:  Joi.string().min(ValidInfoContact.MIN_LENGHT).max(ValidInfoContact.MAX_LENGHT).pattern(new RegExp(patternName)).optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().pattern(new RegExp(patternPhone)).optional(),
    favorite: Joi.boolean().optional(),
})

const schemaId = Joi.object({
  id: Joi.objectId().required,
})

const validate = async (schema, obj, res, next) => {
    try {
        await schema.validateAsync(obj)
        next()
    } catch (err) { 
        res
        .status(400)
        .json({ status: 'error', code: 400, message: `Field ${err.message.replace(/"/g, '')}` })
    }
}

module.exports.validateContact = async (req, res, next) => {
    return await validate(schemaContact, req.body, res, next)
}
module.exports.validatePatchContact = async (req, res, next) => {
    return await validate(schemaPatchContact, req.body, res, next)
}
module.exports.validateId = async (req, res, next) => {
    return await validate(schemaId, req.body, res, next)
}