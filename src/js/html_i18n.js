
const browserapi = chrome


class HtmlLocalizer {
    constructor() {
        this.includeMatching = /__MSG_/
        this.extractKey = /__MSG_(\w+?)__/g
        this.replaceMatching = /__MSG_\w+?__/
    }

    localize(node) {
        const it = document.createNodeIterator(node, NodeFilter.SHOW_TEXT, (node) => {
            return this.includeMatching.test(node.data) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
        })

        let child;
        while (child = it.nextNode()) {
            let textContent = child.data || ''
            let matches = undefined

            while (matches = this.extractKey.exec(child.data)) {
                const key = matches[1]

                if (key === 'manifest_json_version') {
                    const manifest = browserapi.runtime.getManifest()
                    const value = manifest.version
                    textContent = textContent.replace(this.replaceMatching, value)
                }
                else {
                    const value = browserapi.i18n.getMessage(key)
                    if (value) {
                        textContent = textContent.replace(this.replaceMatching, value)
                    }
                    else {
                        console.log('missing localization for ', key)
                    }
                }

            }

            child.data = textContent
        }
    }
}


const localize = (node) => {
    const loc = new HtmlLocalizer()
    return loc.localize(node)
}


module.exports = {
    localize,
    HtmlLocalizer,
}
