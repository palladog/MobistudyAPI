'use strict'

/**
* This provides the API endpoints for the teams.
*/

import express from 'express'
import getDB from '../DB/DB'
import { applogger } from '../logger'

const router = express.Router()

export default async function () {
  var db = await getDB()

  router.get('/teams', async function (req, res) {
    try {
      let teams
      if (req.user.role === 'admin') {
        teams = await db.getAllTeams()
      } else if (req.user.role === 'researcher') {
        teams = await db.getAllTeams(req.user._key)
      } else return res.sendStatus(403)
      res.send(teams)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot retrieve teams')
      res.sendStatus(500)
    }
  })

  router.get('/teams/:team_key', async function (req, res) {
    try {
      let team
      if (req.user.role === 'admin') {
        team = await db.getOneTeam(req.params.team_key)
        res.send(team)
      } else if (req.user.role === 'researcher') {
        team = await db.getOneTeam(req.params.team_key)
        if (team.researchersKeys.includes(req.user._key)) res.send(team)
        else res.sendStatus(403)
      } else res.sendStatus(403)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot retrieve team with _key ' + req.params.team_key)
      res.sendStatus(500)
    }
  })

  router.post('/teams', async function (req, res) {
    let newteam = req.body
    newteam.createdTS = new Date()
    try {
      if (req.user.role === 'admin') {
        newteam = await db.createTeam(newteam)
        res.send(newteam)
      } else res.sendStatus(403)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot store new study')
      res.sendStatus(500)
    }
  })

  router.post('/teams/addResearcher', async function (req, res) {
    // TODO: to be completed, use the JWT token
    // {
    //   researcherKey: '12132',
    //   invitationCode: 'asadsd'
    // }
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

  return router
}
