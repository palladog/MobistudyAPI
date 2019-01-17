'use strict'

/**
* This module abstracts the whole DB with functions (a DAO).
*/

import Database from 'arangojs'
import getStudiesDB from './studiesDB'
import getFormsDB from './formsDB'
import getUsersDB from './usersDB'
import getAnswersDB from './answersDB'
import getTeamsDB from './teamsDB'
import getParticipantsDB from './participantsDB'
import getHealthStoreDataDB from './healthStoreDataDB'

import getConfig from '../config'

export default async function (logger) {
  var config = getConfig()

  try {
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
    let answers = await getAnswersDB(db)
    dao = Object.assign(answers, dao)
    let teams = await getTeamsDB(db)
    dao = Object.assign(teams, dao)
    let participants = await getParticipantsDB(db)
    dao = Object.assign(participants, dao)
    let healthStoreData = await getHealthStoreDataDB(db)
    dao = Object.assign(healthStoreData, dao)

    // TODO: add new collections here
    return dao
  } catch (err) {
    console.error('----> CANNOT CONNECT TO DATABASE !!!!')
    throw err
  }
}
