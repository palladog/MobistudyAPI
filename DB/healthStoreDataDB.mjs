'use strict'

/**
* This provides the data access for the Study healthStoreData.
*/

import utils from './utils'
import { applogger } from '../logger'

export default async function (db, logger) {
  let collection = await utils.getCollection(db, 'healthStoreData')

  return {
    async getAllhealthStoreData () {
      var filter = ''

      // TODO: use LIMIT @offset, @count in the query for pagination

      var query = 'FOR data in healthStoreData ' + filter + ' RETURN data'
      applogger.trace('Querying "' + query + '"')
      let cursor = await db.query(query)
      return cursor.all()
    },

    async createHealthStoreData (newhealthStoreData) {
      let meta = await collection.save(newhealthStoreData)
      newhealthStoreData._key = meta._key
      return newhealthStoreData
    },

    async getOneHealthStoreData (_key) {
      const healthStoreData = await collection.document(_key)
      return healthStoreData
    },

    // udpates the healthStoreData, we assume the _key is the correct one
    async replaceHealthStoreData (_key, healthStoreData) {
      let meta = await collection.replace(_key, healthStoreData)
      healthStoreData._key = meta._key
      return healthStoreData
    },

    // udpates the healthStoreData, we assume the _key is the correct one
    async updateHealthStoreData (_key, healthStoreData) {
      let newval = await collection.update(_key, healthStoreData, { keepNull: false, mergeObjects: true, returnNew: true })
      return newval
    },

    // deletes healthStoreData
    async deleteHealthStoreData (_key) {
      await collection.remove(_key)
      return true
    }
  }
}
