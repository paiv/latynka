
class RegexBuilder {
    constructor(op, args) {
        this.op = op
        this.args = args && args.filter((a) => typeof a === 'string' || !a.is_none())
    }

    regex(flags) {
        return new RegExp(this.toString(), flags)
    }

    toString() {
        switch (this.op) {
            case 'NONE':
                return null
            case 'CAPT_GROUP':
                return ['(', ...this.args, ')'].join('')
            case 'CAPT_OR_GROUP':
                return ['(', this.args.join('|'), ')'].join('')
            case 'NONCAPT_GROUP':
                return ['(?:', ...this.args, ')'].join('')
            case 'AND':
                return this.args.join('')
            case 'OR':
                return ['(?:', this.args.join('|'), ')'].join('')
            case 'CHARS':
                return ['[', this._pack_ranges(this.args.join('')), ']'].join('')
            case 'XCHARS':
                return ['[^', this._pack_ranges(this.args.join('')), ']'].join('')
            case 'OPT':
                switch (this.args.length) {
                    case 0:
                        return ''
                    case 1:
                        if (this.args[0] instanceof RegexBuilder) {
                            return (this.args.join('') + '?')
                        }
                        if (typeof this.args[0] === 'string') {
                            switch (this.args[0].length) {
                                case 0:
                                    return ''
                                case 1:
                                    return (this.args.join('') + '?')
                                default:
                                    break
                            }
                        }
                        // fall through
                    default:
                        return ['(?:', ...this.args, ')?'].join('')
                }
        }
    }

    _pack_ranges(s) {
        const xs = [...(new Set(s))]
        xs.sort()
        let res = ''
        let state = 0
        xs.forEach((c, i) => {
            switch (state) {
                case 0:
                    res += c
                    state = 1
                    break
                case 1:
                    if (c.charCodeAt(0) - xs[i-1].charCodeAt(0) !== 1) {
                        res += c
                    }
                    else {
                        state = 2
                    }
                    break
                case 2:
                    if (c.charCodeAt(0) - xs[i-1].charCodeAt(0) !== 1) {
                        if (xs[i-1].charCodeAt(0) - res.charCodeAt(res.length-1) > 1) {
                            res += '-'
                        }
                        res += xs[i-1]
                        res += c
                        state = 1
                    }
                    break
            }
        })
        if (state === 2) {
            if (xs[xs.length-1].charCodeAt(0) - res.charCodeAt(res.length-1) > 1) {
                res += '-'
            }
            res += xs[xs.length-1]
        }
        return res
    }

    none() {
        return new RegexBuilder('NONE')
    }

    is_none() {
        return this.op === 'NONE'
    }

    group() {
        return new RegexBuilder('CAPT_GROUP', [...arguments])
    }

    orgroup() {
        return new RegexBuilder('CAPT_OR_GROUP', [...arguments])
    }

    ngroup() {
        return new RegexBuilder('NONCAPT_GROUP', [...arguments])
    }

    and() {
        return new RegexBuilder('AND', [...arguments])
    }

    or() {
        return new RegexBuilder('OR', [...arguments])
    }

    chars() {
        return new RegexBuilder('CHARS', [...arguments])
    }

    xchars() {
        return new RegexBuilder('XCHARS', [...arguments])
    }

    optional() {
        return new RegexBuilder('OPT', [...arguments])
    }
}


module.exports = {
    RegexBuilder,
}
