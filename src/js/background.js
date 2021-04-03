'use strict'

const Settings = require('./settings').Settings
    , browserapi = require('./browserapi')
    , validator = require('./rule_validator')
    , sharer = require('./sharer')


class Controller {
    constructor() {
        this.settings = new Settings(browserapi.storage, () => {})

        browserapi.runtime.onMessage.addListener((message, sender, callback) => this._handleMessage(message, sender, callback))

        browserapi.runtime.onInstalled.addListener((details) => this._handleInstalled(details))
    }

    _handleInstalled(details) {
        this.settings.set_defaults()
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
            table.title = browserapi.i18n.getMessage('options_table_title_import_prefix') + new Date().toLocaleString()
            table.rules = validator.filter(table.rules)

            this.settings.import_table(table)

            const canonical = sharer.makeShareLink(table)
            if (canonical !== url) {
                return {title: table.title, error: 'Imported with errors'}
            }

            return {title: table.title}
        }
        catch (e) {
            console.log(e)
            return {error: e.toString()}
        }
    }
}


const ctl = new Controller()
