'use strict'

/**
* This provides the data access for the audit log
*/
import utils from './utils'

export default async function (db, logger) {
  let collection = await utils.getCollection(db, 'auditlogs')

  return {
    async addAuditLog (event, userKey, studyKey, message, refData, refKey, data) {
      let newLog = {
        timestamp: new Date(),
        event,
        userKey,
        studyKey,
        message,
        refData,
        refKey,
        data
      }
      let meta = await collection.save(newLog)
      newLog._key = meta._key
      return newLog
    },
    async getAuditLogs (queryObj) {
      console.log('Query ', queryObj.from)
      let queryString = ' FILTER'
      var filter = ''
      if(queryObj.from)
      // TODO: use LIMIT @offset, @count in the query for pagination

      var query = 'FOR log in auditlogs ' + filter + ' RETURN log'
      applogger.trace('Querying "' + query + '"')
      let cursor = await db.query(query)
      return cursor.all()
    }
  }
}
