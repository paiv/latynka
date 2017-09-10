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

        const TitleCase = (value) => value.toLocaleLowerCase().replace(/^./, (s) => s.toLocaleUpperCase())
        const SillyCase = (value) => value.toLocaleLowerCase().replace(/.$/, (s) => s.toLocaleUpperCase())


        Object.keys(rules).forEach((key) => {
            const lokey = key.toLocaleLowerCase()
            const hikey = lokey.toLocaleUpperCase()
            let rule = rules[key]

            if (typeof rule === 'object') {

                if ('start' in rule) {
                    const value = rule.start
                    word_start_rules[lokey] = value
                    word_start_rules[hikey] = TitleCase(value)
                    if (key.length > 1) {
                        word_start_rules[SillyCase(key)] = SillyCase(value)
                        word_start_rules[TitleCase(key)] = TitleCase(value)
                    }
                }

                if ('cons' in rule) {
                    const value = rule.cons
                    after_cons_rules[lokey] = value
                    after_cons_rules[hikey] = TitleCase(value)
                }

                const value = rule.other
                default_rules[lokey] = value
                default_rules[hikey] = TitleCase(value)
                if (key.length > 1) {
                    default_rules[SillyCase(key)] = SillyCase(value)
                    default_rules[TitleCase(key)] = TitleCase(value)
                }

            }
            else {

                if (key === '\'') {
                    apos.forEach((key) => {
                        default_rules[key] = rule
                    })
                }
                else {
                    default_rules[lokey] = rule
                    default_rules[hikey] = TitleCase(rule)

                    if (key.length > 1) {
                        default_rules[SillyCase(key)] = SillyCase(rule)
                        default_rules[TitleCase(key)] = TitleCase(rule)
                    }
                }
            }
        })


        const keys1 = Object.keys(default_rules).filter((key) => key.length === 1)
            .concat('\'' in rules ? apos : [])
        const default_keyset1 = keys1.map((x) => [
            x.toLocaleLowerCase(),
            x.toLocaleUpperCase()
        ]).reduce((acc, x) => acc.concat(x), [])

        const keys2 = Object.keys(default_rules).filter((key) => key.length > 1)
            .sort((a,b) => b.length - a.length)
        const default_keyset2 = keys2.map((x) => [
            x.toLocaleLowerCase(),
            x.toLocaleUpperCase(),
            TitleCase(x),
            SillyCase(x)
        ]).reduce((acc, x) => acc.concat(x), [])

        const word_start_keyset = Object.keys(word_start_rules).map((x) => [
            x.toLocaleLowerCase(),
            x.toLocaleUpperCase()
        ]).reduce((acc, x) => acc.concat(x), [])

        const consonants_keyset = consonants + consonants.toLocaleUpperCase()
        const after_cons_keyset = Object.keys(after_cons_rules).map((x) => [
            x.toLocaleLowerCase(),
            x.toLocaleUpperCase()
        ]).reduce((acc, x) => acc.concat(x), [])


        const rxb = new RegexBuilder()

        const rx = rxb.or(
            // word start
            rxb.ngroup(
                // char preceding
                rxb.orgroup(  // 1
                    '^',
                    rxb.xchars(loabc, hiabc, ...apos)
                ),
                // char to translate
                rxb.orgroup(  // 2
                    rxb.chars(...word_start_keyset)
                )
            ),
            // or word inner
            rxb.or(
                rxb.orgroup(  // 3
                    ...(default_keyset2.length > 0 ? default_keyset2 : ['xx'])
                ),
                rxb.group(  // 4
                    rxb.chars(consonants_keyset),
                    rxb.chars(...after_cons_keyset)
                ),
                rxb.orgroup(  // 5
                    rxb.chars(...default_keyset1)
                )
            )
        )
        .regex('g')


        const cb = (text, xkey, match_start, match_pairs, match_cons, match_inner) => {
            if (match_start) {
                const value = word_start_rules[match_start]
                return xkey + value
            }

            if (match_pairs) {
                const value = default_rules[match_pairs]
                return value
            }

            if (match_cons) {
                const cons = default_rules[match_cons[0]]
                const value = after_cons_rules[match_cons[1]]
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
