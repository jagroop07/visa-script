const Docker = require('dockerode')
const fs = require('fs')
const io = require('../server')

const docker = new Docker()

function generateContainerName (baseName = 'visascript-container') {
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:T.]/g, '')
    .slice(0, 14)
  const randomSuffix = Math.random().toString(36).substring(2, 7)
  return `${baseName}-${timestamp}-${randomSuffix}`
}

function isContainerRunning (containerName) {
  return docker
    .listContainers({ filters: { name: [containerName] } })
    .then(containers => containers.length > 0)
    .catch(error => {
      console.error(`Error checking container status: ${error.message}`)
      return false
    })
}

function sliceLog (logEntry) {
  const index = logEntry.indexOf('prismaple')
  if (index !== -1) {
    return logEntry.slice(index + 10)
  }
  return logEntry
}

function filterCustomLogs (logEntry) {
  return logEntry.includes('prismaple')
}

async function logStreams (logFile, container, containerName, id) {
  const logStream = await container.logs({
    follow: true,
    stdout: true,
    stderr: true
  })

  let currentLogBuffer = ''

  logStream.on('data', chunk => {
    currentLogBuffer += chunk.toString()

    const logEntries = currentLogBuffer.split('\n')

    currentLogBuffer = logEntries.pop()

    logEntries.forEach(logEntry => {
      logEntry = logEntry.trim()

      if (logEntry && filterCustomLogs(logEntry)) {
        const slicedLog = sliceLog(logEntry)
        if (slicedLog) {
          console.log(slicedLog)
          io.emit(`file-update${id}`, slicedLog)
          logFile.write(slicedLog + '\n')
        }
      }
    })
  })

  logStream.on('end', () => {
    console.log(`Log streaming for container '${containerName}' ended.`)
    logFile.close()
  })

  const intervalId = setInterval(async () => {
    const running = await isContainerRunning(containerName)
    if (!running) {
      clearInterval(intervalId)
      logStream.destroy() // Stop the log stream
      logFile.close()
      console.log(
        `\nContainer '${containerName}' has stopped. Exiting custom log streaming.`
      )
    }
  }, 1000)
}

async function runDockerAndSaveLogs (envVars, id, onContainerStarted) {
  const dockerImage = 'testimage'
  const containerName = generateContainerName()

  if (
    !envVars?.EMBASSY_ARRAY ||
    !envVars?.EMAIL ||
    !envVars?.PASSWORD ||
    !envVars?.SCHEDULE_ID ||
    !envVars?.PRIOD_END
  ) {
    return { message: 'all fields are required' }
  }

  const envArray = Object.entries(envVars).map(
    ([key, value]) => `${key}=${value}`
  )

  console.log('\nCreating Docker container:')
  console.log(envArray)

  try {
    const container = await docker.createContainer({
      Image: dockerImage,
      name: containerName,
      Env: envArray,
      AttachStdout: true,
      AttachStderr: true
    })

    const containerId = container.id

    await container.start()
    console.log(`Container '${containerName}' started.`)

    if (onContainerStarted || typeof onContainerStarted === 'function') {
      onContainerStarted(containerId, containerName)
    }

    const logFileName = `${containerName}_custom_logs.txt`
    console.log(`\nCustom logs will be saved to: ${logFileName}`)

    const logFile = fs.createWriteStream(logFileName, { flags: 'a' })

    console.log(`Streaming custom logs from container '${containerName}'...`)

    await logStreams(logFile, container, containerName, id)
  } catch (error) {
    console.error(`Error managing Docker container: ${error.message}`)
  }
}

async function stopDockerContainer (containerId) {
  const container = docker.getContainer(containerId)

  try {
    await container.stop()
    return { stopped: true }
  } catch (error) {
    if (error.statusCode === 304) {
      return { stopped: false, message: 'container already stopped' }
    }
  }
}

async function restartDockerContainer (containerId) {
  const container = docker.getContainer(containerId)
  try {
    await container.restart()
    return { container, restarted: true }
  } catch (error) {
    if (error.statusCode === 404) {
      return { restarted: false, message: 'container not found' }
    }
  }
}

module.exports = {
  runDockerAndSaveLogs,
  stopDockerContainer,
  restartDockerContainer,
  logStreams
}
