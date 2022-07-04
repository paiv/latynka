
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
                return [nbsp, ch].join('')
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
