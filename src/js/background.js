
const Settings = require('./settings').Settings

const browserapi = chrome


class Controller {
    constructor() {
        this.disabledIcon = {
            16: 'img/icon-disabled16.png',
            32: 'img/icon-disabled32.png',
        }

        this.settings = new Settings(browserapi.storage, () => { this._check_enabled() })
    }

    _check_enabled() {
        this._set_browser_icon(this.settings.enabled)
    }

    _set_browser_icon(enabled) {
        const manifest = browserapi.runtime.getManifest()
        const icons = enabled ? manifest.browser_action.default_icon : this.disabledIcon
        browserapi.browserAction.setIcon({ path: icons })
    }
}


const ctl = new Controller()
