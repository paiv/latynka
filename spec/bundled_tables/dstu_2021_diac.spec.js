const Transliterator = require('../../src/js/translit').Transliterator
    , bundled_table = require('../../src/data/bundled_tables/dstu_2021_diac.json')


describe('ДСТУ 9112:2021, Система А', function() {

    beforeEach(function() {
        this.translit = new Transliterator(bundled_table.rules)
        this.convert = (text) => this.translit.convert(text)
    })

    it('converts common chars', function() {
        const converted = this.convert('абвдеклмнопрстуф')
        expect(converted).toBe('abvdeklmnoprstuf')
    })

    it('converts гґх chars', function() {
        const converted = this.convert('г ґ х')
        expect(converted).toBe('ğ g x')
    })

    it('converts жз chars', function() {
        const converted = this.convert('ж з')
        expect(converted).toBe('ž z')
    })

    it('converts цч chars', function() {
        const converted = this.convert('ц ч')
        expect(converted).toBe('c č')
    })

    it('converts шщ chars', function() {
        const converted = this.convert('ш щ')
        expect(converted).toBe('š ŝ')
    })

    it('converts ь chars', function() {
        const converted = this.convert('ь ль')
        expect(converted).toBe('ĵ lj')
    })

    it('converts єюя chars', function() {
        const converted = this.convert('є ю я')
        expect(converted).toBe('je ju ja')
    })

    it('converts ийії chars', function() {
        const converted = this.convert('и і ї й')
        expect(converted).toBe('y i ï j')
    })

    it('converts йа йе йу', function() {
        const converted = this.convert('йа йе йу лйа лйе лйу')
        expect(converted).toBe("j'a j'e j'u lj'a lj'e lj'u")
    })

    it('converts ьа ье ьу', function() {
        const converted = this.convert('ьа ье ьу льа лье льу')
        expect(converted).toBe("j'a j'e j'u lj'a lj'e lj'u")
    })

    it('converts apos', function() {
        const converted = this.convert('\' м\'я')
        expect(converted).toBe('\' m\'ja')
    })

    it('adds hard apos', function() {
        const tests = [
            ['бй', 'b\'j'],
            ['вй', 'v\'j'],
            ['гй', 'ğ\'j'],
            ['ґй', 'g\'j'],
            ['дй', 'd\'j'],
            ['жй', 'ž\'j'],
            ['зй', 'z\'j'],
            ['кй', 'k\'j'],
            ['лй', 'l\'j'],
            ['мй', 'm\'j'],
            ['нй', 'n\'j'],
            ['пй', 'p\'j'],
            ['рй', 'r\'j'],
            ['сй', 's\'j'],
            ['тй', 't\'j'],
            ['фй', 'f\'j'],
            ['хй', 'x\'j'],
            ['цй', 'c\'j'],
            ['чй', 'č\'j'],
            ['шй', 'š\'j'],
            ['щй', 'ŝ\'j'],
        ]

        tests.forEach((t) => {
            const converted = this.convert(t[0])
            expect(converted).toBe(t[1])
        })
    })

    it('converts pangram', function() {
        const converted = this.convert('Щастям б\'єш жук їх глицю в фон й ґедзь пріч.')
        expect(converted).toBe('Ŝastjam b\'ješ žuk ïx ğlycju v fon j gedzj prič.')
    })

    it('converts pryklady', function() {
        const tests = [
            ['Григор\'єв', 'Ğryğor\'jev'],
            ['в\'юни', 'v\'juny'],
            ['підйом', 'pid\'jom'],
        ]

        tests.forEach((t) => {
            const converted = this.convert(t[0])
            expect(converted).toBe(t[1])
        })
    })
})
