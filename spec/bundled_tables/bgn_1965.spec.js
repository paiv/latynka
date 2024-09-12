const Transliterator = require('../../src/js/translit').Transliterator
    , bundled_table = require('../../src/data/bundled_tables/bgn_1965.json')


describe('BGN/PCGN 1965', function() {

    beforeEach(function() {
        this.translit = new Transliterator(bundled_table.rules)
        this.convert = (text) => this.translit.convert(text)
    })

    it('converts common chars', function() {
        const converted = this.convert('абвдезклмнопрстуф')
        expect(converted).toBe('abvdezklmnoprstuf')
    })

    it('converts гґх chars', function() {
        const converted = this.convert('г ґ х')
        expect(converted).toBe('h g kh')
    })

    it('converts жз chars', function() {
        const converted = this.convert('ж з')
        expect(converted).toBe('zh z')
    })

    it('converts зг кг сг тс тсг special', function() {
        const converted = this.convert('зг гзг кг сг тс тсг')
        expect(converted).toBe('z·h hz·h k·h s·h t·s ts·h')
    })

    it('converts цч chars', function() {
        const converted = this.convert('ц ч')
        expect(converted).toBe('ts ch')
    })

    it('converts шщ chars', function() {
        const converted = this.convert('ш щ')
        expect(converted).toBe('sh shch')
    })

    it('converts ь apos chars', function() {
        const converted = this.convert("ь ль ' в'ю")
        expect(converted).toBe("' l' \" v\"yu")
    })


    describe('at word start', function() {

        it('converts єюя chars', function() {
            const converted = this.convert('є ю я')
            expect(converted).toBe('ye yu ya')
        })

        it('converts ийії chars', function() {
            const converted = this.convert('и й і ї')
            expect(converted).toBe('y y i yi')
        })
    })


    describe('inside word', function() {

        it('converts єюя chars', function() {
            const converted = this.convert('бє бю бя')
            expect(converted).toBe('bye byu bya')
        })

        it('converts ийії chars', function() {
            const converted = this.convert('би бй бі бї')
            expect(converted).toBe('by by bi byi')
        })
    })


    it('converts pangram', function() {
        const converted = this.convert('Щастям б\'єш жук їх глицю в фон й ґедзь пріч.')
        expect(converted).toBe('Shchastyam b\"yesh zhuk yikh hlytsyu v fon y gedz\' prich.')
    })
})
