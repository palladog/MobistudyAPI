'use strict'

/**
* This provides the API endpoints for the Aidit Log profiles.
*/

import express from 'express'
import passport from 'passport'
import getDB from '../DB/DB'
import { applogger } from '../logger'

const router = express.Router()

export default async function () {
  var db = await getDB()

  // 1. Get all logs of a user --> Admin can retrieve all audit logs
  // 2. Delete log of user
  // 3. User posts a new log for each event
  // 4. User can query via params
  // from: ISO string
  // to: ISO string
  // filterBy: user / study/ event type
  // filter: value of the filter (the ID)
  // limit: used for paging
  // count: used for paging
  // sortBy: timestamp, study, event type
  // sortDirection: asc / desc

  // query parameters:
  router.get('/auditlog', passport.authenticate('jwt', { session: false }), async function (req, res) {
    try {
      console.log('in log GET >> ', req.query)
      if (req.user.role === 'admin') {
        let result = await db.getAllLogs(req.query)
        res.send(result)
      } else res.sendStatus(403)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot retrieve audit log')
      res.sendStatus(500)
    }
  })

  return router
}
