'use strict'

/**
* This module abstracts the whole DB with functions (a DAO).
*/
import fs from 'fs'
import Database from 'arangojs'
import getStudiesDB from './studiesDB'
import getFormsDB from './formsDB'
import getUsersDB from './usersDB'

export default async function (logger) {
  var config = {}
  try {
    const configfile = await fs.promises.readFile('config.json', 'utf8')
    config = JSON.parse(configfile)
  } catch (err) {
    config.db = {
      host: (process.env.DBHOST || 'localhost'),
      port: parseInt(process.env.DBPORT || '8529'),
      name: process.env.DBNAME,
      user: process.env.DBUSER,
      password: process.env.DBPASSWORD
    }
    config.logs = {
      folder: (process.env.LOGSFOLDER || 'logs'),
      rotationsize: (process.env.LOGSROTATIONSIZE || '1M')
    }
  }

  try {
    console.log(config)
    const db = new Database({ url: 'http://' + config.db.host + ':' + config.db.port })

    db.useDatabase(config.db.name)
    db.useBasicAuth(config.db.user, config.db.password)
    var dao = {}

    let studies = await getStudiesDB(db)
    dao = Object.assign(studies, dao)
    let forms = await getFormsDB(db)
    dao = Object.assign(forms, dao)
    let users = await getUsersDB(db)
    dao = Object.assign(users, dao)

    // TODO: add new collections here
    return dao
  } catch (err) {
    console.error('----> CANNOT CONNECT TO DATABASE !!!!')
    throw err
  }
}
