
const Dom = require('./dom_builder').DomBuilder


class Markdown {
    constructor() {
        this.link_rx = /\[([^\]]*?)\]\(([^\)]*?)\)/g
    }

    render(md) {
        const pane = Dom.el('div')

        if (!md) {
            return pane
        }

        let offset = 0
        let match;

        while (match = this.link_rx.exec(md)) {
            if (match[3] > offset) {
                pane.appendChild(Dom.text(md.substring(offset, match[3])))
            }

            const title = match[1]
            const url = match[2]

            const link = Dom.el('a')
            link.href = url
            link.appendChild(Dom.text(title))
            pane.appendChild(link)

            offset = this.link_rx.lastIndex
        }

        if (offset + 1 < md.length) {
            pane.appendChild(Dom.text(md.substring(offset)))
        }

        return pane
    }
}


const render = (md) => {
    const engine = new Markdown()
    return engine.render(md)
}


module.exports = {
    Markdown,
    render,
}
