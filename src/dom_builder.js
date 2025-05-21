
class DomBuilder {
    static el(name, classes) {
        const x = document.createElement(name)
        if (classes) classes.forEach((c) => x.classList.add(c))
        return x
    }

    static text(value) {
        return document.createTextNode(value)
    }

    static resetChildren(parent, ...children) {
        let last;
        while (last = parent.lastElementChild) {
            parent.removeChild(last)
        }
        for (const child of children) {
            parent.appendChild(child)
        }
    }
}


module.exports = {
    DomBuilder,
}
