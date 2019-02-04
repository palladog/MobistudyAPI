'use strict'

/**
* This provides the API endpoints for the participants profiles.
*/

import express from 'express'
import passport from 'passport'
import getDB from '../DB/DB'
import { applogger } from '../logger'

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
          participants = await db.getParticipantsByStudyCurrentStatus(req.query.currentStatus)
        } else {
          participants = await db.getAllParticipants()
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
        applogger.debug(newparticipant, 'New participant profile created')
        res.send(newparticipant)
      } else res.sendStatus(403)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot store new participant')
      res.sendStatus(500)
    }
  })

  // Delete Specified participant
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
        await db.removeParticipant(partKey)
        await db.removeUser(userKey)
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
      res.sendStatus(200)
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
    } catch (err) {
      applogger.error({ error: err }, 'Cannot update participant with _key ' + req.params.participant_key)
      res.sendStatus(500)
    }
  })

  router.delete('/participants/byuserkey/:userKey', passport.authenticate('jwt', { session: false }), async function (req, res) {
    if (req.user.role === 'participant' && req.params.userKey !== req.user._key) return res.sendStatus(403)
    if (req.user.role === 'researcher') return res.status(403)
    try {
      let participant = await db.getParticipantByUserKey(req.params.userKey)
      if (!participant) return res.status(404)
      await db.removeParticipant(participant._key)
      await db.removeUser(req.params.userKey)
      // Remove Answers
      let answers = await db.getAllAnswersByUser(req.params.userKey)
      for (let i = 0; i < answers.length; i++) {
        let answerKey = answers[i]._key
        await db.deleteAnswer(answerKey)  
      }
      // Remove Health Store Data
      let healthData = await db.getHealthStoreDataByUser(req.params.userKey)
      for (let j = 0; j < healthData.length; j++) {
        let healthDataKey = healthData[j]._key
        await db.deleteHealthStoreData(healthDataKey)  
      }
      res.sendStatus(200)
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
  router.patch('/participants/byuserkey/:userKey/studies/:studyKey', passport.authenticate('jwt', { session: false }), async function (req, res) {
    let userKey = req.params.userKey
    let studyKey = req.params.studyKey
    let payload = req.body
    let currentStatus = payload.currentStatus
    try {
      if (req.user.role === 'participant' && req.params.userKey !== req.user._key) return res.sendStatus(403)
      if (req.user.role === 'researcher') {
        let allowedParts = await db.getParticipantsByResearcher(req.user._key)
        if (!allowedParts.includes(req.params.user)) return res.sendStatus(403)
      }
      if (!userKey || !studyKey || !currentStatus) return res.sendStatus(400)

      let participant = await db.getParticipantByUserKey(req.params.userKey)
      if (!participant) return res.status(404)

      participant.updatedTS = new Date()

      let studyIndex = -1
      if (!participant.studies) {
        participant.studies = []
      } else {
        studyIndex = participant.studies.findIndex((s) => {
          return s.studyKey === studyKey
        })
      }
      if (studyIndex === -1) {
        participant.studies.push({
          studyKey: studyKey
        })
        studyIndex = participant.studies.length - 1
      }
      participant.studies[studyIndex] = payload
      // Update the DB
      await db.updateParticipant(participant._key, participant)
      res.sendStatus(200)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot update participant with user key ' + userKey)
      res.sendStatus(500)
    }
  })

  return router
}
