
const Dom = require('./dom_builder').DomBuilder


class Markdown {
    constructor(dom) {
        this.dom = dom || Dom
    }

    render(md) {
        const pane = this.dom.el('div')

        if (!md) {
            return pane
        }

        let state = 0
        let so = []
        let link_start = -1
        let href_start = -1
        let link_title = undefined
        let link_href = undefined
        let nodes = []

        for (let char of md) {
            switch (state) {

                case 0:
                    if (char === '\n') {
                        const s = so.join('')
                        so = []
                        if (s) {
                            nodes.push(this.dom.text(s))
                        }
                        state = 1
                    }
                    else if (char === '[') {
                        link_start = so.length
                        so.push(char)
                        state = 2
                    }
                    else {
                        so.push(char)
                    }
                    break

                case 1:
                    if (char === '\n') {
                        let para = this.dom.el('p')
                        for (let node of nodes) {
                            para.appendChild(node)
                        }
                        pane.appendChild(para)
                        nodes = []
                        state = 0
                    }
                    else {
                        nodes.push(this.dom.el('br'))

                        if (char === '[') {
                            link_start = so.length
                            so.push(char)
                            state = 2
                        }
                        else {
                            so.push(char)
                            state = 0
                        }
                    }
                    break

                case 2:
                    if (char === ']') {
                        link_title = so.slice(link_start + 1).join('')
                        state = 3
                    }
                    so.push(char)
                    break

                case 3:
                    if (char === '(') {
                        href_start = so.length
                        state = 4
                    }
                    else {
                        state = 0
                    }
                    so.push(char)
                    break

                case 4:
                    if (char === ')') {
                        if (link_start > 0) {
                            const s = so.slice(0, link_start).join('')
                            nodes.push(this.dom.text(s))
                        }

                        const url = so.slice(href_start + 1).join('')
                        const link = this.dom.el('a')
                        link.href = url
                        link.target = '_blank'
                        link.appendChild(this.dom.text(link_title))
                        nodes.push(link)

                        so = []
                        state = 0
                    }
                    else {
                        so.push(char)
                    }
                    break
            }
        }

        const s = so.join('')
        if (s) {
            nodes.push(this.dom.text(s))
        }

        if (pane.hasChildNodes()) {
            if (nodes.length > 0) {
                const para = this.dom.el('p')
                for (let node of nodes) {
                    para.appendChild(node)
                }
                pane.appendChild(para)
            }
        }
        else {
            for (let node of nodes) {
                pane.appendChild(node)
            }
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
