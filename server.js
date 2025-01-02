const express = require('express')
require('dotenv').config()
const http = require('http')
const { spawn } = require('child_process')
const { Writable } = require('stream')
const connectDb = require('./db/db.config')
const cors = require('cors')
const socketIo = require('socket.io')
const verification = require('./middlewares/verification')
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
  return res.json({ message: 'server is up', success: true })
})

const logStream = fs.createWriteStream(
  path.join(__dirname, 'process_logs.txt'),
  { flags: 'a' }
)

const socketStream = new Writable({
  write (chunk, encoding, callback) {
    const logMessage = chunk.toString()
    io.emit('process-log', { type: 'stdout', message: logMessage })
    callback()
  }
})

app.post('/spawn-process', (req, res) => {
  const { command, args, env } = req.body

  if (!command) {
    return res.status(400).json({ error: 'Command is required' })
  }

  const childEnv = { ...process.env, ...env }

  const child = spawn(command, args || [], { env: childEnv })

  child.stdout.pipe(logStream)
  child.stdout.pipe(socketStream)

  child.stderr.pipe(logStream)
  child.stderr.pipe(socketStream)

  child.on('close', code => {
    const message = `Process exited with code ${code}`
    console.log(message)

    fs.appendFileSync(
      path.join(__dirname, 'process_logs.txt'),
      `CLOSE: ${message}\n`
    )

    io.emit('process-log', { type: 'close', message })
  })

  res.json({ message: 'Process spawned', pid: child.pid })
})

io.on('connection', socket => {
  console.log('Frontend connected via Socket.IO')
})

const PORT = process.env.PORT

server.listen(PORT, () => {
  console.log(`server is running at PORT: ${PORT}`)
})
