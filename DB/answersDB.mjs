'use strict'

/**
* This provides the data access for the Study answers.
*/

import utils from './utils'
import { applogger } from '../logger'

export default async function (db, logger) {
  let collection = await utils.getCollection(db, 'answers')

  return {
    async getAllAnswers () {
      // TODO: use the filter for access control later
      var filter = ''

      // TODO: use LIMIT @offset, @count in the query for pagination

      var query = 'FOR answer in answers ' + filter + ' RETURN answer'
      applogger.trace('Querying "' + query + '"')
      let cursor = await db.query(query)
      return cursor.all()
    },

    async createAnswer (newanswer) {
      // TODO: use the filter for access control later
      let meta = await collection.save(newanswer)
      newanswer._key = meta._key
      return newanswer
    },

    async getOneAnswer (_key) {
      // TODO: use the filter for access control later
      const answer = await collection.document(_key)
      return answer
    },

    // udpates an answer, we assume the _key is the correct one
    async updateAnswer (_key, answer) {
      // TODO: use the filter for access control later
      let meta = await collection.replace(_key, answer)
      answer._key = meta._key
      return answer
    },

    // udpates an answer, we assume the _key is the correct one
    async patchAnswer (_key, answer) {
      // TODO: use the filter for access control later
      let newval = await collection.update(_key, answer, { keepNull: false, mergeObjects: true, returnNew: true })
      return newval
    },

    // deletes an answer
    async deleteAnswer (_key) {
      // TODO: use the filter for access control later
      await collection.remove(_key)
      return true
    }
  }
}
