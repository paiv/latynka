
const i18n = window.i18n || (window.chrome && window.chrome.i18n)


class HtmlLocalizer {
    constructor() {
        this.includeMatching = /__MSG_/
        this.extractKey = /__MSG_(\w+?)__/
        this.replaceMatching = /__MSG_\w+?__/
    }

    localize(node) {
        const it = document.createNodeIterator(node, NodeFilter.SHOW_TEXT, (node) => {
            return this.includeMatching.test(node.data) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
        })

        let child;
        while (child = it.nextNode()) {
            const matches = this.extractKey.exec(child.data)
            if (matches) {
                const key = matches[1]
                const value = i18n.getMessage(key)
                if (value) {
                    child.data = child.data.replace(this.replaceMatching, value)
                }
                else {
                    console.log('missing localization for ', key)
                }
            }
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
