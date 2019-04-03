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
      port: (process.env.WEBPORT || 8080),
      cluster: (process.env.WEBCLUSTER || true),
    },
    config.logs = {
      folder: (process.env.LOGSFOLDER || 'logs'),
      rotationsize: (process.env.LOGSROTATIONSIZE || '1M')
    }
    config.auth = {
      secret: (process.env.AUTH_SECRET),
      tokenExpires: (process.env.AUTH_TOKEN_EXPIRES)
    }
    config.db = {
      host: (process.env.DBHOST || 'localhost'),
      port: parseInt(process.env.DBPORT || '8529'),
      name: process.env.DBNAME,
      user: process.env.DBUSER,
      password: process.env.DBPASSWORD
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
