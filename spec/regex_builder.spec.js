const RegexBuilder = require('../src/js/regex_builder').RegexBuilder


describe('RegexBuilder', function() {

    beforeEach(function() {
        this.rxb = new RegexBuilder()
        this.regex = (flags) => {
            return this.rxb.regex(flags)
        }
        this.source = (flags) => {
            return this.regex(flags).source
        }
    })

    it('can be empty', function() {
        expect(this.source()).toBe('(?:)')
    })

    describe('char class', function() {
        it('handles one char', function() {
            this.rxb = this.rxb.chars('x')
            expect(this.source()).toBe('[x]')
        })

        it('handles string list', function() {
            this.rxb = this.rxb.chars('xz', 'ca')
            expect(this.source()).toBe('[acxz]')
        })

        it('handles negated one char', function() {
            this.rxb = this.rxb.xchars('x')
            expect(this.source()).toBe('[^x]')
        })

        it('handles negated string list', function() {
            this.rxb = this.rxb.xchars('xz', 'ca')
            expect(this.source()).toBe('[^acxz]')
        })

        it('collapses ranges', function() {
            this.rxb = this.rxb.chars('uvwxyz', 'abc')
            expect(this.source()).toBe('[a-cu-z]')
        })

        it('collapses negated ranges', function() {
            this.rxb = this.rxb.xchars('uvwxyz', 'abc')
            expect(this.source()).toBe('[^a-cu-z]')
        })
    })

    it('ands', function() {
        this.rxb = this.rxb.and(this.rxb.chars('x'), 'abc')
        expect(this.source()).toBe('[x]abc')
    })

    it('ors', function() {
        this.rxb = this.rxb.or(this.rxb.chars('x'), 'abc')
        expect(this.source()).toBe('(?:[x]|abc)')
    })

    it('groups', function() {
        this.rxb = this.rxb.group(this.rxb.chars('x'), 'abc')
        expect(this.source()).toBe('([x]abc)')
    })

    it('groups with or', function() {
        this.rxb = this.rxb.orgroup(this.rxb.chars('x'), 'abc')
        expect(this.source()).toBe('([x]|abc)')
    })

    it('groups noncapturing', function() {
        this.rxb = this.rxb.ngroup(this.rxb.chars('x'), 'abc')
        expect(this.source()).toBe('(?:[x]abc)')
    })

    describe('optional', function() {
        it('marks single', function() {
            this.rxb = this.rxb.optional('x')
            expect(this.source()).toBe('x?')
        })

        it('collapses empty', function() {
            this.rxb = this.rxb.optional()
            expect(this.source()).toBe('(?:)')
        })

        it('collapses empty string', function() {
            this.rxb = this.rxb.optional('')
            expect(this.source()).toBe('(?:)')
        })

        it('marks sequence', function() {
            this.rxb = this.rxb.optional('x', 'y')
            expect(this.source()).toBe('(?:xy)?')
        })

        it('marks string', function() {
            this.rxb = this.rxb.optional('xy')
            expect(this.source()).toBe('(?:xy)?')
        })

        it('marks chars', function() {
            this.rxb = this.rxb.optional(this.rxb.chars('xz'))
            expect(this.source()).toBe('[xz]?')
        })

        it('marks xchars', function() {
            this.rxb = this.rxb.optional(this.rxb.xchars('xz'))
            expect(this.source()).toBe('[^xz]?')
        })

        it('marks a group', function() {
            this.rxb = this.rxb.optional(this.rxb.group('x', 'y'))
            expect(this.source()).toBe('(xy)?')
        })
    })

    it('is recursive', function() {
        this.rxb = this.rxb.group(
            this.rxb.ngroup(
                this.rxb.and('abc', this.rxb.chars('xz'))
            ),
            this.rxb.or(this.rxb.chars('q'), 'opr')
        )
        expect(this.source()).toBe('((?:abc[xz])(?:[q]|opr))')
    })

    it('has flags', function() {
        expect(this.regex('g').flags).toBe('g')
    })


    describe('none', function() {

        it('is null', function() {
            this.rxb = this.rxb.none()
            expect(this.rxb.is_none()).toBe(true)
            expect(this.rxb.toString()).toBeNull()
        })

        it('excludes nones', function() {
            this.rxb = this.rxb.or(
                'abc',
                this.rxb.none(),
                'qrx'
            )
            expect(this.source()).toBe('(?:abc|qrx)')
        })
    })
})
