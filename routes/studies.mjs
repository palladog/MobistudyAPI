'use strict'

/**
* This provides the API endpoints for the study descriptions.
*/

import express from 'express'
import getDB from '../DB/DB'
import getLoggers from '../logger'

const router = express.Router()

export default async function () {
  var db = await getDB()
  const loggers = await getLoggers()
  const logger = loggers.applogger

  router.get('/studies', async function (req, res) {
    try {
      // TODO: do some access control
      let studies = await db.getAllStudies()
      res.send(studies)
    } catch (err) {
      logger.error({ error: err }, 'Cannot retrieve studies')
      res.sendStatus(500)
    }
  })

  router.get('/studies/:study_key', async function (req, res) {
    try {
      // TODO: do some access control
      let study = await db.getOneStudy(req.params.study_key)
      res.send(study)
    } catch (err) {
      console.error(err)
      logger.error({ error: err }, 'Cannot retrieve study with _key ' + req.params.study_key)
      res.sendStatus(500)
    }
  })

  router.post('/studies', async function (req, res) {
    let newstudy = req.body
    try {
      // TODO: do some access control
      newstudy = await db.createStudy(newstudy)
      res.send(newstudy)
    } catch (err) {
      console.error(err)
      logger.error({ error: err }, 'Cannot store new study')
      res.sendStatus(500)
    }
  })

  router.put('/studies/:study_key', async function (req, res) {
    let newstudy = req.body
    try {
      // TODO: do some access control
      newstudy = await db.updateStudy(req.params.study_key, newstudy)
      res.send(newstudy)
    } catch (err) {
      console.error(err)
      logger.error({ error: err }, 'Cannot update study with _key ' + req.params.study_key)
      res.sendStatus(500)
    }
  })

  router.patch('/studies/:study_key', async function (req, res) {
    let newstudy = req.body
    try {
      // TODO: do some access control
      newstudy = await db.patchStudy(req.params.study_key, newstudy)
      res.send(newstudy)
    } catch (err) {
      console.error(err)
      logger.error({ error: err }, 'Cannot patch study with _key ' + req.params.study_key)
      res.sendStatus(500)
    }
  })

  router.delete('/studies/:study_key', async function (req, res) {
    try {
      // TODO: do some access control
      await db.deleteStudy(req.params.study_key)
      res.sendStatus(200)
    } catch (err) {
      console.error(err)
      logger.error({ error: err }, 'Cannot delete study with _key ' + req.params.study_key)
      res.sendStatus(500)
    }
  })

  return router
}
