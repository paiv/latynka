
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
                'к': 'k',
                'ґ': {
                    start: null,
                },
            }
        })

        describe('at word start', function() {

            it('converts ї char', function() {
                const converted = this.convert('ї їк')
                expect(converted).toBe('yi yik')
            })

            it('clears ґ char', function() {
                const converted = this.convert('ґ ґї')
                expect(converted).toBe(' ji')
            })
        })

        describe('inside word', function() {
            it('converts ї char', function() {
                const converted = this.convert('кї к\'ї')
                expect(converted).toBe('kji k\'ji')
            })

            it('clears ґ char', function() {
                const converted = this.convert('кґ кґї')
                expect(converted).toBe('k kji')
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
                    'ь': '_',
                }
            )
        })

        it('converts consontant-я pair', function() {
            this.consonants.forEach((x) => {
                const converted = this.convert(x + 'я')
                expect(converted).toBe(this.cons_stub[x] + 'ia')
            })
        })

        it('converts vowel-я pair', function() {
            this.vowels.forEach((x) => {
                if (x !== 'я') {
                    const converted = this.convert(x + 'я')
                    expect(converted).toBe(this.vowel_stub[x] + 'ja')
                }
            })
        })

        it('converts ья pair', function() {
            const converted = this.convert('ья мья')
            expect(converted).toBe('_ja m_ja')
        })

        it('converts apos-я', function() {
            const converted = this.convert('\'я м\'я')
            expect(converted).toBe('\'ja m\'ja')
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
                    other: 'je',
                },
                'їґ': 'qq',
                'єї': 'xxx',
            }
        })

        // TODO: preserve all-caps

        it('preserves 1-1 case', function() {
            const converted = this.convert('Ґ ґ ҐґґҐ')
            expect(converted).toBe('G g GggG')
        })

        it('preserves 1-2 case', function() {
            const converted = this.convert('є ґє Ґє')
            expect(converted).toBe('je gje Gje')
        })

        it('all caps 1-2 case', function() {
            const converted = this.convert('Є ҐЄ')
            expect(converted).toBe('Je GJe')
        })

        it('silly 1-2 case', function() {
            const converted = this.convert('ґЄ')
            expect(converted).toBe('gJe')
        })

        it('preserves 2-2 case', function() {
            const converted = this.convert('їґ Їґ')
            expect(converted).toBe('qq Qq')
        })

        it('all caps 2-2 case', function() {
            const converted = this.convert('ЇҐ ҐЇҐ')
            expect(converted).toBe('Qq GQq')
        })

        it('silly 2-2 case', function() {
            const converted = this.convert('їҐ')
            expect(converted).toBe('qQ')
        })

        it('preserves 2-3 case', function() {
            const converted = this.convert('єї Єї')
            expect(converted).toBe('xxx Xxx')
        })

        it('all caps 2-3 case', function() {
            const converted = this.convert('ЄЇ')
            expect(converted).toBe('Xxx')
        })

        it('silly 2-3 case', function() {
            const converted = this.convert('єЇ')
            expect(converted).toBe('xxX')
        })
    })


    describe('apos', function() {

        beforeEach(function() {
            this.rules = Object.assign({},
                this.cons_stub,
                {
                    '\'': 'g',
                }
            )
        })

        it('converts ascii 27', function() {
            const converted = this.convert('\' к\' \'к к\'к')
            expect(converted).toBe('g kg gk kgk')
        })

        it('converts unicode 2019', function() {
            const converted = this.convert('\u2019 k\u2019 \u2019k k\u2019k')
            expect(converted).toBe('g kg gk kgk')
        })

        it('converts unicode 02BC', function() {
            const converted = this.convert('\u02BC k\u02BC \u02BCk k\u02BCk')
            expect(converted).toBe('g kg gk kgk')
        })
    })

    describe('apos erasure', function() {

        it('removes when empty', function() {
            this.rules = {'\'': ''}
            const converted = this.convert('\'')
            expect(converted).toBe('')
        })

        it('removes when null', function() {
            this.rules = {'\'': null}
            const converted = this.convert('\'')
            expect(converted).toBe('')
        })

        it('preserves when absent', function() {
            this.rules = {}
            const converted = this.convert('\'')
            expect(converted).toBe('\'')
        })
    })
})
