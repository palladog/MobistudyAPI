import googleAPIs from 'googleapis'
import nodemailer from 'nodemailer'
import getConfig from './config.mjs'
import { applogger } from './logger'

const config = getConfig()

// sends emails from a gmail account.
// See this guide: https://medium.com/@nickroach_50526/sending-emails-with-node-js-using-smtp-gmail-and-oauth2-316fe9c790a1
export async function sendEmail (contact, subject, message) {
  const oAuth2Client = new googleAPIs.google.auth.OAuth2(
    config.gmail.client_id,
    config.gmail.client_secret,
    'https://developers.google.com/oauthplayground'
  )
  return new Promise(async (resolve, reject) => {
    try {
      oAuth2Client.setCredentials({
        refresh_token: config.gmail.refresh_token
      })
      let res = await oAuth2Client.refreshAccessToken()
      const smtpTransport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: config.gmail.email,
          clientId: config.gmail.client_id,
          clientSecret: config.gmail.client_secret,
          refreshToken: config.gmail.refresh_token,
          accessToken: res.credentials.access_token
        }
      })

      const mailOptions = {
        from: config.gmail.email,
        to: contact,
        subject: subject,
        generateTextFromHTML: true,
        html: message
      }

      smtpTransport.sendMail(mailOptions, (error, response) => {
        error ? reject(error) : resolve(response)
        smtpTransport.close()
      })
    } catch (error) {
      applogger.error(error, 'Cannot send email to ' + contact)
    }
  })
}
