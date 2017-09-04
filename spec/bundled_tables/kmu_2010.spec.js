const BundledTranslitTables = require('../../src/js/bundled_tables')
    , Transliterator = require('../../src/js/translit').Transliterator


describe('КМУ 2010', function() {

    beforeEach(function() {
        this.table = BundledTranslitTables['kmu_2010']
        this.translit = new Transliterator(this.table.rules)
        this.convert = (text) => this.translit.convert(text)
    })

    it('converts common chars', function() {
        const converted = this.convert('абвдезклмнопрстуф')
        expect(converted).toBe('abvdezklmnoprstuf')
    })

    it('converts гґх chars', function() {
        const converted = this.convert('г ґ х')
        expect(converted).toBe('h g kh')
    })

    it('converts жз chars', function() {
        const converted = this.convert('ж з')
        expect(converted).toBe('zh z')
    })

    it('converts зг special', function() {
        const converted = this.convert('зг гзг')
        expect(converted).toBe('zgh hzgh')
    })

    it('converts цч chars', function() {
        const converted = this.convert('ц ч')
        expect(converted).toBe('ts ch')
    })

    it('converts шщ chars', function() {
        const converted = this.convert('ш щ')
        expect(converted).toBe('sh shch')
    })

    it('converts ь chars', function() {
        const converted = this.convert('ь ль')
        expect(converted).toBe(' l')
    })


    describe('at word start', function() {

        it('converts єюя chars', function() {
            const converted = this.convert('є ю я')
            expect(converted).toBe('ye yu ya')
        })

        it('converts ийії chars', function() {
            const converted = this.convert('и й і ї')
            expect(converted).toBe('y y i yi')
        })
    })


    describe('inside word', function() {

        it('converts єюя chars', function() {
            const converted = this.convert('бє бю бя')
            expect(converted).toBe('bie biu bia')
        })

        it('converts ийії chars', function() {
            const converted = this.convert('би бй бі бї')
            expect(converted).toBe('by bi bi bi')
        })
    })


    it('converts pangram', function() {
        const converted = this.convert('Щастям б\'єш жук їх глицю в фон й ґедзь пріч.')
        expect(converted).toBe('Shchastiam biesh zhuk yikh hlytsiu v fon y gedz prich.')
    })

    it('converts official testset', function() {
        const tests = [
            ['Алушта', 'Alushta'],
            ['Андрій', 'Andrii'],
            ['Борщагівка', 'Borshchahivka'],
            ['Борисенко', 'Borysenko'],
            ['Вінниця', 'Vinnytsia'],
            ['Володимир', 'Volodymyr'],
            ['Гадяч', 'Hadiach'],
            ['Богдан', 'Bohdan'],
            ['Згурський', 'Zghurskyi'],
            ['Ґалаґан', 'Galagan'],
            ['Ґорґани', 'Gorgany'],
            ['Донецьк', 'Donetsk'],
            ['Дмитро', 'Dmytro'],
            ['Рівне', 'Rivne'],
            ['Олег', 'Oleh'],
            ['Есмань', 'Esman'],
            ['Єнакієве', 'Yenakiieve'],
            ['Гаєвич', 'Haievych'],
            ['Короп\'є', 'Koropie'],
            ['Житомир', 'Zhytomyr'],
            ['Жанна', 'Zhanna'],
            ['Жежелів', 'Zhezheliv'],
            ['Закарпаття', 'Zakarpattia'],
            ['Казимирчук', 'Kazymyrchuk'],
            ['Медвин', 'Medvyn'],
            ['Михайленко', 'Mykhailenko'],
            ['Іванків', 'Ivankiv'],
            ['Іващенко', 'Ivashchenko'],
            ['Їжакевич', 'Yizhakevych'],
            ['Кадиївка', 'Kadyivka'],
            ['Мар\'їне', 'Marine'],
            ['Йосипівка', 'Yosypivka'],
            ['Стрий', 'Stryi'],
            ['Олексій', 'Oleksii'],
            ['Київ', 'Kyiv'],
            ['Коваленко', 'Kovalenko'],
            ['Лебедин','Lebedyn'],
            ['Леонід','Leonid'],
            ['Миколаїв','Mykolaiv'],
            ['Маринич','Marynych'],
            ['Ніжин','Nizhyn'],
            ['Наталія','Nataliia'],
            ['Одеса','Odesa'],
            ['Онищенко','Onyshchenko'],
            ['Полтава','Poltava'],
            ['Петро','Petro'],
            ['Решетилівка','Reshetylivka'],
            ['Рибчинський','Rybchynskyi'],
            ['Суми','Sumy'],
            ['Соломія','Solomiia'],
            ['Тернопіль','Ternopil'],
            ['Троць','Trots'],
            ['Ужгород','Uzhhorod'],
            ['Уляна','Uliana'],
            ['Фастів','Fastiv'],
            ['Філіпчук','Filipchuk'],
            ['Харків','Kharkiv'],
            ['Христина','Khrystyna'],
            ['Біла Церква','Bila Tserkva'],
            ['Стеценко','Stetsenko'],
            ['Чернівці','Chernivtsi'],
            ['Шевченко','Shevchenko'],
            ['Шостка','Shostka'],
            ['Кишеньки','Kyshenky'],
            ['Щербухи','Shcherbukhy'],
            ['Гоща','Hoshcha'],
            ['Гаращенко','Harashchenko'],
            ['Юрій','Yurii'],
            ['Корюківка','Koriukivka'],
            ['Яготин','Yahotyn'],
            ['Ярошенко','Yaroshenko'],
            ['Костянтин','Kostiantyn'],
            ['Знам\'янка','Znamianka'],
            ['Феодосія','Feodosiia'],
        ]

        tests.forEach((t) => {
            const converted = this.convert(t[0])
            expect(converted).toBe(t[1])
        })
    })
})
