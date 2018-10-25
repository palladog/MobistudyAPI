'use strict'

/**
* This provides the data access for the form descriptions.
*/

import utils from './utils'
import getLoggers from '../logger'

export default async function (db, logger) {
  let collection = await utils.getCollection(db, 'forms')
  const loggers = await getLoggers()

  return {
    async getFormsList () {
      // TODO: use the filter for access control later
      var filter = ''

      // TODO: use LIMIT @offset, @count in the query for pagination

      var query = 'FOR form in forms ' + filter + ' SORT form.created RETURN { name: form.name, _key: form._key, created: form.created }'
      loggers.applogger.trace('Querying "' + query + '"')
      let cursor = await db.query(query)
      return cursor.all()
    },

    async getAllForms () {
      // TODO: use the filter for access control later
      var filter = ''

      // TODO: use LIMIT @offset, @count in the query for pagination

      var query = 'FOR form in forms ' + filter + ' RETURN form'
      loggers.applogger.trace('Querying "' + query + '"')
      let cursor = await db.query(query)
      return cursor.all()
    },

    async createForm (newform) {
      // TODO: use the filter for access control later
      let meta = await collection.save(newform)
      newform._key = meta._key
      return newform
    },

    async getOneForm (_key) {
      // TODO: use the filter for access control later
      const form = await collection.document(_key)
      return form
    },

    // udpates a form, we assume the _key is the correct one
    async updateForm (_key, form) {
      // TODO: use the filter for access control later
      let meta = await collection.replace(_key, form)
      form._key = meta._key
      return form
    },

    // udpates a form, we assume the _key is the correct one
    async patchForm (_key, form) {
      // TODO: use the filter for access control later
      let newval = await collection.update(_key, form, { keepNull: false, mergeObjects: true, returnNew: true })
      return newval
    },

    // deletes a form
    async deleteForm (_key) {
      // TODO: use the filter for access control later
      await collection.remove(_key)
      return true
    }
  }
}
