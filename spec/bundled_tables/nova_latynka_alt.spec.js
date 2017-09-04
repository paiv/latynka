const BundledTranslitTables = require('../../src/js/bundled_tables')
    , Transliterator = require('../../src/js/translit').Transliterator


describe('Nova Latynka Alt', function() {

    beforeEach(function() {
        this.table = BundledTranslitTables['nova_latynka_alt']
        this.translit = new Transliterator(this.table.rules)
        this.convert = (text) => this.translit.convert(text)
    })

    it('converts common chars', function() {
        const converted = this.convert('абвдезклмнопрстуф')
        expect(converted).toBe('abvdezklmnoprstuf')
    })

    it('converts гґх chars', function() {
        const converted = this.convert('г ґ х')
        expect(converted).toBe('h g x')
    })

    it('converts жз chars', function() {
        const converted = this.convert('ж з')
        expect(converted).toBe('z\u030C z')
    })

    it('converts цч chars', function() {
        const converted = this.convert('ц ч')
        expect(converted).toBe('c c\u030C')
    })

    it('converts шщ chars', function() {
        const converted = this.convert('ш щ')
        expect(converted).toBe('s\u030C s\u030Cc\u030C')
    })

    it('converts єюя chars', function() {
        const converted = this.convert('є ю я')
        expect(converted).toBe('je ju ja')
    })

    it('converts ийії chars', function() {
        const converted = this.convert('и й і ї')
        expect(converted).toBe('y j i ji')
    })

    it('converts ь chars', function() {
        const converted = this.convert('ь ль')
        expect(converted).toBe('j lj')
    })

    it('converts pangram', function() {
        const converted = this.convert('Щастям б\'єш жук їх глицю в фон й ґедзь пріч.')
        expect(converted).toBe('S\u030Cc\u030Castjam b\'jes\u030C z\u030Cuk jix hlycju v fon j gedzj pric\u030C.')
    })
})
