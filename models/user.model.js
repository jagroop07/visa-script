const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  scheduleId: String,
  enddate: String,
  embassyArray: [String],
  status: { type: String, enum: ['Idle', 'Running', 'Errored', 'Done'] }
})

module.exports = mongoose.model("user", userSchema)