'use strict'

const Settings = require('./settings').Settings
    , html_i18n = require('./html_i18n')
    , Transliterator = require('./translit').Transliterator
    , browserapi = require('./browserapi')


class View {
    constructor(doc) {
        this.onChange = () => {}
        this.onClipButtonTouched = () => {}

        this.input_pane = doc.querySelector('[id="translit_input"]')
        this.preview_pane = doc.querySelector('[id="translit_preview"]')
        this.clipboard_button = doc.querySelector('[id="btn_clip"]')

        this.input_pane.addEventListener('input', () => { this._onInputChange() })
        this.input_pane.focus()

        this.clipboard_button.addEventListener('click', () => { this._onClipboardButton() })
    }

    get inputText() {
        return this.input_pane.innerText
    }

    set previewText(value) {
        this.preview_pane.innerText = value
    }

    _onInputChange() {
        this.onChange()
    }

    _onClipboardButton() {
        this.onClipButtonTouched()
    }
}


class Controller {
    constructor() {
        this.translit = new Transliterator({})
        this.settings = new Settings(browserapi.storage, () => { this._onSettingsChange() })

        this.view = new View(document)
        this.view.onChange = () => { this._translateInput() }
        this.view.onClipButtonTouched = () => { this._copyTextToClipboard(this.view.preview_pane) }

        this._localize_html(document)
    }

    _localize_html(doc) {
        html_i18n.localize(doc)
    }

    _onSettingsChange() {
        const table = this.settings.selected_translit_table || {rules: {}}
        this.translit = new Transliterator(table.rules)
        this._translateInput()
    }

    _translateInput() {
        this.view.previewText = this.translit.convert(this.view.inputText)
    }

    _copyTextToClipboard(node) {
        if (window.getSelection) {
            let sel = window.getSelection()
            sel.empty()
            let range = document.createRange()
            range.selectNode(node)
            sel.addRange(range)
            document.execCommand('copy')
        }
    }
}


const ctl = new Controller()
