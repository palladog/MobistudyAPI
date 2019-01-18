'use strict'

/**
* This provides the API endpoints for the study answers.
*/

import express from 'express'
import passport from 'passport'
import getDB from '../DB/DB'
import { applogger } from '../logger'

const router = express.Router()

export default async function () {
  var db = await getDB()

  // Get all health store data
  router.get('/healthStoreData', passport.authenticate('jwt', { session: false }), async function (req, res) {
    try {
      // TODO: do some access control
      let storeData = await db.getAllhealthStoreData()
      res.send(storeData)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot retrieve healthStore data')
      res.sendStatus(500)
    }
  })

  // Get health store data for a user
  router.get('/healthStoreData/:userKey', passport.authenticate('jwt', { session: false }), async function (req, res) {
    try {
      // TODO: do some access control
      let storeData = await db.getAllhealthStoreDataByUser(req.params.userKey)
      res.send(storeData)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot retrieve healthStore data')
      res.sendStatus(500)
    }
  })

  // Get health store data for a study for a user
  router.get('/healthStoreData/:userKey/:studyKey', passport.authenticate('jwt', { session: false }), async function (req, res) {
    try {
      // TODO: do some access control
      let storeData = await db.getAllhealthStoreDataByUser(req.params.userKey, req.params.studyKey)
      res.send(storeData)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot retrieve healthStore Data ')
      res.sendStatus(500)
    }
  })

  router.post('/healthStoreData', passport.authenticate('jwt', { session: false }), async function (req, res) {
    let newHealthStoreData = req.body
    newHealthStoreData.created = new Date()
    try {
      // TODO: do some access control
      newHealthStoreData = await db.createHealthStoreData(newHealthStoreData)
      res.send(newHealthStoreData)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot store new HealthStore Data')
      res.sendStatus(500)
    }
  })

  return router
}
