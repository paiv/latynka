'use strict';

const browserapi = require('./browserapi')
    , sharer = require('./sharer')
    , Settings = require('./settings').Settings


class View {
    constructor(doc) {
        this.onImportClick = () => {}

        const actions_pane = doc.querySelector('.app-actions')
        this.install_pane = actions_pane.querySelector('.install')
        this.import_pane = actions_pane.querySelector('.import')
        this.import_error = this.import_pane.querySelector('.error')
        this.imported_pane = actions_pane.querySelector('.imported')
        this.imported_table_name = this.imported_pane.querySelector('span')

        const button = this.import_pane.querySelector('button')
        button.addEventListener('click', () => { this.onImportClick() })
    }

    show_import() {
        this.install_pane.style.display = 'none'
        this.imported_pane.style.display = 'none'
        this.import_pane.style.display = 'block'
    }

    show_import_error(text) {
        this.import_error.textContent = text
        this.import_error.style.display = 'inline'
    }

    show_imported(table_name) {
        this.install_pane.style.display = 'none'
        this.import_pane.style.display = 'none'
        this.imported_table_name.textContent = table_name
        this.imported_pane.style.display = 'block'
    }
}


class Controller {
    constructor() {
        this.view = new View(document)
        this.view.onImportClick = () => { this._handle_import() }

        this.settings = new Settings(browserapi.storage, () => { this._check_import() })

        this._check_import()
    }

    _check_import() {
        const canonical = sharer.normalize(document.URL)
        const found = this.settings.all_tables().find((table) => sharer.makeShareLink(table) == canonical)

        if (found) {
            this.view.show_imported(found.title || found.id)
        }
        else {
            this.view.show_import()
        }
    }

    _handle_import() {
        browserapi.runtime.sendMessage(null, {action: 'import_url'}, {}, (result) => {
            if (result && result.error) {
                this.view.show_import_error(result.error || 'Import failed')
            }
        })
    }
}


const ctl = new Controller()
