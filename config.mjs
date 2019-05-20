'use strict'

/**
* Sets-up the loggers.
* Returns two loggers, one for the http raw stuff and one for the application.
*/

import fs from 'fs'

export default function () {
  var config = {}
  try {
    const configfile = fs.readFileSync('config.json', 'utf8')
    config = JSON.parse(configfile)
  } catch (err) {
    console.log('No config file was specified, using environmental variables or defaults')

    config.web = {
      port: (process.env.WEB_PORT || 8080),
      cluster: (process.env.WEB_CLUSTER || true),
    },
    config.logs = {
      folder: (process.env.LOGS_FOLDER || 'logs'),
      rotationsize: (process.env.LOGS_ROTATIONSIZE || '1M'),
      console: (process.env.LOGS_CONSOLE || false)
    }
    config.auth = {
      secret: (process.env.AUTH_SECRET),
      tokenExpires: (process.env.AUTH_TOKEN_EXPIRES)
    }
    config.db = {
      host: (process.env.DB_HOST || 'localhost'),
      port: parseInt(process.env.DB_PORT || '8529'),
      name: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    }
    config.gmail = {
      email: process.env.GMAIL_EMAIL,
      client_id: process.env.GMAIL_CLIENTID,
      project_id: process.env.GMAIL_PROJECTID,
      client_secret: process.env.GMAIL_SECRET,
      refresh_token: process.env.GMAIL_REFESHTOKEN
    }
  }

  return config
}
