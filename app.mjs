'use strict'

/**
* Sets-up the application.
* Returns an express app.
*/

import express from 'express'
import bodyParser from 'body-parser'
import getLoggers from './logger'

import indexRouter from './routes/index'
import studiesRouter from './routes/studies'
import formsRouter from './routes/forms'

export default async function () {
  var app = express()

  const loggers = await getLoggers()

  app.use(loggers.httplogger)
  // setup body parser
  // default limit is 100kb, so we need to extend the limit
  // see http://stackoverflow.com/questions/19917401/node-js-express-request-entity-too-large
  app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }))
  app.use(bodyParser.json({ limit: '20mb' }))
  app.use(bodyParser.text({ limit: '20mb' }))

  app.use(express.static('./public'))

  app.use('/', await indexRouter())
  app.use('/api', await studiesRouter())
  app.use('/api', await formsRouter())

  // error handler
  app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    // render the error page
    res.status(err.status || 500)
    res.render('error')
  })

  return app
}
