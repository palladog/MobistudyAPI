import i8n from '../../../src/i8n/i8n.mjs'

describe('when using i8n', () => {
  beforeAll(() => {
    i8n.text.testLang = {
      test: 'TEST',
      phrase: '{ n } times 1 is { n  }',
      phrase2: '{  name1} is cooler than { name2  }'
    }
    i8n.locale = 'testLang'
  })

  test('a phrase can be easily retrieved', () => {
    expect(i8n.text.testLang.test).toBe('TEST')
  })

  test('tokens are changed with actual content', () => {
    expect(i8n.t('phrase', { n: 5 })).toBe('5 times 1 is 5')
    expect(i8n.t('phrase2', { name1: 'dario', name2: 'pino' })).toBe('dario is cooler than pino')
  })
})
