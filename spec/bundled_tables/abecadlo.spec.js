const Transliterator = require('../../src/js/translit').Transliterator
    , bundled_table = require('../../src/data/bundled_tables/abecadlo.json')


describe('Abecadlo', function() {

    beforeEach(function() {
        this.translit = new Transliterator(bundled_table.rules)
        this.convert = (text) => this.translit.convert(text)
    })

    it('converts common chars', function() {
        const converted = this.convert('абвекмопуф')
        expect(converted).toBe('abwekmopuf')
    })

    it('converts гґх chars', function() {
        const converted = this.convert('г ґ х')
        expect(converted).toBe('h g ch')
    })

    it('converts шщ chars', function() {
        const converted = this.convert('ш щ')
        expect(converted).toBe('sz szcz')
    })

    it('converts иіїй chars', function() {
        const converted = this.convert('и і ї й')
        expect(converted).toBe('y i ji j')
    })

    it('converts ь chars', function() {
        const converted = this.convert('ь ль')
        expect(converted).toBe(' l')
    })

    describe('hard', function() {

        it('converts д char', function() {
            const converted = this.convert('д')
            expect(converted).toBe('d')
        })

        it('converts жз chars', function() {
            const converted = this.convert('ж Ж з')
            expect(converted).toBe('ż Ż z')
        })

        it('converts л', function() {
            const converted = this.convert('л')
            expect(converted).toBe('ł')
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
            const converted = this.convert('ц ч')
            expect(converted).toBe('c cz')
        })
    })

    describe('soft', function() {

        it('converts дь char', function() {
            const converted = this.convert('дь Дь')
            expect(converted).toBe('ď Ď')
        })

        it('converts зь', function() {
            const converted = this.convert('зь Зь')
            expect(converted).toBe('ź Ź')
        })

        it('converts ль', function() {
            const converted = this.convert('лє лі ль лю ля ллє ллі ллю лля')
            expect(converted).toBe('le li l lu la lle lli llu lla')
        })

        it('converts нь', function() {
            const converted = this.convert('нь Нь')
            expect(converted).toBe('ń Ń')
        })

        it('converts рь char', function() {
            const converted = this.convert('рь Рь')
            expect(converted).toBe('ŕ Ŕ')
        })

        it('converts сь char', function() {
            const converted = this.convert('сь Сь')
            expect(converted).toBe('ś Ś')
        })

        it('converts ть char', function() {
            const converted = this.convert('ть Ть')
            expect(converted).toBe('ť Ť')
        })

        it('converts ць chars', function() {
            const converted = this.convert('ць Ць')
            expect(converted).toBe('ć Ć')
        })
    })

    describe('єюя', function() {

        it('converts consonant-єюя', function() {
            const converted = this.convert('тє тю тя')
            expect(converted).toBe('tie tiu tia')
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
        expect(converted).toBe('Szczastiam bjesz żuk jich hłyciu w fon j gedź pricz.')
    })

    it('converts testset', function() {
        const tests = [
            ['дятлик', 'diatłyk'],
            ['в\'яз', 'wjaz'],
            ['Рєпін', 'Riepin'],
            ['В\'єтнам', 'Wjetnam'],
            ['бюргер', 'biurher'],
            ['в\'юнок', 'wjunok'],
        ]

        tests.forEach((t) => {
            const converted = this.convert(t[0])
            expect(converted).toBe(t[1])
        })
    })

})
