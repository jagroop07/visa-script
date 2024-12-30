const express = require('express')
const {
  runscript,
  stopscript,
  restartscript,
  getStatus
} = require('../controllers/script.controller')
const scriptRouter = express.Router()

scriptRouter.get('/run/:id', runscript)
scriptRouter.get('/stop/:id', stopscript)
scriptRouter.get('/restart/:id', restartscript)
scriptRouter.get('/get-status/:id', getStatus)

module.exports = scriptRouter
