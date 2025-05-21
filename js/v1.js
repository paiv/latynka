(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

const i18n = require('./i18n')


module.exports = {
    i18n: i18n,
}

},{"./i18n":3}],2:[function(require,module,exports){

class DomBuilder {
    static el(name, classes) {
        const x = document.createElement(name)
        if (classes) classes.forEach((c) => x.classList.add(c))
        return x
    }

    static text(value) {
        return document.createTextNode(value)
    }

    static resetChildren(parent, ...children) {
        let last;
        while (last = parent.lastElementChild) {
            parent.removeChild(last)
        }
        for (const child of children) {
            parent.appendChild(child)
        }
    }
}


module.exports = {
    DomBuilder,
}

},{}],3:[function(require,module,exports){

const messages = {
    en: {
        "rules_label_apostrophe": {
            "message": "apostrophe"
        },
        "rules_label_at_word_start": {
            "message": "at the beginning of a word"
        },
        "rules_label_after_consonants": {
            "message": "after consonants"
        },
        "extension_action_install": {
            "message": "Install browser extension"
        },
        "extension_action_import": {
            "message": "Import"
        },
        "extension_action_copy_to_clipboard": {
            "message": "Copy to clipboard"
        },
    },

    ru: {
        "rules_label_apostrophe": {
            "message": "апостроф"
        },
        "rules_label_at_word_start": {
            "message": "в начале слова"
        },
        "rules_label_after_consonants": {
            "message": "после согласных"
        },
        "extension_action_install": {
            "message": "Установить расширение для браузера"
        },
        "extension_action_import": {
            "message": "Импортировать"
        },
        "extension_action_copy_to_clipboard": {
            "message": "Копировать в буфер обмена"
        },
    },

    uk: {
        "rules_label_apostrophe": {
            "message": "апостроф"
        },
        "rules_label_at_word_start": {
            "message": "на початку слова"
        },
        "rules_label_after_consonants": {
            "message": "після приголосних"
        },
        "extension_action_install": {
            "message": "Встановити розширення до браузера"
        },
        "extension_action_import": {
            "message": "Зберегти"
        },
        "extension_action_copy_to_clipboard": {
            "message": "Скопіювати в буфер"
        },
    },
}


class Localizator {
    constructor() {
        const lang = (window.navigator || window.browser || window).language
        this.lang = (lang || 'en').toLowerCase().substr(0, 2)
        this.messages = messages[this.lang] || messages['en']
    }

    getMessage(key) {
        const transl = this.messages[key] || {}
        return transl.message || key
    }
}


module.exports = new Localizator()

},{}],4:[function(require,module,exports){
"use strict";

/* paiv punycode - https://github.com/paiv/punycode-js

    LICENSE
    Refer to the end of the file for license information.

    Punycode
    https://www.rfc-editor.org/rfc/rfc3492.txt
*/


const _config_d2a = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","0","1","2","3","4","5","6","7","8","9"];
const _config_a2d = new Map([
    ["0",26], ["1",27], ["2",28], ["3",29], ["4",30], ["5",31], ["6",32], ["7",33], ["8",34], ["9",35],
    ["A",0], ["B",1], ["C",2], ["D",3], ["E",4], ["F",5], ["G",6], ["H",7], ["I",8], ["J",9], ["K",10], ["L",11], ["M",12], ["N",13], ["O",14], ["P",15], ["Q",16], ["R",17], ["S",18], ["T",19], ["U",20], ["V",21], ["W",22], ["X",23], ["Y",24], ["Z",25],
    ["a",0], ["b",1], ["c",2], ["d",3], ["e",4], ["f",5], ["g",6], ["h",7], ["i",8], ["j",9], ["k",10], ["l",11], ["m",12], ["n",13], ["o",14], ["p",15], ["q",16], ["r",17], ["s",18], ["t",19], ["u",20], ["v",21], ["w",22], ["x",23], ["y",24], ["z",25],
]);


function _adapt(delta, numpoints, firsttime) {
    delta = firsttime ? Math.trunc(delta / 700) : Math.trunc(delta / 2);
    delta += Math.trunc(delta / numpoints);
    let k = 0;
    while (delta > 455) {
        delta = Math.trunc(delta / 35);
        k += 36;
    }
    return k + Math.trunc((36 * delta) / (delta + 38));
}


function encode(input) {
    let ilen = 0;
    let n = 128;
    let delta = 0;
    let bias = 72;
    let output = "";
    let b = 0;
    let m = Number.MAX_VALUE;
    for (let sp of input) {
        const c = sp.codePointAt(0);
        ilen += 1;
        if (c < n) {
            b += 1;
            output += sp;
        }
        else {
            if (c < m) {
                m = c;
            }
        }
    }
    if (b > 0) {
        output += "-";
    }
    let h = b;
    while (h < ilen) {
        delta += (m - n) * (h + 1);
        n = m;
        m = Number.MAX_VALUE;
        for (let sp of input) {
            const c = sp.codePointAt(0);
            if (c < n) {
                delta += 1;
            }
            else if (c > n) {
                if (c < m) {
                    m = c;
                }
            }
            else {
                let q = delta;
                let k = 36;
                while (true) {
                    let t = (k <= bias) ? 1 : ((k >= bias + 26) ? 26 : (k - bias));
                    if (q < t) { break; }
                    let x = t + ((q - t) % (36 - t));
                    output += _config_d2a[x];
                    q = Math.trunc((q - t) / (36 - t));
                    k += 36;
                }
                output += _config_d2a[q];
                bias = _adapt(delta, h + 1, h === b);
                delta = 0;
                h += 1;
            }
        }
        delta += 1;
        n += 1;
    }
    return output;
}


function decode(input) {
    let n = 128;
    let bias = 72;
    let output = new Array();
    let sep = input.lastIndexOf("-");
    if (sep >= 0) {
        output = [...input.substring(0, sep)];
        for (let sp of output) {
            const c = sp.codePointAt(0);
            if (c >= n) {
                throw new Error("invalid char in basic string: " + sp);
            }
        }
        input = input.substring(sep + 1);
    }
    let it = input[Symbol.iterator]();
    let i = 0;
    while (true) {
        let iv = it.next();
        if (iv.done) { break; }
        let oldi = i;
        let w = 1;
        let k = 36;
        while (true) {
            const sp = iv.value;
            const digit = _config_a2d.get(sp)
            i += digit * w;
            if (digit === undefined) {
                throw new Error("invalid char in delta encoding: " + sp);
            }
            let t = (k <= bias) ? 1 : ((k >= bias + 26) ? 26 : (k - bias));
            if (digit < t) { break; }
            w *= (36 - t);
            iv = it.next()
            if (iv.done) {
                throw new Error("truncated delta encoding");
            }
            k += 36;
        }
        const olen1 = output.length + 1;
        bias = _adapt(i - oldi, olen1, oldi === 0);
        n += Math.trunc(i / olen1);
        i = i % olen1;
        const sp = String.fromCodePoint(n);
        output.splice(i, 0, sp);
        i += 1;
    }
    return output.join("");
}


module.exports = {
    encode,
    decode,
};


/*
MIT License Copyright (c) 2024 Pavel Ivashkov https://github.com/paiv

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


},{}],5:[function(require,module,exports){

class RegexBuilder {
    constructor(op, args) {
        this.op = op
        this.args = args && args.filter((a) => typeof a === 'string' || !a.is_none())
    }

    regex(flags) {
        return new RegExp(this.toString(), flags)
    }

    toString() {
        switch (this.op) {
            case 'NONE':
                return null
            case 'CAPT_GROUP':
                return ['(', ...this.args, ')'].join('')
            case 'CAPT_OR_GROUP':
                return ['(', this.args.join('|'), ')'].join('')
            case 'NONCAPT_GROUP':
                return ['(?:', ...this.args, ')'].join('')
            case 'AND':
                return this.args.join('')
            case 'OR':
                return ['(?:', this.args.join('|'), ')'].join('')
            case 'CHARS':
                return ['[', this._pack_ranges(this.args.join('')), ']'].join('')
            case 'XCHARS':
                return ['[^', this._pack_ranges(this.args.join('')), ']'].join('')
            case 'OPT':
                switch (this.args.length) {
                    case 0:
                        return ''
                    case 1:
                        if (this.args[0] instanceof RegexBuilder) {
                            return (this.args.join('') + '?')
                        }
                        if (typeof this.args[0] === 'string') {
                            switch (this.args[0].length) {
                                case 0:
                                    return ''
                                case 1:
                                    return (this.args.join('') + '?')
                                default:
                                    break
                            }
                        }
                        // fall through
                    default:
                        return ['(?:', ...this.args, ')?'].join('')
                }
        }
    }

    _pack_ranges(s) {
        const xs = [...(new Set(s))]
        xs.sort()
        let res = ''
        let state = 0
        xs.forEach((c, i) => {
            switch (state) {
                case 0:
                    res += c
                    state = 1
                    break
                case 1:
                    if (c.charCodeAt(0) - xs[i-1].charCodeAt(0) !== 1) {
                        res += c
                    }
                    else {
                        state = 2
                    }
                    break
                case 2:
                    if (c.charCodeAt(0) - xs[i-1].charCodeAt(0) !== 1) {
                        if (xs[i-1].charCodeAt(0) - res.charCodeAt(res.length-1) > 1) {
                            res += '-'
                        }
                        res += xs[i-1]
                        res += c
                        state = 1
                    }
                    break
            }
        })
        if (state === 2) {
            if (xs[xs.length-1].charCodeAt(0) - res.charCodeAt(res.length-1) > 1) {
                res += '-'
            }
            res += xs[xs.length-1]
        }
        return res
    }

    none() {
        return new RegexBuilder('NONE')
    }

    is_none() {
        return this.op === 'NONE'
    }

    group() {
        return new RegexBuilder('CAPT_GROUP', [...arguments])
    }

    orgroup() {
        return new RegexBuilder('CAPT_OR_GROUP', [...arguments])
    }

    ngroup() {
        return new RegexBuilder('NONCAPT_GROUP', [...arguments])
    }

    and() {
        return new RegexBuilder('AND', [...arguments])
    }

    or() {
        return new RegexBuilder('OR', [...arguments])
    }

    chars() {
        return new RegexBuilder('CHARS', [...arguments])
    }

    xchars() {
        return new RegexBuilder('XCHARS', [...arguments])
    }

    optional() {
        return new RegexBuilder('OPT', [...arguments])
    }
}


module.exports = {
    RegexBuilder,
}

},{}],6:[function(require,module,exports){

const Dom = require('./dom_builder').DomBuilder
    , browserapi = require('./browserapi')
    , translit = require('./translit')
    , urlshortener = require('./urlshortener')


class Renderer {
    constructor(doc) {
        this.dom = Dom
        this.details_pane = doc.querySelector('.app .app-rules')
        this.details_actions_pane = doc.querySelector('.app .app-actions')
        this.preview_pane = doc.querySelector('.app .app-preview')

        this._localize()
    }

    _localize() {
        this.details_actions_pane.querySelector('.install a').textContent = browserapi.i18n.getMessage('extension_action_install')
        this.details_actions_pane.querySelector('.import button span').textContent = browserapi.i18n.getMessage('extension_action_import')
    }

    show_table_details(table, actions) {
        this._show_table_rules(table)
    }

    _show_table_rules(table) {
        let pane = this.details_pane.querySelector('div')

        let rules_pane = pane.querySelector('.rules')

        if (!rules_pane) {
            const old = pane
            pane = Dom.el('div')
            this.details_pane.replaceChild(pane, old)

            rules_pane = Dom.el('div', ['rules'])
            pane.appendChild(rules_pane)
        }

        const loabc = 'абвгґдеєжзиіїйклмнопрстуфхцчшщьюя'
        const nbsp = '\u00A0'
        const dotc = '\u25CC'

        function codePoint(s) {
            if (s.codePointAt) {
                return s.codePointAt(0)
            }
            return s.charCodeAt(0)
        }

        const rule_tag = (ch) => 'rule-' + codePoint(ch).toString(16)

        const print_char = (ch) => {
            const code = codePoint(ch)
            if ((code >= 0x02B0 && code < 0x0370)) {
                return [dotc, ch].join('')
            }
            return ch
        }

        const rule_cell = (pane, rules, ch) => {
            const lokey = ch.toLocaleLowerCase()
            const hikey = ch.toLocaleUpperCase()
            const aposkey = '\'' + lokey

            let cell = pane.querySelector('#' + rule_tag(lokey))
            if (!cell) {
                cell = Dom.el('div', ['rule-cell'])
                cell.id = rule_tag(lokey)
                pane.appendChild(cell)
            }
            else {
                Dom.resetChildren(cell)
            }


            {
                const main_row = Dom.el('div', ['rule-main'])

                const source = Dom.el('div', ['rule-thumb'])
                source.appendChild(Dom.text([hikey, nbsp, lokey].join('')))
                main_row.appendChild(source)

                let rule = rules[ch]

                if (rule === undefined || rule === null) {
                    rule = ''
                }

                let value = rule

                if (typeof rule === 'object') {
                    value = rule.other
                }

                const target = Dom.el('div', ['rule-thumb'])
                target.appendChild(Dom.text([print_char(value.toLocaleUpperCase()), nbsp, print_char(value.toLocaleLowerCase())].join('')))
                main_row.appendChild(target)

                cell.appendChild(main_row)


                if (typeof rule === 'object' && 'start' in rule) {
                    const extra_row = Dom.el('div', ['rule-extra'])

                    let value = rule.start

                    const target = Dom.el('div', ['rule-thumb'])
                    target.appendChild(Dom.text(print_char(value.toLocaleLowerCase())))
                    extra_row.appendChild(target)

                    const comment = Dom.el('div')
                    comment.appendChild(Dom.text(browserapi.i18n.getMessage('rules_label_at_word_start')))
                    extra_row.appendChild(comment)

                    cell.appendChild(extra_row)
                }

                if (typeof rule === 'object' && 'cons' in rule) {
                    const extra_row = Dom.el('div', ['rule-extra'])

                    let value = rule.cons

                    const target = Dom.el('div', ['rule-thumb'])
                    target.appendChild(Dom.text(print_char(value.toLocaleLowerCase())))
                    extra_row.appendChild(target)

                    const comment = Dom.el('div')
                    comment.appendChild(Dom.text(browserapi.i18n.getMessage('rules_label_after_consonants')))
                    extra_row.appendChild(comment)

                    cell.appendChild(extra_row)
                }
            }


            const extra = Object.keys(rules).filter((key) => (key.startsWith(lokey) && key !== lokey) || key.startsWith(aposkey))

            extra.forEach((key) => {
                const extra_row = Dom.el('div', ['rule-extra'])

                const source = Dom.el('div', ['rule-thumb'])
                source.appendChild(Dom.text(key))
                extra_row.appendChild(source)

                let rule = rules[key]

                if (rule === undefined || rule === null) {
                    rule = ''
                }

                let value = rule

                if (typeof rule === 'object') {
                    value = rule.other
                }

                const target = Dom.el('div', ['rule-thumb'])
                target.appendChild(Dom.text(print_char(value.toLocaleLowerCase())))
                extra_row.appendChild(target)

                cell.appendChild(extra_row)
            })

            return cell
        }


        const apos_cell = (pane, rules, ch) => {
            const lokey = ch

            let cell = pane.querySelector('#' + rule_tag(lokey))
            if (!cell) {
                cell = Dom.el('div', ['rule-cell'])
                cell.id = rule_tag(lokey)
                pane.appendChild(cell)
            }
            else {
                Dom.resetChildren(cell)
            }

            const extra_row = Dom.el('div', ['rule-extra'])

            const source = Dom.el('div', ['rule-thumb'])
            source.appendChild(Dom.text(ch))
            extra_row.appendChild(source)

            let rule = rules[ch]

            if (rule === undefined || rule === null) {
                rule = ''
            }

            const target = Dom.el('div', ['rule-thumb'])
            target.appendChild(Dom.text(print_char(rule.toLocaleLowerCase())))
            extra_row.appendChild(target)

            const comment = Dom.el('div')
            comment.appendChild(Dom.text(browserapi.i18n.getMessage('rules_label_apostrophe')))
            extra_row.appendChild(comment)

            cell.appendChild(extra_row)
            return cell
        }


        loabc.split('').forEach((ch) => {
            rule_cell(rules_pane, table.rules, ch)
        })

        apos_cell(rules_pane, table.rules, '\'')
    }

    show_preview(text) {
        const pane = Dom.el('div', ['content'])

        const lines = (text || '').split('\n\n')

        lines.forEach((line) => {
            const p = Dom.el('p')
            p.appendChild(Dom.text(line))
            pane.appendChild(p)
        })

        Dom.resetChildren(this.preview_pane, pane)
    }
}


class Controller {
    constructor() {
        this.view = new Renderer(document)
    }

    _request_url(url, callback) {
        var xhr = new XMLHttpRequest()
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                callback(xhr.responseText)
            }
        }
        xhr.open('GET', url, true)
        xhr.send()
    }

    render(table) {
        const tr = new translit.Transliterator(table.rules)

        this.view.show_table_details(table, [])

        this._request_url('preview.txt', (text) => {
            text = tr.convert(text)
            this.view.show_preview(text)
        })


        // git.io needs CORS
        // See https://github.com/isaacs/github/issues/973

        // const url = document.URL
        //
        // urlshortener.shorten(url, (short_url) => {
        //     this.view.show_share_pane(short_url)
        // })
    }
}


function render(table) {
    const ctl = new Controller()
    return ctl.render(table)
}


module.exports = {
    render,
}

},{"./browserapi":1,"./dom_builder":2,"./translit":8,"./urlshortener":9}],7:[function(require,module,exports){

const punycode = require('./punycode')


class SharerDecoderError {
    constructor(message) {
        this.message = message
    }

    toString() {
        return `SharerDecoderError{${this.message}}`
    }
}


class Sharer {
    constructor(baseUrl) {
        const canonicalUrl = 'https://paiv.github.io/latynka/v1'
        this.baseUrl = (baseUrl || canonicalUrl).toLowerCase()
    }

    makeShareLink(table) {
        const rules = table.rules || {}
        const res = []

        function _nstring(value) {
            if (value === undefined || value === null) {
                return [0]
            }

            if (value.length > 5) {
                throw 'Value is too long: ' + JSON.stringify(value)
            }

            return [value.length, value]
        }

        const fragment = Object.keys(rules)
            .sort((a,b) => a.localeCompare(b))
            .map((key) => {
                const rule = rules[key]

                if (rule === undefined || rule === null) {
                    return [..._nstring(key), ..._nstring(rule)]
                }
                else if (typeof rule === 'object') {
                    let res = _nstring(key)
                    if ('start' in rule) {
                        res = res.concat([7, ..._nstring(rule.start)])
                    }
                    if ('cons' in rule) {
                        res = res.concat([8, ..._nstring(rule.cons)])
                    }
                    if ('other' in rule) {
                        res = res.concat([9, ..._nstring(rule.other)])
                    }
                    return res
                }
                else {
                    return [..._nstring(key), ..._nstring(rule)]
                }
            })
            .reduce((acc, val) => acc.concat(val), [])
            .join('')

        if (!fragment) {
            return this.baseUrl
        }

        const encoded = encodeURIComponent(punycode.encode(fragment))
            .replace(/\-/g, '%2D')

        const url = `${this.baseUrl}?r=${encoded}`
        return url
    }

    decodeShareLink(link) {
        const table = {rules: {}}

        const parsedUrl = new URL(link)
        const match = `${parsedUrl.protocol}//${parsedUrl.host}${parsedUrl.pathname}`

        if (match.toLowerCase() !== this.baseUrl) {
            throw new SharerDecoderError('Unknown URI ' + JSON.stringify(link))
        }

        const search = (parsedUrl.search || '').substr(1)
        const encoded = search.split('&')
            .filter(p => p.substring(0, 2) === 'r=')
            .map(p => p.substring(2))
        if (!encoded.length) {
            return table
        }
        const fragment = punycode.decode(decodeURIComponent(encoded[0]))

        const rules = {}

        function _nstring(text, offset) {
            const n = parseInt(text.substr(offset++, 1), 10)
            const value = text.substr(offset, n)
            return [offset + n, value]
        }

        function _nvalue(text, offset) {
            let value, inner, done

            while (!done) {
                const n = parseInt(fragment.substr(offset, 1), 10)

                switch (n) {

                    case 7:
                    case 8:
                    case 9:
                        inner = _nstring(text, ++offset)
                        if (!value) {
                            value = {}
                        }
                        offset = inner[0]
                        value[n == 7 ? 'start' : n == 8 ? 'cons' : 'other'] = inner[1]
                        break

                    default:
                        if (!value) {
                            value = text.substr(++offset, n)
                            offset += n
                        }
                        done = true
                        break
                }
            }

            return [offset, value]
        }


        for (var offset = 0; offset < fragment.length; ) {
            const left = _nstring(fragment, offset)
            offset = left[0]
            const key = left[1]

            const right = _nvalue(fragment, offset)
            offset = right[0]
            const value = right[1]

            rules[key] = value
        }

        table.rules = rules

        return table
    }
}


function makeShareLink(table) {
    const sharer = new Sharer()
    return sharer.makeShareLink(table)
}


function decodeShareLink(link) {
    const sharer = new Sharer()
    return sharer.decodeShareLink(link)
}


function normalize(link) {
    const table = decodeShareLink(link)
    return makeShareLink(table)
}


module.exports = {
    Sharer,
    makeShareLink,
    decodeShareLink,
    normalize,
}

},{"./punycode":4}],8:[function(require,module,exports){
const RegexBuilder = require('./regex_builder').RegexBuilder


class Transliterator {
    constructor(rules) {
        this.compiled = Transliterator.compileTable(rules)
    }

    static compileTable(rules) {
        const loabc = 'абвгґдеєжзиіїйклмнопрстуфхцчшщьюя'
        const consonants = 'бвгґджзйклмнпрстфхцчшщ'
        const vowels = 'аеєиіїоуюя'

        const hiabc = loabc.toLocaleUpperCase()
        const apos = ['\'', '\u2019', '\u02BC']

        const default_rules = {}
        const word_start_rules = {}
        const after_cons_rules = {}

        function casesOf(s) {
            function* inner(acc, xs, i) {
                if (i >= xs.length) {
                    yield acc
                    return
                }
                const x = xs[i]
                const y = x.toLocaleUpperCase()
                yield* inner(acc + x, xs, i + 1)
                if (y !== x) {
                    yield* inner(acc + y, xs, i + 1)
                }
            }
            const lo = [...s.toLocaleLowerCase()]
            return [...inner('', lo, 0)]
        }

        function TitleCase(value) {
            return value.toLocaleLowerCase()
                .replace(/^./, (s) => s.toLocaleUpperCase())
        }

        function SillyCase(value) {
            return value.toLocaleLowerCase()
                .replace(/.$/, (s) => s.toLocaleUpperCase())
        }

        function isUpper(s) {
            return s !== s.toLocaleLowerCase()
        }

        function matchCaseOf(k, s) {
            if (isUpper(k[0])) {
                return TitleCase(s)
            }
            else if (isUpper(k[k.length-1])) {
                return SillyCase(s)
            }
            return s.toLocaleLowerCase()
        }


        Object.keys(rules).forEach((key) => {
            let rule = rules[key]

            if (rule == null) {
                rule = ''
            }

            if (typeof rule === 'object') {

                if ('start' in rule) {
                    const value = rule.start || ''
                    casesOf(key).forEach((k) => {
                        word_start_rules[k] = matchCaseOf(k, value)
                    })
                }

                if ('cons' in rule) {
                    const value = rule.cons || ''
                    casesOf(key).forEach((k) => {
                        after_cons_rules[k] = matchCaseOf(k, value)
                    })
                }

                const value = rule.other || ''
                casesOf(key).forEach((k) => {
                    default_rules[k] = matchCaseOf(k, value)
                })
            }
            else {
                if (key.indexOf('\'') >= 0) {
                    apos.forEach((c) => {
                        const newkey = key.replace('\'', c)
                        casesOf(newkey).forEach((k) => {
                            default_rules[k] = matchCaseOf(k, rule)
                        })
                    })
                }
                else {
                    casesOf(key).forEach((k) => {
                        default_rules[k] = matchCaseOf(k, rule)
                    })
                }
            }
        })


        const keys1 = Object.keys(default_rules).filter((key) => key.length === 1)
        const default_keyset1 = [...new Set(
            keys1.map((x) => x.toLocaleLowerCase())
        )]

        const keys2 = Object.keys(default_rules).filter((key) => key.length > 1)
        const default_keyset2 = [...new Set(
            keys2.map((s) => s.toLocaleLowerCase())
        )].sort((a,b) => b.length - a.length)

        const word_start_keyset = [...new Set(
            Object.keys(word_start_rules).map((s) => s.toLocaleLowerCase())
        )].sort((a,b) => b.length - a.length)

        const consonants_keyset = consonants
        const after_cons_keyset = [...new Set(
            Object.keys(after_cons_rules).map((x) => x.toLocaleLowerCase())
        )].sort((a,b) => b.length - a.length)


        const rxb = new RegexBuilder()
        const noop = '\uFFFC\uFFFC'

        const rx = rxb.or(
            // word start
            rxb.ngroup(
                // char preceding
                rxb.orgroup(  // 1
                    '^',
                    rxb.and(
                        rxb.xchars(loabc, ...apos),
                        rxb.optional(rxb.chars(...apos))
                    )
                ),
                // char to translate
                rxb.orgroup(  // 2
                    ...(word_start_keyset.length > 0 ? word_start_keyset : [noop])
                )
            ),
            // or word inner
            rxb.or(
                rxb.orgroup(  // 3
                    ...(default_keyset2.length > 0 ? default_keyset2 : [noop])
                ),
                rxb.group(  // 4
                    ...(after_cons_keyset.length > 0 ?
                        [rxb.chars(consonants_keyset), rxb.or(...after_cons_keyset)]
                        : [noop])
                ),
                rxb.orgroup(  // 5
                    rxb.chars(...default_keyset1)
                )
            )
        )
        .regex('gi')

        const cb = (text, prefix, match_start, match_pairs, match_cons, match_inner) => {
            if (match_start) {
                const value = word_start_rules[match_start]
                return prefix + value
            }

            if (match_pairs) {
                const value = default_rules[match_pairs]
                return value
            }

            if (match_cons) {
                const cons = default_rules[match_cons[0]]
                const value = after_cons_rules[match_cons.substring(1)]
                return cons + value
            }

            const value = default_rules[match_inner]
            return value
        }
        return {
            regex: rx,
            callback: cb,
        }
    }

    convert(text) {
        return text
            .normalize('NFC')
            .replace(this.compiled.regex, this.compiled.callback)
            .normalize('NFC')
    }

    processTextNodes(nodes) {
        nodes.forEach((node) => {
            const text = node.data || ''
            node.data = this.convert(text)
        })
    }
}


module.exports = {
    Transliterator,
}

},{"./regex_builder":5}],9:[function(require,module,exports){

class GitioUrlShortener {
    constructor() {
        this.serviceUrl = 'https://git.io/'
    }

    shorten(url, callback) {
        const xhr = new XMLHttpRequest()
        const form = new FormData()

        form.append('url', url)

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 201) {
                callback(xhr.getResponseHeader('Location'))
            }
        }

        xhr.open('POST', this.serviceUrl, true)
        xhr.send(form)
    }
}


function shorten(url, callback) {
    const service = new GitioUrlShortener()
    return service.shorten(url, callback)
}


module.exports = {
    shorten,
}

},{}],10:[function(require,module,exports){

const sharer = require('./sharer')
    , renderer = require('./renderer')


function app() {
    const loc = window.location
    const baseUrl = `${loc.protocol}//${loc.host}${loc.pathname}`
    const share = new sharer.Sharer(baseUrl)
    const empty = {rules: {}}

    try {
        var table = share.decodeShareLink(document.URL)
    }
    catch (e) {
        console.log(e)
    }

    renderer.render(table || empty)
}


window.addEventListener('load', () => app())

},{"./renderer":6,"./sharer":7}]},{},[10]);
