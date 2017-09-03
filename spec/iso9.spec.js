const BundledTranslitTables = require('../src/js/bundled_tables')
    , Transliterator = require('../src/js/translit').Transliterator


describe('ISO9 1995', function() {

    beforeEach(function() {
        this.table = BundledTranslitTables['iso9_1995']
        this.translit = new Transliterator(this.table.rules)
        this.convert = (text) => this.translit.convert(text)
    })

    it('converts common chars', function() {
        const converted = this.convert('абвдеклмнопрстуф')
        expect(converted).toBe('abvdeklmnoprstuf')
    })

    it('converts гґх chars', function() {
        const converted = this.convert('г ґ Ґ х')
        expect(converted).toBe('g g\u0300 G\u0300 h')
    })

    it('converts жз chars', function() {
        const converted = this.convert('ж Ж з З')
        expect(converted).toBe('ž Ž z Z')
    })

    it('converts цч chars', function() {
        const converted = this.convert('ц ч Ч')
        expect(converted).toBe('c č Č')
    })

    it('converts шщ chars', function() {
        const converted = this.convert('ш Ш щ Щ')
        expect(converted).toBe('š Š ŝ Ŝ')
    })

    it('converts ь chars', function() {
        const converted = this.convert('ь ль')
        expect(converted).toBe('\u02B9 l\u02B9')
    })

    it('converts єюя chars', function() {
        const converted = this.convert('є Є ю Ю я Я')
        expect(converted).toBe('ê Ê û Û â Â')
    })

    it('converts ийії chars', function() {
        const converted = this.convert('и й і І ї Ї')
        expect(converted).toBe('i j ì Ì ï Ï')
    })

    it('converts apos', function() {
        const converted = this.convert('\' м\'я')
        expect(converted).toBe('\u02BC m\u02BCâ')
    })


    it('converts pangram', function() {
        const converted = this.convert('Щастям б\'єш жук їх глицю в фон й ґедзь пріч.')
        expect(converted).toBe('Ŝastâm b\u02BCêš žuk ïh glicû v fon j g\u0300edz\u02B9 prìč.')
    })

})
