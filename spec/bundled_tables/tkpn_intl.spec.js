const BundledTranslitTables = require('../../src/js/bundled_tables')
    , Transliterator = require('../../src/js/translit').Transliterator


describe('ТКПН intl', function() {

    beforeEach(function() {
        this.table = BundledTranslitTables['tkpn_intl']
        this.translit = new Transliterator(this.table.rules)
        this.convert = (text) => this.translit.convert(text)
    })

    it('converts common chars', function() {
        const converted = this.convert('абвдеклмнопрстуф')
        expect(converted).toBe('abvdeklmnoprstuf')
    })

    it('converts гґх chars', function() {
        const converted = this.convert('г ґ х')
        expect(converted).toBe('gh g kh')
    })

    it('converts жз chars', function() {
        const converted = this.convert('ж з')
        expect(converted).toBe('zh z')
    })

    it('converts цч chars', function() {
        const converted = this.convert('ц ч')
        expect(converted).toBe('c ch')
    })

    it('converts шщ chars', function() {
        const converted = this.convert('ш щ')
        expect(converted).toBe('sh shh')
    })

    it('converts ь chars', function() {
        const converted = this.convert('ь ль')
        expect(converted).toBe('j lj')
    })

    it('converts єюя chars', function() {
        const converted = this.convert('є ю я')
        expect(converted).toBe('je ju ja')
    })

    it('converts ийії chars', function() {
        const converted = this.convert('и і ї й')
        expect(converted).toBe('y i ji j')
    })

    it('converts apos', function() {
        const converted = this.convert('\' м\'я')
        expect(converted).toBe('\' m\'ja')
    })

    it('adds hard apos', function() {
        const converted = this.convert('бйо дйо вйо мйо пйо рйо')
        expect(converted).toBe('b\'jo d\'jo v\'jo m\'jo p\'jo r\'jo')
    })

    it('converts pangram', function() {
        const converted = this.convert('Щастям б\'єш жук їх глицю в фон й ґедзь пріч.')
        expect(converted).toBe('Shhastjam b\'jesh zhuk jikh ghlycju v fon j gedzj prich.')
    })

    it('converts pryklady', function() {
        const tests = [
            ['Григор\'єв', 'Ghryghor\'jev'],
            ['в\'юни', 'v\'juny'],
            ['підйом', 'pid\'jom'],
        ]

        tests.forEach((t) => {
            const converted = this.convert(t[0])
            expect(converted).toBe(t[1])
        })
    })
})
