'use strict'

/**
* This provides the data access for the Study Stats.
*/

import utils from './utils'
import { applogger } from '../logger'

export default async function (db, logger) {
  let collection = await utils.getCollection(db, 'studyStats')

  return {
    async getAllstudyStats () {
      let filter = ''
      let query = 'FOR stat IN studyStats ' + filter + ' RETURN stat'
      applogger.trace('Querying "' + query + '"')
      let cursor = await db.query(query)
      return cursor.all()
    },

    async getStudyStatsByUser (userKey) {
      var query = 'FOR stat IN studyStats FILTER stat.userKey == @userKey RETURN stat'
      let bindings = { userKey: userKey }
      applogger.trace(bindings, 'Querying "' + query + '"')
      let cursor = await db.query(query, bindings)
      return cursor.all()
    },

    async getStudyStatsByUserAndStudy (userKey, studyKey) {
      var query = 'FOR stat IN studyStats FILTER stat.userKey == @userKey AND stat.studyKey == @studyKey RETURN stat'
      let bindings = { userKey: userKey, studyKey: studyKey }
      applogger.trace(bindings, 'Querying "' + query + '"')
      let cursor = await db.query(query, bindings)
      return cursor.all()
    },

    async getStudyStatsByStudy (studyKey) {
      var query = 'FOR stat IN studyStats FILTER stat.studyKey == @studyKey RETURN stat'
      let bindings = { studyKey: studyKey }
      applogger.trace(bindings, 'Querying "' + query + '"')
      let cursor = await db.query(query, bindings)
      return cursor.all()
    },

    async createStudyStats (newstudyStats) {
      let meta = await collection.save(newstudyStats)
      newstudyStats._key = meta._key
      return newstudyStats
    },

    async getOneStudyStats (_key) {
      const studyStats = await collection.document(_key)
      return studyStats
    },

    // deletes Study Stats
    async deleteStudyStats (_key) {
      await collection.remove(_key)
      return true
    }
  }
}
