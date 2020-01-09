import getDB from '../../../src/DB/DB.mjs'
import { studyUpdateCompose } from '../../../src/services/emailComposer.mjs'

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
      },
      getOneUser: async ()  => {
        return { email: 'test@test.com'}
      }
    })

    let email = await studyUpdateCompose(1, 1, 'completed', [], [])
    expect(email.email).toBe('test@test.com')
    expect(email.title).toBe('Completion of study teststudy')
    expect(email.content).toBe('The study teststudy has now been completed. Thank you for your participation.')
  })

  test('the email for a withdrawn study is correct', async () => {
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
      },
      getOneUser: async ()  => {
        return { email: 'test@test.com'}
      }
    })

    let email = await studyUpdateCompose(1, 1, 'withdrawn', [], [])
    expect(email.email).toBe('test@test.com')
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
            taskItems: [],
            extraItems: []
          }
        }
      },
      getOneUser: async ()  => {
        return { email: 'test@test.com'}
      }
    })

    let email = await studyUpdateCompose(1, 1, 'accepted', [], [])
    expect(email.email).toBe('test@test.com')
    expect(email.title).toBe('Confirmation of acceptance of study teststudy')
    expect(email.content).toBe('Thank you for accepting to take part in the study teststudy.')
  })
})
