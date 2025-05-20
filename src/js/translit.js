const RegexBuilder = require('./regex_builder').RegexBuilder


class Transliterator {
    constructor(rules) {
        this.compiled = Transliterator.compileTable(rules)
    }

    static compileTable(rules) {
        const loabc = 'абвгґдеєжзиіїйклмнопрстуфхцчшщьюя'
        const consonants = 'бвгґджзйклмнпрстфхцчшщ'
        const vowels = 'аеєиіїоуюя'

        const hiabc = loabc.toLocaleUpperCase()
        const apos = ['\'', '\u2019', '\u02BC']

        const default_rules = {}
        const word_start_rules = {}
        const after_cons_rules = {}

        function casesOf(s) {
            function* inner(acc, xs, i) {
                if (i >= xs.length) {
                    yield acc
                    return
                }
                const x = xs[i]
                const y = x.toLocaleUpperCase()
                yield* inner(acc + x, xs, i + 1)
                if (y !== x) {
                    yield* inner(acc + y, xs, i + 1)
                }
            }
            const lo = [...s.toLocaleLowerCase()]
            return [...inner('', lo, 0)]
        }

        function TitleCase(value) {
            return value.toLocaleLowerCase()
                .replace(/^./, (s) => s.toLocaleUpperCase())
        }

        function SillyCase(value) {
            return value.toLocaleLowerCase()
                .replace(/.$/, (s) => s.toLocaleUpperCase())
        }

        function isUpper(s) {
            return s !== s.toLocaleLowerCase()
        }

        function matchCaseOf(k, s) {
            if (isUpper(k[0])) {
                return TitleCase(s)
            }
            else if (isUpper(k[k.length-1])) {
                return SillyCase(s)
            }
            return s.toLocaleLowerCase()
        }


        Object.keys(rules).forEach((key) => {
            let rule = rules[key]

            if (rule == null) {
                rule = ''
            }

            if (typeof rule === 'object') {

                if ('start' in rule) {
                    const value = rule.start || ''
                    casesOf(key).forEach((k) => {
                        word_start_rules[k] = matchCaseOf(k, value)
                    })
                }

                if ('cons' in rule) {
                    const value = rule.cons || ''
                    casesOf(key).forEach((k) => {
                        after_cons_rules[k] = matchCaseOf(k, value)
                    })
                }

                const value = rule.other || ''
                casesOf(key).forEach((k) => {
                    default_rules[k] = matchCaseOf(k, value)
                })
            }
            else {
                if (key.indexOf('\'') >= 0) {
                    apos.forEach((c) => {
                        const newkey = key.replace('\'', c)
                        casesOf(newkey).forEach((k) => {
                            default_rules[k] = matchCaseOf(k, rule)
                        })
                    })
                }
                else {
                    casesOf(key).forEach((k) => {
                        default_rules[k] = matchCaseOf(k, rule)
                    })
                }
            }
        })


        const keys1 = Object.keys(default_rules).filter((key) => key.length === 1)
        const default_keyset1 = [...new Set(
            keys1.map((x) => x.toLocaleLowerCase())
        )]

        const keys2 = Object.keys(default_rules).filter((key) => key.length > 1)
        const default_keyset2 = [...new Set(
            keys2.map((s) => s.toLocaleLowerCase())
        )].sort((a,b) => b.length - a.length)

        const word_start_keyset = [...new Set(
            Object.keys(word_start_rules).map((s) => s.toLocaleLowerCase())
        )].sort((a,b) => b.length - a.length)

        const consonants_keyset = consonants
        const after_cons_keyset = [...new Set(
            Object.keys(after_cons_rules).map((x) => x.toLocaleLowerCase())
        )].sort((a,b) => b.length - a.length)


        const rxb = new RegexBuilder()
        const noop = '\uFFFC\uFFFC'

        const rx = rxb.or(
            // word start
            rxb.ngroup(
                // char preceding
                rxb.orgroup(  // 1
                    '^',
                    rxb.and(
                        rxb.xchars(loabc, ...apos),
                        rxb.optional(rxb.chars(...apos))
                    )
                ),
                // char to translate
                rxb.orgroup(  // 2
                    ...(word_start_keyset.length > 0 ? word_start_keyset : [noop])
                )
            ),
            // or word inner
            rxb.or(
                rxb.orgroup(  // 3
                    ...(default_keyset2.length > 0 ? default_keyset2 : [noop])
                ),
                rxb.group(  // 4
                    ...(after_cons_keyset.length > 0 ?
                        [rxb.chars(consonants_keyset), rxb.or(...after_cons_keyset)]
                        : [noop])
                ),
                rxb.orgroup(  // 5
                    rxb.chars(...default_keyset1)
                )
            )
        )
        .regex('gi')

        const cb = (text, prefix, match_start, match_pairs, match_cons, match_inner) => {
            if (match_start) {
                const value = word_start_rules[match_start]
                return prefix + value
            }

            if (match_pairs) {
                const value = default_rules[match_pairs]
                return value
            }

            if (match_cons) {
                const cons = default_rules[match_cons[0]]
                const value = after_cons_rules[match_cons.substring(1)]
                return cons + value
            }

            const value = default_rules[match_inner]
            return value
        }
        return {
            regex: rx,
            callback: cb,
        }
    }

    convert(text) {
        return text
            .normalize('NFC')
            .replace(this.compiled.regex, this.compiled.callback)
            .normalize('NFC')
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
