const {
  runDockerAndSaveLogs,
  stopDockerContainer,
  restartDockerContainer,
  logStreams
} = require('../utils/script.services')
const containerModel = require('../models/container.model')
const fs = require('fs')
const userModel = require('../models/user.model')

//run script
const runscript = async (req, res) => {
  const { id } = req.params
  console.log(id)

  if (!id) {
    return res.json({ message: 'fields are missing', success: false })
  }

  try {
    const userEnv = await userModel.findOne({ _id: id })
    const envData = {
      EMAIL: userEnv?.email,
      PASSWORD: userEnv?.password,
      SCHEDULE_ID: userEnv?.scheduleId,
      EMBASSY_ARRAY: userEnv?.embassyArray,
      PRIOD_END: userEnv?.enddate
    }

    await runDockerAndSaveLogs(
      envData,
      id,
      async (containerId, containerName) => {
        await containerModel.create({
          user_id: id,
          containerId,
          containerName
        })

        await userModel.findOneAndUpdate({ _id: id }, { status: 'Running' })
        return res.status(200).json({
          message: 'Script executed successfully.',
          success: true
        })
      }
    )
  } catch (error) {
    await userModel.findOneAndUpdate({ _id: id }, { status: 'Errored' })
    res.status(500).json({
      message: error.message || 'Error executing script.',
      success: false
    })
  }
}

//stop script
const stopscript = async (req, res) => {
  try {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({
        message: 'Invalid ID',
        success: false
      })
    }

    const containerColl = await containerModel
      .findOne({ user_id: id })
      .sort({ _id: -1 })
    console.log({ containerColl })
    const containerId = containerColl?.containerId
    const { stopped } = await stopDockerContainer(containerId)
    console.log(stopped)
    if (!stopped) {
      return res
        .status(400)
        .json({ message: 'Error stopping container.', success: false })
    }

    await userModel.findOneAndUpdate({ _id: id }, { status: 'Idle' })

    return res.status(200).json({
      message: `container stopped with container ID: ${containerId}`,
      success: true
    })
  } catch (error) {
    await userModel.findOneAndUpdate({ _id: id }, { status: 'Errored' })
    return res.status(500).json({
      message: error.message || 'Error stopping script.',
      success: false
    })
  }
}

//restart script
const restartscript = async (req, res) => {
  try {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({
        message: 'Invalid ID',
        success: false
      })
    }

    const containerColl = await containerModel
      .findOne({ user_id: id })
      .sort({ _id: -1 })
    const containerId = containerColl?.containerId
    const containerName = containerColl?.containerName

    const logFileName = `${containerName}_custom_logs.txt`
    const logFile = fs.createWriteStream(logFileName, { flags: 'a' })

    const { restarted, container } = await restartDockerContainer(containerId)

    if (!restarted) {
      return res
        .status(400)
        .json({ message: 'Error restarted container.', success: false })
    }

    await userModel.findOneAndUpdate({ _id: id }, { status: 'Running' })

    await logStreams(logFile, container, containerName, id)
    return res.status(200).json({
      message: `container restarted with container ID: ${containerId}`,
      success: true
    })
  } catch (error) {
    await userModel.findOneAndUpdate({ _id: id }, { status: 'Errored' })
    return res.status(500).json({
      message: error.message || 'Error restarting script.',
      success: false
    })
  }
}

module.exports = {
  runscript,
  stopscript,
  restartscript
}
