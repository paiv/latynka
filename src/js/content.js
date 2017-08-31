
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
        this.callback = callback || (() => {})
        this._delayed = true
        this.includeMatching = /[абвгґдеєжзиіїйклмнопрстуфхцчшщьюя]/i
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

        const filtered = new Set()

        changes.forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                if (this.includeMatching.test(node.data)) {
                    filtered.add(node)
                }
            }
            else if (node.nodeType === Node.ELEMENT_NODE && !this.excludeTags.has(node.localName)) {

                const it = document.createNodeIterator(node,
                    NodeFilter.SHOW_ELEMENT + NodeFilter.SHOW_TEXT,
                    (node) => {
                        return (node.nodeType === Node.TEXT_NODE) ?
                            (this.includeMatching.test(node.data) ?
                            NodeFilter.FILTER_ACCEPT :
                            NodeFilter.FILTER_REJECT)
                            :
                            (this.excludeTags.has(node.localName) ?
                            NodeFilter.FILTER_REJECT :
                            NodeFilter.FILTER_SKIP)
                    })

                let child;
                while (child = it.nextNode()) {
                    filtered.add(child)
                }
            }
        })

        this.visited = filtered
        this.callback(filtered)
    }

    add(node) {
        if (!this.visited.has(node)) {
            this.changedNodes.add(node)
        }
    }

    observe(node) {
        const handleMutations = (records) => {
            records.forEach((record) => {
                this.add(record.target)
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


class Controller {
    constructor() {
        this.settings = new Settings(storage, () => { this._check_enabled(false) })
        this._check_enabled(true)
    }

    _check_enabled(delayed) {
        if (this.settings.enabled) {
            const table = this.settings.selected_translit_table
            this.start(delayed, table.table)
        }
        else {
            this.stop()
        }
    }

    start(delayed, table) {
        if (!this.observer) {
            this.observer = new DomObserver()
            this.observer.observe(document.documentElement)
        }

        if (!delayed) {
            const translit = new Transliterator(table)
            this.observer.callback = (nodes) => translit.processTextNodes(nodes)
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
