var RegexBuilder = require('./regex_builder').RegexBuilder


class Transliterator {
    constructor(rules) {
        this.compiled = Transliterator.compileTable(rules)
    }

    static compileTable(rules) {
        const loabc = 'абвгґдеєжзиіїйклмнопрстуфхцчшщьюя'
        const hiabc = loabc.toLocaleUpperCase()
        const apos = ['\'']

        const word_start_table = {}
        const word_inner_table = {}

        const TitleCase = (value) => value.toLocaleLowerCase().replace(/^./, (s) => s.toLocaleUpperCase())
        const SillyCase = (value) => value.toLocaleLowerCase().replace(/.$/, (s) => s.toLocaleUpperCase())

        const add_rule1 = (lokey, hikey, inner, start) => {
            word_inner_table[lokey] = inner
            word_inner_table[hikey] = TitleCase(inner)

            word_start_table[lokey] = start
            word_start_table[hikey] = TitleCase(start)
        }

        const add_rule2 = (key, inner, start) => {
            word_inner_table[SillyCase(key)] = SillyCase(inner)
            word_inner_table[TitleCase(key)] = TitleCase(inner)

            word_start_table[SillyCase(key)] = SillyCase(start)
            word_start_table[TitleCase(key)] = TitleCase(start)
        }

        Object.keys(rules).forEach((key) => {
            const lokey = key.toLocaleLowerCase()
            const hikey = lokey.toLocaleUpperCase()
            let inner = rules[key]
            let start = inner

            if (typeof inner === 'object') {
                start = inner.start !== undefined ? inner.start : inner.inner
                inner = inner.inner
            }

            add_rule1(lokey, hikey, inner, start)

            if (key.length === 2) {
                add_rule2(key, inner, start)
            }
        })


        const keys1 = Object.keys(rules).filter((key) => key.length === 1)
        const keys2 = Object.keys(rules).filter((key) => key.length === 2)

        const lokeyset1 = new Set(keys1.map((x) => x.toLocaleLowerCase()))
        const hikeyset1 = new Set(keys1.map((x) => x.toLocaleUpperCase()))

        const keyset2 = keys2.map((x) => [
            x.toLocaleLowerCase(),
            x.toLocaleUpperCase(),
            TitleCase(x),
            SillyCase(x)
        ]).reduce((acc, x) => acc.concat(x), [])


        const rxb = new RegexBuilder()

        const rx = rxb.or(
            // word start
            rxb.ngroup(
                // char before word
                rxb.group(
                    rxb.or(
                        '^',
                        rxb.xchars(loabc, hiabc, ...apos)
                    )
                ),
                // char to translate
                rxb.group(
                    rxb.or(
                        ...keyset2,
                        rxb.chars(...lokeyset1),
                        rxb.chars(...hikeyset1)
                    )
                )
            ),
            // or word inner
            rxb.group(
                rxb.or(
                    ...keyset2,
                    rxb.chars(...lokeyset1),
                    rxb.chars(...hikeyset1)
                )
            )
        )
        .regex('g')


        const cb = (text, xkey, match_start, match_inner) => {
            if (match_start) {
                const value = word_start_table[match_start]
                return xkey + value
            }

            const value = word_inner_table[match_inner]
            return value
        }
        return {
            regex: rx,
            callback: cb,
        }
    }

    convert(text) {
        return text.replace(this.compiled.regex, this.compiled.callback)
    }

    processTextNodes(nodes) {
        nodes.forEach((node) => {
            const text = node.data || ''
            node.data = this.convert(text)
        })
    }
}


module.exports = {
    Transliterator,
}
