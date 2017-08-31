
class Transliterator {
    constructor(table) {
        this.table = Transliterator.compileTable(table)
    }

    static compileTable(table) {
        const regexString = ['[', ...Object.keys(table), ']'].join('')
        const rx = new RegExp(regexString, 'g')
        const cb = (text) => {
            return table[text] || text
        }
        return {
            regex: rx,
            callback: cb,
        }
    }

    convert(text) {
        return text.replace(this.table.regex, this.table.callback)
    }

    processTextNodes(nodes) {
        nodes.forEach((node) => {
            const text = node.data || ''
            node.data = this.convert(text)
        })
    }
}


if (typeof require !== 'undefined') {
    module.exports = {
        Transliterator,
    }
}
