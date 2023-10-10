'use strict'

const Settings = require('./settings').Settings
    , html_i18n = require('./html_i18n')
    , Dom = require('./dom_builder').DomBuilder
    , browserapi = require('./browserapi')
    , markdown = require('./markdown')
    , random = require('./random')
    , jaaml = require('./jaaml')
    , validator = require('./rule_validator')
    , sharer = require('./sharer')
    , translit = require('./translit')


function _safe_element_id(value) {
    return (value || '').replace(/[^\w\-]/g, '-')
}


class View {
    constructor(doc) {
        this.onChange = () => {}
        this.onMenuClickedTableRow = (table_id) => {}
        this.onBlacklistChange = (text) => {}
        this.onWhitelistChange = (text) => {}
        this.onRulesEditorInput = (text) => {}
        this.onPreviewEditClick = () => {}
        this.onPreviewSaveClick = () => {}

        this.form = doc.querySelector('[id="settings"]')

        this.about_pane = this.form.querySelector('[id="menu-about"]')
        this.expand_about()
        
        this.enabled = this.form.querySelector('input[id="ext_enabled"]')
        this.enabled.addEventListener('change', () => { this._onEnabledChange() })

        this.tables_pane = doc.querySelector('[id="translit_tables"]')
        this.active_tables = new Set()

        this.details_pane = doc.querySelector('[id="details"]')
        this.preview_pane = doc.querySelector('[id="preview"]')

        const blacklist_pane = this.form.querySelector('[id="menu-site-blacklist"]')
        this.blacklist_enabled = blacklist_pane.querySelector('input')
        this.blacklist_enabled.addEventListener('click', (event) => { event.stopPropagation() }, false)
        this.blacklist_enabled.addEventListener('change', () => { this._onBlacklistEnabledChange() })
        {
            const textarea = blacklist_pane.querySelector('textarea')
            textarea.addEventListener('change', () => { this.onBlacklistChange(textarea.value) })
        }
        const whitelist_pane = this.form.querySelector('[id="menu-site-whitelist"]')
        this.whitelist_enabled = whitelist_pane.querySelector('input')
        this.whitelist_enabled.addEventListener('click', (event) => { event.stopPropagation() }, false)
        this.whitelist_enabled.addEventListener('change', () => { this._onWhitelistEnabledChange() })
        {
            const textarea = whitelist_pane.querySelector('textarea')
            textarea.addEventListener('change', () => { this.onWhitelistChange(textarea.value) })
        }
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

            const more = Dom.el('button')
            more.appendChild(Dom.text('…'))

            const label = Dom.el('label')
            label.appendChild(chk)
            label.appendChild(text)
            
            const row = Dom.el('div', ['menu-row'])
            row.id = 'menu-' + element_id

            row.appendChild(label)
            row.appendChild(more)

            more.addEventListener('click', () => { this._onTableRowClicked(table_id) })

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
    }

    show_table_details(table, actions) {
        this._show_table_rules(table, actions)
        window.scrollTo(0, 0)
    }

    show_table_editor(table, text, actions) {
        this._show_rules_editor(table, text, actions)
    }

    show_share_pane(table, actions) {
        this._show_sharing(table)
    }

    _render_actions(actions, pane) {
        if (!pane) {
            pane = Dom.el('div', ['details-actions'])
        }
        else {
            Dom.resetChildren(pane)
        }
        actions.forEach((action) => {
            const button = Dom.el('button')
            button.id = action.id
            button.appendChild(Dom.text(action.title))
            button.addEventListener('click', action.handler)
            pane.appendChild(button)
        })
        return pane
    }
    
    _show_table_rules(table, actions) {
        let pane = this.details_pane

        let title = pane.querySelector('.details-title')
        let description = pane.querySelector('.details-descr')
        let rules_pane = pane.querySelector('.rules')
        let actions_pane = pane.querySelector('.details-actions')

        if (!rules_pane) {
            title = Dom.el('div', ['details-title'])
            description = Dom.el('div', ['details-descr'])
            rules_pane = Dom.el('div', ['rules'])
            actions_pane = Dom.el('div', ['details-actions'])
        }
        Dom.resetChildren(pane, title, description, actions_pane, rules_pane)

        title.textContent = table.title

        const desc = markdown.render(table.description)
        Dom.resetChildren(description, desc)

        this._render_actions(actions, actions_pane)

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

    _show_rules_editor(table, text, actions) {
        const pane = Dom.el('div')

        {
            const title_pane = Dom.el('div', ['title-editor'])
            pane.appendChild(title_pane)

            var title = Dom.el('input')
            title.value = table.title
            title_pane.appendChild(title)

            let actions_pane = this._render_actions(actions)
            pane.appendChild(actions_pane)

            const rules_pane = Dom.el('div', ['rules-editor'])
            pane.appendChild(rules_pane)

            const textarea = Dom.el('textarea')
            rules_pane.appendChild(textarea)

            textarea.value = text

            textarea.addEventListener('input', () => { this.onRulesEditorInput(textarea.value) })
        }

        {
            const info_pane = Dom.el('div', ['editor-info'])
            pane.appendChild(info_pane)
            const status = Dom.el('div', ['status'])
            info_pane.appendChild(status)
        }

        Dom.resetChildren(this.details_pane, ...pane.children)

        title.focus()
    }

    close_preview() {
        let pane = Dom.el('div')
        Dom.resetChildren(this.preview_pane, pane)
    }

    show_preview(text, edit_mode) {
        const pane = this.preview_pane
        let textarea = pane.querySelector('textarea')
        if (!textarea) {
            const actions = Dom.el('div', ['preview-actions'])
            const label = Dom.el('label')
            label.htmlFor = 'pta'
            label.textContent = browserapi.i18n.getMessage('options_preview_title')
            actions.appendChild(label)
            
            const editPreview = Dom.el('button', ['edit-preview'])
            editPreview.textContent = 'edit'
            editPreview.style.display = edit_mode ? 'none' : null
            actions.appendChild(editPreview)

            const savePreview = Dom.el('button', ['save-preview'])
            savePreview.textContent = 'save'
            savePreview.style.display = edit_mode ? null : 'none'
            actions.appendChild(savePreview)

            editPreview.addEventListener('click', () => { this.onPreviewEditClick() })
            savePreview.addEventListener('click', () => { this.onPreviewSaveClick() })
            
            textarea = Dom.el('textarea')
            textarea.id = 'pta'
            Dom.resetChildren(pane, actions, textarea)
        }
        else {
            const editPreview = pane.querySelector('.edit-preview')
            const savePreview = pane.querySelector('.save-preview')
            editPreview.style.display = edit_mode ? 'none' : null
            savePreview.style.display = edit_mode ? null : 'none'
        }
        textarea.value = text
        textarea.readOnly = !edit_mode
        return preview
    }

    get preview_text() {
        const textarea = this.preview_pane.querySelector('textarea')
        return textarea.value
    }

    set preview_text(value) {
        const textarea = this.preview_pane.querySelector('textarea')
        textarea.value = value
    }

    preview_edit_mode(text, isEdit) {
        this.preview_text = text

        const pane = this.preview_pane
        const textarea = pane.querySelector('textarea')
        const editButton = pane.querySelector('.edit-preview')
        const saveButton = pane.querySelector('.save-preview')

        editButton.style.display = isEdit ? 'none' : null
        saveButton.style.display = isEdit ? null : 'none'
        textarea.readOnly = !isEdit

        if (isEdit) {
            textarea.focus()
        }
    }

    get rules_editor_error() {
        const error = this.details_pane.querySelector('.editor-info .status')
        return error.textContent
    }

    set rules_editor_error(value) {
        const error = this.details_pane.querySelector('.editor-info .status')
        error.textContent = value
        
        let actions_pane = this.details_pane.querySelector('.details-actions')
        const saveButton = actions_pane.querySelector('#action-save-edit')
        saveButton.disabled = !!value
    }

    _show_sharing(table) {
        let details = this.details_pane
        const rules_pane = details.querySelector('.rules')
        let share_pane = details.querySelector('.share')

        function link_row(url, description) {
            let row = Dom.el('div', ['share-row'])

            if (description) {
                let desc = Dom.el('div', ['share-descr'])
                desc.appendChild(Dom.text(description))
                row.appendChild(desc)
            }

            let copy = Dom.el('button')
            copy.appendChild(Dom.text('Copy URL'))
            row.appendChild(copy)

            let link = Dom.el('input')
            link.type = "text"
            link.readOnly = true
            link.value = url
            row.appendChild(link)

            copy.addEventListener('click', () => {
                link.select()
                document.execCommand('copy')
            })

            return row
        }

        let pane = Dom.el('div', ['share'])

        let full_pane = link_row(table.share_link)
        full_pane.classList.add('full-link')
        pane.appendChild(full_pane)

        if (table.short_share_link) {
        const placeholder = 'loading...'

        let short_pane = link_row(table.short_share_link || placeholder, 'Short URL:')
        short_pane.classList.add('short-link')
        pane.appendChild(short_pane)
        }

        if (share_pane) {
            details.replaceChild(pane, share_pane)
        }
        else {
            details.insertBefore(pane, rules_pane)
        }
    }

    get rules_editor() {
        return this.details_pane.querySelector('.rules-editor > textarea')
    }

    get title_editor() {
        return this.details_pane.querySelector('.title-editor > input')
    }

    get confirm_delete_visible() {
        return !!this.details_pane.querySelector('.confirm-delete')
    }

    set confirm_delete_visible(value) {
        const pane = this.details_pane.querySelector('.details-actions')

        let el = pane.querySelector('.confirm-delete')
        if (!value) {
            if (el) {
                pane.removeChild(el)
            }
        }
        else {
            if (!el) {
                el = Dom.el('div', ['confirm-delete'])
                el.textContent = browserapi.i18n.getMessage('options_table_confirm_delete')

                const actionDelete = pane.querySelector('[id="action-delete"]')
                if (actionDelete) {
                    pane.insertBefore(el, actionDelete)
                }
                else {
                    pane.appendChild(el)
                }
            }
        }
    }

    expand_about() {
        const title = Dom.el('h2')
        title.appendChild(Dom.text(browserapi.i18n.getMessage('options_about')))
        
        let details = browserapi.i18n.getMessage('options_about_details')
        details = markdown.render(details)
        
        Dom.resetChildren(this.about_pane, title, details)
    }

    show_blacklist_details(blacklist) {
        const textarea = this.form.querySelector('#menu-site-blacklist textarea')
        textarea.value = blacklist.join('\n')
    }

    show_whitelist_details(whitelist) {
        const textarea = this.form.querySelector('#menu-site-whitelist textarea')
        textarea.value = whitelist.join('\n')
    }
}


class Controller {
    constructor() {
        this.settings = new Settings(browserapi.storage, () => { this._reloadView() })
        this.view = new View(document)

        this._localize_html(document)

        this.view.onChange = () => { this._storeSettings() }
        this.view.onMenuClickedTableRow = (table_id) => { this._showTableDetails(table_id) }
        this.view.onBlacklistChange = (text) => { this._storeBlacklist(text) }
        this.view.onWhitelistChange = (text) => { this._storeWhitelist(text) }
        this.view.onRulesEditorInput = (text) => { this._checkRulesEditorInput(text) }
        this.view.onPreviewEditClick = () => { this._editPreviewText() }
        this.view.onPreviewSaveClick = () => { this._savePreviewText() }
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
        this._has_user_tables = this.settings.user_tables().length > 0

        this.view.show_blacklist_details(this.settings.site_blacklist)
        this.view.show_whitelist_details(this.settings.site_whitelist)

        if (this.selected_table_id) {
            if (this._in_edit_mode) {
                this._editMode(this.selected_table_id, this.rules_text)
            }
            else {
                this._showTableDetails(this.selected_table_id)
            }
        }
        else {
            this._closeDetails()
        }
    }

    _reloadPreview() {
        this._in_preview_edit_mode = false
        let trx = undefined
        if (this._in_edit_mode) {
            const rules = jaaml.parse(this.rules_text)
            trx = new translit.Transliterator(rules)
        }
        else {
            const table_id = this.selected_table_id
            const table = this.settings.get_table(table_id) || {}
            trx = new translit.Transliterator(table.rules)
        }
        const preview_text = trx.convert(this.settings.preview_text)
        this.view.show_preview(preview_text, false)
    }

    _localize_html(doc) {
        html_i18n.localize(doc)
    }

    _closeDetails() {
        this._in_edit_mode = false
        this._in_preview_edit_mode = false
        this.selected_table_id = null
        this.view.selected_menu_row = null
        this.view.clear_details()
        this.view.close_preview()
    }

    _showTableDetails(table_id) {
        const table = this.settings.get_table(table_id) || {}
        table_id = table.id

        if (!table.rules) {
            table.rules = {}
        }

        this._in_edit_mode = false
        this.selected_table_id = table_id

        const element_id = _safe_element_id(table_id)
        const is_bundled = table_id && !(/\./.test(table_id))

        this.view.selected_menu_row = element_id

        const actions = []

        actions.push({
            id: 'action-close',
            title: browserapi.i18n.getMessage('options_table_action_close'),
            handler: () => { this._closeDetails() }
        })
        actions.push({
            id: 'action-share',
            title: browserapi.i18n.getMessage('options_table_action_share'),
            handler: () => { this._sharingMode(table_id) }
        })

        if (is_bundled) {
            actions.push({
                id: 'action-copy',
                title: browserapi.i18n.getMessage('options_table_action_copy'),
                handler: () => { this._createEditableCopy(table_id, false) }
            })
        }
        else {
            actions.push({
                id: 'action-edit',
                title: browserapi.i18n.getMessage('options_table_action_edit'),
                handler: () => { this._editMode(table_id) }
            })

            actions.push({
                id: 'action-copy',
                title: browserapi.i18n.getMessage('options_table_action_copy'),
                handler: () => { this._createEditableCopy(table_id) }
            })

            actions.push({
                id: 'action-delete',
                title: browserapi.i18n.getMessage('options_table_action_delete'),
                handler: () => { this._deleteTable(table_id) }
            })
        }

        this.view.show_table_details(table, actions)
        this._reloadPreview()
    }

    _createEditableCopy(table_id, edit_mode) {
        const table = this.settings.get_table(table_id) || {}
        const seq_no = this.settings.user_tables_seq_no

        const newtable = {
            id: this.settings.generate_table_id(table.id, seq_no),
            seq_no: seq_no,
            title: this._generate_table_title(table.title),
            rules: JSON.parse(JSON.stringify(table.rules)),
        }

        if (!newtable.rules) {
            newtable.rules = {}
        }

        this.selected_table_id = newtable.id
        this.view.selected_menu_row = _safe_element_id(newtable.id)
        this.rules_text = undefined
        this._in_edit_mode = edit_mode

        this.settings.import_table(newtable)
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
            this.view.selected_menu_row = null
            this.settings.delete_user_table(table_id)
        }
        else {
            this.view.confirm_delete_visible = true
        }
    }

    _editMode(table_id, edited_text) {
        const table = this.settings.get_table(table_id) || {}
        table_id = table.id
        this._in_edit_mode = true
        this.view.selected_menu_row = _safe_element_id(table_id)
        this.selected_table_id = table_id

        const rules = {}
        Object.keys(table.rules)
            .sort((a,b) => a.localeCompare(b))
            .forEach((key) => rules[key] = table.rules[key])

        this.rules_text = edited_text

        try {
            if (edited_text === undefined) {
                this.rules_text = jaaml.stringify(rules)
            }
        }
        catch (e) {
            this.rules_text = e.toString()
        }

        const actions = []

        actions.push({
            id: 'action-save-edit',
            title: browserapi.i18n.getMessage('options_rules_editor_save'),
            handler: () => { this._saveEdit(table) }
        })

        actions.push({
            id: 'action-cancel-edit',
            title: browserapi.i18n.getMessage('options_rules_editor_cancel'),
            handler: () => { this._cancelEdit(table_id) }
        })

        this.view.show_table_editor(table, this.rules_text, actions)
        this._reloadPreview()

        this._checkRulesEditor(this.rules_text)
    }

    _saveEdit(table) {
        const title = this.view.title_editor.value
        const text = this.view.rules_editor.value
        let rules

        try {
            rules = jaaml.parse(text)
        }
        catch (e) {
            console.error(e)
            return
        }

        const newtable = Object.assign({}, table, {rules: null, share_link: null, short_share_link: null})
        newtable.title = title
        newtable.rules = rules

        this.settings.update_user_table(newtable)

        this._showTableDetails(newtable.id)
    }

    _cancelEdit(table_id) {
        this._showTableDetails(table_id)
    }

    _sharingMode(table_id) {
        const table = this.settings.get_table(table_id) || {}
        table_id = table.id

        if (!table.share_link) {
            table.share_link = sharer.makeShareLink(table)
        }

        const actions = []

        actions.push({
            id: 'action-share-close',
            title: browserapi.i18n.getMessage('share_dialog_close'),
            handler: () => { this._showTableDetails(table_id) }
        })

        this.view.show_share_pane(table, actions)
    }

    _checkRulesEditorInput(text) {
        this._delayed_overlapping('rules-editor', 200, () => {
            this._checkRulesEditor(text)
        })
    }

    _delayed_overlapping(key, interval, handler) {
        if (!this._delayed_overlapping_ids) {
            this._delayed_overlapping_ids = new Object()
        }

        const other = this._delayed_overlapping_ids[key]
        window.clearTimeout(other)
        this._delayed_overlapping_ids[key] = window.setTimeout(handler, interval)
    }

    _checkRulesEditor(rulesText) {
        try {
            this.rules_text = rulesText
            const rules = jaaml.parse(this.rules_text)
            this._validate_rules(rules || {})
            if (!this._in_preview_edit_mode) {
                const trx = new translit.Transliterator(rules)
                const preview = trx.convert(this.settings.preview_text)
                this.view.preview_text = preview
            }
            this.view.rules_editor_error = ''
        }
        catch (e) {
            this.view.rules_editor_error = e.toString()
        }
    }

    _validate_rules(rules) {
        validator.validate(rules)
    }

    _editPreviewText() {
        this._in_preview_edit_mode = true
        this.view.preview_edit_mode(this.settings.preview_text, true)
    }

    _savePreviewText() {
        this._in_preview_edit_mode = false
        const previewText = this.view.preview_text

        if (this.settings.preview_text === previewText) {
            this._reloadPreview()
        }
        else {
            this.settings.preview_text = previewText
        }
    }
}


const ctl = new Controller()
