'use strict'

const Settings = require('./settings').Settings
    , html_i18n = require('./html_i18n')

const browserapi = chrome


class View {
    constructor(doc) {
        this.onChange = () => {}

        const form = doc.querySelector('[id="settings"]')
        this.enabled = form.querySelector('input[id="ext_enabled"]')
        this.enabled.addEventListener('change', () => { this._onEnabledChange() })

        this.tables_pane = doc.querySelector('[id="translit_tables"]')
        this.active_tables = new Set()
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

        const inner_pane = document.createElement('div')

        value.forEach((table) => {
            const chk = document.createElement('input')
            const table_id = table.id
            chk.type = 'checkbox'
            chk.name = 'chk-' + table_id

            if (active.has(table_id)) {
                chk.checked = true
                this.active_tables.add(table_id)
            }

            chk.addEventListener('change', () => { this._onTableChkChange(chk, table_id) })

            const lab = document.createElement('label')
            const text = document.createTextNode(table.title)
            lab.appendChild(chk)
            lab.appendChild(text)

            inner_pane.appendChild(lab)
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
}


class Controller {
    constructor() {
        this.settings = new Settings(browserapi.storage, () => { this._reloadView() })
        this.view = new View(document)

        this._localize_html(document)

        this.view.onChange = () => { this._storeSettings() }
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
}


const ctl = new Controller()
