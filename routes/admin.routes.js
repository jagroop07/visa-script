const express = require('express')
const { login, register } = require('../controllers/admin.controller')
const adminRouter = express.Router()

adminRouter.post('/login', login)
adminRouter.post('/register', register)

module.exports = adminRouter
