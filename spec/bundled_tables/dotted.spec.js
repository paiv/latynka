const Transliterator = require('../../src/js/translit').Transliterator
    , bundled_table = require('../../src/data/bundled_tables/dotted.json')


describe('Dotted', function() {

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
        expect(converted).toBe('š Š šč Šč')
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
            expect(converted).toBe('d\u0307 D\u0307 d\u0307e d\u0307u d\u0307a')
        })

        it('converts зь char', function() {
            const converted = this.convert('зь Зь зє зю зя')
            expect(converted).toBe('z\u0307 Z\u0307 z\u0307e z\u0307u z\u0307a')
        })

        it('converts ль char', function() {
            const converted = this.convert('ль ЛЬ лє лю ля')
            expect(converted).toBe('l\u0307 L\u0307 l\u0307e l\u0307u l\u0307a')
        })

        it('converts нь char', function() {
            const converted = this.convert('нь Нь нє ню ня')
            expect(converted).toBe('n\u0307 N\u0307 n\u0307e n\u0307u n\u0307a')
        })

        it('converts рь char', function() {
            const converted = this.convert('рь Рь рє рю ря')
            expect(converted).toBe('r\u0307 R\u0307 r\u0307e r\u0307u r\u0307a')
        })

        it('converts сь char', function() {
            const converted = this.convert('сь Сь сє сю ся')
            expect(converted).toBe('s\u0307 S\u0307 s\u0307e s\u0307u s\u0307a')
        })

        it('converts ть char', function() {
            const converted = this.convert('ть Ть тє тю тя')
            expect(converted).toBe('t\u0307 T\u0307 t\u0307e t\u0307u t\u0307a')
        })

        it('converts ць char', function() {
            const converted = this.convert('ць Ць цє цю ця')
            expect(converted).toBe('c\u0307 C\u0307 c\u0307e c\u0307u c\u0307a')
        })
    })

    describe('єюя', function() {

        it('converts consonant-єюя', function() {
            const converted = this.convert('тє тю тя')
            expect(converted).toBe('t\u0307e t\u0307u t\u0307a')
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
        expect(converted).toBe('Ščasṫam bješ žuk ïx glyċu v fon j ǧedż prič.')
    })
})
