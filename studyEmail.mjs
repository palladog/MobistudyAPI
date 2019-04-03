'use strict'

/**
* This allows email to be structured and sent to participants wrt studies.
*/

import { sendEmail } from './mailSender'
import getDB from './DB/DB'

export default async function (studyKey, userKey, updatedCurrentStatus) {
    try {
        var db = await getDB()
        let study = await db.getOneStudy(studyKey)
        let title = study.generalities.title
        let emailTitle = ''
        let emailContent = ''
        if (updatedCurrentStatus === 'accepted') {
          emailTitle = 'Confirmation of Acceptance of Study ' + title
          emailContent = 'Thank you for accepting to take part in the study ' + title + '.'
          let user = await db.getOneUser(userKey)
          sendEmail(user.email, emailTitle, emailContent)
        }
        if (updatedCurrentStatus === 'completed') {
          emailTitle = 'Completion of study ' + title
          emailContent = 'The study ' + title + ' has now been completed. Thank you for your participation.'
          let user = await db.getOneUser(userKey)
          sendEmail(user.email, emailTitle, emailContent)
        }
        if (updatedCurrentStatus === 'withdrawn') {
          emailTitle = 'Withdrawal from study ' + title
          emailContent = 'You have withdrawn from the study ' + title + '. Thank you for your time.'
          let user = await db.getOneUser(userKey)
          sendEmail(user.email, emailTitle, emailContent)
        }
    } catch (err) {
        applogger.error({ error: err }, 'Cannot send status change email for study ' + studyKey + ' for user ' + userKey)
        res.sendStatus(500)
    }
}