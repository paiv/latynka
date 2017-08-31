
const app = () => {


const storage = this.storage || (this.chrome && this.chrome.storage)
const tabs = this.tabs || (this.chrome && this.chrome.tabs)
const windows = this.windows || (this.chrome && this.chrome.windows)


class View {
    constructor(doc) {
        this.onChange = () => {}

        const form = doc.querySelector('[id="settings"]')
        this.enabled = form.querySelector('input[id="ext_enabled"]')
        this.enabled.addEventListener('change', () => { this._onEnabledChange() })

        const reloadButton = doc.querySelector('button[id="page_reload"]')
        reloadButton.addEventListener('click', () => { this._onReloadButtonClick() })

        this.tables_pane = doc.querySelector('[id="translit_tables"]')
    }

    _changed() {
        this.onChange()
    }

    _onEnabledChange() {
        this._changed()
    }

    _onReloadButtonClick() {
        tabs.query({ active: true, windowId: windows.WINDOW_ID_CURRENT }, (views) => {
            views.forEach((tab) => {
                tabs.reload(tab.id)
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
}


class Controller {
    constructor() {
        this.settings = new Settings(storage, () => { this._reloadView() })
        this.view = new View(document)

        this._localize_html(document)

        this.view.onChange = () => { this._storeSettings() }
    }

    _storeSettings() {
        this.settings.save({
            enabled: this.view.enabled.checked,
            selected_table_id: this.view.selected_table,
        })
    }

    _reloadView() {
        this.view.enabled.checked = this.settings.enabled
        this.view.set_table_list(this.settings.active_tables, this.settings.selected_table_id)
    }

    _localize_html(doc) {
        html_i18n.localize(doc)
    }
}


const ctl = new Controller()

}


app()
