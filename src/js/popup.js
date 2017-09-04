'use strict'

const Settings = require('./settings').Settings
    , html_i18n = require('./html_i18n')

const browserapi = chrome


class View {
    constructor(doc) {
        this.onChange = () => {}
        this.onOptionsClicked = () => {}

        const form = doc.querySelector('[id="settings"]')
        this.enabled = form.querySelector('input[id="ext_enabled"]')
        this.enabled.addEventListener('change', () => { this._onEnabledChange() })

        const reloadButton = doc.querySelector('button[id="page_reload"]')
        reloadButton.addEventListener('click', () => { this._onReloadButtonClick() })

        this.tables_pane = doc.querySelector('[id="translit_tables"]')

        this.optionsButton = doc.querySelector('button[id="open_options"]')
        this.optionsButton.addEventListener('click', () => { this._onOptionsButtonClick() })
    }

    _changed() {
        this.onChange()
    }

    _onEnabledChange() {
        this._changed()
    }

    _onReloadButtonClick() {
        browserapi.tabs.query({ active: true, windowId: browserapi.windows.WINDOW_ID_CURRENT }, (views) => {
            views.forEach((tab) => {
                browserapi.tabs.reload(tab.id)
            })
        })
    }

    set_table_list(value, selected) {
        this.tables_pane.innerHTML = '';

        value.forEach((table) => {
            const rad = document.createElement('input')
            rad.type = 'radio'
            rad.name = 't'
            rad.value = table.id

            rad.addEventListener('change', () => { this._onSelectedTableChange(rad) })

            if (table.id === selected) {
                this.selected_table = selected
                rad.checked = true
            }

            const lab = document.createElement('label')
            const text = document.createTextNode(table.title)
            lab.appendChild(rad)
            lab.appendChild(text)

            this.tables_pane.appendChild(lab)
        })
    }

    _onSelectedTableChange(radioButton) {
        this.selected_table = radioButton.value
        this._changed()
    }

    _onOptionsButtonClick() {
        this.onOptionsClicked()
    }

    set options_enabled(value) {
        if (!value && this.optionsButton) {
            this.optionsButton.parentNode.removeChild(this.optionsButton)
            this.optionsButton = undefined
        }
    }
}


class Controller {
    constructor() {
        this.settings = new Settings(browserapi.storage, () => { this._reloadView() })
        this.view = new View(document)

        this.view.options_enabled = typeof browserapi.runtime.openOptionsPage !== 'undefined'

        this._localize_html(document)

        this.view.onChange = () => { this._storeSettings() }
        this.view.onOptionsClicked = () => { this._openOptions() }
    }

    _storeSettings() {
        this.settings.save({
            enabled: this.view.enabled.checked,
            selected_table_id: this.view.selected_table,
        })
    }

    _reloadView() {
        const active_tables = this.settings.active_tables
        let selected_id = this.settings.selected_table_id

        if (!active_tables.find((table) => table.id === selected_id)) {
            if (active_tables.length > 0) {
                selected_id = active_tables[0].id
            }
        }

        this.view.enabled.checked = this.settings.enabled
        this.view.set_table_list(active_tables, selected_id)
    }

    _localize_html(doc) {
        html_i18n.localize(doc)
    }

    _openOptions() {
        browserapi.runtime.openOptionsPage()
    }
}


const ctl = new Controller()
