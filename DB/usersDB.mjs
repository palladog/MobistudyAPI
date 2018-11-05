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
import { applogger } from '../logger'

export default async function (db, logger) {
  let usersCollection = await utils.getCollection(db, 'users')
  await utils.getCollection(db, 'teams')

  return {
    async findUser (email) {
      var query = 'FOR user in users FILTER user.email == \'' + email + '\' RETURN user'
      applogger.trace('Querying "' + query + '"')
      let cursor = await db.query(query)
      let users = await cursor.all()
      if (users.length) return users[0]
      else return undefined
    },

    async createUser (newuser) {
      let meta = await usersCollection.save(newuser)
      newuser._key = meta._key
      return newuser
    },

    async getOneUsers (key) {
      let bindings = { key: key }
      var query = 'FOR user in users FILTER user._key == @key RETURN user'
      applogger.trace(bindings, 'Querying "' + query + '"')
      let cursor = await db.query(query, bindings)
      return cursor.all()
    },

    async getAllUsers (role, studyKey, studyKeys) {
      let join = ''
      let filter = ''
      let bindings = {}
      if (studyKey) {
        join = ' FOR study in studies '
        filter = ' FILTER studies._key == @studyKey '
        bindings.studyKey = studyKey
      }
      if (studyKeys) {
        join = ' FOR study in studies '
        filter = ' FILTER studies._key IN @studyKey '
        bindings.studyKeys = studyKeys
      }
      if (role) {
        if (studyKey) filter += ' AND user.role == @role'
        else filter = ' FILTER user.role == @role'
        bindings.role = role
      }

      var query = 'FOR user in users ' + join + filter + ' RETURN user'
      applogger.trace(bindings, 'Querying "' + query + '"')
      let cursor = await db.query(query, bindings)
      return cursor.all()
    }
  }
}
