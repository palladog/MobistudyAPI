import enGB from './en-gb/text.mjs'
import svSV from './sv/text.mjs'

// API inspired by https://kazupon.github.io/vue-i18n/introduction.html
export default {
  'en-gb': enGB,
  sv: svSV,
  t: function(locale, id, args) {
    let text = this[locale][id]
    for (const token in args) {
      let regex = new RegExp('{\\s*' + token + '\\s*}', 'g')
      text = text.replace(regex, args[token])
    }
    return text
  }
}
