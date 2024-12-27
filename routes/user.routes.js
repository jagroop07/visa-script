const express = require('express')
const { resources } = require('../utils/resources')
const userRouter = express.Router()
const userModel = require('../models/user.model')
const userController = resources(userModel)

userRouter.post("/", userController.list)
userRouter.get("/:id", userController.single)
userRouter.patch("/:id", userController.update)
userRouter.post("/create", userController.create)



module.exports = userRouter