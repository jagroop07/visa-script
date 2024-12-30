const express = require('express')
require('dotenv').config()
const http = require('http')
const connectDb = require('./db/db.config')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const socketIo = require('socket.io')
const verification = require('./middlewares/verification')
const containerModel = require('./models/container.model')
const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true
  }
})

module.exports = io

connectDb()
app.use(express.json())
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true
  })
)

app.use('/user', require('./routes/user.routes'))
app.use('/admin', require('./routes/admin.routes'))
app.use('/script', require('./routes/script.routes'))

app.get('/verify', verification, (req, res) => {
  console.log({ req })
  return res.json({ message: 'server is up', success: true })
})

// const getLogfile = async id => {
//   const containerColl = await containerModel.findOne({ user_id: id })
//   return `${containerColl?.containerName}_custom_logs.txt`
// }

io.on('connection', socket => {
  console.log('Client connected via Socket.IO')

  const id = socket.handshake.query.id

  if (!id) {
    socket.emit('file-update', 'Invalid Id')
    socket.disconnect()
    return
  }

  // getLogfile(id)
  //   .then(logFile => {
  //     const logFilePath = path.join(__dirname, logFile)

  //     const sendFileContent = () => {
  //       if (fs.existsSync(logFilePath)) {
  //         const content = fs.readFileSync(logFilePath, 'utf-8')
  //         socket.emit('file-update', content)
  //       } else {
  //         socket.emit('file-update', 'Log file not found')
  //       }
  //     }

  //     sendFileContent()

  //     socket.on('disconnect', () => {
  //       console.log('Client disconnected')
  //     })
  //   })
  //   .catch(err => {
  //     socket.emit('file-update', 'Error fetching log file: ' + err.message)
  //     socket.disconnect()
  //   })
})

const PORT = process.env.PORT

server.listen(PORT, () => {
  console.log(`server is running at PORT: ${PORT}`)
})
