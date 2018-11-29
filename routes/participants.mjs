'use strict'

/**
* This provides the API endpoints for the participants profiles.
*/

import express from 'express'
import passport from 'passport'
import getDB from '../DB/DB'
import { applogger } from '../logger'
import jwt from 'jsonwebtoken'

const router = express.Router()

export default async function () {
  var db = await getDB()

  router.get('/participants', passport.authenticate('jwt', { session: false }), async function (req, res) {
    try {
      if (req.user.role === 'admin') {
        // Admins can retrieve all
        let allParticipants = await db.getAllParticipants()
        res.send(allParticipants)
      } else if (req.user.role === 'participant') {
        // participants can retrieve only themselves
        let result = await db.getOneParticipant(req.user._key)
        res.send(result)
      } else res.sendStatus(403)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot retrieve participants')
      res.sendStatus(500)
    }
  })

  router.get('/participants/accepted/:team_key', passport.authenticate('jwt', { session: false }), async function (req, res) {
    try {
      if (req.user.role === 'researcher' || req.user.role === 'admin') {
        // researchers can retrieve only those related to the studies of their teams
        let studies, acceptedOnes = []
        // 1. Look in Studies for teams associated to team_key
          studies = await db.getAllTeamStudies(req.params.team_key)
          if (studies.length > 0)
          {
            // 2. Look in Participants for studies.
            for (let i = 0; i < studies.length; i++) {
              let arrP = []
              // Get all accepted participants of a study --> ['123', '456']
              let accParts = await db.getAllAcceptedParticipants (studies[i]._key)
              if (accParts.length > 0) {
                for (let j = 0; j < accParts.length; j++) {
                  arrP = accParts
                }
                acceptedOnes.push({
                  studyKey: studies[i]._key,
                  participants: arrP
                })
              } 
            }
            res.send(acceptedOnes)
          } else res.sendStatus(403)
      } else res.sendStatus(403)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot retrieve accepted participants')
      res.sendStatus(500)
    }
  })

  router.get('/participants/withdrawn/:team_key', passport.authenticate('jwt', { session: false }), async function (req, res) {
    try {
      if (req.user.role === 'researcher' || req.user.role === 'admin') {
        // researchers can retrieve only those related to the studies of their teams
        let studies, withdrawnOnes = []
        // 1. Look in Studies for teams associated to team_key
          studies = await db.getAllTeamStudies(req.params.team_key)
          if (studies.length > 0)
          {
            // 2. Look in Participants for studies.
            for (let i = 0; i < studies.length; i++) {
              let arrP = []
              // Get all accepted participants of a study --> ['123', '456']
              let withdParts = await db.getAllWithdrawnParticipants (studies[i]._key)
              if (withdParts.length > 0) {
                for (let j = 0; j < withdParts.length; j++) {
                  arrP = withdParts
                }
                withdrawnOnes.push({
                  studyKey: studies[i]._key,
                  participants: arrP
                })
              } 
            }
            res.send(withdrawnOnes)
          } else res.sendStatus(403)
      } else res.sendStatus(403)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot retrieve withdrawn participants')
      res.sendStatus(500)
    }
  })

  router.get('/participants/:participant_key', passport.authenticate('jwt', { session: false }), async function (req, res) {
    try {
      // TODO: do some access control
      let participant = await db.getOneStudy(req.params.participant_key)
      res.send(participant)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot retrieve participant with _key ' + req.params.participant_key)
      res.sendStatus(500)
    }
  })

  router.post('/participants', passport.authenticate('jwt', { session: false }), async function (req, res) {
    let newparticipant = req.body
    newparticipant.createdTS = new Date()
    try {
      // TODO: do some access control
      newparticipant = await db.createParticipant(newparticipant)
      res.send(newparticipant)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot store new participant')
      res.sendStatus(500)
    }
  })

  router.put('/participants/:participant_key', passport.authenticate('jwt', { session: false }), async function (req, res) {
    let newparticipant = req.body
    try {
      // TODO: do some access control, only allowed to participant and admin
      newparticipant = await db.updateParticipant(req.params.participant_key, newparticipant)
      res.send(newparticipant)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot update participant with _key ' + req.params.participant_key)
      res.sendStatus(500)
    }
  })

  router.patch('/participants/:participant_key', passport.authenticate('jwt', { session: false }), async function (req, res) {
    let newparticipant = req.body
    try {
      // TODO: do some access control, only allowed to participant and admin
      newparticipant = await db.patchParticipant(req.params.participant_key, newparticipant)
      res.send(newparticipant)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot patch participant with _key ' + req.params.participant_key)
      res.sendStatus(500)
    }
  })

  return router
}
