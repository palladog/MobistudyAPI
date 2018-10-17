'use strict'

/**
* Mobistudy REST API. This is the main application file.
* This laods the actual application and initalises the environment.
*/

import fs from 'fs'
import getApp from '../app'
import http from 'http'
import https from 'https'

(async () => {
  const app = await getApp()

  var config = {}
  try {
    const configfile = fs.readFileSync('config.json', 'utf8')
    config = JSON.parse(configfile)
  } catch (err) {
    console.log('No config file specified, using environment variables')
    config.web = {
      port: parseInt(process.env.PORT || '3000')
    }
    if (process.env.CERTKEYFILE) {
      config.cert = {
        key: process.env.CERTKEYFILE,
        file: process.env.CERTFILE
      }
    }
  }

  // pass parameters down the application
  app.set('port', config.web.port)

  var server

  if (config.cert) {
    // HTTPS case

    // Private Key and Public Certificate
    var privateKey = fs.readFileSync(config.cert.key, 'utf8')
    var certificate = fs.readFileSync(config.cert.file, 'utf8')

    server = https.createServer({ key: privateKey, cert: certificate }, app)
  } else {
    // HTTP case
    server = http.createServer(app)
  }

  // Listen on provided port, on all network interfaces.
  server.listen(config.web.port)
  server.on('error', onError)
  server.on('listening', onListening)

  /**
  * Event listener for HTTP server "error" event.
  */
  function onError (error) {
    if (error.syscall !== 'listen') {
      throw error
    }

    var bind = typeof config.web.port === 'string' ? 'Pipe ' + config.web.port : 'Port ' + config.web.port

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges')
        process.exit(1)
      case 'EADDRINUSE':
        console.error(bind + ' is already in use')
        process.exit(1)
      default:
        throw error
    }
  }

  /**
  * Event listener for HTTP server "listening" event.
  */
  function onListening () {
    var addr = server.address()
    var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port
    console.log('Listening on ' + bind)
  }
})()
