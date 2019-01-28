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
    if (req.user.role !== 'participant') return res.sendStatus(403)
    if (!newanswer.generatedTS) return res.sendStatus(400)
    newanswer.userKey = req.user._key
    newanswer.createdTS = new Date()
    try {
      newanswer = await db.createAnswer(newanswer)
      // also update task status
      let participant = await db.getParticipantByUserKey(req.params.userKey)
      if (!participant) return res.status(404)

      let study = participant.studies.find((s) => {
        return s.studyKey === newanswer.studyKey
      })
      if (!study) return res.status(400)
      let taskItem = study.taskItemsConsent.find(ti => ti.taskId === newanswer.taskId)
      if (!taskItem) return res.status(400)
      taskItem.lastExecuted = newanswer.generatedTS
      // update the participant
      await db.replaceParticipant(participant._key, participant)
      res.send(newanswer)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot store new answer')
      res.sendStatus(500)
    }
  })

  router.put('/answers/:answer_key', passport.authenticate('jwt', { session: false }), async function (req, res) {
    let newanswer = req.body
    newanswer.updatedTS = new Date()
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
    newanswer.updatedTS = new Date()
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
