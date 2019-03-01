'use strict'

/**
* This provides the API endpoints for some tester functions
*/

import express from 'express'
import passport from 'passport'
import { applogger } from '../logger'
import { sendEmail } from '../mailSender'

const router = express.Router()

export default async function () {
  // sends an email
  router.post('/tester/sendemail/', passport.authenticate('jwt', { session: false }), async function (req, res) {
    if (req.user.role !== 'admin') {
      res.sendStatus(403)
    } else {
      console.log(req.body)
      try {
        sendEmail(req.body.address, req.body.subject, req.body.content)
        applogger.info(req.body, 'Test email sent')
        res.sendStatus(200)
      } catch (error) {
        console.error(error)
        applogger.error(req.body, 'Test email cannot be sent sent')
        res.status(500).send(error)
      }
    }
  })

  return router
}
