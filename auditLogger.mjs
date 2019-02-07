'use strict'

/**
* Audit log, uses the DB to log events and it includes the file logger too.
*/
import getDB from './DB/DB'

export default {
  db: undefined,
  async log (event, userKey, studyKey, taskId, message, refData, refKey, data) {
    if (!this.db) this.db = await getDB()
    this.db.addAuditLog({ timestamp: new Date(),
      event,
      userKey,
      studyKey,
      taskId,
      message,
      refData,
      refKey,
      data })
  }
}
