import getDB from '../../../src/DB/DB.mjs'
import { studyStatusUpdateCompose } from '../../../src/services/emailComposer.mjs'

jest.mock('../../../src/DB/DB.mjs');

describe('when composing an email', () => {

  test('the email for a completed study is correct', async () => {
    getDB.mockResolvedValue({
      getOneStudy: async () => {
        return {
          generalities: {
            title: 'teststudy'
          },
          consent: {
            taskItems: [],
            extraItems: []
          }
        }
      }
    })

    let email = await studyStatusUpdateCompose('1', {
      studies: [{
        studyKey: '1',
        currentStatus: "completed"
      }]
    })
    expect(email.title).toBe('Completion of study teststudy')
    expect(email.content).toBe('The study teststudy has now been completed. Thank you for your participation.')
  })

  test('the email for a withdrawn study is correct', async () => {
    getDB.mockResolvedValue({
      getOneStudy: async () => {
        return {
          generalities: { title: 'teststudy' },
          consent: { taskItems: [], extraItems: [] }
        }
      }
    })

    let email = await studyStatusUpdateCompose('1', {
      studies: [{
        studyKey: '1',
        currentStatus: "withdrawn"
      }]
    })
    expect(email.title).toBe('Withdrawal from study teststudy')
    expect(email.content).toBe('You have withdrawn from the study teststudy. Thank you for your time.')
  })

  test('the email for an accepted study is correct', async () => {
    getDB.mockResolvedValue({
      getOneStudy: async () => {
        return {
          generalities: {
            title: 'teststudy'
          },
          consent: {
            taskItems: [{
              description: 'task1',
              taskId: 1
            }],
            extraItems: [{
              description: 'extra1'
            }]
          }
        }
      }
    })

    let email = await studyStatusUpdateCompose('1', {
      studies: [{
        studyKey: '1',
        currentStatus: "accepted",
        taskItemsConsent: [
          { taskId: 1, consented: true }
        ],
        extraItemsConsent: [
          { consented: true }
        ]
      }]
    })

    expect(email.title).toBe('Confirmation of acceptance of study teststudy')
    expect(email.content).toBe('Thank you for accepting to take part in the study teststudy.\n\nYou have consented to the following:\n\u2022 task1\n\u2022 extra1\n')
  })
})
