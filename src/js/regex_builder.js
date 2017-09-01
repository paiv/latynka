
class RegexBuilder {
    constructor(op, args) {
        this.op = op
        this.args = args
    }

    regex(flags) {
        return new RegExp(this.toString(), flags)
    }

    toString() {
        switch (this.op) {
            case 'CAPT_GROUP':
                return ['(', this.args.join(''), ')'].join('')
            case 'NONCAPT_GROUP':
                return ['(?:', this.args.join(''), ')'].join('')
            case 'AND':
                return this.args.join('')
            case 'OR':
                return ['(?:', this.args.join('|'), ')'].join('')
            case 'CHARS':
                return ['[', this.args.join(''), ']'].join('')
            case 'XCHARS':
                return ['[^', this.args.join(''), ']'].join('')
        }
    }

    group() {
        return new RegexBuilder('CAPT_GROUP', [...arguments])
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
}


module.exports = {
    RegexBuilder,
}
