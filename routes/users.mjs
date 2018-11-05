'use strict'

/**
* This provides the API endpoints for authentication.
*/
import express from 'express'
import passport from 'passport'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import getDB from '../DB/DB'
import getLoggers from '../logger'

const router = express.Router()

export default async function () {
  var db = await getDB()
  const loggers = await getLoggers()
  const logger = loggers.applogger

  router.post('/login', passport.authenticate('local', { session: false }), function (req, res, next) {
    // generate a signed json web token with the contents of user object and return it in the response
    delete req.user.hashedPassword
    const token = jwt.sign(req.user, 'your_jwt_secret')
    return res.json({ user: req.user, token })
  })

  router.post('/users', async (req, res) => {
    let user = req.body
    let hashedPassword = bcrypt.hashSync(user.password, 8)
    delete user.password
    user.hashedPassword = hashedPassword
    try {
      let existing = await db.findUser(user.email)
      if (existing) return res.status(409).send('This email is already registered')
      if (user.role !== 'researcher' || user.role !== 'participant') return res.send(403)
      if (user.role === 'researcher' && user.invitationCode !== '827363423') return res.status(400).send('Bad invitation code')
      await db.createUser(user)
    } catch (err) {
      logger.error({ error: err }, 'Cannot store new user')
      res.sendStatus(500)
    }
  })

  return router
}
