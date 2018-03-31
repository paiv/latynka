const Transliterator = require('../../src/js/translit').Transliterator
    , bundled_table = require('../../src/data/bundled_tables/paiv.json')


describe('PAIV', function() {

    beforeEach(function() {
        this.translit = new Transliterator(bundled_table.rules)
        this.convert = (text) => this.translit.convert(text)
    })

    it('converts common chars', function() {
        const converted = this.convert('абвекмопуф')
        expect(converted).toBe('abvekmopuf')
    })

    it('converts гґх chars', function() {
        const converted = this.convert('г Г ґ Ґ х Х')
        expect(converted).toBe('g G ǧ Ǧ x X')
    })

    it('converts шщ chars', function() {
        const converted = this.convert('ш Ш щ Щ')
        expect(converted).toBe('š Š ŝ Ŝ')
    })

    it('converts иіїй chars', function() {
        const converted = this.convert('и і ї й')
        expect(converted).toBe('y i ï j')
    })

    describe('hard', function() {

        it('converts д char', function() {
            const converted = this.convert('д')
            expect(converted).toBe('d')
        })

        it('converts жз chars', function() {
            const converted = this.convert('ж Ж з')
            expect(converted).toBe('ž Ž z')
        })

        it('converts л char', function() {
            const converted = this.convert('л')
            expect(converted).toBe('l')
        })

        it('converts н char', function() {
            const converted = this.convert('н')
            expect(converted).toBe('n')
        })

        it('converts р char', function() {
            const converted = this.convert('р')
            expect(converted).toBe('r')
        })

        it('converts с char', function() {
            const converted = this.convert('с')
            expect(converted).toBe('s')
        })

        it('converts т char', function() {
            const converted = this.convert('т')
            expect(converted).toBe('t')
        })

        it('converts цч chars', function() {
            const converted = this.convert('ц Ц ч Ч')
            expect(converted).toBe('c C č Č')
        })
    })

    describe('soft', function() {

        it('converts дь char', function() {
            const converted = this.convert('дь Дь дє дю дя')
            expect(converted).toBe('d\u0301 D\u0301 d\u0301e d\u0301u d\u0301a')
        })

        it('converts зь char', function() {
            const converted = this.convert('зь Зь зє зю зя')
            expect(converted).toBe('z\u0301 Z\u0301 z\u0301e z\u0301u z\u0301a')
        })

        it('converts ль char', function() {
            const converted = this.convert('ль ЛЬ лє лю ля')
            expect(converted).toBe('l\u0301 L\u0301 l\u0301e l\u0301u l\u0301a')
        })

        it('converts нь char', function() {
            const converted = this.convert('нь Нь нє ню ня')
            expect(converted).toBe('n\u0301 N\u0301 n\u0301e n\u0301u n\u0301a')
        })

        it('converts рь char', function() {
            const converted = this.convert('рь Рь рє рю ря')
            expect(converted).toBe('r\u0301 R\u0301 r\u0301e r\u0301u r\u0301a')
        })

        it('converts сь char', function() {
            const converted = this.convert('сь Сь сє сю ся')
            expect(converted).toBe('s\u0301 S\u0301 s\u0301e s\u0301u s\u0301a')
        })

        it('converts ть char', function() {
            const converted = this.convert('ть Ть тє тю тя')
            expect(converted).toBe('t\u0301 T\u0301 t\u0301e t\u0301u t\u0301a')
        })

        it('converts ць char', function() {
            const converted = this.convert('ць Ць цє цю ця')
            expect(converted).toBe('c\u0301 C\u0301 c\u0301e c\u0301u c\u0301a')
        })
    })

    describe('єюя', function() {

        it('converts consonant-єюя', function() {
            const converted = this.convert('тє тю тя')
            expect(converted).toBe('t\u0301e t\u0301u t\u0301a')
        })

        it('converts word start єюя', function() {
            const converted = this.convert('є ю я')
            expect(converted).toBe('je ju ja')
        })

        it('converts vowel-єюя', function() {
            const converted = this.convert('ає аю ая')
            expect(converted).toBe('aje aju aja')
        })

        it('converts apos-єюя', function() {
            const converted = this.convert("'є 'ю 'я")
            expect(converted).toBe('je ju ja')
        })
    })

    it('converts pangram', function() {
        const converted = this.convert('Щастям б\'єш жук їх глицю в фон й ґедзь пріч.')
        expect(converted).toBe('Ŝast́am bješ žuk ïx glyću v fon j ǧedź prič.')
    })
})
