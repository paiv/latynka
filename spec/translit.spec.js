
const Transliterator = require('../src/js/translit').Transliterator


describe('Transliterator', function() {

    beforeEach(function() {
        this.table = {
            rules: {
                'ґ': 'g',
                // 'є': 'je',
                'є': {
                    inner: 'je',
                },
                'ї': {
                    start: 'yi',
                    inner: 'ji',
                },
                'єї': 'xxx',
                'їґ': 'qq',
            }
        }

        this.translit = new Transliterator(this.table.rules)
        this.convert = (text) => this.translit.convert(text)
    })

    it('converts ґ char', function() {
        const converted = this.convert('ґ')
        expect(converted).toBe('g')
    })

    it('converts є char', function() {
        const converted = this.convert('є')
        expect(converted).toBe('je')
    })

    it('converts a word', function() {
        const converted = this.convert('ґє')
        expect(converted).toBe('gje')
    })


    describe('at word start', function() {

        it('converts ї char', function() {
            const converted = this.convert('ї')
            expect(converted).toBe('yi')
        })
    })


    describe('inside word', function() {

        it('converts ї char', function() {
            const converted = this.convert('ґї')
            expect(converted).toBe('gji')
        })
    })

    it('converts єї special', function() {
        const converted = this.convert('єї їєї')
        expect(converted).toBe('xxx yixxx')
    })

    it('converts їґ special', function() {
        const converted = this.convert('їґ їїґ')
        expect(converted).toBe('qq yiqq')
    })


    describe('casing', function() {
        // TODO: preserve all-caps

        it('preserves 1-1 case', function() {
            const converted = this.convert('Ґ ґ ҐґґҐ')
            expect(converted).toBe('G g GggG')
        })

        it('preserves 1-2 case', function() {
            const converted = this.convert('є ґє Ґє')
            expect(converted).toBe('je gje Gje')
        })

        it('all caps 1-2 case', function() {
            const converted = this.convert('Є ҐЄ')
            expect(converted).toBe('Je GJe')
        })

        it('silly 1-2 case', function() {
            const converted = this.convert('ґЄ')
            expect(converted).toBe('gJe')
        })

        it('preserves 2-2 case', function() {
            const converted = this.convert('їґ Їґ')
            expect(converted).toBe('qq Qq')
        })

        it('all caps 2-2 case', function() {
            const converted = this.convert('ЇҐ ҐЇҐ')
            expect(converted).toBe('Qq GQq')
        })

        it('silly 2-2 case', function() {
            const converted = this.convert('їҐ')
            expect(converted).toBe('qQ')
        })

        it('preserves 2-3 case', function() {
            const converted = this.convert('єї Єї')
            expect(converted).toBe('xxx Xxx')
        })

        it('all caps 2-3 case', function() {
            const converted = this.convert('ЄЇ')
            expect(converted).toBe('Xxx')
        })

        it('silly 2-3 case', function() {
            const converted = this.convert('єЇ')
            expect(converted).toBe('xxX')
        })
    })
})
