'use strict'

/**
* This provides the API endpoints for the study descriptions.
*/

import express from 'express'
import passport from 'passport'
import getDB from '../DB/DB'
import { applogger } from '../logger'

const router = express.Router()

export default async function () {
  var db = await getDB()

  // query parameters:
  // teamKey (optional)
  router.get('/studies', passport.authenticate('jwt', { session: false }), async function (req, res) {
    try {
      let studies = []
      if (req.user.role === 'researcher') {
        if (req.query.teamKey) {
          let team = await db.getOneTeam(req.query.teamKey)
          if (!team.researchersKeys.includes(req.user._key)) return res.sendStatus(403)
          studies = await db.getAllTeamStudies(req.query.teamKey)
        } else {
          // limit the studies to the teams the user belongs to
          let teams = await db.getAllTeams(req.user._key)
          for (let i = 0; i < teams.lenght; i++) {
            let studies = await db.getAllTeamStudies(teams[i]._key)
            studies.push(studies)
          }
        }
      } else if (req.user.role === 'admin') {
        if (req.query.teamKey) {
          studies = await db.getAllTeamStudies(req.query.teamKey)
        } else {
          studies = await db.getAllStudies()
        }
      } else if (req.user.role === 'participant') {
        let part = await db.getParticipantByUserKey(req.user._key)
        studies = await db.getAllParticipantStudies(part._key)
      }

      res.send(studies)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot retrieve studies')
      res.sendStatus(500)
    }
  })

  router.get('/studies/:study_key', passport.authenticate('jwt', { session: false }), async function (req, res) {
    try {
      // TODO: do some access control
      let study = await db.getOneStudy(req.params.study_key)
      if (!study) res.sendStatus(404)
      else res.json(study)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot retrieve study with _key ' + req.params.study_key)
      res.sendStatus(500)
    }
  })

  router.post('/studies', passport.authenticate('jwt', { session: false }), async function (req, res) {
    let newstudy = req.body
    newstudy.created = new Date()
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
      newstudy = await db.replaceStudy(req.params.study_key, newstudy)
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
      newstudy = await db.updateStudy(req.params.study_key, newstudy)
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
          let pKeyRej = await db.getAllRejectedStudyParticipants(studykey)
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
