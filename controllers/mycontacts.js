const Contacts = require('../repository/index')
const {CustomError} = require('../helpers/customError')

const getContacts = async (req, res) => {
  const userId = req.user._id
  const data = await Contacts.listContacts(userId, req.query)
  res.json({ status: 'success', code: 200, data: {...data} })
}
  
const getContactById = async (req, res) => {
  const userId = req.user._id
  const contact = await Contacts.getContactById(req.params.contactId, userId)

  if (contact) {
    return res
      .status(200)
      .json({ status: 'success', code: 200, data: {contact} })
  }

  throw new CustomError(404, 'Not Found')     
}
  
const addContact = async (req, res) => {
  const userId = req.user._id  
  const contact = await Contacts.addContact({...req.body, owner: userId })
  res.status(201).json({ status: 'success', code: 201, data: {contact} })
}
  
const removeContact = async (req, res) => {
  const userId = req.user._id  
  const contact = await Contacts.removeContact(req.params.contactId, userId)
  if (contact) {
    return res
      .status(200)
      .json({ status: 'success', code: 200, message: "Contact deleted" })
  }
  throw new CustomError(404, 'Not Found') 
}
  
const updateContact = async (req, res) => {
  const userId = req.user._id 

  const contact = await Contacts.updateContact(req.params.contactId, req.body, userId)
  if (Object.keys(req.body).length === 0) {
      return res
        .status(400)
        .json({ status: 'error', code: 400, message: "missing fields" })
      
    }
  if (contact) {
    return res
      .status(200)
      .json({ status: 'success', code: 200, data: {contact} })
  }
  throw new CustomError(404, 'Not Found') 
}

const updateStatusContact = async (req, res, next) => {
  const userId = req.user._id  
  const contact = await Contacts.updateStatusContact(req.params.id, req.body, userId)
  if (contact) {
    return res
      .status(200)
      .json({ status: 'success', code: 200, data: { contact } })
  }
  throw new CustomError(404, 'Not Found')
}
  
module.exports = {
    getContacts,
    getContactById,
    removeContact,
    addContact,
    updateContact,
    updateStatusContact
  }