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

  router.get('/participants', passport.authenticate('jwt', { session: false }), async function (req, res) {
    try {
      // TODO: do some access control
      // admins cah retrieve all
      // researchers can retrieve only those related to the studies of their teams
      // participants only retrieve themselves
      let studies = await db.getAllParticipants()
      res.send(studies)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot retrieve participants')
      res.sendStatus(500)
    }
  })

  router.get('/participants/:participant_key', passport.authenticate('jwt', { session: false }), async function (req, res) {
    try {
      // TODO: do some access control
      let study = await db.getOneStudy(req.params.participant_key)
      res.send(study)
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
