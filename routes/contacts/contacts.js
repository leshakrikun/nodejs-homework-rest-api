const express = require('express')
const router = express.Router()

const {getContacts,
        getContactById,
        removeContact,
        addContact,
        updateContact,
        updateStatusContact} = require('../../controllers/mycontacts')

const { validateContact, validateId, validatePatchContact } = require('./validation')
const guard = require('../../helpers/guard')
const wrapError = require('../../helpers/errorHandler')

router.get('/', guard, wrapError(getContacts))

router.get('/:contactId', guard, validateId, wrapError(getContactById))

router.post('/', guard, validateContact, wrapError(addContact))

router.delete('/:contactId', guard, validateId, wrapError(removeContact))

router.patch('/:contactId', guard,  [validateId, validateContact],  wrapError(updateContact) )  

router.patch('/:contactId',  guard, [validatePatchContact, validateId],  wrapError(updateStatusContact))

module.exports = router

