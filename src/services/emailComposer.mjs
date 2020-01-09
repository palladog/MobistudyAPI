'use strict'

/**
* This allows email to be structured and sent to participants wrt studies.
*/
import { applogger } from './logger.mjs'
import getDB from '../DB/DB.mjs'
import i8n from '../i8n/i8n.mjs'

// Creates the content of an email to be sent to a user when the status of a study changes
// returns { address: 'user@email.com', title: '...', content: '...'}
export async function studyUpdateCompose(studyKey, userKey, updatedCurrentStatus, taskItems, extraItems) {
  let db = await getDB()

  let study = await db.getOneStudy(studyKey)
  let user = await db.getOneUser(userKey)
  i8n.locale = 'en-gb' //TODO: change it to actual user language
  let studyTitle = study.generalities.title
  let emailTitle = ''
  let emailContent = ''
  let taskConDesc = ''
  let taskNotConDesc = ''

  // Send EMAILS according to status
  if (updatedCurrentStatus === 'accepted') {
    emailTitle = i8n.t('email.studyAcceptedTitle', { studyTitle: studyTitle })
    emailContent = i8n.t('email.studyAcceptedThanks', { studyTitle: studyTitle })
    // If there are consented task items, get them from study
    if (taskItems.length !== 0 || extraItems.length !== 0) {
      emailContent += '\n\n'
      for (let i = 0; i < taskItems.length; i++) {
        let taskID = taskItems[i].taskId
        // From Study get description of task ID
        let descr = '\n\u2022 ' + study.consent.taskItems.filter(t => t.taskId === taskId).description+ '\n'
        if (taskItems[i].consented === true) taskConDesc += descr
        else taskNotConDesc += descr
      }
      for (let i = 0; i < extraItems.length; i++) {
        let descr = '\n\u2022 ' + study.consent.extraItems[i].description + '\n'
        if(taskItems[i].consented) taskConDesc += descr
        else taskNotConDesc += descr
      }
      emailContent += '\n ' + i8n.t('email.studyAcceptedConsentedTasks') + ':\n'
      emailContent += taskConDesc
      emailContent += '\n ' + i8n.t('email.studyAcceptedNotConsentedTasks') + ':\n'
      emailContent += taskNotConDesc
    }
  }
  if (updatedCurrentStatus === 'completed') {
    emailTitle = i8n.t('email.studyCompletedTitle', { studyTitle: studyTitle })
    emailContent = i8n.t('email.studyCompletedThanks', { studyTitle: studyTitle })
  }
  if (updatedCurrentStatus === 'withdrawn') {
    emailTitle = i8n.t('email.studyWithdrawnTitle', { studyTitle: studyTitle })
    emailContent = i8n.t('email.studyWithdrawnThanks', { studyTitle: studyTitle })
  }
  return { email: user.email, title: emailTitle, content: emailContent }
}
