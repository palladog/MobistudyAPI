'use strict'

/**
* This provides the data access for the Study participants.
*/

import utils from './utils'
import { applogger } from '../logger'

export default async function (db, logger) {
  let collection = await utils.getCollection(db, 'auditlogs')

  return {
    async getAllLogs (queryObj) {
      console.log('Query ', queryObj.from)
        let queryString = ' FILTER'
        var filter = ''
        if(queryObj.from)
        // TODO: use LIMIT @offset, @count in the query for pagination
  
        var query = 'FOR log in auditlogs ' + filter + ' RETURN log'
        applogger.trace('Querying "' + query + '"')
        let cursor = await db.query(query)
        return cursor.all()
      },
      async createAuditLog (newLog) {
        let meta = await collection.save(newLog)
        newLog._key = meta._key
        return newLog
      }, 
      // deletes an audit log
      async deleteAuditLog (_key) {
        await collection.remove(_key)
        return true
      }
  }
 
}
