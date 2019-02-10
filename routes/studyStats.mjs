'use strict'

/**
* This provides the API endpoints for the health data of the participant.
*/

import express from 'express'
import passport from 'passport'
import getDB from '../DB/DB'
import { applogger } from '../logger'
import auditLogger from '../auditLogger'

const router = express.Router()

export default async function () {
  var db = await getDB()

  // Get all study Stats
  router.get('/studyStats', passport.authenticate('jwt', { session: false }), async function (req, res) {
    try {
      if (req.user.role === 'researcher') {
        // extra check about the teams
        if (req.query.teamKey) {
          let team = await db.getOneTeam(req.query.teamKey)
          if (!team.researchersKeys.includes(req.user._key)) return res.sendStatus(403)
          else {
            let studyStats = await db.getAllstudyStats()
            res.send(studyStats)
          }
        }
        if (req.query.studyKey) {
          let team = await db.getAllTeams(req.user._key, req.query.studyKey)
          if (team.length === 0) return res.sendStatus(403)
          else {
            let studyStats = await db.getAllHealthStoreData()
            res.send(studyStats)
          }
        }
      } else if (req.user.role === 'participant') {
        let studyStats = await db.getHealthStoreDataByUser(req.user._key)
        res.send(studyStats)
      }
    } catch (err) {
      applogger.error({ error: err }, 'Cannot retrieve study stats')
      res.sendStatus(500)
    }
  })

  // Get health store data for a user
  router.get('/studyStats/:userKey', passport.authenticate('jwt', { session: false }), async function (req, res) {
    try {
      let studyStats = await db.getStudyStatsByUser(req.params.userKey)
      res.send(studyStats)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot retrieve study stats')
      res.sendStatus(500)
    }
  })

  // Get health store data for a study for a user
  router.get('/studyStats/:userKey/:studyKey', passport.authenticate('jwt', { session: false }), async function (req, res) {
    try {
      let studyStats = await db.getStudyStatsByUserAndStudy(req.params.userKey, req.params.studyKey)
      res.send(studyStats)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot retrieve study stats ')
      res.sendStatus(500)
    }
  })

  router.post('/studyStats', passport.authenticate('jwt', { session: false }), async function (req, res) {
    let newStudyStats = req.body
    if (req.user.role !== 'participant') return res.sendStatus(403)
    newStudyStats.userKey = req.user._key
    newStudyStats.createdTS = new Date()
    try {
      newStudyStats = await db.createStudyStats(newStudyStats)
     res.sendStatus(200)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot store new study Stat')
      res.sendStatus(500)
    }
  })

  return router
}
