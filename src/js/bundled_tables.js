
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
                other: 'ie',
            },
            'ж': 'zh',
            'з': 'z',
            'и': 'y',
            'і': 'i',
            'ї': {
                start: 'yi',
                other: 'i',
            },
            'й': {
                start: 'y',
                other: 'i',
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
                other: 'iu',
            },
            'я': {
                start: 'ya',
                other: 'ia',
            },
            '\'': '',
            'зг': 'zgh',
        }
    },

    'abecadlo': {
        title: 'Abecadło Лозинського 1834',
        description: 'https://uk.wikipedia.org/wiki/%D0%90%D0%B1%D0%B5%D1%86%D0%B0%D0%B4%D0%BB%D0%BE',
        rules: {
            'а': 'a',
            'б': 'b',
            'в': 'w',
            'г': 'h',
            'ґ': 'g',
            'д': 'd',
            'дь': 'ď',
            'е': 'e',
            'є': {
                cons: 'ie',
                other: 'je',
            },
            'ж': 'ż',
            'з': 'z',
            'зь': 'ź',
            'и': 'y',
            'і': 'i',
            'ї': 'ji',
            'й': 'j',
            'к': 'k',
            'л': 'ł',
            'лє': 'le',
            'лі': 'li',
            'ль': 'l',
            'лю': 'lu',
            'ля': 'la',
            'ллє': 'lle',
            'ллі': 'lli',
            'лль': 'll',
            'ллю': 'llu',
            'лля': 'lla',
            'м': 'm',
            'н': 'n',
            'нь': 'ń',
            'о': 'o',
            'п': 'p',
            'р': 'r',
            'рь': 'ŕ',
            'с': 's',
            'сь': 'ś',
            'т': 't',
            'ть': 'ť',
            'у': 'u',
            'ф': 'f',
            'х': 'ch',
            'ц': 'c',
            'ць': 'ć',
            'ч': 'cz',
            'ш': 'sz',
            'щ': 'szcz',
            'ь': '',
            'ю': {
                cons: 'iu',
                other: 'ju',
            },
            'я': {
                cons: 'ia',
                other: 'ja',
            },
            '\'': '',
        }
    },

    'pseudo_jirecek': {
        title: 'Псевдо-Їречківка',
        description: 'https://uk.wikipedia.org/wiki/%D0%A3%D0%BA%D1%80%D0%B0%D1%97%D0%BD%D1%81%D1%8C%D0%BA%D0%B0_%D0%BB%D0%B0%D1%82%D0%B8%D0%BD%D0%BA%D0%B0',
        rules: {
            'а': 'a',
            'б': 'b',
            'в': 'v',
            'г': 'h',
            'ґ': 'g',
            'д': 'd',
            'дь': 'ď',
            'е': 'e',
            'є': {
                cons: 'ie',
                other: 'je',
            },
            'ж': 'ž',
            'з': 'z',
            'зь': 'ź',
            'и': 'y',
            'і': 'i',
            'ї': 'ji',
            'й': 'j',
            'к': 'k',
            'л': 'l',
            'ль': 'ľ',
            'м': 'm',
            'н': 'n',
            'нь': 'ń',
            'о': 'o',
            'п': 'p',
            'р': 'r',
            'рь': 'ŕ',
            'с': 's',
            'сь': 'ś',
            'т': 't',
            'ть': 'ť',
            'у': 'u',
            'ф': 'f',
            'х': 'ch',
            'ц': 'c',
            'ць': 'ć',
            'ч': 'č',
            'ш': 'š',
            'щ': 'šč',
            'ь': '',
            'ю': {
                cons: 'iu',
                other: 'ju',
            },
            'я': {
                cons: 'ia',
                other: 'ja',
            },
            '\'': '',
        }
    },

    'jirecek': {
        title: 'Їречківка 1859',
        description: 'http://latynka.tak.today/works/proekt-jirecheka/',
        rules: {
            'а': 'a',
            'б': 'b',
            'в': 'v',
            'г': 'h',
            'ґ': 'g',
            'д': 'd',
            'дє': 'ďe',
            'дь': 'ď',
            'дю': 'ďu',
            'дя': 'ďa',
            'е': 'e',
            'є': 'je',
            'ж': 'ž',
            'з': 'z',
            'зє': 'źe',
            'зь': 'ź',
            'зю': 'źu',
            'зя': 'źa',
            'и': 'y',
            'і': 'i',
            'ї': 'ji',
            'й': 'j',
            'к': 'k',
            'л': 'l',
            'лє': 'ľe',
            'ль': 'ľ',
            'лю': 'ľu',
            'ля': 'ľa',
            'м': 'm',
            'н': 'n',
            'нє': 'ńe',
            'нь': 'ń',
            'ню': 'ńu',
            'ня': 'ńa',
            'о': 'o',
            'п': 'p',
            'р': 'r',
            'рє': 'ŕe',
            'рь': 'ŕ',
            'рю': 'ŕu',
            'ря': 'ŕa',
            'с': 's',
            'сє': 'śe',
            'сь': 'ś',
            'сю': 'śu',
            'ся': 'śa',
            'т': 't',
            'тє': 'ťe',
            'ть': 'ť',
            'тю': 'ťu',
            'тя': 'ťa',
            'у': 'u',
            'ф': 'f',
            'х': 'ch',
            'ц': 'c',
            'цє': 'će',
            'ць': 'ć',
            'цю': 'ću',
            'ця': 'ća',
            'ч': 'č',
            'ш': 'š',
            'щ': 'šč',
            'ь': '',
            'ю': 'ju',
            'я': 'ja',
            '\'': '',
        }
    },

    'lucuk': {
        title: 'Лучуківка 2000',
        description: 'http://www.vntl.com/im/pdf/pravopys.pdf',
        rules: {
            'а': 'a',
            'б': 'b',
            'в': 'v',
            'г': 'h',
            'ґ': 'g',
            'д': 'd',
            'дє': 'ďe',
            'дь': 'ď',
            'дю': 'ďu',
            'дя': 'ďa',
            'е': 'e',
            'є': 'je',
            'ж': 'ž',
            'з': 'z',
            'зє': 'źe',
            'зь': 'ź',
            'зю': 'źu',
            'зя': 'źa',
            'и': 'y',
            'і': 'i',
            'ї': 'ji',
            'й': 'j',
            'к': 'k',
            'л': 'l',
            'лє': 'ľe',
            'ль': 'ľ',
            'лю': 'ľu',
            'ля': 'ľa',
            'м': 'm',
            'н': 'n',
            'нє': 'ńe',
            'нь': 'ń',
            'ню': 'ńu',
            'ня': 'ńa',
            'о': 'o',
            'п': 'p',
            'р': 'r',
            'рє': 'ŕe',
            'рь': 'ŕ',
            'рю': 'ŕu',
            'ря': 'ŕa',
            'с': 's',
            'сє': 'śe',
            'сь': 'ś',
            'сю': 'śu',
            'ся': 'śa',
            'т': 't',
            'тє': 'ťe',
            'ть': 'ť',
            'тю': 'ťu',
            'тя': 'ťa',
            'у': 'u',
            'ф': 'f',
            'х': 'x',
            'ц': 'c',
            'цє': 'će',
            'ць': 'ć',
            'цю': 'ću',
            'ця': 'ća',
            'ч': 'č',
            'ш': 'š',
            'щ': 'šč',
            'ь': '',
            'ю': 'ju',
            'я': 'ja',
            '\'': '',
        }
    },

    'melnyk': {
        title: 'Meĺnyk 2008',
        description: 'http://web.archive.org/web/20090901072239/http://www.latynka.com/pravopys/',
        rules: {
            'а': 'a',
            'б': 'b',
            'в': 'v',
            'г': 'h',
            'ґ': 'g',
            'д': 'd',
            'дь': 'ď',
            'дьо': 'dio',
            'е': 'e',
            'є': {
                cons: 'ie',
                other: 'je',
            },
            'ж': 'ž',
            'з': 'z',
            'зь': 'ź',
            'зьо': 'zio',
            'и': 'y',
            'ий': 'ý',
            'иє': 'ýe',
            'иї': 'ýi',
            'ию': 'ýu',
            'ия': 'ýa',
            'і': 'i',
            'ї': 'ji',
            'й': 'j',
            'к': 'k',
            'л': 'l',
            'ль': 'ĺ',
            'льо': 'lio',
            'м': 'm',
            'н': 'n',
            'нь': 'ń',
            'ньо': 'nio',
            'о': 'o',
            'п': 'p',
            'р': 'r',
            'рь': 'ŕ',
            'рьо': 'rio',
            'с': 's',
            'сь': 'ś',
            'сьо': 'sio',
            'т': 't',
            'ть': 'ť',
            'тьо': 'tio',
            'у': 'u',
            'ф': 'f',
            'х': 'ch',
            'ц': 'c',
            'ць': 'ć',
            'цьо': 'cio',
            'ч': 'č',
            'ш': 'š',
            'щ': 'šč',
            'ь': '',
            'ю': {
                cons: 'iu',
                other: 'ju',
            },
            'я': {
                cons: 'ia',
                other: 'ja',
            },
            '\'': '',
        }
    },

    'iso9_1995': {
        title: 'ISO 9:1995, GOST 7.79 System A',
        description: 'https://en.wikipedia.org/wiki/ISO_9',
        rules: {
            'а': 'a',
            'б': 'b',
            'в': 'v',
            'г': 'g',
            'ґ': 'g\u0300',
            'д': 'd',
            'е': 'e',
            'є': 'ê',
            'ж': 'ž',
            'з': 'z',
            'и': 'i',
            'і': 'ì',
            'ї': 'ï',
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
            'х': 'h',
            'ц': 'c',
            'ч': 'č',
            'ш': 'š',
            'щ': 'ŝ',
            'ь': '\u02B9',
            'ю': 'û',
            'я': 'â',
            '\'': '\u02BC',
        }
    },

    'gost779b': {
        title: 'GOST 7.79 System B',
        description: 'https://en.wikipedia.org/wiki/ISO_9',
        rules: {
            'а': 'a',
            'б': 'b',
            'в': 'v',
            'г': 'g',
            'ґ': 'g\u0300',
            'д': 'd',
            'е': 'e',
            'є': 'ye',
            'ж': 'zh',
            'з': 'z',
            'и': 'y\u0300',
            'і': 'i',
            'ї': 'yi',
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
            'ц': 'cz',
            'ці': 'ci',
            'ци': 'cy\u0300',
            'цє': 'cye',
            'цю': 'cyu',
            'ця': 'cya',
            'ч': 'ch',
            'ш': 'sh',
            'щ': 'shh',
            'ь': '\u0300',
            'ю': 'yu',
            'я': 'ya',
            '\'': '\'',
        }
    },

    'tkpn': {
        title: 'ТКПН Вакуленко 1994',
        description: 'http://linguistics.kspu.edu/webfm_send/945',
        rules: {
            'а': 'a',
            'б': 'b',
            'в': 'v',
            'г': 'gh',
            'ґ': 'g',
            'д': 'd',
            'е': 'e',
            'є': 'je',
            'ж': 'zh',
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
            'х': 'kh',
            'ц': 'c',
            'ч': 'ch',
            'ш': 'sh',
            'щ': 'shh',
            'ь': 'j',
            'ю': 'ju',
            'я': 'ja',
            '\'': '\'',
        }
    },

    'tkpn_diac': {
        title: 'ТКПН Вакуленко 1994 diac',
        description: 'http://linguistics.kspu.edu/webfm_send/945',
        rules: {
            'а': 'a',
            'б': 'b',
            'в': 'v',
            'г': 'ğ',
            'ґ': 'g',
            'д': 'd',
            'е': 'e',
            'є': 'ë',
            'ж': 'ž',
            'з': 'z',
            'и': 'y',
            'і': 'i',
            'ї': 'ï',
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
            'щ': 'ŝ',
            'ь': 'j',
            'ю': 'ü',
            'я': 'ä',
            '\'': '\'',
        }
    },
}


module.exports = BundledTranslitTables
