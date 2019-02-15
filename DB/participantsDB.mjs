'use strict'

/**
* This provides the data access for the Study participants.
*/

import utils from './utils'
import { applogger } from '../logger'

export default async function (db, logger) {
  let collection = await utils.getCollection(db, 'participants')

  return {
    async getAllParticipants () {
      var filter = ''
      // TODO: use LIMIT @offset, @count in the query for pagination

      var query = 'FOR participant in participants ' + filter + ' RETURN participant'
      applogger.trace('Querying "' + query + '"')
      let cursor = await db.query(query)
      return cursor.all()
    },

    async createParticipant (newparticipant) {
      let meta = await collection.save(newparticipant)
      newparticipant._key = meta._key
      return newparticipant
    },

    async getOneParticipant (_key) {
      let participant = await collection.document(_key)
      return participant
    },

    async getParticipantByUserKey (userKey) {
      let filter = ''
      let bindings = { 'userkey': userKey }
      if (userKey) {
        filter = ' FILTER participant.userKey == @userkey '
      }
      var query = 'FOR participant IN participants ' +
      filter + ' RETURN participant'
      applogger.trace(bindings, 'Querying "' + query + '"')
      let cursor = await db.query(query, bindings)
      let parts = await cursor.all()
      return parts[0]
    },

    // currentStatus is optional
    async getParticipantsByStudy (studykey, currentStatus) {
      let filter = ' FILTER @studyKey IN participant.studies[*].studyKey '
      let bindings = { 'studyKey': studykey }
      if (currentStatus) {
        bindings.currentStatus = currentStatus
        filter += ' AND @currentStatus IN participant.studies[*].currentStatus  '
      }
      var query = 'FOR participant IN participants ' + filter + ' RETURN participant'
      applogger.trace(bindings, 'Querying "' + query + '"')
      let cursor = await db.query(query, bindings)
      return cursor.all()
    },

    async getParticipantsByResearcher (researcherKey) {
      let query = `FOR team IN teams
      FILTER @researcherKey IN team.researchersKeys
      FOR study IN studies
      FILTER study.teamKey == team._key
      FOR participant IN participants
      FILTER study._key IN participant.studies[*].studyKey
      RETURN participant._key`
      let bindings = { 'researcherKey': researcherKey }
      applogger.trace(bindings, 'Querying "' + query + '"')
      let cursor = await db.query(query, bindings)
      return cursor.all()
    },

    async getParticipantsStatusCountByStudy (studykey) {
      let bindings = { 'studyKey': studykey }
      var query = `FOR participant IN participants
      FILTER @studyKey IN participant.studies[*].studyKey
      COLLECT statuses = participant.studies[* FILTER CURRENT.studyKey == @studyKey].currentStatus WITH COUNT INTO statuesLen      
      RETURN { status: FIRST(statuses), count: statuesLen }`
      applogger.trace(bindings, 'Querying "' + query + '"')
      let cursor = await db.query(query, bindings)
      return cursor.all()
    },

    async getParticipantsByCurrentStatus (currentStatus) {
      let bindings = { 'currentStatus': currentStatus }
      var query = 'FOR participant IN participants FILTER @currentStatus IN participant.studies[*].currentStatus RETURN participant'
      applogger.trace(bindings, 'Querying "' + query + '"')
      let cursor = await db.query(query, bindings)
      return cursor.all()
    },

    // currentStatus is optional
    async getParticipantsByTeam (teamKey, currentStatus) {
      let bindings = { teamKey: teamKey }

      let statusFilter = ''
      if (currentStatus) {
        bindings.currentStatus = currentStatus
        statusFilter += 'AND @currentStatus IN participant.studies[*].currentStatus '
      }

      let query = 'FOR study IN studies FILTER study.teamKey == @teamKey ' +
      'FOR participant IN participants FILTER study._key IN participant.studies[*].studyKey ' +
      statusFilter +
      'RETURN  participant'

      applogger.trace(bindings, 'Querying "' + query + '"')
      let cursor = await db.query(query, bindings)
      return cursor.all()
    },

    // udpates a participant, we assume the _key is the correct one
    async replaceParticipant (_key, participant) {
      let meta = await collection.replace(_key, participant)
      applogger.trace(participant, 'Replacing participant "' + _key + '"')
      participant._key = meta._key
      return participant
    },

    // udpates a participant, we assume the _key is the correct one
    async updateParticipant (_key, participant) {
      let newval = await collection.update(_key, participant, { keepNull: false, mergeObjects: true, returnNew: true })
      applogger.trace(participant, 'Updating participant "' + _key + '"')
      return newval
    },

    // deletes an participant
    async removeParticipant (_key) {
      await collection.remove(_key)
      applogger.trace('Removing participant "' + _key + '"')
      return true
    }
  }
}
