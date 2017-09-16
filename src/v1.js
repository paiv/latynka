
const sharer = require('./sharer')
    , renderer = require('./renderer')


function app() {
    const loc = window.location
    const baseUrl = `${loc.protocol}//${loc.host}${loc.pathname}`
    const share = new sharer.Sharer(baseUrl)

    const table = share.decodeShareLink(document.URL)

    renderer.render(table)
}


window.addEventListener('load', () => app())
