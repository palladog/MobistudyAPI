'use strict'

/**
* Sets-up the loggers.
* Returns two loggers, one for the http raw stuff and one for the application.
*/

import fs from 'fs'

var config

/**
* Retrieves Docker secrets from /run/secrets
*/
function getSwarmSecret(secret){
  try{
    // Swarm secret are accessible within tmpfs /run/secrets dir
    return fs.readFileSync(util.format('/run/secrets/%s', secret), 'utf8').trim()
   }
   catch(e){
     return false
   }
 }

export default function () {
  if (!config) {
    try {
      const configfile = fs.readFileSync('./config.json', 'utf8')
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
        secret: (getSwarmSecret('AUTH_SECRET') || process.env.AUTH_SECRET),
        tokenExpires: (process.env.AUTH_TOKEN_EXPIRES),
        adminEmail: (getSwarmSecret('AUTH_ADMIN_EMAIL') || process.env.AUTH_ADMIN_EMAIL),
        adminPassword: (getSwarmSecret('AUTH_ADMIN_PASSWORD') || process.env.AUTH_ADMIN_PASSWORD)
      }
      config.db = {
        host: (process.env.DB_HOST || 'localhost'),
        port: parseInt(process.env.DB_PORT || '8529'),
        name: (getSwarmSecret('DB_NAME') || process.env.DB_NAME),
        user: (getSwarmSecret('DB_USER') || process.env.DB_USER),
        password: (getSwarmSecret('DB_PASSWORD') || process.env.DB_PASSWORD)
      }
      config.gmail = {
        email: process.env.GMAIL_EMAIL,
        client_id: (getSwarmSecret('GMAIL_CLIENTID') || process.env.GMAIL_CLIENTID),
        project_id: (getSwarmSecret('GMAIL_PROJECTID') || process.env.GMAIL_PROJECTID),
        client_secret: (getSwarmSecret('GMAIL_SECRET') || process.env.GMAIL_SECRET),
        refresh_token: (getSwarmSecret('GMAIL_REFESHTOKEN') || process.env.GMAIL_REFESHTOKEN)
      }
    }
  }
  return config
}
