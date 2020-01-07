'use strict'

/**
* Some utilities for the DB.
*/
export default {
  getCollection: async function (db, collname) {
    // load or create collection
    let names = await db.listCollections()
    var found = false

    for (var ii = 0; !found && ii < names.length; ii++) {
      if (names[ii].name === collname) {
        found = true
      }
    }
    var coll = db.collection(collname)

    if (!found) {
      return coll.create()
    } else {
      return coll
    }
  }
}
