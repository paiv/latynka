'use strict'

const Settings = require('./settings').Settings
    , html_i18n = require('./html_i18n')
    , Dom = require('./dom_builder').DomBuilder
    , browserapi = require('./browserapi')
    , markdown = require('./markdown')
    , random = require('./random')


function _safe_element_id(value) {
    return (value || '').replace(/[^\w\-]/g, '-')
}


class View {
    constructor(doc) {
        this.onChange = () => {}
        this.onMenuClickedBlacklist = () => {}
        this.onMenuClickedWhitelist = () => {}
        this.onMenuClickedTableRow = (table_id) => {}
        this.onBlacklistChange = (text) => {}
        this.onWhitelistChange = (text) => {}

        this.form = doc.querySelector('[id="settings"]')
        this.enabled = this.form.querySelector('input[id="ext_enabled"]')
        this.enabled.addEventListener('change', () => { this._onEnabledChange() })

        this.tables_pane = doc.querySelector('[id="translit_tables"]')
        this.active_tables = new Set()

        this._selected_menu_item = undefined
        this.details_pane = doc.querySelector('[id="details"]')
        this.details_actions_pane = doc.querySelector('[id="details-actions"]')

        const blacklist_pane = this.form.querySelector('[id="menu-site-blacklist"]')
        this.blacklist_enabled = blacklist_pane.querySelector('input')
        this.blacklist_item = blacklist_pane.querySelector('span')
        this.blacklist_enabled.addEventListener('click', (event) => { event.stopPropagation() }, false)
        this.blacklist_enabled.addEventListener('change', () => { this._onBlacklistEnabledChange() })
        blacklist_pane.addEventListener('click', () => { this._onBlacklistMenuClicked() })

        const whitelist_pane = this.form.querySelector('[id="menu-site-whitelist"]')
        this.whitelist_enabled = whitelist_pane.querySelector('input')
        this.whitelist_item = whitelist_pane.querySelector('span')
        this.whitelist_enabled.addEventListener('click', (event) => { event.stopPropagation() }, false)
        this.whitelist_enabled.addEventListener('change', () => { this._onWhitelistEnabledChange() })
        whitelist_pane.addEventListener('click', () => { this._onWhitelistMenuClicked() })
    }

    _changed() {
        this.onChange()
    }

    _onEnabledChange() {
        this._changed()
    }

    _onBlacklistEnabledChange() {
        this._changed()
    }

    _onWhitelistEnabledChange() {
        this._changed()
    }

    _onBlacklistMenuClicked() {
        this.onMenuClickedBlacklist()
    }

    _onWhitelistMenuClicked() {
        this.onMenuClickedWhitelist()
    }

    set_table_list(value, active) {
        this.active_tables.clear()

        const pane = Dom.el('div')

        value.forEach((table) => {
            const chk = Dom.el('input')
            const table_id = table.id
            const element_id = _safe_element_id(table_id)
            chk.type = 'checkbox'
            chk.name = 'chk-' + element_id

            if (active.has(table_id)) {
                chk.checked = true
                this.active_tables.add(table_id)
            }

            chk.addEventListener('click', (event) => { event.stopPropagation() }, false)
            chk.addEventListener('change', () => { this._onTableChkChange(chk, table_id) })

            const text = Dom.el('span')
            text.textContent = table.title || table.id

            const row = Dom.el('div', ['menu-row'])
            row.id = 'menu-' + element_id

            row.appendChild(chk)
            row.appendChild(text)

            row.addEventListener('click', () => { this._onTableRowClicked(table_id) })

            pane.appendChild(row)
        })

        const old = this.tables_pane.querySelector('div')
        this.tables_pane.replaceChild(pane, old)
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
        return this._selected_menu_item
    }

    set selected_menu_row(item_id) {
        if (this._selected_menu_item) {
            const el = this.form.querySelector('#menu-' + this._selected_menu_item)
            if (el) {
                el.classList.remove('menu-row-selected')
            }
        }

        const el = this.form.querySelector('#menu-' + item_id)
        if (el) {
            el.classList.add('menu-row-selected')
        }

        this._selected_menu_item = item_id
    }

    clear_details() {
        let pane = Dom.el('div')
        Dom.resetChildren(this.details_pane, pane)
        this._show_detail_actions([])
    }

    show_table_details(table, actions) {
        this._show_table_rules(table)
        this._show_detail_actions(actions)
    }

    _show_table_rules(table) {
        let pane = this.details_pane.querySelector('div')

        let title = pane.querySelector('.details-title')
        let description = pane.querySelector('.details-descr')
        let rules_pane = pane.querySelector('.rules')

        if (!rules_pane) {
            const old = pane
            pane = Dom.el('div')
            this.details_pane.replaceChild(pane, old)

            title = Dom.el('div', ['details-title'])
            pane.appendChild(title)

            description = Dom.el('div', ['details-descr'])
            pane.appendChild(description)

            rules_pane = Dom.el('div', ['rules'])
            pane.appendChild(rules_pane)
        }

        title.textContent = table.title

        const desc = markdown.render(table.description)
        Dom.resetChildren(description, desc)

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
                Dom.resetChildren(cell)
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
                Dom.resetChildren(cell)
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

    _show_detail_actions(actions) {
        let pane = Dom.el('div')

        actions.forEach((action) => {
            const button = Dom.el('button')
            button.appendChild(Dom.text(action.title))
            button.addEventListener('click', action.handler)
            pane.appendChild(button)
        })

        let old = this.details_actions_pane.querySelector('div')
        this.details_actions_pane.replaceChild(pane, old)
    }

    get confirm_delete_visible() {
        return !!this.details_actions_pane.querySelector('.confirm-delete')
    }

    set confirm_delete_visible(value) {
        const pane = this.details_actions_pane.querySelector('div')

        let el = pane.querySelector('.confirm-delete')
        if (!value) {
            if (el) {
                pane.removeChild(el)
            }
        }
        else {
            if (!el) {
                el = Dom.el('div', ['confirm-delete'])
                el.textContent = 'Confirm Delete'
                pane.appendChild(el)
            }
        }
    }

    _show_blackwhitelist_details(title, description, list_rules) {
        this._show_detail_actions([])

        const old = this.details_pane.querySelector('div')
        const pane = Dom.el('div')

        const title_pane = Dom.el('div', ['details-title'])
        pane.appendChild(title_pane)
        title_pane.appendChild(Dom.text(title))

        const descr_pane = Dom.el('div', ['details-descr'])
        pane.appendChild(descr_pane)
        descr_pane.appendChild(Dom.text(description))

        const rules_pane = Dom.el('div', ['site-list'])
        pane.appendChild(rules_pane)

        const rules = Dom.el('textarea')
        rules_pane.appendChild(rules)
        rules.value = list_rules.join('\n')

        this.details_pane.replaceChild(pane, old)
    }

    show_blacklist_details(blacklist) {
        this._show_blackwhitelist_details(
            browserapi.i18n.getMessage('options_blacklist_details_title'),
            browserapi.i18n.getMessage('options_blacklist_details_description'),
            blacklist)

        const textarea = this.details_pane.querySelector('textarea')
        textarea.addEventListener('change', () => { this.onBlacklistChange(textarea.value) })
    }

    show_whitelist_details(whitelist) {
        this._show_blackwhitelist_details(
            browserapi.i18n.getMessage('options_whitelist_details_title'),
            browserapi.i18n.getMessage('options_whitelist_details_description'),
            whitelist)

            const textarea = this.details_pane.querySelector('textarea')
            textarea.addEventListener('change', () => { this.onWhitelistChange(textarea.value) })
    }
}


class Controller {
    constructor() {
        this.settings = new Settings(browserapi.storage, () => { this._reloadView() })
        this.view = new View(document)

        this._localize_html(document)

        this.view.onChange = () => { this._storeSettings() }
        this.view.onMenuClickedBlacklist = () => { this._showBlacklistDetails() }
        this.view.onMenuClickedWhitelist = () => { this._showWhitelistDetails() }
        this.view.onMenuClickedTableRow = (table_id) => { this._showTableDetails(table_id) }
        this.view.onBlacklistChange = (text) => { this._storeBlacklist(text) }
        this.view.onWhitelistChange = (text) => { this._storeWhitelist(text) }
    }

    _storeSettings() {
        this.settings.save({
            enabled: this.view.enabled.checked,
            blacklist_enabled: this.view.blacklist_enabled.checked,
            whitelist_enabled: this.view.whitelist_enabled.checked,
            active_table_ids: [...this.view.active_tables],
        })
    }

    _storeBlacklist(text) {
        this.settings.set_site_blacklist_from_text(text)
    }

    _storeWhitelist(text) {
        this.settings.set_site_whitelist_from_text(text)
    }

    _reloadView() {
        this.view.enabled.checked = this.settings.enabled
        this.view.blacklist_enabled.checked = this.settings.blacklist_enabled
        this.view.whitelist_enabled.checked = this.settings.whitelist_enabled
        this.view.set_table_list(this.settings.all_tables(), new Set(this.settings.active_table_ids))

        if (this.view.selected_menu_row === 'site-blacklist') {
            this.view.show_blacklist_details(this.settings.site_blacklist)
        }
        else if (this.view.selected_menu_row === 'site-whitelist') {
            this.view.show_whitelist_details(this.settings.site_whitelist)
        }
        else if (this.selected_table_id) {
            this._showTableDetails(this.selected_table_id)
        }
        else {
            this.view.clear_details()
        }
    }

    _localize_html(doc) {
        html_i18n.localize(doc)
    }

    _showBlacklistDetails() {
        this.view.selected_menu_row = 'site-blacklist'
        this.selected_table_id = null
        this.view.show_blacklist_details(this.settings.site_blacklist)
    }

    _showWhitelistDetails() {
        this.view.selected_menu_row = 'site-whitelist'
        this.selected_table_id = null
        this.view.show_whitelist_details(this.settings.site_whitelist)
    }

    _showTableDetails(table_id) {
        const table = this.settings.get_table(table_id) || {}
        table_id = table.id
        this.selected_table_id = table_id

        const element_id = _safe_element_id(table_id)
        const is_bundled = table_id && !(/\./.test(table_id))

        this.view.selected_menu_row = element_id

        const actions = []

        if (is_bundled) {
            actions.push({
                title: 'edit',
                handler: () => { this._createEditableCopy(table_id) }
            })
        }
        else {
            actions.push({
                title: 'copy',
                handler: () => { this._createEditableCopy(table_id) }
            })

            actions.push({
                title: 'delete',
                handler: () => { this._deleteTable(table_id) }
            })
        }

        this.view.show_table_details(table, actions)
    }

    _createEditableCopy(table_id) {
        const table = this.settings.get_table(table_id) || {}
        const seq_no = this.settings.user_tables_seq_no

        const newtable = {
            id: this._generate_table_id(table.id, seq_no),
            seq_no: seq_no,
            title: this._generate_table_title(table.title),
            rules: JSON.parse(JSON.stringify(table.rules)),
        }

        this.view.selected_menu_row = _safe_element_id(newtable.id)
        this.selected_table_id = newtable.id

        this.settings.import_table(newtable)
    }

    _generate_table_id(from_id, seq_no) {
        seq_no = `000${seq_no}`.slice(-3)

        from_id = (from_id || '').replace(/\..*$/, '')
        const suffix = random.string(8)

        return `${from_id}.${seq_no}.${suffix}`
    }

    _generate_table_title(from_title) {
        const prefix = browserapi.i18n.getMessage('options_table_title_copy_prefix')

        if (from_title && from_title.startsWith(prefix)) {
            from_title = from_title.substring(prefix.length)
            const match = /^\s*\((\d+)\)\s*(.*)/.exec(from_title)
            if (match) {
                const count = parseInt(match[1], 10)
                return `${prefix}(${count + 1}) ${match[2]}`
            }
            else {
                return `${prefix}(1) ${from_title}`
            }
        }

        return `${prefix}${from_title}`
    }

    _deleteTable(table_id) {
        if (this.view.confirm_delete_visible) {
            this.selected_table_id = null
            this.settings.delete_user_table(table_id)
        }
        else {
            this.view.confirm_delete_visible = true
        }
    }
}


const ctl = new Controller()
