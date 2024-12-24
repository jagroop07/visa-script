const express = require('express')
require('dotenv').config()
const { runDockerAndSaveLogs } = require('./script')
const connectDb = require('./db/db.config')
const app = express()

connectDb()
app.use(express.json())

app.use('/user', require('./routes/user.routes'))
app.use('/admin', require('./routes/admin.routes'))

app.post('/run-id', async (req, res) => {
  const envData = req.body

  if(!envData?.EMBASSY_ARRAY || !envData?.USERNAME || !envData?.PASSWORD || !envData?.SCHEDULE_ID || !envData?.PRIOD_END){
    return res.json({message: 'fields are missing', success: false})
  }

  try {
    await runDockerAndSaveLogs(envData)
    res.status(200).json({ message: 'Script executed successfully.' })
  } catch (error) {
    console.error(`Error running script: ${error.message}`)
    res
      .status(500)
      .json({ message: 'Error executing script.', error: error.message })
  }
})

const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`server is running at PORT: ${PORT}`)
})
