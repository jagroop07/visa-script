const express = require('express')
const login = require('../controllers/admin.controller')
const adminRouter = express.Router()

adminRouter.post('/login', login)

module.exports = adminRouter