
const BundledTranslitTables = {

    'nova_latynka': {
        title: 'Nova Latynka',
        description: 'https://nova-latynka.livejournal.com/775.html',
        rules: {
            'а': 'a',
            'б': 'b',
            'в': 'v',
            'г': 'h',
            'ґ': 'g',
            'д': 'd',
            'е': 'e',
            'є': 'je',
            'ж': 'ž',
            'з': 'z',
            'и': 'y',
            'і': 'i',
            'ї': 'ji',
            'й': 'j',
            'к': 'k',
            'л': 'l',
            'м': 'm',
            'н': 'n',
            'о': 'o',
            'п': 'p',
            'р': 'r',
            'с': 's',
            'т': 't',
            'у': 'u',
            'ф': 'f',
            'х': 'x',
            'ц': 'c',
            'ч': 'č',
            'ш': 'š',
            'щ': 'šč',
            'ь': 'j',
            'ю': 'ju',
            'я': 'ja',
        }
    },

    'nova_latynka_alt': {
        title: 'Nova Latynka alt',
        description: 'https://nova-latynka.livejournal.com/775.html',
        rules: {
            'а': 'a',
            'б': 'b',
            'в': 'v',
            'г': 'h',
            'ґ': 'g',
            'д': 'd',
            'е': 'e',
            'є': 'je',
            'ж': 'z\u030C', // 'ž'
            'з': 'z',
            'и': 'y',
            'і': 'i',
            'ї': 'ji',
            'й': 'j',
            'к': 'k',
            'л': 'l',
            'м': 'm',
            'н': 'n',
            'о': 'o',
            'п': 'p',
            'р': 'r',
            'с': 's',
            'т': 't',
            'у': 'u',
            'ф': 'f',
            'х': 'x',
            'ц': 'c',
            'ч': 'c\u030C', // 'č'
            'ш': 's\u030C', // 'š'
            'щ': 's\u030Cc\u030C', // 'šč'
            'ь': 'j',
            'ю': 'ju',
            'я': 'ja',
        }
    },

    'kmu_2010': {
        title: 'Official КМУ 2010',
        description: 'http://zakon2.rada.gov.ua/laws/show/55-2010-%D0%BF',
        rules: {
            'а': 'a',
            'б': 'b',
            'в': 'v',
            'г': 'h',
            'ґ': 'g',
            'д': 'd',
            'е': 'e',
            'є': {
                start: 'ye',
                inner: 'ie',
            },
            'ж': 'zh',
            'з': 'z',
            'и': 'y',
            'і': 'i',
            'ї': {
                start: 'yi',
                inner: 'i',
            },
            'й': {
                start: 'y',
                inner: 'i',
            },
            'к': 'k',
            'л': 'l',
            'м': 'm',
            'н': 'n',
            'о': 'o',
            'п': 'p',
            'р': 'r',
            'с': 's',
            'т': 't',
            'у': 'u',
            'ф': 'f',
            'х': 'kh',
            'ц': 'ts',
            'ч': 'ch',
            'ш': 'sh',
            'щ': 'shch',
            'ь': '',
            'ю': {
                start: 'yu',
                inner: 'iu',
            },
            'я': {
                start: 'ya',
                inner: 'ia',
            },
            '\'': '',
            'зг': 'zgh',
        }
    },

}


module.exports = BundledTranslitTables
