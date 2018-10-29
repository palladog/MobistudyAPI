'use strict'

/**
* Sets-up the authentication strategy.
*/

import fs from 'fs'
import passport from 'passport'
import { Strategy, ExtractJwt } from 'passport-jwt'

export default async function () {
  var config = {}
  try {
    const configfile = await fs.promises.readFile('config.json', 'utf8')
    config = JSON.parse(configfile)
  } catch (err) {
    config.logs = {
      folder: (process.env.LOGSFOLDER || 'logs'),
      rotationsize: (process.env.LOGSROTATIONSIZE || '1M')
    }
  }

  var opts = {}
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
  opts.secretOrKey = config.auth.secret
  opts.issuer = config.auth.issuer
  opts.audience = config.auth.audience
  passport.use(new Strategy(opts, function (jwtpayload, done) {
    // TODO: find the user using jwtpayload.sub as user key
    // User.findOne({id: jwtpayload.sub}, function (err, user) {
    //     if (err) {
    //         return done(err, false);
    //     }
    //     if (user) {
    //         return done(null, user);
    //     } else {
    //         return done(null, false);
    //         // or you could create a new account
    //     }
    // })
  }))
}
