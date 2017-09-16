
const messages = {
    en: {
        "rules_label_apostrophe": {
            "message": "apostrophe"
        },
        "rules_label_at_word_start": {
            "message": "at the beginning of a word"
        },
        "rules_label_after_consonants": {
            "message": "after consonants"
        },
        "extension_action_install": {
            "message": "Install browser extension"
        },
        "extension_action_import": {
            "message": "Import"
        },
        "extension_action_copy_to_clipboard": {
            "message": "Copy to clipboard"
        },
    },

    ru: {
        "rules_label_apostrophe": {
            "message": "апостроф"
        },
        "rules_label_at_word_start": {
            "message": "в начале слова"
        },
        "rules_label_after_consonants": {
            "message": "после согласных"
        },
        "extension_action_install": {
            "message": "Установить расширение для браузера"
        },
        "extension_action_import": {
            "message": "Импортировать"
        },
        "extension_action_copy_to_clipboard": {
            "message": "Копировать в буфер обмена"
        },
    },

    uk: {
        "rules_label_apostrophe": {
            "message": "апостроф"
        },
        "rules_label_at_word_start": {
            "message": "на початку слова"
        },
        "rules_label_after_consonants": {
            "message": "після приголосних"
        },
        "extension_action_install": {
            "message": "Встановити розширення до браузера"
        },
        "extension_action_import": {
            "message": "Зберегти"
        },
        "extension_action_copy_to_clipboard": {
            "message": "Скопіювати в буфер"
        },
    },
}


class Localizator {
    constructor() {
        const lang = (window.navigator || window.browser || window).language
        this.lang = (lang || 'en').toLowerCase().substr(0, 2)
        this.messages = messages[this.lang] || messages['en']
    }

    getMessage(key) {
        const transl = this.messages[key] || {}
        return transl.message || key
    }
}


module.exports = new Localizator()
