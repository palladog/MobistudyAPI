'use strict'

/**
* Sets-up the loggers.
* Returns two loggers, one for the http raw stuff and one for the application.
*/

import rfs from 'rotating-file-stream'
import expresspino from 'express-pino-logger'
import pino from 'pino'
import getConfig from './config'

const config = getConfig()

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

export { httppino as httplogger }
export { logger as applogger }
