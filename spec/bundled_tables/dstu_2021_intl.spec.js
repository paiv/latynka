const Transliterator = require('../../src/js/translit').Transliterator
    , bundled_table = require('../../src/data/bundled_tables/dstu_2021_intl.json')


describe('ДСТУ 9112:2021, Система Б', function() {

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
        expect(converted).toBe('gh g kh')
    })

    it('converts жз chars', function() {
        const converted = this.convert('ж з')
        expect(converted).toBe('zh z')
    })

    it('converts цч chars', function() {
        const converted = this.convert('ц ч')
        expect(converted).toBe('c ch')
    })

    it('converts шщ chars', function() {
        const converted = this.convert('ш щ')
        expect(converted).toBe('sh shch')
    })

    it('converts ь chars', function() {
        const converted = this.convert('ь ль')
        expect(converted).toBe('hj lj')
    })

    it('converts єюя chars', function() {
        const converted = this.convert('є ю я')
        expect(converted).toBe('je ju ja')
    })

    it('converts ийії chars', function() {
        const converted = this.convert('и і ї й')
        expect(converted).toBe('y i ji j')
    })

    it('converts йа йе йі йу', function() {
        const converted = this.convert('йа йе йі йу')
        expect(converted).toBe('j\'a j\'e j\'i j\'u')
    })

    it('converts ьа ье ьі ьу', function() {
        const converted = this.convert('ьа ье ьі ьу')
        expect(converted).toBe('j\'a j\'e j\'i j\'u')
    })

    it('converts apos', function() {
        const converted = this.convert('\' м\'я')
        expect(converted).toBe('\' m\'ja')
    })

    it('adds hard apos', function() {
        const tests = [
            ['бй', 'b\'j'],
            ['вй', 'v\'j'],
            ['гй', 'gh\'j'],
            ['ґй', 'g\'j'],
            ['дй', 'd\'j'],
            ['жй', 'zh\'j'],
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
            ['хй', 'kh\'j'],
            ['цй', 'c\'j'],
            ['чй', 'ch\'j'],
            ['шй', 'sh\'j'],
            ['шч', 'sh\'ch'],
            ['щй', 'shch\'j'],
        ]

        tests.forEach((t) => {
            const converted = this.convert(t[0])
            expect(converted).toBe(t[1])
        })
    })

    it('converts pangram', function() {
        const converted = this.convert('Щастям б\'єш жук їх глицю в фон й ґедзь пріч.')
        expect(converted).toBe('Shchastjam b\'jesh zhuk jikh ghlycju v fon j gedzj prich.')
    })

    it('converts pryklady', function() {
        const tests = [
            ['Григор\'єв', 'Ghryghor\'jev'],
            ['в\'юни', 'v\'juny'],
            ['підйом', 'pid\'jom'],
        ]

        tests.forEach((t) => {
            const converted = this.convert(t[0])
            expect(converted).toBe(t[1])
        })
    })
})
