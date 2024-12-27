const { runDockerAndSaveLogs } = require('../script')

//run script
const runscript = async (req, res) => {
  const envData = req.body

  if (
    !envData?.EMBASSY_ARRAY ||
    !envData?.USERNAME ||
    !envData?.PASSWORD ||
    !envData?.SCHEDULE_ID ||
    !envData?.PRIOD_END
  ) {
    return res.json({ message: 'fields are missing', success: false })
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
}

//stop script
const stopscript = async (req, res) => {
  try {
    
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Error executing script.', error: error.message })
  }
}

module.exports = {
  runscript
}
