'use strict'

const Settings = require('./settings').Settings
    , html_i18n = require('./html_i18n')
    , Dom = require('./dom_builder').DomBuilder
    , browserapi = require('./browserapi')


class View {
    constructor(doc) {
        this.onChange = () => {}
        this.onOptionsClicked = () => {}
        this.onReloadClicked = () => {}
        this.onSiteEnabledChange = () => {}

        const form = doc.querySelector('[id="settings"]')
        this.enabled = form.querySelector('input[id="ext_enabled"]')
        this.enabled.addEventListener('change', () => { this._onEnabledChange() })

        this.site_enabled_pane = form.querySelector('[id="site_enabled"]')
        this.site_enabled = this.site_enabled_pane.querySelector('input')
        this.site_enabled.addEventListener('change', () => { this._onSiteEnabledChange() })

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

    _onSiteEnabledChange() {
        this.onSiteEnabledChange()
    }

    _onReloadButtonClick() {
        this.onReloadClicked()
    }

    set_table_list(value, selected) {
        const pane = Dom.el('div')

        value.forEach((table) => {
            const rad = Dom.el('input')
            rad.type = 'radio'
            rad.name = 't'
            rad.value = table.id

            rad.addEventListener('change', () => { this._onSelectedTableChange(rad) })

            if (table.id === selected) {
                this.selected_table = selected
                rad.checked = true
            }

            const lab = Dom.el('label')
            const text = Dom.text(table.title)
            lab.appendChild(rad)
            lab.appendChild(text)

            pane.appendChild(lab)
        })

        const old = this.tables_pane.querySelector('div')
        this.tables_pane.replaceChild(pane, old)
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

    set site_enabled_hidden(value) {
        this.site_enabled_pane.style.display = value ? 'none' : 'block'
    }
}


class Controller {
    constructor() {
        this.settings = new Settings(browserapi.storage, () => { this._reloadView() })
        this.view = new View(document)

        this.view.options_enabled = typeof browserapi.runtime.openOptionsPage !== 'undefined'

        this._localize_html(document)

        this.view.onChange = () => { this._storeSettings() }
        this.view.onSiteEnabledChange = () => { this._excludeSiteOnActiveTab() }
        this.view.onReloadClicked = () => { this._reloadActiveTab() }
        this.view.onOptionsClicked = () => { this._openOptions() }
    }

    _storeSettings() {
        this.settings.save({
            enabled: this.view.enabled.checked,
            selected_table_id: this.view.selected_table,
        })
    }

    _reloadActiveTab() {
        browserapi.tabs.query({ active: true, windowId: browserapi.windows.WINDOW_ID_CURRENT }, (views) => {
            views.forEach((tab) => {
                browserapi.tabs.reload(tab.id)
            })
        })
    }

    _excludeSiteOnActiveTab() {
        const extension_enabled = this.settings.enabled
        const site_checked = this.view.site_enabled.checked

        browserapi.tabs.query({ active: true, windowId: browserapi.windows.WINDOW_ID_CURRENT }, (views) => {
            views.forEach((tab) => {
                const site_url = tab.url

                if (extension_enabled) {
                    // blacklist
                    if (site_checked) {
                        this.settings.blacklist_remove(site_url)
                    }
                    else {
                        this.settings.blacklist_add(site_url)
                    }
                }
                else {
                    // whitelist
                    if (site_checked) {
                        this.settings.whitelist_add(site_url)
                    }
                    else {
                        this.settings.whitelist_remove(site_url)
                    }
                }

            })
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
        this.view.site_enabled_hidden = (this.settings.enabled && !this.settings.blacklist_enabled) ||
           (!this.settings.enabled && !this.settings.whitelist_enabled)

        this.view.set_table_list(active_tables, selected_id)

        browserapi.tabs.query({ active: true, windowId: browserapi.windows.WINDOW_ID_CURRENT }, (views) => {
            this.view.site_enabled.checked = views.find((tab) => this.settings.enabled_for_url(tab.url))
        })
    }

    _localize_html(doc) {
        html_i18n.localize(doc)
    }

    _openOptions() {
        browserapi.runtime.openOptionsPage()
    }
}


const ctl = new Controller()
