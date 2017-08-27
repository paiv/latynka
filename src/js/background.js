
const app = () => {

const browser = this.browser || this.chrome || this
const storage = browser.storage
const runtime = browser.runtime
const browserAction = browser.browserAction


class Controller {
    constructor() {
        this.disabledIcon = {
            16: 'img/icon-disabled16.png',
            32: 'img/icon-disabled32.png',
        }

        this.settings = new Settings(storage, () => { this._check_enabled() })
    }

    _check_enabled() {
        this._set_browser_icon(this.settings.enabled)
    }

    _set_browser_icon(enabled) {
        const manifest = runtime.getManifest()
        const icons = enabled ? manifest.browser_action.default_icon : this.disabledIcon
        browserAction.setIcon({ path: icons })
    }
}


const ctl = new Controller()

}


app()
