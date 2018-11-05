'use strict'

/**
* This provides the data access for users.
* A use will have basic authentication and data access information:
* {
*   email: 'aas@as.com',
*   hashedPassword: 'asdasdasdasdads',
*   role: 'participant', (or 'admin', 'researcher')
*   teamKey: 'asdasdaasd' (only if the role is researcher)
* }
*/

import utils from './utils'
import getLoggers from '../logger'

export default async function (db, logger) {
  let usersCollection = await utils.getCollection(db, 'users')
  await utils.getCollection(db, 'teams')
  const loggers = await getLoggers()

  return {
    async findUser (email) {
      var query = 'FOR user in users FILTER user.email == \'' + email + '\' RETURN user'
      loggers.applogger.trace('Querying "' + query + '"')
      let cursor = await db.query(query)
      let users = await cursor.all()
      if (users.length) return users[0]
      else return undefined
    },

    async createUser (newuser) {
      let meta = await usersCollection.save(newuser)
      newuser._key = meta._key
      return newuser
    }
  }
}
