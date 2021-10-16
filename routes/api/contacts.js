const express = require('express')
const router = express.Router()

const {getContacts,
        getContactById,
        removeContact,
        addContact,
        updateContact,
        updateStatusContact} = require('../../controllers/mycontacts')

const { validateContact, validateId, validatePatchContact } = require('./validation')

router.get('/', getContacts)

router.get('/:contactId', validateId, getContactById)

router.post('/', validateContact, addContact)

router.delete('/:contactId', validateId, removeContact)

router.put('/:contactId', [validateId, validatePatchContact], updateContact)

router.put('/:contactId',  [validatePatchContact, validateId],  updateStatusContact)

module.exports = router

