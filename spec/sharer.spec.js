
const sharer = require('../src/js/sharer')
    , punycode = require('../src/js/punycode')


describe('Sharer', function() {

    describe('public endpoint', function() {

        it('makes url for empty table', function() {
            const link = sharer.makeShareLink({rules:{}})
            expect(link).toEqual('https://paiv.github.io/latynka/v1')
        })
    })


    describe('github quirks', function() {

        it('escapes hyphen', function() {
            const link = sharer.makeShareLink({rules:{'ї': ''}})

            expect(link).not.toContain('-')
        })
    })


    describe('encoder', function() {

        beforeEach(function() {
            this.encode = (rules) => {
                const obj = new sharer.Sharer('url')
                const link = obj.makeShareLink({rules: rules})
                return link.substring(0,6) + punycode.decode(decodeURIComponent(link.substring(6)))
            }
        })

        it('encodes empty table', function() {
            const link = this.encode({})
            expect(link).toBe('url')
        })

        it('encodes apos null', function() {
            const link = this.encode({'\'':null})
            expect(link).toBe('url?r=1\'0')
        })

        it('encodes apos empty', function() {
            const link = this.encode({'\'':''})
            expect(link).toBe('url?r=1\'0')
        })

        it('encodes apos apos', function() {
            const link = this.encode({'\'':'\''})
            expect(link).toBe('url?r=1\'1\'')
        })

        it('encodes "а" key', function() {
            const link = this.encode({'а':'w'})
            expect(link).toBe('url?r=1а1w')
        })

        it('encodes value', function() {
            const link = this.encode({'а':'ŵ'})
            expect(link).toBe('url?r=1а1ŵ')
        })

        it('encodes "б,в,г" keys', function() {
            const link = this.encode({'б':'b', 'в':'v', 'г':'h'})
            expect(link).toBe('url?r=1б1b1в1v1г1h')
        })

        it('encodes start rule', function() {
            const link = this.encode({'а':{start:'w', other:'q'}})
            expect(link).toBe('url?r=1а71w91q')
        })

        it('encodes cons rule', function() {
            const link = this.encode({'а':{cons:'w', other:'q'}})
            expect(link).toBe('url?r=1а81w91q')
        })

        it('encodes max lengths', function() {
            const link = this.encode({'ааааа':'ŵŵŵŵŵ'})
            expect(link).toBe('url?r=5ааааа5ŵŵŵŵŵ')
        })

        it('error on key exceeding max length', function() {
            expect(() => {
                this.encode({'аааааа':''})
            }).toThrow()
        })

        it('error on value exceeding max length', function() {
            expect(() => {
                this.encode({'а':'ŵŵŵŵŵŵ'})
            }).toThrow()
        })
    })


    describe('decoder', function() {

        beforeEach(function() {
            this.decode = (link) => {
                const obj = new sharer.Sharer('http://url/')
                const table = obj.decodeShareLink('http://' + link.substring(0, 6) + encodeURIComponent(punycode.encode(link.substring(6))))
                return table.rules
            }
        })

        it('decodes empty', function() {
            const rules = this.decode('url')
            expect(rules).toEqual({})
        })

        it('decodes apos empty', function() {
            const rules = this.decode('url?r=1\'0')
            expect(rules).toEqual({'\'':''})
        })

        it('decodes "а" key', function() {
            const rules = this.decode('url?r=1а1w')
            expect(rules).toEqual({'а':'w'})
        })

        it('decodes value', function() {
            const rules = this.decode('url?r=1а1ŵ')
            expect(rules).toEqual({'а':'ŵ'})
        })

        it('decodes "б,в,г" keys', function() {
            const rules = this.decode('url?r=1б1b1в1v1г1h')
            expect(rules).toEqual({'б':'b', 'в':'v', 'г':'h'})
        })

        it('decodes start rule', function() {
            const rules = this.decode('url?r=1а71w91q')
            expect(rules).toEqual({'а':{start:'w', other:'q'}})
        })

        it('decodes cons rule', function() {
            const rules = this.decode('url?r=1а81w91q')
            expect(rules).toEqual({'а':{cons:'w', other:'q'}})
        })

        it('decodes complex table', function() {
            const rules = this.decode('url?r=1\'01а81w91q1б1b')
            expect(rules).toEqual({'а':{cons:'w', other:'q'}, 'б': 'b', '\'': ''})
        })


        describe('errors', function() {

            it('throws on non-canonical uri', function() {
                expect(() => {
                    this.decode('some')
                }).toThrow()
            })

            it('ignores unhandled query parameter', function() {
                const obj = new sharer.Sharer('http://url/')
                const a1w1 = encodeURIComponent(punycode.encode('1а1w'))
                const table = obj.decodeShareLink('http://url?r=' + a1w1 + '&some=something')
                expect(table.rules).toEqual({'а':'w'})
            })
        })
    })


    describe('codec', function() {

        it('roundtrip', function() {
            const input = {rules: {'\'':'', 'а': {'start': 'w', 'other': 'q'}, 'б': 'b'}}
            const link = sharer.makeShareLink(input)
            const decoded = sharer.decodeShareLink(link)
            expect(decoded.rules).toEqual(input.rules)
        })
    })
})
