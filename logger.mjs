'use strict'

/**
* Sets-up the loggers.
* Returns two loggers, one for the http raw stuff and one for the application.
*/

import fs from 'fs'
import rfs from 'rotating-file-stream'
import expresspino from 'express-pino-logger'
import pino from 'pino'

export default async function () {

  var config = {}
  try {
    const configfile = await fs.promises.readFile('config.json', 'utf8')
    config = JSON.parse(configfile)
  } catch (err) {
    config.logs = {
      folder: (process.env.LOGSFOLDER || 'logs'),
      rotationsize: (process.env.LOGSROTATIONSIZE || '1M')
    }
  }

  const httplogstream = rfs('http.log', {
    path: config.logs.folder,
    size: config.logs.rotationsize,
    compress: true
  })

  const applogstream = rfs('app.log', {
    path: config.logs.folder,
    size: config.logs.rotationsize,
    compress: true
  })

  httplogstream.on('error', console.error)
  httplogstream.on('warning', console.error)

  applogstream.on('error', console.error)
  applogstream.on('warning', console.error)

  const httppino = expresspino(httplogstream)
  const logger = pino(applogstream)

  httppino.level = 10
  logger.level = 10

  return {
    httplogger: httppino,
    applogger: logger
  }
}
