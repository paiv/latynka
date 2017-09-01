const BundledTranslitTables = require('../src/js/bundled_tables')
    , Transliterator = require('../src/js/translit').Transliterator


describe('Nova Latynka', function() {

    beforeEach(function() {
        this.table = BundledTranslitTables['nova_latynka']
        this.translit = new Transliterator(this.table.rules)
        this.convert = (text) => this.translit.convert(text)
    })

    it('converts common chars', function() {
        const converted = this.convert('абвдезклмнопрстф')
        expect(converted).toBe('abvdezklmnoprstf')
    })

    it('converts гґх chars', function() {
        const converted = this.convert('г ґ х')
        expect(converted).toBe('h g x')
    })

    it('converts жз chars', function() {
        const converted = this.convert('ж з')
        expect(converted).toBe('ž z')
    })

    it('converts цч chars', function() {
        const converted = this.convert('ц ч')
        expect(converted).toBe('c č')
    })

    it('converts шщ chars', function() {
        const converted = this.convert('ш щ')
        expect(converted).toBe('š šč')
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
        expect(converted).toBe('Ščastjam b\'ješ žuk jix hlycju v fon j gedzj prič.')
    })
})
