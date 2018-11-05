'use strict'

/**
* This provides the data access for the study descriptions.
*/

import utils from './utils'
import { applogger } from '../logger'

export default async function (db, logger) {
  let collection = await utils.getCollection(db, 'studies')

  return {
    async getAllStudies () {
      // TODO: use the filter for access control later
      var filter = ''

      // TODO: use LIMIT @offset, @count in the query for pagination

      var query = 'FOR study in studies ' + filter + ' RETURN study'
      applogger.trace('Querying "' + query + '"')
      let cursor = await db.query(query)
      return cursor.all()
    },

    async createStudy (newstudy) {
      // TODO: use the filter for access control later
      let meta = await collection.save(newstudy)
      newstudy._key = meta._key
      return newstudy
    },

    async getOneStudy (_key) {
      // TODO: use the filter for access control later
      const study = await collection.document(_key)
      return study
    },

    // udpates a study, we assume the _key is the correct one
    async updateStudy (_key, study) {
      // TODO: use the filter for access control later
      let meta = await collection.replace(_key, study)
      study._key = meta._key
      return study
    },

    // udpates a study, we assume the _key is the correct one
    async patchStudy (_key, study) {
      // TODO: use the filter for access control later
      let newval = await collection.update(_key, study, { keepNull: false, mergeObjects: true, returnNew: true })
      return newval
    },

    // deletes a study
    async deleteStudy (_key) {
      // TODO: use the filter for access control later
      await collection.remove(_key)
      return true
    }
  }
}
