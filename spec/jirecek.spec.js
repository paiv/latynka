const BundledTranslitTables = require('../src/js/bundled_tables')
    , Transliterator = require('../src/js/translit').Transliterator


fdescribe('Jirecek', function() {

    beforeEach(function() {
        this.table = BundledTranslitTables['jirecek']
        this.translit = new Transliterator(this.table.rules)
        this.convert = (text) => this.translit.convert(text)
    })

    it('converts common chars', function() {
        const converted = this.convert('абвекмопуф')
        expect(converted).toBe('abvekmopuf')
    })

    it('converts гґх chars', function() {
        const converted = this.convert('г ґ х')
        expect(converted).toBe('h g ch')
    })

    it('converts шщ chars', function() {
        const converted = this.convert('ш Ш щ')
        expect(converted).toBe('š Š šč')
    })

    it('converts иіїй chars', function() {
        const converted = this.convert('и і ї й')
        expect(converted).toBe('y i ji j')
    })

    it('converts ь chars', function() {
        const converted = this.convert('ь ьк')
        expect(converted).toBe(' k')
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

        it('converts л', function() {
            const converted = this.convert('л')
            expect(converted).toBe('l')
        })

        it('converts н', function() {
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
            expect(converted).toBe('ď Ď ďe ďu ďa')
        })

        it('converts зь', function() {
            const converted = this.convert('зь Зь зє зю зя')
            expect(converted).toBe('ź Ź źe źu źa')
        })

        it('converts ль', function() {
            const converted = this.convert('ль ЛЬ лє лю ля')
            expect(converted).toBe('ľ Ľ ľe ľu ľa')
        })

        it('converts нь', function() {
            const converted = this.convert('нь Нь нє ню ня')
            expect(converted).toBe('ń Ń ńe ńu ńa')
        })

        it('converts рь char', function() {
            const converted = this.convert('рь Рь рє рю ря')
            expect(converted).toBe('ŕ Ŕ ŕe ŕu ŕa')
        })

        it('converts сь char', function() {
            const converted = this.convert('сь Сь сє сю ся')
            expect(converted).toBe('ś Ś śe śu śa')
        })

        it('converts ть char', function() {
            const converted = this.convert('ть Ть тє тю тя')
            expect(converted).toBe('ť Ť ťe ťu ťa')
        })

        it('converts ць chars', function() {
            const converted = this.convert('ць Ць цє цю ця')
            expect(converted).toBe('ć Ć će ću ća')
        })
    })

    describe('єюя', function() {

        it('converts consonant-єюя', function() {
            const converted = this.convert('тє тю тя')
            expect(converted).toBe('ťe ťu ťa')
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
        expect(converted).toBe('Ščasťam bješ žuk jich hlyću v fon j gedź prič.')
    })
})
