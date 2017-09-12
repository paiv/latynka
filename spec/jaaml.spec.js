
const jaaml = require('../src/js/jaaml.js')


// Jaaml is a simplistic YAML tuned for this project:
// - document is a dictionary
// - keys and values are unquoted, terminate on new line
// - extra space is ignored
// - escape sequences: \\ \t \' \" \: \xFF \uFFFF
// - key: value
// - key:
//     key: value


describe('jaaml', function() {

    // fit('xxx', function() {
    //     this.parse_string = (text, ending) => {
    //         const parser = new jaaml.JaamlParser()
    //         return parser.parse_string(text, ending)
    //     }
    //
    //     const s = jaaml.parse("\\u02bc")
    //     expect(s).toBe('\u02bc')
    //
    //     const parsed = jaaml.parse("': \\u02bc")
    //     expect(parsed).toEqual({'\'': '\u02bc'})
    // })

    describe('parser', function() {

        describe('empty', function() {

            it('parses empty document', function() {
                const parsed = jaaml.parse('')
                expect(parsed).toEqual({})
            })

            it('parses empty space document', function() {
                const parsed = jaaml.parse('    ')
                expect(parsed).toEqual({})
            })

            it('parses more space document', function() {
                const parsed = jaaml.parse('      \n  \n')
                expect(parsed).toEqual({})
            })

            it('error for undefined', function() {
                expect(() => {
                    jaaml.parse()
                }).toThrow()
            })

            it('error for null', function() {
                expect(() => {
                    jaaml.parse(null)
                }).toThrow()
            })
        })

        describe('string', function() {

            beforeEach(function() {
                this.parse_string = (text, ending) => {
                    const parser = new jaaml.JaamlParser()
                    return parser.parse_string(text, ending)
                }
            })

            describe('unquoted', function() {

                it('parses empty', function() {
                    const parsed = this.parse_string('')
                    expect(parsed).toBe('')
                })

                it('parses a sentence', function() {
                    const parsed = this.parse_string('some text')
                    expect(parsed).toBe('some text')
                })

                it('parses up to ending char', function() {
                    const parsed = this.parse_string('someZtext', ['Z'])
                    expect(parsed).toBe('some')
                })

                it('parses escaped backslash', function() {
                    const parsed = this.parse_string('some \\\\ text')
                    expect(parsed).toBe('some \\ text')
                })

                it('parses escaped quote', function() {
                    const parsed = this.parse_string('some \\\' text')
                    expect(JSON.stringify(parsed)).toBe(JSON.stringify('some \' text'))
                })

                it('parses escaped dquote', function() {
                    const parsed = this.parse_string('some \\" text')
                    expect(JSON.stringify(parsed)).toBe(JSON.stringify('some " text'))
                })

                it('parses escaped tab', function() {
                    const parsed = this.parse_string('some \\t text')
                    expect(JSON.stringify(parsed)).toBe(JSON.stringify('some \t text'))
                })

                it('parses unescaped colon', function() {
                    const parsed = this.parse_string('some : text')
                    expect(JSON.stringify(parsed)).toBe(JSON.stringify('some : text'))
                })

                it('parses escaped colon', function() {
                    const parsed = this.parse_string('some \\: text')
                    expect(JSON.stringify(parsed)).toBe(JSON.stringify('some : text'))
                })

                it('parses escaped hex', function() {
                    const parsed = this.parse_string('some \\xAF \\x0F text')
                    expect(JSON.stringify(parsed)).toBe(JSON.stringify('some \xaf \x0f text'))
                })

                it('error on invalid escaped hex', function() {
                    expect(() => {
                        this.parse_string('some \\xAX text')
                    }).toThrow()
                })

                it('parses escaped unicode', function() {
                    const parsed = this.parse_string('some \\u1ee7 \\u02bc text')
                    expect(JSON.stringify(parsed)).toBe(JSON.stringify('some \u1ee7 \u02bc text'))
                })

                it('error on invalid escaped unicode', function() {
                    expect(() => {
                        this.parse_string('some \\uBeeX text')
                    }).toThrow()
                })
            })

        })

        describe('dict', function() {

            describe('flat', function() {

                it('parses simple object', function() {
                    const parsed = jaaml.parse('a:')
                    expect(parsed).toEqual({a:null})
                })

                it('parses simple object with extra space', function() {
                    const parsed = jaaml.parse('a:\n  \n')
                    expect(parsed).toEqual({a:null})
                })

                it('parses sentence key', function() {
                    const parsed = jaaml.parse('some key:')
                    expect(parsed).toEqual({'some key':null})
                })

                it('parses simple key-value object', function() {
                    const parsed = jaaml.parse('some:text')
                    expect(parsed).toEqual({some:'text'})
                })

                it('parses value with colon', function() {
                    const parsed = jaaml.parse('some:text:')
                    expect(parsed).toEqual({some:'text:'})
                })

                it('parses 3-key object', function() {
                    const parsed = jaaml.parse('a:b\nc:d\ne:f')
                    expect(parsed).toEqual({a:'b', c:'d', e:'f'})
                })

                it('ignores extra space between keys', function() {
                    const parsed = jaaml.parse('a:b\n   \nc:d\n\t\t\ne:f')
                    expect(parsed).toEqual({a:'b', c:'d', e:'f'})
                })

                it('infers null value', function() {
                    const parsed = jaaml.parse('a:\nb:c')
                    expect(parsed).toEqual({a:null, b:'c'})
                })

                it('ignores extra space after key', function() {
                    const parsed = jaaml.parse('a :b')
                    expect(parsed).toEqual({a:'b'})
                })

                it('ignores extra space before value', function() {
                    const parsed = jaaml.parse('a: b')
                    expect(parsed).toEqual({a:'b'})
                })

                it('ignores more space before value', function() {
                    const parsed = jaaml.parse('a:  \t   b')
                    expect(parsed).toEqual({a:'b'})
                })

                it('ignores extra space after value', function() {
                    const parsed = jaaml.parse('a:b ')
                    expect(parsed).toEqual({a:'b'})
                })

                it('ignores more space after value', function() {
                    const parsed = jaaml.parse('a:b  \t  ')
                    expect(parsed).toEqual({a:'b'})
                })
            })

            describe('nested', function() {

                it('parses simple object', function() {
                    const parsed = jaaml.parse('a:\n b:c')
                    expect(parsed).toEqual({a:{b:'c'}})
                })

                it('error on short indent', function() {
                    expect(() => {
                        jaaml.parse(' a:\nb:c')
                    }).toThrow()
                })

                it('parses ladder indent', function() {
                    const parsed = jaaml.parse(`
a:
 b:
  c:
   d:e
   f:g
  h:i
 j:k
l:m
`)
                    expect(parsed).toEqual({a:{b:{c:{d:'e', f:'g'}, h:'i'}, j:'k'}, l:'m'})
                })
            })

        })
    })


    describe('generator', function() {

        it('prints empty document', function() {
            const text = jaaml.stringify({})
            expect(text).toBe('')
        })

        it('prints empty document for undefined', function() {
            const text = jaaml.stringify(undefined)
            expect(text).toBe('')
        })

        it('prints empty document for null', function() {
            const text = jaaml.stringify(null)
            expect(text).toBe('')
        })

        it('error for array', function() {
            expect(() => {
                jaaml.stringify([])
            }).toThrow()
        })

        it('prints simple object', function() {
            const text = jaaml.stringify({a:null})
            expect(JSON.stringify(text)).toBe(JSON.stringify('a:'))
        })

        it('prints key-value object', function() {
            const text = jaaml.stringify({a:'b',c:'d'})
            expect(JSON.stringify(text)).toBe(JSON.stringify('a: b\nc: d'))
        })

        it('escapes key', function() {
            const text = jaaml.stringify({'a\\\t\'":\x1F\u0300':null})
            expect(JSON.stringify(text)).toBe(JSON.stringify('a\\\\\\t\'"\\:\\x1f\\u0300:'))
        })

        it('escapes value', function() {
            const text = jaaml.stringify({a:'b\\\t\'":\x1F\u0300'})
            expect(JSON.stringify(text)).toBe(JSON.stringify('a: b\\\\\\t\'":\\x1f\\u0300'))
        })

        it('prints deep object', function() {
            const text = jaaml.stringify({a:{b:{c:{d:'e', f:'g'}, h:'i'}, j:'k'}, l:'m'})
            expect(JSON.stringify(text)).toBe(JSON.stringify(`a:
  b:
    c:
      d: e
      f: g
    h: i
  j: k
l: m`))
        })
    })
})
