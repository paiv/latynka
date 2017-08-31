
const app = () => {


const storage = this.storage || (this.chrome && this.chrome.storage)


class View {
    constructor(doc) {
        const form = doc.querySelector('[id="settings"]')
        this.enabled = form.querySelector('input[id="ext-enabled"]')
        this.enabled.addEventListener('change', () => { this._onEnabledChange() })
        this.onChange = () => {}
    }

    _changed() {
        this.onChange()
    }

    _onEnabledChange() {
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
        })
    }

    _reloadView() {
        this.view.enabled.checked = this.settings.enabled
    }

    _localize_html(doc) {
        html_i18n.localize(doc)
    }
}


const ctl = new Controller()

}


app()
