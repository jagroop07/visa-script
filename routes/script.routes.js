const express = require('express')
const {
  runscript,
  stopscript,
  restartscript
} = require('../controllers/script.controller')
const scriptRouter = express.Router()

scriptRouter.get('/run/:id', runscript)
scriptRouter.get('/stop/:id', stopscript)
scriptRouter.get('/restart/:id', restartscript)

module.exports = scriptRouter
