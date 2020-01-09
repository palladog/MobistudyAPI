import enGBtext from './en-gb/text.mjs'
import svSVtext from './sv/text.mjs'

// extracts a property using a string, see https://stackoverflow.com/a/6491621/1097607
let byString = function(o, s) {
    s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    s = s.replace(/^\./, '');           // strip a leading dot
    var a = s.split('.');
    for (var i = 0, n = a.length; i < n; ++i) {
        var k = a[i];
        if (k in o) {
            o = o[k];
        } else {
            return;
        }
    }
    return o;
}

// API inspired by https://kazupon.github.io/vue-i18n/introduction.html
export default {
  locale: 'en-gb', // default locale
  text: {
    'en-gb': enGBtext,
    sv: svSVtext
  },
  t: function(id, args) {
    let text = byString(this.text[this.locale], id)
    if (!text) return undefined
    for (const token in args) {
      let regex = new RegExp('{\\s*' + token + '\\s*}', 'g')
      text = text.replace(regex, args[token])
    }
    return text
  }
}
