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

  router.get('/answers', passport.authenticate('jwt', { session: false }), async function (req, res) {
    try {
      // TODO: do some access control
      let answers = await db.getAllAnswers()
      res.send(answers)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot retrieve answers')
      res.sendStatus(500)
    }
  })

  router.get('/answers/:answer_key', passport.authenticate('jwt', { session: false }), async function (req, res) {
    try {
      // TODO: do some access control
      let answer = await db.getOneAnswer(req.params.answer_key)
      res.send(answer)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot retrieve answer with _key ' + req.params.answer_key)
      res.sendStatus(500)
    }
  })

  router.post('/answers', passport.authenticate('jwt', { session: false }), async function (req, res) {
    let newanswer = req.body
    newanswer.created = new Date()
    try {
      // TODO: do some access control
      newanswer = await db.createAnswer(newanswer)
      res.send(newanswer)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot store new answer')
      res.sendStatus(500)
    }
  })

  router.put('/answers/:answer_key', passport.authenticate('jwt', { session: false }), async function (req, res) {
    let newanswer = req.body
    newanswer.updated = new Date()
    try {
      // TODO: do some access control
      newanswer = await db.replaceAnswer(req.params.answer_key, newanswer)
      res.send(newanswer)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot update answer with _key ' + req.params.answer_key)
      res.sendStatus(500)
    }
  })

  router.patch('/answers/:answer_key', passport.authenticate('jwt', { session: false }), async function (req, res) {
    let newanswer = req.body
    newanswer.updated = new Date()
    try {
      // TODO: do some access control
      newanswer = await db.updateAnswer(req.params.answer_key, newanswer)
      res.send(newanswer)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot patch answer with _key ' + req.params.answer_key)
      res.sendStatus(500)
    }
  })

  router.delete('/answers/:answer_key', passport.authenticate('jwt', { session: false }), async function (req, res) {
    try {
      // TODO: do some access control
      await db.deleteAnswer(req.params.answer_key)
      res.sendStatus(200)
    } catch (err) {
      console.error(err)
      applogger.error({ error: err }, 'Cannot delete answer with _key ' + req.params.answer_key)
      res.sendStatus(500)
    }
  })

  return router
}
