const Markdown = require('../src/js/markdown').Markdown


describe('Markdown', function() {

    class El {
        constructor(tag, children, text) {
            this.tag = tag
            this.children = [...(children || [])]
            this.text = text
        }
        appendChild(el) {
            this.children.push(el)
        }
        hasChildNodes() {
            return this.children.length > 0
        }
    }

    class Text extends El {
        constructor(value) {
            super('text', [], value)
        }
    }

    class StubDom {
        el(name, classes) {
            const el = new El(name)
            return el
        }

        text(value) {
            return new Text(value)
        }
    }

    class S {
        static el(tag, children, text) {
            return new El(tag, children, text)
        }

        static div(...children) {
            return this.el('div', children)
        }

        static p(...children) {
            return this.el('p', children)
        }

        static text(value) {
            return new Text(value)
        }
    }

    beforeEach(function() {
        this.md = new Markdown(new StubDom())
        this.render = (text) => {
            return this.md.render(text)
        }
    })

    it('renders empty document', function() {
        expect(this.render('')).toEqual(S.div())
    })


    describe('paragraph', function() {

        it('renders a line', function() {
            expect(this.render('Hello world')).toEqual(S.div(S.text('Hello world')))
        })

        it('renders line break', function() {
            expect(this.render('some\ntext')).toEqual(S.div( S.text('some'), S.el('br'), S.text('text') ))
        })

        it('renders a paragraph', function() {
            expect(this.render('some text\n\n')).toEqual(S.div(S.p(S.text('some text'))))
        })

        it('renders two paragraphs', function() {
            expect(this.render('some text\n\nmore text')).toEqual(S.div( S.p(S.text('some text')), S.p(S.text('more text')) ))
        })

        it('renders two paragraphs lf', function() {
            expect(this.render('some text\n\nmore text\n\n')).toEqual(S.div( S.p(S.text('some text')), S.p(S.text('more text')) ))
        })
    })


    describe('link', function() {

        it('renders a link', function() {
            const link = S.el('a', [S.text('some text')])
            link.href = 'some link'
            expect(this.render('[some text](some link)')).toEqual(S.div(link))
        })

        it('renders text + link', function() {
            const link = S.el('a', [S.text('some title')])
            link.href = 'some link'
            expect(this.render('prefix [some title](some link)')).toEqual(S.el('div', [S.text('prefix '), link]))
        })

        it('renders link + text', function() {
            const link = S.el('a', [S.text('some title')])
            link.href = 'some link'
            expect(this.render('[some title](some link) suffix')).toEqual(S.el('div', [link, S.text(' suffix')]))
        })

        it('renders link inside text', function() {
            const link = S.el('a', [S.text('some title')])
            link.href = 'some link'
            expect(this.render('prefix [some title](some link) suffix')).toEqual(
                S.el('div', [S.text('prefix '), link, S.text(' suffix')]))
        })

        it('renders incomplete link as text', function() {
            expect(this.render('[some text](some link')).toEqual(S.el('div', [S.text('[some text](some link')]))
        })

        it('renders invalid link as text', function() {
            expect(this.render('[some text] (some link)')).toEqual(S.el('div', [S.text('[some text] (some link)')]))
        })
    })
})
