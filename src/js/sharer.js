
const punycode = require('punycode')
    , url = require('url')


class SharerDecoderError {
    constructor(message) {
        this.message = message
    }

    toString() {
        return `SharerDecoderError{${this.message}}`
    }
}


class Sharer {
    constructor(baseUrl) {
        const canonicalUrl = 'https://paiv.github.io/latynka/v1.html'
        this.baseUrl = (baseUrl || canonicalUrl).toLowerCase()
    }

    makeShareLink(table) {
        const rules = table.rules || {}
        const res = []

        function _nstring(value) {
            if (value === undefined || value === null) {
                return [0]
            }

            if (value.length > 5) {
                throw 'Value is too long: ' + JSON.stringify(value)
            }

            return [value.length, value]
        }

        const fragment = Object.keys(rules)
            .sort((a,b) => a.localeCompare(b))
            .map((key) => {
                const rule = rules[key]

                if (rule === undefined || rule === null) {
                    return [..._nstring(key), ..._nstring(rule)]
                }
                else if (typeof rule === 'object') {
                    let res = _nstring(key)
                    if ('start' in rule) {
                        res = res.concat([7, ..._nstring(rule.start)])
                    }
                    if ('cons' in rule) {
                        res = res.concat([8, ..._nstring(rule.cons)])
                    }
                    if ('other' in rule) {
                        res = res.concat([9, ..._nstring(rule.other)])
                    }
                    return res
                }
                else {
                    return [..._nstring(key), ..._nstring(rule)]
                }
            })
            .reduce((acc, val) => acc.concat(val), [])
            .join('')

        if (!fragment) {
            return this.baseUrl
        }

        const encoded = encodeURIComponent(punycode.encode(fragment))
            .replace(/\-/g, '%2D')

        const url = `${this.baseUrl}?r=${encoded}`
        return url
    }

    decodeShareLink(link) {
        const table = {rules: {}}

        const parsedUrl = new url.parse(link)
        const match = `${parsedUrl.protocol}//${parsedUrl.host}${parsedUrl.pathname}`

        if (match.toLowerCase() !== this.baseUrl) {
            throw new SharerDecoderError('Unknown URI ' + JSON.stringify(link))
        }

        const search = (parsedUrl.search || '').substr(3)
        const fragment = punycode.decode(decodeURIComponent(search))

        const rules = {}

        function _nstring(text, offset) {
            const n = parseInt(text.substr(offset++, 1), 10)
            const value = text.substr(offset, n)
            return [offset + n, value]
        }

        function _nvalue(text, offset) {
            let value, inner, done

            while (!done) {
                const n = parseInt(fragment.substr(offset, 1), 10)

                switch (n) {

                    case 7:
                    case 8:
                    case 9:
                        inner = _nstring(text, ++offset)
                        if (!value) {
                            value = {}
                        }
                        offset = inner[0]
                        value[n == 7 ? 'start' : n == 8 ? 'cons' : 'other'] = inner[1]
                        break

                    default:
                        if (!value) {
                            value = text.substr(++offset, n)
                            offset += n
                        }
                        done = true
                        break
                }
            }

            return [offset, value]
        }


        for (var offset = 0; offset < fragment.length; ) {
            const left = _nstring(fragment, offset)
            offset = left[0]
            const key = left[1]

            const right = _nvalue(fragment, offset)
            offset = right[0]
            const value = right[1]

            rules[key] = value
        }

        table.rules = rules

        return table
    }
}


function makeShareLink(table) {
    const sharer = new Sharer()
    return sharer.makeShareLink(table)
}


function decodeShareLink(link) {
    const sharer = new Sharer()
    return sharer.decodeShareLink(link)
}


function normalize(link) {
    const table = decodeShareLink(link)
    return makeShareLink(table)
}


module.exports = {
    Sharer,
    makeShareLink,
    decodeShareLink,
    normalize,
}
