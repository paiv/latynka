
const sharer = require('./sharer')
    , renderer = require('./renderer')


function app() {
    const loc = window.location
    const baseUrl = `${loc.protocol}//${loc.host}${loc.pathname}`
    const share = new sharer.Sharer(baseUrl)
    const empty = {rules: {}}

    try {
        var table = share.decodeShareLink(document.URL)
    }
    catch (e) {
        console.log(e)
    }

    renderer.render(table || empty)
}


window.addEventListener('load', () => app())
