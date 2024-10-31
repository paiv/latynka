const Transliterator = require('../../src/js/translit').Transliterator
    , bundled_table = require('../../src/data/bundled_tables/prudeus.json')


describe('Prudeus 2022', function () {

    beforeEach(function () {
        this.translit = new Transliterator(bundled_table.rules)
        this.convert = (text) => this.translit.convert(text)
    })

    it('converts common chars', function () {
        const converted = this.convert('абвекмопуф')
        expect(converted).toBe('abvekmopuf')
    })

    it('converts гґх chars', function () {
        const converted = this.convert('г ґ х')
        expect(converted).toBe('g ĝ h')
    })

    it('converts шщ chars', function () {
        const converted = this.convert('ш Ш щ')
        expect(converted).toBe('š Š šč')
    })

    it('converts иіїй chars', function () {
        const converted = this.convert('и і ї й')
        expect(converted).toBe('y i ji j')
    })

    it('converts ь chars', function () {
        const converted = this.convert('ь ьк')
        expect(converted).toBe('\' \'k')
    })

    describe('hard', function () {

        it('converts д char', function () {
            const converted = this.convert('д')
            expect(converted).toBe('d')
        })

        it('converts жз chars', function () {
            const converted = this.convert('ж Ж з')
            expect(converted).toBe('ž Ž z')
        })

        it('converts л', function () {
            const converted = this.convert('л')
            expect(converted).toBe('l')
        })

        it('converts н', function () {
            const converted = this.convert('н')
            expect(converted).toBe('n')
        })

        it('converts р char', function () {
            const converted = this.convert('р')
            expect(converted).toBe('r')
        })

        it('converts с char', function () {
            const converted = this.convert('с')
            expect(converted).toBe('s')
        })

        it('converts т char', function () {
            const converted = this.convert('т')
            expect(converted).toBe('t')
        })

        it('converts цч chars', function () {
            const converted = this.convert('ц Ц ч Ч')
            expect(converted).toBe('c C č Č')
        })
    })

    describe('soft', function () {

        it('converts дь char', function () {
            const converted = this.convert('дь Дь')
            expect(converted).toBe('d\' D\'')
        })

        it('converts зь', function () {
            const converted = this.convert('зь Зь')
            expect(converted).toBe('z\' Z\'')
        })

        it('converts ль', function () {
            const converted = this.convert('ль ЛЬ')
            expect(converted).toBe('l\' L\'')
        })

        it('converts нь', function () {
            const converted = this.convert('нь Нь')
            expect(converted).toBe('n\' N\'')
        })

        it('converts рь char', function () {
            const converted = this.convert('рь Рь')
            expect(converted).toBe('r\' R\'')
        })

        it('converts сь char', function () {
            const converted = this.convert('сь Сь')
            expect(converted).toBe('s\' S\'')
        })

        it('converts ть char', function () {
            const converted = this.convert('ть Ть')
            expect(converted).toBe('t\' T\'')
        })

        it('converts ць chars', function () {
            const converted = this.convert('ць Ць')
            expect(converted).toBe('c\' C\'')
        })
    })

    describe('єюя', function () {

        it('converts consonant-єюя', function () {
            const converted = this.convert('тє тю тя')
            expect(converted).toBe('tje tju tja')
        })

        it('converts word start єюя', function () {
            const converted = this.convert('є ю я')
            expect(converted).toBe('je ju ja')
        })

        it('converts vowel-єюя', function () {
            const converted = this.convert('ає аю ая')
            expect(converted).toBe('aje aju aja')
        })

        it('converts apos-єюя', function () {
            const converted = this.convert("'є 'ю 'я")
            expect(converted).toBe('\'je \'ju \'ja')
        })
    })

    it('converts pangram', function () {
        const converted = this.convert('Щастям б\'єш жук їх глицю в фон й ґедзь пріч.')
        expect(converted).toBe('Ščastjam b\'ješ žuk jih glycju v fon j ĝedz\' prič.')
    })

    describe('йо', function () {

        it('converts дйо', function () {
            const converted = this.convert('підйом')
            expect(converted).toBe('pid\'jom')
        })

        it('converts зйо', function () {
            const converted = this.convert('зйомка')
            expect(converted).toBe('z\'jomka')
        })

        it('converts рйо', function () {
            const converted = this.convert('всерйоз')
            expect(converted).toBe('vser\'joz')
        })

        it('converts вйо', function () {
            const converted = this.convert('шевйот')
            expect(converted).toBe('šev\'jot')
        })

        it('converts бйо', function () {
            const converted = this.convert('Воробйов')
            expect(converted).toBe('Vorob\'jov')
        })

        it('converts льйо', function () {
            const converted = this.convert('мільйон')
            expect(converted).toBe('mil\'jon')
        })

        it('converts ньйо', function () {
            const converted = this.convert('каньйон')
            expect(converted).toBe('kan\'jon')
        })

        it('converts сьйо', function () {
            const converted = this.convert('лосьйон')
            expect(converted).toBe('los\'jon')
        })

    })

})
