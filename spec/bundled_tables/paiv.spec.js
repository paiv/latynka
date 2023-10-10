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
        expect(converted).toBe('ğ Ğ g G x X')
    })

    it('converts шщ chars', function() {
        const converted = this.convert('ш Ш щ Щ шч')
        expect(converted).toBe('š Š šč Šč š\'č')
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

        it('converts гь char', function() {
            const converted = this.convert('гь Гь гє гю гя')
            expect(converted).toBe('ǵ Ǵ ǵe ǵu ǵa')
        })

        it('converts ґь char', function() {
            const converted = this.convert('ґь Ґь ґє ґю ґя')
            expect(converted).toBe('ǵ Ǵ ǵe ǵu ǵa')
        })

        it('converts дь char', function() {
            const converted = this.convert('дь Дь дє дю дя')
            expect(converted).toBe('d\u0301 D\u0301 d\u0301e d\u0301u d\u0301a')
        })

        it('converts жь char', function() {
            const converted = this.convert('жь Жь жє жю жя')
            expect(converted).toBe('ž Ž že žu ža')
        })

        it('converts зь char', function() {
            const converted = this.convert('зь Зь зє зю зя')
            expect(converted).toBe('ź Ź źe źu źa')
        })

        it('converts кь char', function() {
            const converted = this.convert('кь Кь кє кю кя')
            expect(converted).toBe('ḱ Ḱ ḱe ḱu ḱa')
        })

        it('converts ль char', function() {
            const converted = this.convert('ль ЛЬ лє лю ля')
            expect(converted).toBe('ĺ Ĺ ĺe ĺu ĺa')
        })

        it('converts мь char', function() {
            const converted = this.convert('мь Мь мє мю мя')
            expect(converted).toBe('ḿ Ḿ ḿe ḿu ḿa')
        })

        it('converts нь char', function() {
            const converted = this.convert('нь Нь нє ню ня')
            expect(converted).toBe('ń Ń ńe ńu ńa')
        })

        it('converts пь char', function() {
            const converted = this.convert('пь Пь пє пю пя')
            expect(converted).toBe('ṕ Ṕ ṕe ṕu ṕa')
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
            expect(converted).toBe('t\u0301 T\u0301 t\u0301e t\u0301u t\u0301a')
        })

        it('converts ться ending', function() {
            const converted = this.convert('ться')
            expect(converted).toBe('tśa')
        })

        it('converts ць char', function() {
            const converted = this.convert('ць Ць цє цю ця')
            expect(converted).toBe('ć Ć će ću ća')
        })

        it('converts чь char', function() {
            const converted = this.convert('чь Чь чє чю чя')
            expect(converted).toBe('č Č če ču ča')
        })
        
        it('converts шчь combo', function() {
            const converted = this.convert('шчь шчє шчю шчя')
            expect(converted).toBe("š'č š'če š'ču š'ča")
        })

        it('converts шь char', function() {
            const converted = this.convert('шь Шь шє шю шя')
            expect(converted).toBe('š Š še šu ša')
        })

        it('converts щь char', function() {
            const converted = this.convert('щь Щь щє щю щя')
            expect(converted).toBe('šč Šč šče šču šča')
        })
    })

    describe('єюяї', function() {

        it('converts consonant-єюя', function() {
            const converted = this.convert('тє тю тя тї')
            expect(converted).toBe('t\u0301e t\u0301u t\u0301a tji')
        })

        it('converts word start єюяї', function() {
            const converted = this.convert('є ю я ї')
            expect(converted).toBe('je ju ja ï')
        })

        it('converts vowel-єюяї', function() {
            const converted = this.convert('ає аю ая аї')
            expect(converted).toBe('aje aju aja aï')
        })

        it('converts apos-єюяї', function() {
            const converted = this.convert("'є 'ю 'я 'ї")
            expect(converted).toBe('je ju ja ji')
        })

        it('converts ь-аеуї', function() {
            const converted = this.convert("тьа тье тьу тьї")
            expect(converted).toBe("t\u0301'a t\u0301'e t\u0301'u t\u0301ji")
        })

        describe('borrowed', function() {

            it('converts й-єюяї', function() {
                const converted = this.convert('йє йю йя йї')
                expect(converted).toBe('jje jju jja jji')
            })

            it('converts й-аеуі', function() {
                const converted = this.convert('йа йе йу йі')
                expect(converted).toBe("j'a j'e j'u j'i")
            })
        })
    })

    it('converts pangram', function() {
        const converted = this.convert('Щастям б\'єш жук їх глицю в фон й ґедзь пріч.')
        expect(converted).toBe('Ščast́am bješ žuk ïx ğlyću v fon j gedź prič.')
    })
})
