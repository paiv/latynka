const BundledTranslitTables = require('../../src/js/bundled_tables')
    , Transliterator = require('../../src/js/translit').Transliterator


describe('ТКПН diac', function() {

    beforeEach(function() {
        this.table = BundledTranslitTables['tkpn_diac']
        this.translit = new Transliterator(this.table.rules)
        this.convert = (text) => this.translit.convert(text)
    })

    it('converts common chars', function() {
        const converted = this.convert('абвдеклмнопрстуф')
        expect(converted).toBe('abvdeklmnoprstuf')
    })

    it('converts гґх chars', function() {
        const converted = this.convert('г ґ х')
        expect(converted).toBe('ğ g x')
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
        expect(converted).toBe('š ŝ')
    })

    it('converts ь chars', function() {
        const converted = this.convert('ь ль')
        expect(converted).toBe('j lj')
    })

    it('converts єюя chars', function() {
        const converted = this.convert('є ю я')
        expect(converted).toBe('ë ü ä')
    })

    it('converts ийії chars', function() {
        const converted = this.convert('и і ї й')
        expect(converted).toBe('y i ï j')
    })

    it('converts apos', function() {
        const converted = this.convert('\' м\'я')
        expect(converted).toBe('\' m\'ä')
    })

    it('adds hard apos', function() {
        const converted = this.convert('бйо дйо вйо мйо пйо рйо')
        expect(converted).toBe('b\'jo d\'jo v\'jo m\'jo p\'jo r\'jo')
    })

    it('converts pangram', function() {
        const converted = this.convert('Щастям б\'єш жук їх глицю в фон й ґедзь пріч.')
        expect(converted).toBe('Ŝastäm b\'ëš žuk ïx ğlycü v fon j gedzj prič.')
    })

    it('converts pryklady', function() {
        const tests = [
            ['Григор\'єв', 'Ğryğor\'ëv'],
            ['в\'юни', 'v\'üny'],
            ['підйом', 'pid\'jom'],
        ]

        tests.forEach((t) => {
            const converted = this.convert(t[0])
            expect(converted).toBe(t[1])
        })
    })
})
