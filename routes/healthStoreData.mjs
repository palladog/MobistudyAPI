'use strict'

/**
* This provides the API endpoints for the study answers.
*/

import express from 'express'
import passport from 'passport'
import getDB from '../DB/DB'
import { applogger } from '../logger'
import jwt from 'jsonwebtoken'

const router = express.Router()

export default async function () {
  var db = await getDB()

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

  // Get health store data for a study  
  router.get('/healthStoreData/:userKey/', passport.authenticate('jwt', { session: false }), async function (req, res) {
    try {
      // TODO: do some access control
      let storeData = await db.getOneHealthStoreData(req.params.healthStoreDataKey)
      res.send(storeData)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot retrieve healthStore Data with _key ' + req.params.healthStoreDataKey)
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

  router.put('/healthStoreData/:healthStoreDataKey', passport.authenticate('jwt', { session: false }), async function (req, res) {
    let newHealthStoreData = req.body
    newHealthStoreData.updated = new Date()
    try {
      // TODO: do some access control
      newHealthStoreData = await db.replaceHealthStoreData(req.params.healthStoreDataKey, newHealthStoreData)
      res.send(newHealthStoreData)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot update new HealthStoreData with _key ' + req.params.healthStoreDataKey)
      res.sendStatus(500)
    }
  })

  router.patch('/healthStoreData/:healthStoreDataKey', passport.authenticate('jwt', { session: false }), async function (req, res) {
    let newHealthStoreData = req.body
    newHealthStoreData.updated = new Date()
    try {
      // TODO: do some access control
      newHealthStoreData = await db.updateHealthStoreData(req.params.healthStoreDataKey, newHealthStoreData)
      res.send(newHealthStoreData)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot patch answer with _key ' + req.params.healthStoreDataKey)
      res.sendStatus(500)
    }
  })

  router.delete('/healthStoreData/:healthStoreDataKey', passport.authenticate('jwt', { session: false }), async function (req, res) {
    try {
      // TODO: do some access control
      await db.deleteHealthStoreData(req.params.healthStoreDataKey)
      res.sendStatus(200)
    } catch (err) {
      console.error(err)
      applogger.error({ error: err }, 'Cannot delete answer with _key ' + req.params.healthStoreDataKey)
      res.sendStatus(500)
    }
  })

  return router
}
