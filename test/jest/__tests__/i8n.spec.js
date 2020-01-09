import i8n from '../../../src/i8n/langs.mjs'

describe('when using i8n', () => {
  beforeAll(() => {
    i8n['test'] = {
      test: 'TEST',
      phrase: '{ n } times 1 is { n  }',
      phrase2: '{  name1} is cooler than { name2  }'
    }
  })

  test('a phrase can be easily retrieved', () => {
    expect(i8n['test'].test).toBe('TEST')
  })

  test('tokens are changed with actual content', () => {
    expect(i8n.t('test', 'phrase', { n: 5 })).toBe('5 times 1 is 5')
    expect(i8n.t('test', 'phrase2', { name1: 'dario', name2: 'pino' })).toBe('dario is cooler than pino')
  })
})
