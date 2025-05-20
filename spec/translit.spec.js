
const Transliterator = require('../src/js/translit').Transliterator


describe('Transliterator', function() {

    beforeAll(function() {
        this.vowels = 'аеєиіїоуюя'.split('')
        const vow_stub = 'aeëyiïouüä'.split('')

        this.consonants = 'бвгґджзйклмнпрстфхцчшщ'.split('')
        const con_stub = 'bvhgdžzjklmnprstfxcčṡš'.split('')

        const vstub = {}
        this.vowels.forEach((x, i) => { vstub[x] = vow_stub[i] })
        this.vowel_stub = vstub

        const cstub = {}
        this.consonants.forEach((x, i) => { cstub[x] = con_stub[i] })
        this.cons_stub = cstub
    })


    beforeEach(function() {
        this.convert = (text) => {
            const translit = new Transliterator(this.rules)
            return translit.convert(text)
        }
    })


    describe('single char', function() {

        beforeEach(function() {
            this.rules = {
                'ґ': 'g',
                'є': {
                    other: 'je',
                },
                'ї': '',
                'я': null,
            }
        })

        it('converts ґ char', function() {
            const converted = this.convert('ґ')
            expect(converted).toBe('g')
        })

        it('converts є char', function() {
            const converted = this.convert('є')
            expect(converted).toBe('je')
        })

        it('converts a word', function() {
            const converted = this.convert('ґє')
            expect(converted).toBe('gje')
        })

        it('removes a char when empty', function() {
            const converted = this.convert('їґ')
            expect(converted).toBe('g')
        })

        it('removes a char when null', function() {
            const converted = this.convert('яґ')
            expect(converted).toBe('g')
        })

        it('preserves char not in rules', function() {
            const converted = this.convert('єк')
            expect(converted).toBe('jeк')
        })
    })


    describe('start rule', function() {

        beforeEach(function() {
            this.rules = {
                'ї': {
                    start: 'yi',
                    other: 'ji',
                },
                'їк': {
                    start: 'iq',
                    other: 'jiq',
                },
                'м': 'm',
                'к': 'k',
                'ґ': {
                    start: null,
                },
            }
        })

        describe('at word start', function() {

            it('converts ї char', function() {
                const converted = this.convert('ї їм їк')
                expect(converted).toBe('yi yim iq')
            })

            it('clears ґ char', function() {
                const converted = this.convert('ґ ґї ґїк')
                expect(converted).toBe(' ji jiq')
            })
        })

        describe('inside word', function() {
            it('converts ї char', function() {
                const converted = this.convert("кї к'ї")
                expect(converted).toBe("kji k'ji")
            })

            it('clears ґ char', function() {
                const converted = this.convert('кґ кґї')
                expect(converted).toBe('k kji')
            })
        })

        describe('after apos', function() {

            it('converts ї char', function() {
                const converted = this.convert("к'їк 'ї 'їк")
                expect(converted).toBe("k'jiq 'yi 'iq")
            })

            it('clears ґ char', function() {
                const converted = this.convert("к'ґї 'ґ 'ґї")
                expect(converted).toBe("k'ji ' 'ji")
            })
        })
    })


    describe('sequence', function() {

        beforeEach(function() {
            this.rules = {
                'єї': 'xxx',
                'єїк': 'zzz',
                'їк': 'yy',
                'к': 'k',
                'єїкєк': 'qqqq'
            }
        })

        it('converts єї', function() {
            const converted = this.convert('єї кєї')
            expect(converted).toBe('xxx kxxx')
        })

        it('converts їк', function() {
            const converted = this.convert('їк кїк')
            expect(converted).toBe('yy kyy')
        })

        it('priority for єїк', function() {
            const converted = this.convert('єїк єї')
            expect(converted).toBe('zzz xxx')
        })

        it('priority for longer', function() {
            const converted = this.convert('єїкєк кїкєїкєк')
            expect(converted).toBe('qqqq kyyqqqq')
        })
    })


    describe('cons rule', function() {

        beforeEach(function() {
            this.rules = Object.assign({},
                this.cons_stub,
                this.vowel_stub,
                {
                    'я': {
                        cons: 'ia',
                        other: 'ja',
                    },
                    'ял': {
                        cons: 'iaq',
                        other: 'jaq',
                    },
                    'ь': '_',
                    'ууу': {
                        cons: 'pppp',
                        other: 'ssss',
                    },
                }
            )
        })

        it('converts consontant-я pair', function() {
            this.consonants.forEach((x) => {
                const converted = this.convert(x + 'я')
                expect(converted).toBe(this.cons_stub[x] + 'ia')
            })
        })

        it('converts consontant-ял pair', function() {
            this.consonants.forEach((x) => {
                const converted = this.convert(x + 'ял')
                expect(converted).toBe(this.cons_stub[x] + 'iaq')
            })
        })

        it('converts vowel-я pair', function() {
            this.vowels.forEach((x) => {
                if (x !== 'я') {
                    const converted = this.convert(x + 'я')
                    expect(converted).toBe(this.vowel_stub[x] + 'ja')
                    const convert2 = this.convert(x + 'ял')
                    expect(convert2).toBe(this.vowel_stub[x] + 'jaq')
                }
            })
        })

        it('converts ья pair', function() {
            const converted = this.convert('ья мья')
            expect(converted).toBe('_ja m_ja')
        })

        it('converts apos-я', function() {
            const converted = this.convert("'я м'я")
            expect(converted).toBe("'ja m'ja")
        })

        it('converts consontant-ууу', function() {
            this.consonants.forEach((x) => {
                const converted = this.convert(x + 'ууу')
                expect(converted).toBe(this.cons_stub[x] + 'pppp')
            })
        })

        it('converts vowel-ууу', function() {
            this.vowels.forEach((x) => {
                if (x !== 'у') {
                    const vow = this.convert(x)
                    const converted = this.convert(x + 'ууу')
                    expect(converted).toBe(vow + 'ssss')
                }
            })
        })


        describe('empty', function() {
            beforeEach(function() {
                this.rules = Object.assign({},
                    this.cons_stub,
                    this.vowel_stub,
                    {
                        'я': {
                            cons: 'ia',
                            other: 'ja',
                        },
                        'ю': {
                            cons: null,
                        },
                    }
                )
            })

            it('clears ю after cons', function() {
                const converted = this.convert('кю')
                expect(converted).toBe('k')
            })

            it('clears ю after non-cons', function() {
                const converted = this.convert('яю')
                expect(converted).toBe('ja')
            })
        })
    })


    describe('casing', function() {

        beforeEach(function() {
            this.rules = {
                'ґ': 'g',
                'є': {
                    start: 'ye',
                    other: 'je',
                },
                'ю': {
                    cons: 'iu',
                    other: 'ju',
                },
                'їґ': 'qq',
                'її': 'xxx',
                'яюі': 'ppp',
                'ууу': 'ssss',
            }
        })

        it('preserves 1-1 case', function() {
            const converted = this.convert('Ґ ґ ҐґґҐ')
            expect(converted).toBe('G g GggG')
        })

        it('preserves 1-2 case', function() {
            const converted = this.convert('є ю ґє ґю Ґє Ґю Ґєґ Єґ Юґ')
            expect(converted).toBe('ye ju gje giu Gje Giu Gjeg Yeg Jug')
        })

        it('all caps 1-2 case', function() {
            const converted = this.convert('Є Ю ЄҐ ҐЄ ҐЮ ҐЄҐ ҐЮҐ')
            expect(converted).toBe('Ye Ju YeG GJe GIu GJeG GIuG')
        })

        it('silly 1-2 case', function() {
            const converted = this.convert('ґЄ ґєҐ ґЄҐ')
            expect(converted).toBe('gJe gjeG gJeG')
        })

        it('preserves 2-2 case', function() {
            const converted = this.convert('їґ Їґ Ґїґ ҐЇґ ґЇҐ ЇҐґ')
            expect(converted).toBe('qq Qq Gqq GQq gQq Qqg')
        })

        it('all caps 2-2 case', function() {
            const converted = this.convert('ЇҐ ҐЇҐ ҐЇҐҐ')
            expect(converted).toBe('Qq GQq GQqG')
        })

        it('silly 2-2 case', function() {
            const converted = this.convert('їҐ їҐґ')
            expect(converted).toBe('qQ qQg')
        })

        it('preserves 2-3 case', function() {
            const converted = this.convert('її Її ґЇї Ґїї')
            expect(converted).toBe('xxx Xxx gXxx Gxxx')
        })

        it('all caps 2-3 case', function() {
            const converted = this.convert('ЇЇ ҐЇЇ ЇЇҐ')
            expect(converted).toBe('Xxx GXxx XxxG')
        })

        it('silly 2-3 case', function() {
            const converted = this.convert('їЇ ҐїЇ ґїЇ')
            expect(converted).toBe('xxX GxxX gxxX')
        })

        it('preserves 3-3 case', function() {
            const converted = this.convert('яюі Яюі яЮі ЯЮі яюІ ЯюІ яЮІ ЯЮІ')
            expect(converted).toBe(        'ppp Ppp ppp Ppp ppP Ppp ppP Ppp')
        })

        it('preserves 3-4 case', function() {
            const converted = this.convert('ууу Ууу уУу УУу ууУ УуУ уУУ УУУ')
            expect(converted).toBe('ssss Ssss ssss Ssss sssS Ssss sssS Ssss')
        })
    })


    describe('apos', function() {

        beforeEach(function() {
            this.rules = Object.assign({},
                this.cons_stub,
                {
                    "'": 'g',
                    "в'": 'vq',
                }
            )
        })

        it('converts ascii 27', function() {
            const converted = this.convert("' к' 'к к'к в' кв' в'к кв'к")
            expect(converted).toBe('g kg gk kgk vq kvq vqk kvqk')
        })

        it('converts unicode 2019', function() {
            const converted = this.convert('\u2019 к\u2019 \u2019к к\u2019к в\u2019 кв\u2019 в\u2019к кв\u2019к')
            expect(converted).toBe('g kg gk kgk vq kvq vqk kvqk')
        })

        it('converts unicode 02BC', function() {
            const converted = this.convert('\u02BC к\u02BC \u02BCк к\u02BCк в\u02BC кв\u02BC в\u02BCк кв\u02BCк')
            expect(converted).toBe('g kg gk kgk vq kvq vqk kvqk')
        })
    })


    describe('apos erasure', function() {

        it('removes when empty', function() {
            this.rules = {"'": ''}
            const converted = this.convert("' \u2019 \u02BC")
            expect(converted).toBe('  ')
        })

        it('removes when null', function() {
            this.rules = {"'": null}
            const converted = this.convert("' \u2019 \u02BC")
            expect(converted).toBe('  ')
        })

        it('preserves when absent', function() {
            this.rules = {}
            const converted = this.convert("' \u2019 \u02BC")
            expect(converted).toBe("' \u2019 \u02BC")
        })
    })


    describe('unicode normalization', function() {

        beforeEach(function() {
            this.rules = {
                'ї': 'ö',
                'й': 'o\u0306',
            }
        })

        it('normalizes input', function() {
            const converted = this.convert("ї Ї і\u0308 І\u0308")
            expect(converted).toBe('ö Ö ö Ö')
        })

        it('normalizes output', function() {
            const converted = this.convert("й Й и\u0306 И\u0306")
            expect(converted).toBe('ŏ Ŏ ŏ Ŏ')
        })
    })
})
