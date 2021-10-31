const Transliterator = require('../../src/js/translit').Transliterator
    , bundled_table = require('../../src/data/bundled_tables/kolomyjec.json')


describe('Kolomyjec', function() {

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
        expect(converted).toBe('h H g G x X')
    })

    it('converts шщ chars', function() {
        const converted = this.convert('ш Ш щ Щ')
        expect(converted).toBe('ş Ş şç Şç')
    })

    it('converts иіїй chars', function() {
        const converted = this.convert('и і ї й')
        expect(converted).toBe('y i ji j')
    })

    describe('hard', function() {

        it('converts д char', function() {
            const converted = this.convert('д')
            expect(converted).toBe('d')
        })

        it('converts жз chars', function() {
            const converted = this.convert('ж Ж з')
            expect(converted).toBe('ȥ Ȥ z')
        })

        it('converts дж char', function() {
            const converted = this.convert('дж')
            expect(converted).toBe('ḑ')
        })

        it('converts дз char', function() {
            const converted = this.convert('дз')
            expect(converted).toBe('q')
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
            expect(converted).toBe('c C ç Ç')
        })
    })

    describe('soft', function() {

        it('converts дь char', function() {
            const converted = this.convert('дь Дь дє дю дя')
            expect(converted).toBe('d\u0301 D\u0301 d\u0301e d\u0301u d\u0301a')
        })

        it('converts ддь char', function() {
            const converted = this.convert('ддь ддє дді ддю ддя')
            expect(converted).toBe('d\u0301d\u0301 d\u0301d\u0301e d\u0301di d\u0301d\u0301u d\u0301d\u0301a')
        })

        it('converts зь char', function() {
            const converted = this.convert('зь Зь зє зю зя')
            expect(converted).toBe('ź Ź źe źu źa')
        })

        it('converts ззь char', function() {
            const converted = this.convert('ззь ззє ззі ззю ззя')
            expect(converted).toBe('źź źźe źzi źźu źźa')
        })

        it('converts ль char', function() {
            const converted = this.convert('ль ЛЬ лє лю ля')
            expect(converted).toBe('ĺ Ĺ ĺe ĺu ĺa')
        })

        it('converts лль char', function() {
            const converted = this.convert('лль ллє ллі ллю лля')
            expect(converted).toBe('ĺĺ ĺĺe ĺli ĺĺu ĺĺa')
        })

        it('converts нь char', function() {
            const converted = this.convert('нь Нь нє ню ня')
            expect(converted).toBe('ń Ń ńe ńu ńa')
        })

        it('converts ннь char', function() {
            const converted = this.convert('ннь ннє нні нню ння')
            expect(converted).toBe('ńń ńńe ńni ńńu ńńa')
        })

        it('converts рь char', function() {
            const converted = this.convert('рь Рь рє рю ря')
            expect(converted).toBe('ŕ Ŕ ŕe ŕu ŕa')
        })

        it('converts сь char', function() {
            const converted = this.convert('сь Сь сє сю ся')
            expect(converted).toBe('ś Ś śe śu śa')
        })

        it('converts ссь char', function() {
            const converted = this.convert('ссь ссє ссі ссю сся')
            expect(converted).toBe('śś śśe śsi śśu śśa')
        })

        it('converts ть char', function() {
            const converted = this.convert('ть Ть тє тю тя')
            expect(converted).toBe('t\u0301 T\u0301 t\u0301e t\u0301u t\u0301a')
        })

        it('converts тть char', function() {
            const converted = this.convert('тть ттє тті ттю ття')
            expect(converted).toBe('t\u0301t\u0301 t\u0301t\u0301e t\u0301ti t\u0301t\u0301u t\u0301t\u0301a')
        })

        it('converts ться ending', function() {
            const converted = this.convert('ться')
            expect(converted).toBe('ćća')
        })

        it('converts ць char', function() {
            const converted = this.convert('ць Ць цє цю ця')
            expect(converted).toBe('ć Ć će ću ća')
        })

        it('converts цць char', function() {
            const converted = this.convert('цць ццє цці ццю цця')
            expect(converted).toBe('ćć ćće ćci ćću ćća')
        })
    })

    describe('єюя', function() {

        it('converts consonant-єюя', function() {
            const converted = this.convert('тє тю тя')
            expect(converted).toBe('t\u0301e t\u0301u t\u0301a')
        })

        it('converts дж-єюя', function() {
            const converted = this.convert('джє джю джя')
            expect(converted).toBe('ḑe ḑu ḑa')
        })

        it('converts ж-єюя', function() {
            const converted = this.convert('жє жю жя')
            expect(converted).toBe('ȥe ȥu ȥa')
        })

        it('converts ч-єюя', function() {
            const converted = this.convert('чє чю чя')
            expect(converted).toBe('çe çu ça')
        })

        it('converts ш-єюя', function() {
            const converted = this.convert('шє шю шя')
            expect(converted).toBe('şe şu şa')
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

        describe('borrowed', function() {

            it('converts й-єюя', function() {
                const converted = this.convert('йє йю йя')
                expect(converted).toBe('jje jju jja')
            })
        })
    })

    it('converts pangram', function() {
        const converted = this.convert('Щастям б\'єш жук їх глицю в фон й ґедзь пріч.')
        expect(converted).toBe('Şçast́am bjeş ȥuk jix hlyću v fon j geq́ priç.')
    })
})
