const Transliterator = require('../../src/js/translit').Transliterator
    , bundled_table = require('../../src/data/bundled_tables/etypical.json')


describe('Etypical', function() {

    beforeEach(function() {
        this.translit = new Transliterator(bundled_table.rules)
        this.convert = (text) => this.translit.convert(text)
    })

    it('converts common chars', function() {
        const converted = this.convert('абвдеклмнопрстуф')
        expect(converted).toBe('abwdeklmnoprstuf')
    })

    it('converts гґх chars', function() {
        const converted = this.convert('г ґ х')
        expect(converted).toBe('ğ g ch')
    })

    it('converts жз chars', function() {
        const converted = this.convert('ж з')
        expect(converted).toBe('ż z')
    })

    it('converts цч chars', function() {
        const converted = this.convert('ц ч')
        expect(converted).toBe('c cz')
    })

    it('converts шщ chars', function() {
        const converted = this.convert('ш щ')
        expect(converted).toBe('sz szcz')
    })

    it('converts ь chars', function() {
        const converted = this.convert('вь гь ґь зь кь ль мь нь пь рь сь ць')
        expect(converted).toBe('ẃ ǵ ǵ ź ḱ ĺ ḿ ń ṕ ŕ ś ć')
    })

    it('discards ь chars', function() {
        const converted = this.convert('жь чь шь щь ться')
        expect(converted).toBe('ż cz sz szcz tsia')
    })

    it('converts єюя chars', function() {
        const converted = this.convert('є ю я')
        expect(converted).toBe('je ju ja')
    })

    it('converts єюя chars after cons', function() {
        const converted = this.convert('нє ню ня')
        expect(converted).toBe('nie niu nia')
    })

    it('converts єюя chars after жчшщ', function() {
        const converted = this.convert('жє жю жя чє чю чя шє шю шя щє щю щя')
        expect(converted).toBe('że żu ża cze czu cza sze szu sza szcze szczu szcza')
    })

    it('converts ьо after cons', function() {
        const converted = this.convert('дьо зьо льо мьо ньо пьо рьо сьо тьо цьо')
        expect(converted).toBe('dio zio lio mio nio pio rio sio tio cio')
    })

    it('converts ьо after cons uncommon', function() {
        const converted = this.convert('бьо вьо гьо ґьо жьо фьо хьо чьо шьо щьо')
        expect(converted).toBe('bio wio ğio gio żo fio chio czo szo szczo')
    })

    it('converts ийії chars', function() {
        const converted = this.convert('и і ї й')
        expect(converted).toBe('y i ji j')
    })

    it('converts йа йе йі йу', function() {
        const converted = this.convert('йа йе йі йу')
        expect(converted).toBe('j\'a j\'e j\'i j\'u')
    })

    it('converts йє йю йя', function() {
        const converted = this.convert('йє йю йя')
        expect(converted).toBe('jje jju jja')
    })

    it('converts ьа ье ьі ьу', function() {
        const converted = this.convert('вьа вье вьі вьу')
        expect(converted).toBe('ẃ\'a ẃ\'e ẃ\'i ẃ\'u')
    })

    it('converts apos', function() {
        const converted = this.convert('в\' м\'я')
        expect(converted).toBe('w mja')
    })

    it('adds hard apos', function() {
        const tests = [
            ['сз', 's\'z'],
            ['цз', 'c\'z'],
            ['шч', 'sz\'cz'],
            ['шчь', 'sz\'cz'],
        ]

        tests.forEach((t) => {
            const converted = this.convert(t[0])
            expect(converted).toBe(t[1])
        })
    })

    it('converts pangram', function() {
        const converted = this.convert('Щастям б\'єш жук їх глицю в фон й ґедзь пріч.')
        expect(converted).toBe('Szczastiam bjesz żuk jich ğlyciu w fon j gedź pricz.')
    })

    it('converts pryklady', function() {
        const tests = [
            ['Григор\'єв', 'Ğryğorjew'],
            ['в\'юни', 'wjuny'],
            ['підйом', 'pidjom'],
        ]

        tests.forEach((t) => {
            const converted = this.convert(t[0])
            expect(converted).toBe(t[1])
        })
    })
})
