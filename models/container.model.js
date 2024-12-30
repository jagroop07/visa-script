const mongoose = require('mongoose')

const containerSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  containerName: String,
  containerId: String,
  running: Boolean
})

module.exports = mongoose.model('container', containerSchema)
