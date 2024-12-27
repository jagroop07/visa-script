const express = require('express')
const { runscript } = require('../controllers/script.controller')
const scriptRouter = express.Router()

scriptRouter.post("/", runscript)

module.exports = scriptRouter