'use strict'

/**
* Audit log, uses the DB to log events and it includes the file logger too.
*/
import getDB from './DB/DB'

export default {
  db: undefined,
  log: async (event, userKey, studyKey, message, refData, refKey, data) => {
    if (!this.db) this.db = await getDB()
    this.db.addAuditLog(event, userKey, studyKey, message, refData, refKey, data)
  }
}
