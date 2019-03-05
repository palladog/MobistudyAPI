'use strict'

/**
* This provides the API endpoints for the participants profiles.
*/

import express from 'express'
import passport from 'passport'
import getDB from '../DB/DB'
import { applogger } from '../logger'
import auditLogger from '../auditLogger'
import { sendEmail } from '../mailSender'

const router = express.Router()

export default async function () {
  var db = await getDB()

  // query parameters:
  // teamKey, studyKey, currentStatus
  router.get('/participants', passport.authenticate('jwt', { session: false }), async function (req, res) {
    try {
      if (req.user.role === 'participant') {
        // participants can retrieve only themselves
        let result = await db.getParticipantByUserKey(req.user._key)
        res.send(result)
      } else if (req.user.role === 'researcher' || req.user.role === 'admin') {
        if (req.user.role === 'researcher') {
          // extra check about the teams
          if (req.query.teamKey) {
            let team = await db.getOneTeam(req.query.teamKey)
            if (!team.researchersKeys.includes(req.user._key)) return res.sendStatus(403)
          }
          if (req.query.studyKey) {
            let team = await db.getAllTeams(req.user._key, req.query.studyKey)
            if (team.length === 0) return res.sendStatus(403)
          }
        }
        let participants = []
        if (req.query.studyKey) {
          participants = await db.getParticipantsByStudy(req.query.studyKey, req.query.currentStatus)
        } else if (req.query.teamKey) {
          participants = await db.getParticipantsByTeam(req.query.teamKey, req.query.currentStatus)
        } else if (req.query.currentStatus) {
          if (req.user.role === 'researcher') {
            participants = await db.getParticipantsByResearcher(req.user._key, req.query.currentStatus)
          } else { // admin
            participants = await db.getParticipantsByCurrentStatus(req.query.currentStatus)
          }
        } else {
          if (req.user.role === 'researcher') {
            participants = await db.getParticipantsByResearcher(req.user._key)
          } else {
            participants = await db.getAllParticipants()
          }
        }
        res.json(participants)
      } else res.sendStatus(403)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot retrieve participants')
      res.sendStatus(500)
    }
  })

  router.get('/participants/:participant_key', passport.authenticate('jwt', { session: false }), async function (req, res) {
    try {
      if (req.user.role === 'participant' && req.params.participant_key !== req.user._key) return res.sendStatus(403)
      else if (req.user.role === 'researcher') {
        let parts = await db.getParticipantsByResearcher(req.user._key)
        if (!parts.includes(req.params.participant_key)) return res.sendStatus(403)
      } else {
        let participant = await db.getOneParticipant(req.params.participant_key)
        res.send(participant)
      }
    } catch (err) {
      applogger.error({ error: err }, 'Cannot retrieve participant with _key ' + req.params.participant_key)
      res.sendStatus(500)
    }
  })

  router.post('/participants', passport.authenticate('jwt', { session: false }), async function (req, res) {
    let newparticipant = req.body
    newparticipant.createdTS = new Date()
    try {
      if (req.user.role === 'participant') {
        newparticipant = await db.createParticipant(newparticipant)
        res.send(newparticipant)
        applogger.info({ userKey: newparticipant.userKey, participantKey: newparticipant._key }, 'New participant profile created')
        auditLogger.log('participantCreated', req.user._key, undefined, undefined, 'New participant created', 'participants', newparticipant._key, newparticipant)
      } else res.sendStatus(403)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot store new participant')
      res.sendStatus(500)
    }
  })

  // Delete Specified participant. Called from Web API by Admin.
  router.delete('/participants/:participant_key', passport.authenticate('jwt', { session: false }), async function (req, res) {
    try {
      let partKey = req.params.participant_key
      // Get User Key of participant first. Then remove participant and then user.
      let participant = await db.getOneParticipant(partKey)
      if (participant === null) return res.sendStatus(404)
      // Participant can remove only himself from Participant and Users DB
      let userKey = participant.userKey
      if (req.user.role === 'admin' || req.user.role === 'participant') {
        if (req.user.role === 'participant' && req.params.userKey !== req.user._key) return res.sendStatus(403)
        // Remove Answers
        let answers = await db.getAllAnswersByUser(userKey)
        for (let i = 0; i < answers.length; i++) {
          let answerKey = answers[i]._key
          await db.deleteAnswer(answerKey)
        }
        // Remove Health Store Data
        let healthData = await db.getHealthStoreDataByUser(userKey)
        for (let j = 0; j < healthData.length; j++) {
          let healthDataKey = healthData[j]._key
          await db.deleteHealthStoreData(healthDataKey)
        }
        // Remove Audit logs
        let auditLogs = await db.getLogsByUser(userKey)
        for (let k = 0; k < auditLogs.length; k++) {
          let auditLogKey = auditLogs[k]._key
          await db.deleteLog(auditLogKey)
        }
        await db.removeParticipant(partKey)
        await db.removeUser(userKey)
        res.sendStatus(200)
        applogger.info({ participantKey: partKey }, 'Participant profile deleted')
        auditLogger.log('participantDeleted', req.user._key, undefined, undefined, 'Participant deleted', 'participants', partKey, undefined)
      }
    } catch (err) {
      // respond to request with error
      applogger.error({ error: err }, 'Cannot delete participant')
      res.sendStatus(500)
    }
  })

  // Participant by userkey
  router.get('/participants/byuserkey/:userKey', passport.authenticate('jwt', { session: false }), async function (req, res) {
    if (req.user.role === 'participant' && req.params.userKey !== req.user._key) return res.sendStatus(403)
    if (req.user.role === 'researcher') {
      let allowedParts = await db.getParticipantsByResearcher(req.user._key)
      if (!allowedParts.includes(req.params.user)) return res.sendStatus(403)
    }
    try {
      let participant = await db.getParticipantByUserKey(req.params.userKey)
      if (!participant) return res.status(404)
      res.send(participant)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot retrieve participant with userKey ' + req.params.userKey)
      res.sendStatus(500)
    }
  })

  // this is meant to be used to update the info not related to the studies
  router.patch('/participants/byuserkey/:userKey', passport.authenticate('jwt', { session: false }), async function (req, res) {
    let newparticipant = req.body
    if (newparticipant.createdTS) delete newparticipant.createdTS
    // timestamp the update
    newparticipant.updatedTS = new Date()
    // ignore the studies property
    delete newparticipant.studies
    if (req.user.role === 'participant' && req.params.userKey !== req.user._key) return res.sendStatus(403)
    if (req.user.role === 'researcher') return res.status(403)
    try {
      let participant = await db.getParticipantByUserKey(req.params.userKey)
      if (!participant) return res.status(404)
      newparticipant = await db.updateParticipant(participant._key, newparticipant)
      res.send(newparticipant)
      applogger.info({ participantKey: participant._key }, 'Participant profile updated')
      auditLogger.log('participantUpdated', req.user._key, undefined, undefined, 'Participant updated', 'participants', participant._key, newparticipant)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot update participant with _key ' + req.params.participant_key)
      res.sendStatus(500)
    }
  })

  // participant deletes himself
  router.delete('/participants/byuserkey/:userKey', passport.authenticate('jwt', { session: false }), async function (req, res) {
    if (req.user.role === 'participant' && req.params.userKey !== req.user._key) return res.sendStatus(403)
    if (req.user.role === 'researcher') return res.status(403)
    try {
      let userKey = req.params.userKey
      let participant = await db.getParticipantByUserKey(userKey)
      if (!participant) return res.status(404)
      // Remove Answers
      let answers = await db.getAllAnswersByUser(userKey)
      for (let i = 0; i < answers.length; i++) {
        let answerKey = answers[i]._key
        await db.deleteAnswer(answerKey)
      }
      // Remove Health Store Data
      let healthData = await db.getHealthStoreDataByUser(userKey)
      for (let j = 0; j < healthData.length; j++) {
        let healthDataKey = healthData[j]._key
        await db.deleteHealthStoreData(healthDataKey)
      }
      // Remove Audit logs
      let auditLogs = await db.getLogsByUser(userKey)
      for (let k = 0; k < auditLogs.length; k++) {
        let auditLogKey = auditLogs[k]._key
        await db.deleteLog(auditLogKey)
      }
      await db.removeParticipant(participant._key)
      await db.removeUser(req.params.userKey)
      res.sendStatus(200)
      applogger.info({ userKey: participant._key }, 'Participant profile deleted')
      auditLogger.log('participantDeleted', req.user._key, undefined, undefined, 'Participant deleted', 'participants', participant._key, undefined)
    } catch (err) {
      // respond to request with error
      applogger.error({ error: err }, 'Cannot delete participant')
      res.sendStatus(500)
    }
  })

  // this endpoint is for the app to update the status of the participant regarding a study
  // the data sent must contain the current status and the timestamp
  // withdrawalReason must be added in the case of a withdrawal
  // criteriaAnswers must be added in case of acceptance of not eligible
  // taskItemsConsent and extraItemsConsent can be added, but is not mandatory
  // example: { currentStatus: 'withdrawn', timestamp: 'ISO string', withdrawalReason: 'quit' }
  // Send Emails on change of status: active, completed, withdrawn
  router.patch('/participants/byuserkey/:userKey/studies/:studyKey', passport.authenticate('jwt', { session: false }), async function (req, res) {
    let userKey = req.params.userKey
    let studyKey = req.params.studyKey
    let payload = req.body
    payload.studyKey = studyKey
    let currentStatus = undefined
    let updatedCurrentStatus = undefined
    try {
      if (req.user.role === 'participant' && req.params.userKey !== req.user._key) return res.sendStatus(403)
      if (req.user.role === 'researcher') {
        let allowedParts = await db.getParticipantsByResearcher(req.user._key)
        if (!allowedParts.includes(req.params.user)) return res.sendStatus(403)
      }
      if (!userKey || !studyKey) return res.sendStatus(400)
      // Get study status before patch update
      let participant = await db.getParticipantByUserKey(userKey)
      let pStu = participant.studies
      if (!participant) return res.status(404)
      for (let i = 0; i < pStu.length; i++) {
        // Before a participant accepts a study, there will be no current status in the participant
        if (pStu[i].studyKey === studyKey && pStu[i].currentStatus !== undefined) {
          currentStatus = pStu[i].currentStatus
        }
      }
      // Updated Time Stamp
      participant.updatedTS = new Date()

      let studyIndex = -1
      if (!pStu) {
        pStu = []
      } else {
        studyIndex = pStu.findIndex((s) => {
          return s.studyKey === studyKey
        })
      }
      if (studyIndex === -1) {
        pStu.push({
          studyKey: studyKey
        })
        studyIndex = pStu.length - 1
      }
      // TODO: use [deepmerge](https://github.com/TehShrike/deepmerge) instead
      pStu[studyIndex] = payload
      // Update the DB
      await db.updateParticipant(participant._key, participant)
      // Get Updated study status
      for (let i = 0; i < pStu.length; i++) {
        if (pStu[i].studyKey === studyKey) {
          updatedCurrentStatus = pStu[i].currentStatus
        }
      }
      // if there is a change in status, then send email reflecting updated status change
      if (updatedCurrentStatus !== currentStatus) {
        let study = await db.getOneStudy(studyKey)
        let title = study.generalities.title
        let emailTitle = ''
        let emailContent = ''
        if (updatedCurrentStatus === 'accepted') {
          emailTitle = 'Confirmation of Acceptance of Study ' + title
          emailContent = 'Thank you for accepting to take part in the study ' + title + '.'
        }
        if (updatedCurrentStatus === 'completed') {
          emailTitle = 'Completion of study ' + title
          emailContent = 'The study ' + title + ' has now been completed. Thank you for your participation.'
        }
        if (updatedCurrentStatus === 'withdrawn') {
          emailTitle = 'Withdrawal from study ' + title
          emailContent = 'You have withdrawn from the study ' + title + '. Thank you for your time.'
        }
        let user = await db.getOneUser(userKey)
        // Send User Email
        sendEmail(user.email, emailTitle, emailContent)
      }
      res.sendStatus(200)
      applogger.info({ participantKey: participant._key, study: payload }, 'Participant has changed studies status')
      auditLogger.log('participantStudyUpdate', req.user._key, payload.studyKey, undefined, 'Participant with key ' + participant._key + ' has changed studies status', 'participants', participant._key, payload)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot update participant with user key ' + userKey)
      res.sendStatus(500)
    }
  })
  // gets simple statistics about the study
  router.get('/participants/statusStats/:studyKey', passport.authenticate('jwt', { session: false }), async function (req, res) {
    try {
      if (req.user.role === 'participant') {
        res.sendStatus(403)
      } else if (req.user.role === 'researcher') {
        if (req.user.role === 'researcher') {
          let team = await db.getAllTeams(req.user._key, req.params.studyKey)
          if (team.length === 0) return res.sendStatus(403)
        }
        let participants = await db.getParticipantsStatusCountByStudy(req.params.studyKey)
        res.json(participants)
      }
    } catch (err) {
      applogger.error({ error: err }, 'Cannot retrieve participants')
      res.sendStatus(500)
    }
  })

  return router
}
