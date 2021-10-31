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
        expect(converted).toBe('h H g G x X')
    })

    it('converts шщ chars', function() {
        const converted = this.convert('ш Ш щ Щ')
        expect(converted).toBe('ṡ Ṡ ṡċ Ṡċ')
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
            expect(converted).toBe('ż Ż z')
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
            expect(converted).toBe('c C ċ Ċ')
        })
    })

    describe('soft', function() {

        it('converts дь char', function() {
            const converted = this.convert('дь Дь дє дю дя')
            expect(converted).toBe('ḍ Ḍ ḍe ḍu ḍa')
        })

        it('converts зь char', function() {
            const converted = this.convert('зь Зь зє зю зя')
            expect(converted).toBe('ẓ Ẓ ẓe ẓu ẓa')
        })

        it('converts ль char', function() {
            const converted = this.convert('ль ЛЬ лє лю ля')
            expect(converted).toBe('ḷ Ḷ ḷe ḷu ḷa')
        })

        it('converts нь char', function() {
            const converted = this.convert('нь Нь нє ню ня')
            expect(converted).toBe('ṇ Ṇ ṇe ṇu ṇa')
        })

        it('converts рь char', function() {
            const converted = this.convert('рь Рь рє рю ря')
            expect(converted).toBe('ṛ Ṛ ṛe ṛu ṛa')
        })

        it('converts сь char', function() {
            const converted = this.convert('сь Сь сє сю ся')
            expect(converted).toBe('ṣ Ṣ ṣe ṣu ṣa')
        })

        it('converts ть char', function() {
            const converted = this.convert('ть Ть тє тю тя')
            expect(converted).toBe('ṭ Ṭ ṭe ṭu ṭa')
        })

        it('converts ць char', function() {
            const converted = this.convert('ць Ць цє цю ця')
            expect(converted).toBe('c\u0323 C\u0323 c\u0323e c\u0323u c\u0323a')
        })

        describe('borrowed', function() {

            it('converts бь char', function() {
                const converted = this.convert('бь Бь бє бю бя')
                expect(converted).toBe('ḅ Ḅ ḅe ḅu ḅa')
            })

            it('converts вь char', function() {
                const converted = this.convert('вь Вь вє вю вя')
                expect(converted).toBe('ṿ Ṿ ṿe ṿu ṿa')
            })

            it('converts гь char', function() {
                const converted = this.convert('гь Гь гє гю гя')
                expect(converted).toBe('ḥ Ḥ ḥe ḥu ḥa')
            })

            it('converts ґь char', function() {
                const converted = this.convert('ґь Ґь ґє ґю ґя')
                expect(converted).toBe('g\u0323 G\u0323 g\u0323e g\u0323u g\u0323a')
            })

            it('converts кь char', function() {
                const converted = this.convert('кь Кь кє кю кя')
                expect(converted).toBe('ḳ Ḳ ḳe ḳu ḳa')
            })

            it('converts мь char', function() {
                const converted = this.convert('мь Мь мє мю мя')
                expect(converted).toBe('ṃ Ṃ ṃe ṃu ṃa')
            })
        })
    })

    describe('єюя', function() {

        it('converts consonant-єюя', function() {
            const converted = this.convert('тє тю тя')
            expect(converted).toBe('ṭe ṭu ṭa')
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
        expect(converted).toBe('Ṡċasṭam bjeṡ żuk ïx hlyc\u0323u v fon j gedẓ priċ.')
    })
})
