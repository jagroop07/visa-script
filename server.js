const express = require('express')
require('dotenv').config()
const connectDb = require('./db/db.config')
const cors = require('cors')
const verification = require('./middlewares/verification')
const app = express()

connectDb()
app.use(express.json())
app.use(cors())

app.use('/user', require('./routes/user.routes'))
app.use('/admin', require('./routes/admin.routes'))
app.use('/script', require('./routes/script.routes'))

app.get('/verify', verification, (req, res) => {
  console.log({ req })
  return res.json({ message: 'server is up', success: true })
})

const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`server is running at PORT: ${PORT}`)
})
