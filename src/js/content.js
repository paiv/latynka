
const app = () => {

const storage = this.storage || (this.chrome && this.chrome.storage)


class AwesomeTimer {
    constructor(callback) {
        this.callback = callback
    }

    handler() {
        this.clear()
        this.callback()
    }

    asap() {
        if (!this.tid) {
            this.tid = requestAnimationFrame(() => { this.handler() })
        }
    }

    clear() {
        cancelAnimationFrame(this.tid)
        this.tid = undefined
    }
}


class DomObserver {

    constructor(callback) {
        this.callback = callback
        this._delayed = true
        this.excludeTags = new Set(['head', 'link', 'meta', 'script', 'style'])
        this.changedNodes = new Set()
        this.visited = new Set()
        this.observers = []
        this.timer = new AwesomeTimer(() => { this.processChanges() })
    }

    get delayed() {
        return this._delayed
    }

    set delayed(value) {
        this._delayed = value
        if (!value && this.changedNodes.size) {
            this.timer.asap()
        }
    }

    processChanges() {
        const changes = this.changedNodes
        this.changedNodes = new Set()

        this.visited.clear()
        changes.forEach((node) => { this.visited.add(node) })

        this.callback(changes)
    }

    add(node) {
        if (!this.visited.has(node)) {
            this.changedNodes.add(node)
        }
    }

    observe(node) {
        const handleMutations = (records) => {
            records.forEach((record) => {
                if (record.type === 'characterData') {
                    this.add(record.target)
                }
                else if (record.type === 'childList') {
                    if (record.target.nodeType === Node.ELEMENT_NODE && !this.excludeTags.has(record.target.localName)) {

                        const it = document.createNodeIterator(record.target,
                            NodeFilter.SHOW_ELEMENT + NodeFilter.SHOW_TEXT,
                            (node) => {
                                return (node.nodeType === Node.TEXT_NODE) ?
                                    NodeFilter.FILTER_ACCEPT
                                    :
                                    this.excludeTags.has(node.localName) ?
                                    NodeFilter.FILTER_REJECT :
                                    NodeFilter.FILTER_SKIP
                            })

                        let node;
                        while (node = it.nextNode()) {
                            this.add(node)
                        }
                    }
                }
            })

            if (!this.delayed) {
                this.timer.asap()
            }
        }

        const observer = new MutationObserver(handleMutations)
        this.observers.push(observer)

        observer.observe(node, {
            subtree: true,
            childList: true,
            characterData: true,
        })
    }

    disconnect() {
        this.observers.forEach((observer) => {
            observer.disconnect()
        })
        this.observers = []
    }
}


class Transliterator {
    constructor(table) {
        this.table = Transliterator.compileTable(table)
    }

    processTextNodes(nodes) {
        nodes.forEach((node) => {
            const text = node.data || ''
            node.data = text.replace(this.table.regex, this.table.callback)
        })
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
}


// class IframeObserver {
//
//     observe(node) {
//         const handleMutations = (records) => {
//             records.forEach((node) => {
//                 console.log(node.target)
//             })
//         }
//
//         const observer = new MutationObserver(handleMutations)
//         this.observers.push(observer)
//
//         observer.observe(node, {
//             attributes: true,
//             attributeFilter: ['src'],
//         })
//
//     }
// }


const table_noncombining = {
    'а': 'a',
    'б': 'b',
    'в': 'v',
    'г': 'h',
    'ґ': 'g',
    'д': 'd',
    'е': 'e',
    'є': 'je',
    'ж': 'ž', // 'z\u030C'
    'з': 'z',
    'и': 'y',
    'і': 'i',
    'ї': 'ji', // 'i\u0308'
    'й': 'j',
    'к': 'k',
    'л': 'l',
    'м': 'm',
    'н': 'n',
    'о': 'o',
    'п': 'p',
    'р': 'r',
    'с': 's',
    'т': 't',
    'у': 'u',
    'ф': 'f',
    'х': 'x',
    'ц': 'c',
    'ч': 'č', // 'c\u030C'
    'ш': 'š', // 's\u030C'
    'щ': 'šč', // 's\u030Cc\u030C'
    'ь': 'j',
    'ю': 'ju',
    'я': 'ja',
    'А': 'A',
    'Б': 'B',
    'В': 'V',
    'Г': 'H',
    'Ґ': 'G',
    'Д': 'D',
    'Е': 'E',
    'Є': 'Je',
    'Ж': 'Ž', // 'Z\u030C'
    'З': 'Z',
    'И': 'Y',
    'І': 'I',
    'Ї': 'Ji', // 'I\u0308'
    'Й': 'J',
    'К': 'K',
    'Л': 'L',
    'М': 'M',
    'Н': 'N',
    'О': 'O',
    'П': 'P',
    'Р': 'R',
    'С': 'S',
    'Т': 'T',
    'У': 'U',
    'Ф': 'F',
    'Х': 'X',
    'Ц': 'C',
    'Ч': 'Č', // 'C\u030C'
    'Ш': 'Š', // 'S\u030C'
    'Щ': 'Šč', // 'S\u030Cc\u030C'
    'Ь': 'J',
    'Ю': 'Ju',
    'Я': 'Ja',
}


const table_combining = {
    'а': 'a',
    'б': 'b',
    'в': 'v',
    'г': 'h',
    'ґ': 'g',
    'д': 'd',
    'е': 'e',
    'є': 'je',
    'ж': 'z\u030C', // 'ž'
    'з': 'z',
    'и': 'y',
    'і': 'i',
    'ї': 'ji', // 'i\u0308'
    'й': 'j',
    'к': 'k',
    'л': 'l',
    'м': 'm',
    'н': 'n',
    'о': 'o',
    'п': 'p',
    'р': 'r',
    'с': 's',
    'т': 't',
    'у': 'u',
    'ф': 'f',
    'х': 'x',
    'ц': 'c',
    'ч': 'c\u030C', // 'č'
    'ш': 's\u030C', // 'š'
    'щ': 's\u030Cc\u030C', // 'šč'
    'ь': 'j',
    'ю': 'ju',
    'я': 'ja',
    'А': 'A',
    'Б': 'B',
    'В': 'V',
    'Г': 'H',
    'Ґ': 'G',
    'Д': 'D',
    'Е': 'E',
    'Є': 'Je',
    'Ж': 'Z\u030C', // 'Ž'
    'З': 'Z',
    'И': 'Y',
    'І': 'I',
    'Ї': 'Ji', // 'I\u0308'
    'Й': 'J',
    'К': 'K',
    'Л': 'L',
    'М': 'M',
    'Н': 'N',
    'О': 'O',
    'П': 'P',
    'Р': 'R',
    'С': 'S',
    'Т': 'T',
    'У': 'U',
    'Ф': 'F',
    'Х': 'X',
    'Ц': 'C',
    'Ч': 'C\u030C', // 'Č'
    'Ш': 'S\u030C', // 'Š'
    'Щ': 'S\u030Cc\u030C', // 'Šč'
    'Ь': 'J',
    'Ю': 'Ju',
    'Я': 'Ja',
}


class Controller {
    constructor() {
        this.settings = new Settings(storage, () => { this._check_enabled(false) })
        this._check_enabled(true)
    }

    _check_enabled(delayed) {
        if (this.settings.enabled) {
            this.start(delayed)
        }
        else {
            this.stop()
        }
    }

    start(delayed) {
        if (!this.observer) {
            const translit = new Transliterator(table_combining)
            this.observer = new DomObserver((nodes) => translit.processTextNodes(nodes))
            this.observer.observe(document.documentElement)
        }
        this.observer.delayed = delayed
    }

    stop() {
        if (this.observer) {
            this.observer.disconnect()
            this.observer = undefined
        }
    }
}


const ctl = new Controller()


}


app()
