const express = require('express')
const logger = require('morgan')
const cors = require('cors')
const boolParser = require('express-query-boolean')
const helmet = require('helmet')

const usersRouter = require('./routes/users/users')
const contactsRouter = require('./routes/contacts/contacts')
const {clientMaxBodySize} = require('./config/constant')

const app = express()

const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short'

app.use(helmet())
app.use(logger(formatsLogger))
app.use(cors())
app.use(express.json({limit: clientMaxBodySize}))
app.use(boolParser())

app.use((req, res, next) => {
  app.set('lang', req.acceptsLanguages(['en', 'ru']))
  next()
})

app.use('/api/users', usersRouter)
app.use('/api/contacts', contactsRouter)

app.use((req, res) => {
  res.status(404).json({ status: 'error', code: 404, message: 'Not found' })
})

app.use((err, req, res, next) => {
  res.status(500).json({ status: 'fail', code: 500, message: err.message })
})

module.exports = app
