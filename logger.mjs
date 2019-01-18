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
const applogger = pino(applogstream)

httppino.level = 10
applogger.level = 10

let applogger_

if (config.logs.console) {
  applogger_ = {
    trace (object, message) {
      if (message) {
        console.trace(message, object)
        applogger.trace(object, message)
      } else {
        console.trace(object)
        applogger.trace(object)
      }
    },
    debug (object, message) {
      if (message) {
        console.debug(message, object)
        applogger.trace(object, message)
      } else {
        console.debug(object)
        applogger.trace(object)
      }
    },
    info (object, message) {
      if (message) {
        console.info(message, object)
        applogger.trace(object, message)
      } else {
        console.info(object)
        applogger.trace(object)
      }
    },
    warn (object, message) {
      if (message) {
        console.warn(message, object)
        applogger.trace(object, message)
      } else {
        console.warn(object)
        applogger.trace(object)
      }
    },
    error (object, message) {
      if (message) {
        console.error(message, object)
        applogger.trace(object, message)
      } else {
        console.error(object)
        applogger.trace(object)
      }
    },
    fatal (object, message) {
      if (message) {
        console.error(message, object)
        applogger.trace(object, message)
      } else {
        console.error(object)
        applogger.trace(object)
      }
    }
  }
} else {
  applogger_ = applogger
}

export { httppino as httplogger }
export { applogger_ as applogger }
