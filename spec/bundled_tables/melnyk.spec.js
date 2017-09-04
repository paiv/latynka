const BundledTranslitTables = require('../../src/js/bundled_tables')
    , Transliterator = require('../../src/js/translit').Transliterator


describe('Melnyk', function() {

    beforeEach(function() {
        this.table = BundledTranslitTables['melnyk']
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

    it('converts ий pairs', function() {
        const converted = this.convert('ий иє иї ию ия')
        expect(converted).toBe('ý ýe ýi ýu ýa')
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
            const converted = this.convert('дь Дь')
            expect(converted).toBe('ď Ď')
        })

        it('converts зь', function() {
            const converted = this.convert('зь Зь')
            expect(converted).toBe('ź Ź')
        })

        it('converts ль', function() {
            const converted = this.convert('ль ЛЬ')
            expect(converted).toBe('ĺ Ĺ')
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
            const converted = this.convert('тє тю тя тьо')
            expect(converted).toBe('tie tiu tia tio')
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
        expect(converted).toBe('Ščastiam bješ žuk jich hlyciu v fon j gedź prič.')
    })

    it('converts pryklady', function() {
        const tests = [
            ['мова', 'mova'],
            ['барва', 'barva'],
            ['головний', 'holovný'],
            ['ґрунт', 'grunt'],
            ['життя', 'žyttia'],
            ['перший', 'peršý'],
            ['хто', 'chto'],
            ['де', 'de'],
            ['що', 'ščo'],
            ['зелений', 'zelený'],
            ['гарний', 'harný'],
            ['Київ', 'Kýiv'],
            ['кияни', 'kýany'],
            ['Грушевський', 'Hruševśký'],   // orig: Gruševśký
            ['чия', 'čýa'],
            ['мийка', 'mýka'],
            ['людина', 'liudyna'],
            ['ньому', 'niomu'],
            ['знання', 'znannia'],
            ['українська', 'ukrajinśka'],
            ['ледь', 'leď'],
            ['декілька', 'dekiĺka'],
            ['біленький', 'bileńký'],
            ['день', 'deń'],
            ['місяць', 'misiać'],
            ['скрізь', 'skriź'],
            ['третє', 'tretie'],
            ['люба', 'liuba'],
            ['натхнення', 'natchnennia'],
            ['єдність', 'jednisť'],
            ['яскравий', 'jaskravý'],
            ['нею', 'neju'],
        ]

        tests.forEach((t) => {
            const converted = this.convert(t[0])
            expect(converted).toBe(t[1])
        })
    })
})
