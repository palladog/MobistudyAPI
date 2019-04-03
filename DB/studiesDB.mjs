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
      var filter = ''

      // TODO: use LIMIT @offset, @count in the query for pagination

      var query = 'FOR study in studies ' + filter + ' RETURN study'
      applogger.trace('Querying "' + query + '"')
      let cursor = await db.query(query)
      return cursor.all()
    },

    async getAllTeamStudies (teamkey) {
      var query = 'FOR study in studies FILTER study.teamKey == @teamkey RETURN study'
      let bindings = { teamkey: teamkey }
      applogger.trace(bindings, 'Querying "' + query + '"')
      let cursor = await db.query(query, bindings)
      return cursor.all()
    },

    async getAllParticipantStudies (participantKey) {
      var query = `FOR participant IN participants
      FILTER participant._key == @participantKey
      FOR study IN studies
      FILTER study._key IN participant.studies[*].studyKey
      RETURN study`
      let bindings = { participantKey: participantKey }
      applogger.trace(bindings, 'Querying "' + query + '"')
      let cursor = await db.query(query, bindings)
      return cursor.all()
    },

    async createStudy (newstudy) {
      // TODO: use the filter for access control later
      let meta = await collection.save(newstudy)
      newstudy._key = meta._key
      return newstudy
    },

    async getOneStudy (studyKey) {
      var query = `FOR study IN studies FILTER study._key == @studyKey RETURN study`
      let bindings = { studyKey: studyKey }
      applogger.trace(bindings, 'Querying "' + query + '"')
      let cursor = await db.query(query, bindings)
      let study = await cursor.next()
      return study
    },

    // udpates a study, we assume the _key is the correct one
    async replaceStudy (_key, study) {
      const meta = await collection.replace(_key, study)
      study._key = meta._key
      return study
    },

    // udpates a study, we assume the _key is the correct one
    async udpateStudy (_key, study) {
      const newval = await collection.update(_key, study, { keepNull: false, mergeObjects: true, returnNew: true })
      return newval
    },

    // deletes a study
    async deleteStudy (_key) {
      await collection.remove(_key)
      return true
    },

    // gets all the studies that match inclusion criteria
    async getMatchedNewStudies (userKey) {
      const query = `FOR study IN studies
      FILTER !!study.publishedTS
      LET partsN = FIRST (
        RETURN COUNT(
          FOR part IN participants
          FILTER !!part.studies
          FILTER study._key IN part.studies[* FILTER !!CURRENT.acceptedTS].studyKey
          RETURN 1
        )
      )
      FILTER !study.numberOfParticipants || study.numberOfParticipants > partsN
      FOR participant IN participants
      LET age = DATE_DIFF(participant.dateOfBirth, DATE_NOW(), "year")
      FILTER participant.userKey == @userKey
      AND study._key NOT IN participant.studies[*].studyKey
      AND age >= study.inclusionCriteria.minAge AND age <= study.inclusionCriteria.maxAge
      AND participant.gender IN study.inclusionCriteria.gender
      RETURN study._key`
      // Commented out for 4YP ---> To replace above query with the one below
      // --> Search originally done wrt diseases, meds, age
      // FILTER !study.numberOfParticipants || study.numberOfParticipants > partsN
      // FOR participant IN participants
      // LET age = DATE_DIFF(participant.dateOfBirth, DATE_NOW(), "year")
      // FILTER participant.userKey == @userKey
      // AND study._key NOT IN participant.studies[*].studyKey
      // AND age >= study.inclusionCriteria.minAge AND age <= study.inclusionCriteria.maxAge
      // AND participant.gender IN study.inclusionCriteria.gender
      // AND (study.inclusionCriteria.lifestyle.active == 'notrequired'? TRUE : study.inclusionCriteria.lifestyle.active == participant.lifestyle.active)
      // AND (study.inclusionCriteria.lifestyle.smoker == 'notrequired'? TRUE : study.inclusionCriteria.lifestyle.smoker == participant.lifestyle.smoker)
      // AND study.inclusionCriteria.diseases[*].conceptId ALL IN participant.diseases[*].conceptId
      // AND study.inclusionCriteria.medications[*].conceptId ALL IN participant.medications[*].conceptId
      // RETURN study._key`
      let bindings = { userKey: userKey }
      applogger.trace(bindings, 'Querying "' + query + '"')
      let cursor = await db.query(query, bindings)
      return cursor.all()
    }
  }
}
