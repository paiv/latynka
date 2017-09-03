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

    it('handles char class of one char', function() {
        this.rxb = this.rxb.chars('x')
        expect(this.source()).toBe('[x]')
    })

    it('handles char class from string list', function() {
        this.rxb = this.rxb.chars('xyz', 'abc')
        expect(this.source()).toBe('[xyzabc]')
    })

    it('handles negated char class of one char', function() {
        this.rxb = this.rxb.xchars('x')
        expect(this.source()).toBe('[^x]')
    })

    it('handles negated char class from string list', function() {
        this.rxb = this.rxb.xchars('xyz', 'abc')
        expect(this.source()).toBe('[^xyzabc]')
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

    it('is recursive', function() {
        this.rxb = this.rxb.group(
            this.rxb.ngroup(
                this.rxb.and('abc', this.rxb.chars('xyz'))
            ),
            this.rxb.or(this.rxb.chars('q'), 'opr')
        )
        expect(this.source()).toBe('((?:abc[xyz])(?:[q]|opr))')
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
