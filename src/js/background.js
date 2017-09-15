'use strict'

const Settings = require('./settings').Settings
    , browserapi = require('./browserapi')
    , sharer = require('./sharer')


class Controller {
    constructor() {
        this.disabledIcon = {
            16: 'img/icon-disabled16.png',
            32: 'img/icon-disabled32.png',
        }

        this.settings = new Settings(browserapi.storage, () => { this._check_enabled() })

        browserapi.runtime.onMessage.addListener((message, sender, callback) => this._handleMessage(message, sender, callback))
    }

    _check_enabled() {
        this._set_browser_icon(this.settings.enabled)
    }

    _set_browser_icon(enabled) {
        const manifest = browserapi.runtime.getManifest()
        const icons = enabled ? manifest.browser_action.default_icon : this.disabledIcon
        browserapi.browserAction.setIcon({ path: icons })
    }

    _handleMessage(message, sender, callback) {
        if (message.action === 'import_url') {
            const res = this._importTableFromUrl(sender.url)
            callback(res)
        }
    }

    _importTableFromUrl(url) {
        try {
            const table = sharer.decodeShareLink(url)
            table.title = 'Imported ' + new Date().toLocaleString()
            this.settings.import_table(table)
            return table.title
        }
        catch (e) {
            console.log(e)
        }
    }
}


const ctl = new Controller()
