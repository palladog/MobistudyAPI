'use strict'

/**
* This allows email to be structured and sent to participants wrt studies.
*/
import { sendEmail } from './mailSender.mjs'
import { applogger } from './logger.mjs'
import getDB from '../DB/DB.mjs'

export async function studyUpdateCompose(studyKey, userKey, updatedCurrentStatus, taskItems, extraItems) {
  try {
    var db = await getDB()
    let study = await db.getOneStudy(studyKey)
    let title = study.generalities.title
    let emailTitle = ''
    let emailContent = ''
    let taskItemConStr = ''
    let extraItemConStr = ''
    let taskConDesc = ''
    let extraConDesc = ''
    let taskTrueCnt = 0
    let taskFalseCnt = 0
    let extraTrueCnt = 0
    let extraFalseCnt = 0

    // If there are consented task items, get them from study
    if (taskItems.length !== 0) {
      for (let i = 0; i < taskItems.length; i++) {
        let taskID = taskItems[i].taskId
        let consented = taskItems[i].consented
        // From Study get description of task ID
        taskConDesc += '\n\u2022 ' + getTaskConsentDescr(study, taskID) + '\n'
        // Check Consented bool. Print accordingly.
        if (consented === true) {
          if (taskTrueCnt === 0) {
            taskItemConStr = '\n You have consented to the following: '
          } else if (taskTrueCnt > 0) {
            taskItemConStr += taskConDesc
          }
          taskTrueCnt++
        } else if (consented === false) {
          if (taskFalseCnt === 0) {
            taskItemConStr = '\n You have not consented to the following: '
          } else if (taskFalseCnt > 0) {
            taskItemConStr += taskConDesc
          }
          taskFalseCnt++
        }
      }
    } else {
      if (taskItems.length === 0) taskItemConStr = '\n There are no TASK Items that require consent.'
    }

    // If there are consented items, get them from study
    if (extraItems.length !== 0) {
      for (let i = 0; i < taskItems.length; i++) {
        let consented = taskItems[i].consented
        // From Study get description of task ID
        extraConDesc += '\n\u2022 ' + getExtraConsentDescr(study, consented, i) + '\n'
        // Check Consented bool. Print accordingly.
        if (consented === true) {
          if (extraTrueCnt === 0) {
            extraItemConStr = '\n You have consented to the following extra item: '
          } else if (extraTrueCnt > 0) {
            extraItemConStr += extraConDesc
          }
          extraTrueCnt++
        } else if (consented === false) {
          if (extraFalseCnt === 0) {
            extraItemConStr = '\n You have not consented to the following extra Item: '
          } else if (extraFalseCnt > 0) {
            extraItemConStr += extraConDesc
          }
          extraFalseCnt++
        }
      }
    } else {
      if (extraItems.length === 0) extraItemConStr = '\n There are no EXTRA Items that require consent.'
    }

    // Send EMAILS according to status
    if (updatedCurrentStatus === 'accepted') {
      emailTitle = 'Confirmation of Acceptance of Study ' + title
      emailContent = 'Thank you for accepting to take part in the study ' + title + '.' + '\n'
      emailContent += taskItemConStr
      emailContent += extraItemConStr
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
  }
}

function getTaskConsentDescr(study, taskId) {
  // From Study get description of task ID
  let items = study.consent.taskItems
  let descr = ''
  for (let i = 0; i < items.length; i++) {
    if (items[i].taskId === taskId) descr = items[i].description
  }
  return descr
}

function getExtraConsentDescr(study, optional, indexPos) {
  // From Study get description of task ID
  let items = study.consent.extraItems
  let descr = ''
  for (let i = 0; i < items.length; i++) {
    if (items[i].optional === optional) descr = items[i].description
  }
  return descr
}
