'use strict'

/**
* Sets-up the loggers.
* Returns two loggers, one for the http raw stuff and one for the application.
*/

import fs from 'fs'
import secrets from './secrets'

var config

export default function () {
  if (!config) {
    try {
      const configfile = fs.readFileSync('config.json', 'utf8')
      config = JSON.parse(configfile)
    } catch (err) {
      console.log('No config file was specified, using secrets or defaults')
      config = {}
      config.web = {
        port: (process.env.WEB_PORT || 8080),
        cluster: (process.env.WEB_CLUSTER || true),
      },
      config.logs = {
        folder: (process.env.LOGS_FOLDER || 'logs'),
        rotationsize: (process.env.LOGS_ROTATIONSIZE || '1M'),
        console: (process.env.LOGS_CONSOLE || false),
        level: (parseInt(process.env.LOGS_LEVEL) || 30)
      }
      config.auth = {
        secret: (secrets.get('AUTH_SECRET') || process.env.AUTH_SECRET),
        tokenExpires: (process.env.AUTH_TOKEN_EXPIRES),
        adminEmail: (secrets.get('AUTH_ADMIN_EMAIL') || process.env.AUTH_ADMIN_EMAIL),
        adminPassword: (secrets.get('AUTH_ADMIN_PASSWORD') || process.env.AUTH_ADMIN_PASSWORD)
      }
      config.db = {
        host: (process.env.DB_HOST || 'localhost'),
        port: parseInt(process.env.DB_PORT || '8529'),
        name: (secrets.get('DB_NAME') || process.env.DB_NAME),
        user: (secrets.get('DB_USER') || process.env.DB_USER),
        password: (secrets.get('DB_PASSWORD') || process.env.DB_PASSWORD)
      }
      config.gmail = {
        email: process.env.GMAIL_EMAIL,
        client_id: (secrets.get('GMAIL_CLIENTID') || process.env.GMAIL_CLIENTID),
        project_id: (secrets.get('GMAIL_PROJECTID') || process.env.GMAIL_PROJECTID),
        client_secret: (secrets.get('GMAIL_SECRET') || process.env.GMAIL_SECRET),
        refresh_token: (secrets.get('GMAIL_REFESHTOKEN') || process.env.GMAIL_REFESHTOKEN)
      }
    }
  }
  return config
}
