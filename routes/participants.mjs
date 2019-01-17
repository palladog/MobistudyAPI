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
        let result = await db.getOneParticipant(req.user._key)
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
        res.send(newparticipant)
      } else res.sendStatus(403)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot store new participant')
      res.sendStatus(500)
    }
  })

  router.put('/participants/:participant_key', passport.authenticate('jwt', { session: false }), async function (req, res) {
    let newparticipant = req.body
    try {
      if (req.user.role === 'participant' || req.user.role === 'admin') {
        newparticipant = await db.replaceParticipant(req.params.participant_key, newparticipant)
        res.send(newparticipant)
      } else res.sendStatus(403)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot replace participant with _key ' + req.params.participant_key)
      res.sendStatus(500)
    }
  })

  router.patch('/participants/:participant_key', passport.authenticate('jwt', { session: false }), async function (req, res) {
    let newparticipant = req.body
    newparticipant.updatedTS = new Date()
    try {
      if (req.user.role === 'participant') {
        let part = await db.getOneParticipant(req.params.participant_key)
        if (part.userKey !== req.user._key) return res.status(403)
      }
      if (req.user.role === 'researcher') return res.status(403)

      newparticipant = await db.updateParticipant(req.params.participant_key, newparticipant)
      res.send(newparticipant)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot update participant with _key ' + req.params.participant_key)
      res.sendStatus(500)
    }
  })

  // this endpoint is for the app to update the status of the participant regarding a study
  router.post('/participants/:participant_key/studyUpdates/:studyKey/:status', passport.authenticate('jwt', { session: false }), async function (req, res) {
    let participantKey = req.params.participant_key
    let studyKey = req.params.studyKey
    let status = req.params.status
    let payload = req.body
    if (!participantKey || !studyKey || !status) return res.sendStatus(400)
    try {
      if (req.user.role === 'participant') {
        let part = await db.getOneParticipant(req.params.participant_key)
        if (part.userKey !== req.user._key) return res.status(403)
        let studyIndex = part.studies.findIndex((s) => {
          return s.studyKey === studyKey
        })
        if (studyIndex === -1) {
          part.studies.push({
            studyKey: studyKey
          })
          studyIndex = part.studies.lenght - 1
        }
        part.studies[studyIndex].currentStatus = status
        part.studies[studyIndex] = Object.assign(payload, part.studies[studyIndex])
        // Update the DB
        await db.replaceParticipant(participantKey, part)
        res.sendStatus(200)
      } else res.sendStatus(403)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot update participant with _key ' + req.body.withdrawnOne.partKey)
      res.sendStatus(500)
    }
  })

  // Delete Specified participant
  router.delete('/participants/:participant_key', passport.authenticate('jwt', { session: false }), async function (req, res) {
    try {
      let partKey = req.params.participant_key
      // Participant can remove only itself from Participant and Users DB
      if (partKey !== null) {
        let participant = await db.getOneParticipant(partKey)
        if (participant !== null) {
          let user_Key = participant.userKey
          if (req.user.role === 'admin') {
            if (user_Key !== null) {
              // Get User Key of participant first. Then remove participant and then user.
              await db.removeParticipant(partKey)
              await db.removeUser(user_Key)
              res.sendStatus(200)
            } else res.sendStatus(403)
          } else if (req.user.role === 'participant') {
            if (user_Key !== null && req.user._key === user_Key) {
              await db.removeParticipant(partKey)
              await db.removeUser(user_Key)
              res.sendStatus(200)
            } else res.sendStatus(403)
          } else res.sendStatus(403)
        } else res.sendStatus(403)
      } else res.sendStatus(403)
    } catch (err) {
      // respond to request with error
      applogger.error({ error: err }, 'Cannot delete participant')
      res.sendStatus(500)
    }
  })

  // Participant by userkey
  router.get('/participants/byuserkey/:userKey', passport.authenticate('jwt', { session: false }), async function (req, res) {
    try {
      if (req.user.role === 'participant' && req.params.userKey !== req.user._key) return res.sendStatus(403)
      else if (req.user.role === 'researcher') {
        let parts = await db.getParticipantsByResearcher(req.user._key)
        if (!parts.includes(req.params.user)) return res.sendStatus(403)
      } else {
        let participant = await db.getParticipantByUserKey(req.params.userKey)
        res.send(participant)
      }
    } catch (err) {
      applogger.error({ error: err }, 'Cannot retrieve participant with userKey ' + req.params.userKey)
      res.sendStatus(500)
    }
  })

  router.put('/participants/byuserkey/:userKey', passport.authenticate('jwt', { session: false }), async function (req, res) {
    let newparticipant = req.body
    try {
      if (req.user.role === 'participant' && req.params.userKey !== req.user._key) return res.sendStatus(403)
      else {
        let participant = await db.getParticipantByUserKey(req.params.userKey)
        newparticipant = await db.replaceParticipant(participant._key, newparticipant)
        res.send(newparticipant)
      }
      if (req.user.role === 'researcher') return res.status(403)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot replace participant with userKey ' + req.params.userKey)
      res.sendStatus(500)
    }
  })

  router.patch('/participants/byuserkey/:userKey', passport.authenticate('jwt', { session: false }), async function (req, res) {
    let newparticipant = req.body
    newparticipant.updatedTS = new Date()
    try {
      if (req.user.role === 'participant') {
        let part = await db.getParticipantByUserKey(req.params.userKey)
        if (part.userKey !== req.user._key) return res.status(403)
      }
      if (req.user.role === 'researcher') return res.status(403)

      newparticipant = await db.updateParticipant(part._key, newparticipant)
      res.send(newparticipant)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot update participant with _key ' + req.params.participant_key)
      res.sendStatus(500)
    }
  })

  router.delete('/participants/byuserkey/:userKey', passport.authenticate('jwt', { session: false }), async function (req, res) {
    try {
      let partKey = await db.getParticipantByUserKey(req.params.userKey)
      partKey = partKey._key
      // Participant can remove only itself from Participant and Users DB
      if (partKey !== null) {
        let participant = await db.getOneParticipant(partKey)
        if (participant !== null) {
          if (req.user.role === 'admin') {
              // Get User Key of participant first. Then remove participant and then user.
              await db.removeParticipant(partKey)
              await db.removeUser(req.params.userKey)
              res.sendStatus(200)
          } else if (req.user.role === 'participant') {
            if (req.params.userKey !== null && req.user._key === req.params.userKey) {
              await db.removeParticipant(partKey)
              await db.removeUser(req.params.userKey)
              res.sendStatus(200)
            } else res.sendStatus(403)
          } else res.sendStatus(403)
        } else res.sendStatus(403)
      } else res.sendStatus(403)
    } catch (err) {
      // respond to request with error
      applogger.error({ error: err }, 'Cannot delete participant')
      res.sendStatus(500)
    }
    })


  return router
}
