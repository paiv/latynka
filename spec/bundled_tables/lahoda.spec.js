const Transliterator = require('../../src/js/translit').Transliterator
    , bundled_table = require('../../src/data/bundled_tables/lahoda.json')


describe('Lahoda 2008', function() {

    beforeEach(function() {
        this.translit = new Transliterator(bundled_table.rules)
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
            const converted = this.convert('дь Дь дє дю дя дьє дьйо дью дья')
            expect(converted).toBe('ď Ď ďe ďu ďa ďie ďio ďiu ďia')
        })

        it('converts зь', function() {
            const converted = this.convert('зь Зь зє зю зя зьє зьйо зью зья')
            expect(converted).toBe('ź Ź źe źu źa źie źio źiu źia')
        })

        it('converts ль', function() {
            const converted = this.convert('ль ЛЬ лє лю ля льє льйо лью лья')
            expect(converted).toBe('ľ Ľ ľe ľu ľa ľie ľio ľiu ľia')
        })

        it('converts нь', function() {
            const converted = this.convert('нь Нь нє ню ня ньє ньйо нью нья')
            expect(converted).toBe('ń Ń ńe ńu ńa ńie ńio ńiu ńia')
        })

        it('converts рь char', function() {
            const converted = this.convert('рь Рь рє рю ря')
            expect(converted).toBe('ŕ Ŕ ŕe ŕu ŕa')
        })

        it('converts сь char', function() {
            const converted = this.convert('сь Сь сє сю ся сьє сьйо сью сья')
            expect(converted).toBe('ś Ś śe śu śa śie śio śiu śia')
        })

        it('converts ть char', function() {
            const converted = this.convert('ть Ть тє тю тя тьє тьйо тью тья')
            expect(converted).toBe('ť Ť ťe ťu ťa ťie ťio ťiu ťia')
        })

        it('converts ць chars', function() {
            const converted = this.convert('ць Ць цє цю ця цьє цьйо цью цья')
            expect(converted).toBe('ć Ć će ću ća ćie ćio ćiu ćia')
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

    describe('special', function() {

        it('converts іа іе іу', function() {
            const converted = this.convert("іа іе іу")
            expect(converted).toBe('ía íe íu')
        })

        it('converts ий', function() {
            const converted = this.convert("ий")
            expect(converted).toBe('ý')
        })

        it('converts вв', function() {
            const converted = this.convert("вв")
            expect(converted).toBe('w')
        })

        it('converts р\'є', function() {
            const converted = this.convert("р\'є")
            expect(converted).toBe('rie')
        })

        it('converts рйо', function() {
            const converted = this.convert("рйо")
            expect(converted).toBe('rio')
        })
    })

    it('converts pangram', function() {
        const converted = this.convert('Щастям б\'єш жук їх глицю в фон й ґедзь пріч.')
        expect(converted).toBe('Ščasťam bješ žuk jich hlyću v fon j gedź prič.')
    })

    it('converts official testset', function() {
        const tests = [
            ['авіабаза', 'avíabaza'],
            ['ангел', 'anhel'],
            ['абсурд', 'absurd'],
            ['акцент', 'akcent'],
            ['балкон', 'balkon'],
            ['балон', 'balon'],
            ['бар’єра', 'bariera'],
            ['цукор', 'cukor'],
            ['церемонія', 'ceremonija'],
            ['цивілізація', 'cyvilizacija'],
            ['ця', 'ća'],
            ['одиниця', 'odynyća'],
            ['чай', 'čaj'],
            ['черешня', 'čerešńa'],
            ['добрий день', 'dobrý deń'],
            ['дякую', 'ďakuju'],
            ['Европа', 'Evropa'],
            ['елегантний', 'elehantný'],
            ['Запоріжжя', 'Zaporižžia'],
            ['зв’язок', 'zvjazok'],
            ['з’їсти', 'zjisty'],
            ['Франція', 'Francija'],
            ['Іван Франко', 'Ivan Franko'],
            ['ґрунт', 'grunt'],
            ['ґуля', 'guľa'], // orig: ґула
            ['організація', 'orhanizacija'],
            ['гумор', 'humor'],
            ['гардероб', 'harderob'],
            ['характер', 'charakter'],
            ['монархія', 'monarchija'],
            ['ідеал', 'ideal'],
            ['Ізраїль', 'Izrajiľ'],
            ['ідол', 'idol'],
            ['ім’я', 'imja'],
            ['свята', 'sviata'],
            ['Йорданія', 'Jordanija'],
            ['Юдаїзм', 'Judajizm'],
            ['кабінет', 'kabinet'],
            ['Канада', 'Kanada'],
            ['кар’єра', 'kariera'],
            ['компанія', 'kompanija'],
            ['комп’ютер', 'kompjuter'],
            ['кур’єр', 'kurier'],
            ['Лондон', 'London'],
            ['ліфт', 'lift'],
            ['людина', 'ľudyna'],
            ['льодовий', 'ľodový'],
            ['любов’ю', 'ľubovju'],
            ['медаль', 'medaľ'],
            ['механізм', 'mechanizm'],
            ['мільйон', 'miľion'],
            ['народний', 'narodný'],
            ['нація', 'nacija'],
            ['національний', 'nacionaľný'],
            ['намагання', 'namahanńa'],
            ['Ніобій', 'Niobij'],
            ['нотаріус', 'notaríus'],
            ['рельєф', 'reľief'],
            ['рівень', 'riveń'],
            ['обличчя', 'oblyččia'],
            ['обов’язок', 'obovjazok'],
            ['обов’язковий', 'obovjazkový'],
            ['опозиція', 'opozycija'],
            ['пікантний', 'pikantný'],
            ['премія', 'premija'],
            ['оратор', 'orator'],
            ['рація', 'racija'],
            ['темрява', 'temŕava'],
            ['уряд', 'uŕad'],
            ['рятувати', 'ŕatuvaty'],
            ['сальдо', 'saľdo'],
            ['сода', 'soda'],
            ['службовий', 'službový'],
            ['сьогодні', 'śohodni'],
            ['серйозний', 'seriozný'],
            ['народжуються', 'narodžujuťśa'],
            ['шампунь', 'šampuń'],
            ['Швеція', 'Švecija'],
            ['табу', 'tabu'],
            ['телеграма', 'telehrama'],
            ['телебачення', 'telebačenńa'],
            ['тяжко', 'ťažko'],
            ['тюльпан', 'ťuľpan'],
            ['Умань', 'Umań'],
            ['уважний', 'uvažný'],
            ['Ватикан', 'Vatykan'],
            ['вільно', 'viľno'],
            ['введи', 'wedy'],
            ['вважати', 'wažaty'],
            ['Ватикан', 'Vatykan'],
            ['індик', 'indyk'],
            ['національний', 'nacionaľný'],
            ['зелений', 'zelený'],
            ['зять', 'źať'],
            ['жовтень', 'žovteń'],
            ['жнива', 'žnyva'],
        ]

        tests.forEach((t) => {
            const converted = this.convert(t[0])
            expect(converted).toBe(t[1])
        })
    })
})
