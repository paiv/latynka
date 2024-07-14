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
        return this.input_pane.value
    }

    set previewText(value) {
        this.preview_pane.value = value
    }

    _onInputChange() {
        this.onChange()
    }

    _onClipboardButton() {
        this.onClipButtonTouched()
    }

    flashCopyOK() {
        this._btnok_setok(this.clipboard_button)
    }

    _btnok_setok(btn) {
        if (btn._btnoktok) {
            window.clearTimeout(btn._btnoktok)
        }
        const overlay = btn.querySelector('.okmark')
        const animations = `
        animation: 0.15s ease-out 0s forwards btnok-on,
           0.1s ease-in 0.5s forwards btnok-off;`
        overlay.style = animations
        btn._btnoktok = window.setTimeout(() => { overlay.style = undefined; }, 650)
    }
}


class Controller {
    constructor() {
        this.translit = new Transliterator({})
        this.settings = new Settings(browserapi.storage, () => { this._onSettingsChange() })

        this.view = new View(document)
        this._localize_html(document)
        
        this.view.onChange = () => { this._translateInput() }
        this.view.onClipButtonTouched = () => {
            this._copyTextToClipboard(
              this.view.preview_pane,
              () => { this.view.flashCopyOK() }
            )}
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

    _copyTextToClipboard(node, callback) {
        if (window.getSelection) {
            let sel = window.getSelection()
            sel.empty()
        }
        node.focus()
        node.select()
        if (navigator.clipboard) {
            navigator.clipboard.writeText(node.value)
            .then(callback, (e) => console.error(e) )
        }
        else if (document.execCommand) {
            if (document.execCommand('copy')) {
                callback()
            }
        }
    }
}


const ctl = new Controller()
