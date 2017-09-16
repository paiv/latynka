const Transliterator = require('../../src/js/translit').Transliterator
    , bundled_table = require('../../src/data/bundled_tables/gost779b.json')


describe('GOST 7.79 System B', function() {

    beforeEach(function() {
        this.translit = new Transliterator(bundled_table.rules)
        this.convert = (text) => this.translit.convert(text)
    })

    it('converts common chars', function() {
        const converted = this.convert('абвдеклмнопрстуф')
        expect(converted).toBe('abvdeklmnoprstuf')
    })

    it('converts гґх chars', function() {
        const converted = this.convert('г ґ Ґ х')
        expect(converted).toBe('g g\u0300 G\u0300 x')
    })

    it('converts жз chars', function() {
        const converted = this.convert('ж з')
        expect(converted).toBe('zh z')
    })

    it('converts цч chars', function() {
        const converted = this.convert('ц ч')
        expect(converted).toBe('cz ch')
    })

    it('converts ц- pairs', function() {
        const converted = this.convert('ці ци цє цю ця')
        expect(converted).toBe('ci cy\u0300 cye cyu cya')
    })

    it('converts шщ chars', function() {
        const converted = this.convert('ш щ')
        expect(converted).toBe('sh shh')
    })

    it('converts ь chars', function() {
        const converted = this.convert('ь ль')
        expect(converted).toBe('\u0300 l\u0300')
    })

    it('converts єюя chars', function() {
        const converted = this.convert('є ю я')
        expect(converted).toBe('ye yu ya')
    })

    it('converts ийії chars', function() {
        const converted = this.convert('и й і ї')
        expect(converted).toBe('y\u0300 j i yi')
    })

    it('converts apos', function() {
        const converted = this.convert('\' м\'я')
        expect(converted).toBe('\' m\'ya')
    })


    it('converts pangram', function() {
        const converted = this.convert('Щастям б\'єш жук їх глицю в фон й ґедзь пріч.')
        expect(converted).toBe('Shhastyam b\'yesh zhuk yix gly\u0300cyu v fon j g\u0300edz\u0300 prich.')
    })

})
