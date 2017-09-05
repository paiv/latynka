'use strict'

const Settings = require('./settings').Settings
    , html_i18n = require('./html_i18n')

const browserapi = chrome


class Dom {
    static el(name, classes) {
        const x = document.createElement(name)
        if (classes) classes.forEach((c) => x.classList.add(c))
        return x
    }

    static text(value) {
        return document.createTextNode(value)
    }

    static html(value) {
        const x = this.el('span')
        x.innerHTML = value
        return x
    }
}


class View {
    constructor(doc) {
        this.onChange = () => {}
        this.onMenuClickedTableRow = (table_id) => {}

        const form = doc.querySelector('[id="settings"]')
        this.enabled = form.querySelector('input[id="ext_enabled"]')
        this.enabled.addEventListener('change', () => { this._onEnabledChange() })

        this.tables_pane = doc.querySelector('[id="translit_tables"]')
        this.active_tables = new Set()

        this._selected_table_id = undefined
        this.table_details = doc.querySelector('[id="table_details"]')
    }

    _changed() {
        this.onChange()
    }

    _onEnabledChange() {
        this._changed()
    }

    set_table_list(value, active) {
        this.tables_pane.innerHTML = ''
        this.active_tables.clear()

        const inner_pane = Dom.el('div')

        value.forEach((table) => {
            const chk = Dom.el('input')
            const table_id = table.id
            chk.type = 'checkbox'
            chk.name = 'chk-' + table_id

            if (active.has(table_id)) {
                chk.checked = true
                this.active_tables.add(table_id)
            }

            chk.addEventListener('click', (event) => { event.stopPropagation() }, false)
            chk.addEventListener('change', () => { this._onTableChkChange(chk, table_id) })

            const text = Dom.el('span')
            text.textContent = table.title

            const row = Dom.el('div', ['menu-row'])
            row.id = 'menu-' + table_id

            row.appendChild(chk)
            row.appendChild(text)

            row.addEventListener('click', () => { this._onTableRowClicked(table_id) })

            inner_pane.appendChild(row)
        })

        this.tables_pane.appendChild(inner_pane)
    }

    _onTableChkChange(chk, table_id) {
        if (chk.checked) {
            this.active_tables.add(table_id)
        }
        else {
            this.active_tables.delete(table_id)
        }

        this._changed()
    }

    _onTableRowClicked(table_id) {
        this.onMenuClickedTableRow(table_id)
    }

    get selected_menu_row() {
        return this._selected_table_id
    }

    set selected_menu_row(table_id) {
        if (this._selected_table_id) {
            const el = this.tables_pane.querySelector('#menu-' + this._selected_table_id)
            if (el) {
                el.classList.remove('menu-row-selected')
            }
        }

        const el = this.tables_pane.querySelector('#menu-' + table_id)
        if (el) {
            el.classList.add('menu-row-selected')
        }

        this._selected_table_id = table_id
    }

    show_table_details(table) {
        const pane = this.table_details

        let title = pane.querySelector('.details-title')
        let description = pane.querySelector('.details-descr')
        let rules_pane = pane.querySelector('.rules')

        if (!title) {
            pane.innerHTML = ''

            title = Dom.el('div', ['details-title'])
            pane.appendChild(title)

            description = Dom.el('div', ['details-descr'])
            pane.appendChild(description)

            rules_pane = Dom.el('div', ['rules'])
            pane.appendChild(rules_pane)
        }

        title.textContent = table.title
        description.innerHTML = table.description

        const loabc = 'абвгґдеєжзиіїйклмнопрстуфхцчшщьюя'
        const nbsp = '\u00A0'

        const rule_tag = (ch) => 'rule-' + ch.codePointAt(0).toString(16)

        const print_char = (ch) => {
            const code = ch.codePointAt(0)
            if ((code >= 0x02B0 && code < 0x0370)) {
                return [nbsp, ch].join('')
            }
            return ch
        }

        const rule_cell = (pane, rules, ch) => {
            const lokey = ch.toLocaleLowerCase()
            const hikey = ch.toLocaleUpperCase()

            let cell = pane.querySelector('#' + rule_tag(lokey))
            if (!cell) {
                cell = Dom.el('div', ['rule-cell'])
                cell.id = rule_tag(lokey)
                pane.appendChild(cell)
            }
            else {
                cell.innerHTML = ''
            }


            {
                const main_row = Dom.el('div', ['rule-main'])

                const source = Dom.el('div', ['rule-thumb'])
                source.appendChild(Dom.text([hikey, nbsp, lokey].join('')))
                main_row.appendChild(source)

                const rule = rules[ch]
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


            const extra = Object.keys(rules).filter((key) => key.startsWith(lokey) && key !== lokey)

            extra.forEach((key) => {
                const extra_row = Dom.el('div', ['rule-extra'])

                const source = Dom.el('div', ['rule-thumb'])
                source.appendChild(Dom.text(key))
                extra_row.appendChild(source)

                const rule = rules[key]
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
                cell.innerHTML = ''
            }

            const extra_row = Dom.el('div', ['rule-extra'])

            const source = Dom.el('div', ['rule-thumb'])
            source.appendChild(Dom.text(ch))
            extra_row.appendChild(source)

            let rule = rules[ch]
            if (typeof rule === 'undefined') {
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
}


class Controller {
    constructor() {
        this.settings = new Settings(browserapi.storage, () => { this._reloadView() })
        this.view = new View(document)

        this._localize_html(document)

        this.view.onChange = () => { this._storeSettings() }
        this.view.onMenuClickedTableRow = (table_id) => { this._showTableDetails(table_id) }
    }

    _storeSettings() {
        this.settings.save({
            enabled: this.view.enabled.checked,
            active_table_ids: [...this.view.active_tables],
        })
    }

    _reloadView() {
        this.view.enabled.checked = this.settings.enabled
        this.view.set_table_list(this.settings.all_tables(), new Set(this.settings.active_table_ids))
    }

    _localize_html(doc) {
        html_i18n.localize(doc)
    }

    _showTableDetails(table_id) {
        const table = this.settings.get_table(table_id) || {}
        this.view.selected_menu_row = table.id
        this.view.show_table_details(table)
    }
}


const ctl = new Controller()
