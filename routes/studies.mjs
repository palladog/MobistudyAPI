'use strict'

/**
* This provides the API endpoints for the study descriptions.
*/

import express from 'express'
import passport from 'passport'
import getDB from '../DB/DB'
import { applogger } from '../logger'
import jwt from 'jsonwebtoken'

const router = express.Router()

export default async function () {
  var db = await getDB()

  router.get('/studies', passport.authenticate('jwt', { session: false }), async function (req, res) {
    try {
      // TODO: do some access control ---> studies per user
      // query parameter (teamKey)  --> Studies of specific team req.query
      let studies = await db.getAllStudies()
      res.send(studies)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot retrieve studies')
      res.sendStatus(500)
    }
  })

  router.get('/studies/:team_key', passport.authenticate('jwt', { session: false }), async function (req, res) {
    try {
      // TODO: do some access control ---> studies per user
      // query parameter (teamKey)  --> Studies of specific team req.query
      let studies = await db.getAllTeamStudies(req.params.team_key)
      res.send(studies)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot retrieve studies')
      res.sendStatus(500)
    }
  })

  router.get('/studies/:team_key/:study_key', passport.authenticate('jwt', { session: false }), async function (req, res) {
    try {
      // TODO: do some access control
      let study = await db.getOneStudy(req.params.study_key)
      res.send(study)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot retrieve study with _key ' + req.params.study_key)
      res.sendStatus(500)
    }
  })

  router.post('/studies', passport.authenticate('jwt', { session: false }), async function (req, res) {
    let newstudy = req.body
    newstudy.created = new Date()
    let user = req.user
    let JToken = req.headers.authorization.replace('Bearer ','')
    let decoded = jwt.decode(JToken, {complete: true})
    // console.log('USER: ', req.user)
    // console.log('Decodede Ky: ', decoded)
    try {
      // TODO: do some access control
      newstudy = await db.createStudy(newstudy)
      res.send(newstudy)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot store new study')
      res.sendStatus(500)
    }
  })

  router.put('/studies/:study_key', passport.authenticate('jwt', { session: false }), async function (req, res) {
    let newstudy = req.body
    newstudy.updated = new Date()
    try {
      // TODO: do some access control
      newstudy = await db.updateStudy(req.params.study_key, newstudy)
      res.send(newstudy)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot update study with _key ' + req.params.study_key)
      res.sendStatus(500)
    }
  })

  router.patch('/studies/:study_key', passport.authenticate('jwt', { session: false }), async function (req, res) {
    let newstudy = req.body
    newstudy.updated = new Date()
    try {
      // TODO: do some access control
      newstudy = await db.patchStudy(req.params.study_key, newstudy)
      res.send(newstudy)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot patch study with _key ' + req.params.study_key)
      res.sendStatus(500)
    }
  })

  router.delete('/studies/:study_key', passport.authenticate('jwt', { session: false }), async function (req, res) {
    if (req.user.role === 'admin') {
      try {
        let studykey = req.params.study_key
        if (studykey !== null) {
          await db.deleteStudy(studykey)
          // Search participants for study
          let pKeyAcc = await db.getAllAcceptedParticipants(studykey)
          let pKeyWith = await db.getAllWithdrawnParticipants(studykey)
          let pKeyRej = await db.getAllRejectedStudyParticipants (studykey)
          if (pKeyAcc !== null) {
            for (let i = 0; i < pKeyAcc.length; i++) {
              let accParKey = pKeyAcc[i]
              // For Each participant, delete the study key from accepted studies
              let participant = await db.getOneParticipant(accParKey)
              let studyArray = participant.acceptedStudies
              studyArray = studyArray.filter(study => study.studyDescriptionKey !== studykey)
              participant.acceptedStudies = studyArray
              await db.replaceParticipant(accParKey, participant)
            }
            res.sendStatus(200)
          } else res.sendStatus(403)
          if (pKeyWith !== null) {
            for (let i = 0; i < pKeyWith.length; i++) {
              let withParKey = pKeyWith[i]
              // For Each participant, delete the study key from withdrawn studies
              let participant = await db.getOneParticipant(withParKey)
              let studyArray = participant.withdrawnStudies
              studyArray = studyArray.filter(study => study.studyDescriptionKey !== studykey)
              participant.withdrawnStudies = studyArray
              await db.replaceParticipant(withParKey, participant)
            }
            res.sendStatus(200)
          } else res.sendStatus(403)
          if (pKeyRej !== null) {
            for (let i = 0; i < pKeyRej.length; i++) {
              let rejParKey = pKeyRej[i]
              // For Each participant, delete the study key from rejected studies
              let participant = await db.getOneParticipant(rejParKey)
              let studyArray = participant.rejectedStudies
              studyArray = studyArray.filter(study => study.studyDescriptionKey !== studykey)
              participant.rejectedStudies = studyArray
              await db.replaceParticipant(withParKey, participant)
            }
            res.sendStatus(200)
          } else res.sendStatus(403)
        } else res.sendStatus(403)
      } catch (err) {
        applogger.error({ error: err }, 'Cannot delete study with _key ' + req.params.study_key)
        res.sendStatus(500)
      }
    } else res.sendStatus(403)
  })

  return router
}
