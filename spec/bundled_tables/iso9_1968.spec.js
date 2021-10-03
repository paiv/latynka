const Transliterator = require('../../src/js/translit').Transliterator
    , bundled_table = require('../../src/data/bundled_tables/iso9_1968.json')


describe('ISO9 1968', function() {

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
        expect(converted).toBe('h g G ch')
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
        expect(converted).toBe('š Š šč Šč')
    })

    it('converts ь chars', function() {
        const converted = this.convert('ь ль')
        expect(converted).toBe('\u02B9 l\u02B9')
    })

    it('converts єюя chars', function() {
        const converted = this.convert('є Є ю Ю я Я')
        expect(converted).toBe('je Je ju Ju ja Ja')
    })

    it('converts ийії chars', function() {
        const converted = this.convert('и й і І ї Ї')
        expect(converted).toBe('y j i I ï Ï')
    })

    it('converts apos', function() {
        const converted = this.convert('\' м\'я')
        expect(converted).toBe('\u2033 m\u2033ja')
    })


    it('converts pangram', function() {
        const converted = this.convert('Щастям б\'єш жук їх глицю в фон й ґедзь пріч.')
        expect(converted).toBe('Ščastjam b\u2033ješ žuk ïch hlycju v fon j gedz\u02B9 prič.')
    })

})
