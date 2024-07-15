(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (global){(function (){
/*! https://mths.be/punycode v1.4.1 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports &&
		!exports.nodeType && exports;
	var freeModule = typeof module == 'object' && module &&
		!module.nodeType && module;
	var freeGlobal = typeof global == 'object' && global;
	if (
		freeGlobal.global === freeGlobal ||
		freeGlobal.window === freeGlobal ||
		freeGlobal.self === freeGlobal
	) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw new RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		var result = [];
		while (length--) {
			result[length] = fn(array[length]);
		}
		return result;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings or email
	 * addresses.
	 * @private
	 * @param {String} domain The domain name or email address.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		var parts = string.split('@');
		var result = '';
		if (parts.length > 1) {
			// In email addresses, only the domain name should be punycoded. Leave
			// the local part (i.e. everything up to `@`) intact.
			result = parts[0] + '@';
			string = parts[1];
		}
		// Avoid `split(regex)` for IE8 compatibility. See #17.
		string = string.replace(regexSeparators, '\x2E');
		var labels = string.split('.');
		var encoded = map(labels, fn).join('.');
		return result + encoded;
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <https://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * https://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name or an email address
	 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
	 * it doesn't matter if you call it on a string that has already been
	 * converted to Unicode.
	 * @memberOf punycode
	 * @param {String} input The Punycoded domain name or email address to
	 * convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(input) {
		return mapDomain(input, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name or an email address to
	 * Punycode. Only the non-ASCII parts of the domain name will be converted,
	 * i.e. it doesn't matter if you call it with a domain that's already in
	 * ASCII.
	 * @memberOf punycode
	 * @param {String} input The domain name or email address to convert, as a
	 * Unicode string.
	 * @returns {String} The Punycode representation of the given domain name or
	 * email address.
	 */
	function toASCII(input) {
		return mapDomain(input, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.4.1',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <https://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define('punycode', function() {
			return punycode;
		});
	} else if (freeExports && freeModule) {
		if (module.exports == freeExports) {
			// in Node.js, io.js, or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else {
			// in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else {
		// in Rhino or a web browser
		root.punycode = punycode;
	}

}(this));

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(require,module,exports){

const i18n = require('./i18n')


module.exports = {
    i18n: i18n,
}

},{"./i18n":4}],3:[function(require,module,exports){

class DomBuilder {
    static el(name, classes) {
        const x = document.createElement(name)
        if (classes) classes.forEach((c) => x.classList.add(c))
        return x
    }

    static text(value) {
        return document.createTextNode(value)
    }

    static resetChildren(parent, child) {
        let last;
        while (last = parent.lastElementChild) {
            parent.removeChild(last)
        }
        if (child) {
            parent.appendChild(child)
        }
    }
}


module.exports = {
    DomBuilder,
}

},{}],4:[function(require,module,exports){

const messages = {
    en: {
        "rules_label_apostrophe": {
            "message": "apostrophe"
        },
        "rules_label_at_word_start": {
            "message": "at the beginning of a word"
        },
        "rules_label_after_consonants": {
            "message": "after consonants"
        },
        "extension_action_install": {
            "message": "Install browser extension"
        },
        "extension_action_import": {
            "message": "Import"
        },
        "extension_action_copy_to_clipboard": {
            "message": "Copy to clipboard"
        },
    },

    ru: {
        "rules_label_apostrophe": {
            "message": "апостроф"
        },
        "rules_label_at_word_start": {
            "message": "в начале слова"
        },
        "rules_label_after_consonants": {
            "message": "после согласных"
        },
        "extension_action_install": {
            "message": "Установить расширение для браузера"
        },
        "extension_action_import": {
            "message": "Импортировать"
        },
        "extension_action_copy_to_clipboard": {
            "message": "Копировать в буфер обмена"
        },
    },

    uk: {
        "rules_label_apostrophe": {
            "message": "апостроф"
        },
        "rules_label_at_word_start": {
            "message": "на початку слова"
        },
        "rules_label_after_consonants": {
            "message": "після приголосних"
        },
        "extension_action_install": {
            "message": "Встановити розширення до браузера"
        },
        "extension_action_import": {
            "message": "Зберегти"
        },
        "extension_action_copy_to_clipboard": {
            "message": "Скопіювати в буфер"
        },
    },
}


class Localizator {
    constructor() {
        const lang = (window.navigator || window.browser || window).language
        this.lang = (lang || 'en').toLowerCase().substr(0, 2)
        this.messages = messages[this.lang] || messages['en']
    }

    getMessage(key) {
        const transl = this.messages[key] || {}
        return transl.message || key
    }
}


module.exports = new Localizator()

},{}],5:[function(require,module,exports){

class RegexBuilder {
    constructor(op, args) {
        this.op = op
        this.args = args && args.filter((a) => typeof a === 'string' || !a.is_none())
    }

    regex(flags) {
        return new RegExp(this.toString(), flags)
    }

    toString() {
        switch (this.op) {
            case 'NONE':
                return null
            case 'CAPT_GROUP':
                return ['(', this.args.join(''), ')'].join('')
            case 'CAPT_OR_GROUP':
                return ['(', this.args.join('|'), ')'].join('')
            case 'NONCAPT_GROUP':
                return ['(?:', this.args.join(''), ')'].join('')
            case 'AND':
                return this.args.join('')
            case 'OR':
                return ['(?:', this.args.join('|'), ')'].join('')
            case 'CHARS':
                return ['[', this.args.join(''), ']'].join('')
            case 'XCHARS':
                return ['[^', this.args.join(''), ']'].join('')
        }
    }

    none() {
        return new RegexBuilder('NONE')
    }

    is_none() {
        return this.op === 'NONE'
    }

    group() {
        return new RegexBuilder('CAPT_GROUP', [...arguments])
    }

    orgroup() {
        return new RegexBuilder('CAPT_OR_GROUP', [...arguments])
    }

    ngroup() {
        return new RegexBuilder('NONCAPT_GROUP', [...arguments])
    }

    and() {
        return new RegexBuilder('AND', [...arguments])
    }

    or() {
        return new RegexBuilder('OR', [...arguments])
    }

    chars() {
        return new RegexBuilder('CHARS', [...arguments])
    }

    xchars() {
        return new RegexBuilder('XCHARS', [...arguments])
    }
}


module.exports = {
    RegexBuilder,
}

},{}],6:[function(require,module,exports){

const Dom = require('./dom_builder').DomBuilder
    , browserapi = require('./browserapi')
    , translit = require('./translit')
    , urlshortener = require('./urlshortener')


class Renderer {
    constructor(doc) {
        this.dom = Dom
        this.details_pane = doc.querySelector('.app .app-rules')
        this.details_actions_pane = doc.querySelector('.app .app-actions')
        this.preview_pane = doc.querySelector('.app .app-preview')

        this._localize()
    }

    _localize() {
        this.details_actions_pane.querySelector('.install a').textContent = browserapi.i18n.getMessage('extension_action_install')
        this.details_actions_pane.querySelector('.import button span').textContent = browserapi.i18n.getMessage('extension_action_import')
    }

    show_table_details(table, actions) {
        this._show_table_rules(table)
    }

    _show_table_rules(table) {
        let pane = this.details_pane.querySelector('div')

        let rules_pane = pane.querySelector('.rules')

        if (!rules_pane) {
            const old = pane
            pane = Dom.el('div')
            this.details_pane.replaceChild(pane, old)

            rules_pane = Dom.el('div', ['rules'])
            pane.appendChild(rules_pane)
        }

        const loabc = 'абвгґдеєжзиіїйклмнопрстуфхцчшщьюя'
        const nbsp = '\u00A0'
        const dotc = '\u25CC'

        function codePoint(s) {
            if (s.codePointAt) {
                return s.codePointAt(0)
            }
            return s.charCodeAt(0)
        }

        const rule_tag = (ch) => 'rule-' + codePoint(ch).toString(16)

        const print_char = (ch) => {
            const code = codePoint(ch)
            if ((code >= 0x02B0 && code < 0x0370)) {
                return [dotc, ch].join('')
            }
            return ch
        }

        const rule_cell = (pane, rules, ch) => {
            const lokey = ch.toLocaleLowerCase()
            const hikey = ch.toLocaleUpperCase()
            const aposkey = '\'' + lokey

            let cell = pane.querySelector('#' + rule_tag(lokey))
            if (!cell) {
                cell = Dom.el('div', ['rule-cell'])
                cell.id = rule_tag(lokey)
                pane.appendChild(cell)
            }
            else {
                Dom.resetChildren(cell)
            }


            {
                const main_row = Dom.el('div', ['rule-main'])

                const source = Dom.el('div', ['rule-thumb'])
                source.appendChild(Dom.text([hikey, nbsp, lokey].join('')))
                main_row.appendChild(source)

                let rule = rules[ch]

                if (rule === undefined || rule === null) {
                    rule = ''
                }

                let value = rule

                if (typeof rule === 'object') {
                    value = rule.other
                }

                const target = Dom.el('div', ['rule-thumb'])
                target.appendChild(Dom.text([print_char(value.toLocaleUpperCase()), nbsp, print_char(value.toLocaleLowerCase())].join('')))
                main_row.appendChild(target)

                cell.appendChild(main_row)


                if (typeof rule === 'object' && 'start' in rule) {
                    const extra_row = Dom.el('div', ['rule-extra'])

                    let value = rule.start

                    const target = Dom.el('div', ['rule-thumb'])
                    target.appendChild(Dom.text(print_char(value.toLocaleLowerCase())))
                    extra_row.appendChild(target)

                    const comment = Dom.el('div')
                    comment.appendChild(Dom.text(browserapi.i18n.getMessage('rules_label_at_word_start')))
                    extra_row.appendChild(comment)

                    cell.appendChild(extra_row)
                }

                if (typeof rule === 'object' && 'cons' in rule) {
                    const extra_row = Dom.el('div', ['rule-extra'])

                    let value = rule.cons

                    const target = Dom.el('div', ['rule-thumb'])
                    target.appendChild(Dom.text(print_char(value.toLocaleLowerCase())))
                    extra_row.appendChild(target)

                    const comment = Dom.el('div')
                    comment.appendChild(Dom.text(browserapi.i18n.getMessage('rules_label_after_consonants')))
                    extra_row.appendChild(comment)

                    cell.appendChild(extra_row)
                }
            }


            const extra = Object.keys(rules).filter((key) => (key.startsWith(lokey) && key !== lokey) || key.startsWith(aposkey))

            extra.forEach((key) => {
                const extra_row = Dom.el('div', ['rule-extra'])

                const source = Dom.el('div', ['rule-thumb'])
                source.appendChild(Dom.text(key))
                extra_row.appendChild(source)

                let rule = rules[key]

                if (rule === undefined || rule === null) {
                    rule = ''
                }

                let value = rule

                if (typeof rule === 'object') {
                    value = rule.other
                }

                const target = Dom.el('div', ['rule-thumb'])
                target.appendChild(Dom.text(print_char(value.toLocaleLowerCase())))
                extra_row.appendChild(target)

                cell.appendChild(extra_row)
            })

            return cell
        }


        const apos_cell = (pane, rules, ch) => {
            const lokey = ch

            let cell = pane.querySelector('#' + rule_tag(lokey))
            if (!cell) {
                cell = Dom.el('div', ['rule-cell'])
                cell.id = rule_tag(lokey)
                pane.appendChild(cell)
            }
            else {
                Dom.resetChildren(cell)
            }

            const extra_row = Dom.el('div', ['rule-extra'])

            const source = Dom.el('div', ['rule-thumb'])
            source.appendChild(Dom.text(ch))
            extra_row.appendChild(source)

            let rule = rules[ch]

            if (rule === undefined || rule === null) {
                rule = ''
            }

            const target = Dom.el('div', ['rule-thumb'])
            target.appendChild(Dom.text(print_char(rule.toLocaleLowerCase())))
            extra_row.appendChild(target)

            const comment = Dom.el('div')
            comment.appendChild(Dom.text(browserapi.i18n.getMessage('rules_label_apostrophe')))
            extra_row.appendChild(comment)

            cell.appendChild(extra_row)
            return cell
        }


        loabc.split('').forEach((ch) => {
            rule_cell(rules_pane, table.rules, ch)
        })

        apos_cell(rules_pane, table.rules, '\'')
    }

    show_preview(text) {
        const pane = Dom.el('div', ['content'])

        const lines = (text || '').split('\n\n')

        lines.forEach((line) => {
            const p = Dom.el('p')
            p.appendChild(Dom.text(line))
            pane.appendChild(p)
        })

        Dom.resetChildren(this.preview_pane, pane)
    }
}


class Controller {
    constructor() {
        this.view = new Renderer(document)
    }

    _request_url(url, callback) {
        var xhr = new XMLHttpRequest()
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                callback(xhr.responseText)
            }
        }
        xhr.open('GET', url, true)
        xhr.send()
    }

    render(table) {
        const tr = new translit.Transliterator(table.rules)

        this.view.show_table_details(table, [])

        this._request_url('preview.txt', (text) => {
            text = tr.convert(text)
            this.view.show_preview(text)
        })


        // git.io needs CORS
        // See https://github.com/isaacs/github/issues/973

        // const url = document.URL
        //
        // urlshortener.shorten(url, (short_url) => {
        //     this.view.show_share_pane(short_url)
        // })
    }
}


function render(table) {
    const ctl = new Controller()
    return ctl.render(table)
}


module.exports = {
    render,
}

},{"./browserapi":2,"./dom_builder":3,"./translit":8,"./urlshortener":9}],7:[function(require,module,exports){

const punycode = require('punycode')


class SharerDecoderError {
    constructor(message) {
        this.message = message
    }

    toString() {
        return `SharerDecoderError{${this.message}}`
    }
}


class Sharer {
    constructor(baseUrl) {
        const canonicalUrl = 'https://paiv.github.io/latynka/v1'
        this.baseUrl = (baseUrl || canonicalUrl).toLowerCase()
    }

    makeShareLink(table) {
        const rules = table.rules || {}
        const res = []

        function _nstring(value) {
            if (value === undefined || value === null) {
                return [0]
            }

            if (value.length > 5) {
                throw 'Value is too long: ' + JSON.stringify(value)
            }

            return [value.length, value]
        }

        const fragment = Object.keys(rules)
            .sort((a,b) => a.localeCompare(b))
            .map((key) => {
                const rule = rules[key]

                if (rule === undefined || rule === null) {
                    return [..._nstring(key), ..._nstring(rule)]
                }
                else if (typeof rule === 'object') {
                    let res = _nstring(key)
                    if ('start' in rule) {
                        res = res.concat([7, ..._nstring(rule.start)])
                    }
                    if ('cons' in rule) {
                        res = res.concat([8, ..._nstring(rule.cons)])
                    }
                    if ('other' in rule) {
                        res = res.concat([9, ..._nstring(rule.other)])
                    }
                    return res
                }
                else {
                    return [..._nstring(key), ..._nstring(rule)]
                }
            })
            .reduce((acc, val) => acc.concat(val), [])
            .join('')

        if (!fragment) {
            return this.baseUrl
        }

        const encoded = encodeURIComponent(punycode.encode(fragment))
            .replace(/\-/g, '%2D')

        const url = `${this.baseUrl}?r=${encoded}`
        return url
    }

    decodeShareLink(link) {
        const table = {rules: {}}

        const parsedUrl = new URL(link)
        const match = `${parsedUrl.protocol}//${parsedUrl.host}${parsedUrl.pathname}`

        if (match.toLowerCase() !== this.baseUrl) {
            throw new SharerDecoderError('Unknown URI ' + JSON.stringify(link))
        }

        const search = (parsedUrl.search || '').substr(1)
        const encoded = search.split('&')
            .filter(p => p.substring(0, 2) === 'r=')
            .map(p => p.substring(2))
        if (!encoded.length) {
            return table
        }
        const fragment = punycode.decode(decodeURIComponent(encoded[0]))

        const rules = {}

        function _nstring(text, offset) {
            const n = parseInt(text.substr(offset++, 1), 10)
            const value = text.substr(offset, n)
            return [offset + n, value]
        }

        function _nvalue(text, offset) {
            let value, inner, done

            while (!done) {
                const n = parseInt(fragment.substr(offset, 1), 10)

                switch (n) {

                    case 7:
                    case 8:
                    case 9:
                        inner = _nstring(text, ++offset)
                        if (!value) {
                            value = {}
                        }
                        offset = inner[0]
                        value[n == 7 ? 'start' : n == 8 ? 'cons' : 'other'] = inner[1]
                        break

                    default:
                        if (!value) {
                            value = text.substr(++offset, n)
                            offset += n
                        }
                        done = true
                        break
                }
            }

            return [offset, value]
        }


        for (var offset = 0; offset < fragment.length; ) {
            const left = _nstring(fragment, offset)
            offset = left[0]
            const key = left[1]

            const right = _nvalue(fragment, offset)
            offset = right[0]
            const value = right[1]

            rules[key] = value
        }

        table.rules = rules

        return table
    }
}


function makeShareLink(table) {
    const sharer = new Sharer()
    return sharer.makeShareLink(table)
}


function decodeShareLink(link) {
    const sharer = new Sharer()
    return sharer.decodeShareLink(link)
}


function normalize(link) {
    const table = decodeShareLink(link)
    return makeShareLink(table)
}


module.exports = {
    Sharer,
    makeShareLink,
    decodeShareLink,
    normalize,
}

},{"punycode":1}],8:[function(require,module,exports){
const RegexBuilder = require('./regex_builder').RegexBuilder


class Transliterator {
    constructor(rules) {
        this.compiled = Transliterator.compileTable(rules)
    }

    static compileTable(rules) {
        const loabc = 'абвгґдеєжзиіїйклмнопрстуфхцчшщьюя'
        const consonants = 'бвгґджзйклмнпрстфхцчшщ'
        const vowels = 'аеєиіїоуюя'

        const hiabc = loabc.toLocaleUpperCase()
        const apos = ['\'', '\u2019', '\u02BC']

        const default_rules = {}
        const word_start_rules = {}
        const after_cons_rules = {}

        const TitleCase = (value) => value.toLocaleLowerCase().replace(/^./, (s) => s.toLocaleUpperCase())
        const SillyCase = (value) => value.toLocaleLowerCase().replace(/.$/, (s) => s.toLocaleUpperCase())


        Object.keys(rules).forEach((key) => {
            const lokey = key.toLocaleLowerCase()
            const hikey = lokey.toLocaleUpperCase()
            let rule = rules[key]

            if (rule == null) {
                rule = ''
            }

            if (typeof rule === 'object') {

                if ('start' in rule) {
                    const value = rule.start || ''
                    word_start_rules[lokey] = value
                    word_start_rules[hikey] = TitleCase(value)
                    if (key.length > 1) {
                        word_start_rules[SillyCase(key)] = SillyCase(value)
                        word_start_rules[TitleCase(key)] = TitleCase(value)
                    }
                }

                if ('cons' in rule) {
                    const value = rule.cons || ''
                    after_cons_rules[lokey] = value
                    after_cons_rules[hikey] = TitleCase(value)
                }

                const value = rule.other || ''
                default_rules[lokey] = value
                default_rules[hikey] = TitleCase(value)
                if (key.length > 1) {
                    default_rules[SillyCase(key)] = SillyCase(value)
                    default_rules[TitleCase(key)] = TitleCase(value)
                }

            }
            else {

                if (key.indexOf('\'') >= 0) {
                    apos.forEach((char) => {
                        const newkey = key.replace('\'', char)
                        default_rules[newkey] = rule
                    })
                }
                else {
                    default_rules[lokey] = rule
                    default_rules[hikey] = TitleCase(rule)

                    if (key.length > 1) {
                        default_rules[SillyCase(key)] = SillyCase(rule)
                        default_rules[TitleCase(key)] = TitleCase(rule)
                    }
                }
            }
        })


        const keys1 = Object.keys(default_rules).filter((key) => key.length === 1)
        const default_keyset1 = keys1.map((x) => [
            x.toLocaleLowerCase(),
            x.toLocaleUpperCase()
        ]).reduce((acc, x) => acc.concat(x), [])

        const keys2 = Object.keys(default_rules).filter((key) => key.length > 1)
            .sort((a,b) => b.length - a.length)
        const default_keyset2 = keys2.map((x) => [
            x.toLocaleLowerCase(),
            x.toLocaleUpperCase(),
            TitleCase(x),
            SillyCase(x)
        ]).reduce((acc, x) => acc.concat(x), [])

        const word_start_keyset = Object.keys(word_start_rules).map((x) => [
            x.toLocaleLowerCase(),
            x.toLocaleUpperCase()
        ]).reduce((acc, x) => acc.concat(x), [])

        const consonants_keyset = consonants + consonants.toLocaleUpperCase()
        const after_cons_keyset = Object.keys(after_cons_rules).map((x) => [
            x.toLocaleLowerCase(),
            x.toLocaleUpperCase()
        ]).reduce((acc, x) => acc.concat(x), [])


        const rxb = new RegexBuilder()

        const rx = rxb.or(
            // word start
            rxb.ngroup(
                // char preceding
                rxb.orgroup(  // 1
                    '^',
                    rxb.xchars(loabc, hiabc, ...apos)
                ),
                // char to translate
                rxb.orgroup(  // 2
                    rxb.chars(...word_start_keyset)
                )
            ),
            // or word inner
            rxb.or(
                rxb.orgroup(  // 3
                    ...(default_keyset2.length > 0 ? default_keyset2 : ['\uFFFC\uFFFC'])
                ),
                rxb.group(  // 4
                    rxb.chars(consonants_keyset),
                    rxb.chars(...after_cons_keyset)
                ),
                rxb.orgroup(  // 5
                    rxb.chars(...default_keyset1)
                )
            )
        )
        .regex('g')


        const cb = (text, xkey, match_start, match_pairs, match_cons, match_inner) => {
            if (match_start) {
                const value = word_start_rules[match_start]
                return xkey + value
            }

            if (match_pairs) {
                const value = default_rules[match_pairs]
                return value
            }

            if (match_cons) {
                const cons = default_rules[match_cons[0]]
                const value = after_cons_rules[match_cons[1]]
                return cons + value
            }

            const value = default_rules[match_inner]
            return value
        }
        return {
            regex: rx,
            callback: cb,
        }
    }

    convert(text) {
        return text.replace(this.compiled.regex, this.compiled.callback)
    }

    processTextNodes(nodes) {
        nodes.forEach((node) => {
            const text = node.data || ''
            node.data = this.convert(text)
        })
    }
}


module.exports = {
    Transliterator,
}

},{"./regex_builder":5}],9:[function(require,module,exports){

class GitioUrlShortener {
    constructor() {
        this.serviceUrl = 'https://git.io/'
    }

    shorten(url, callback) {
        const xhr = new XMLHttpRequest()
        const form = new FormData()

        form.append('url', url)

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 201) {
                callback(xhr.getResponseHeader('Location'))
            }
        }

        xhr.open('POST', this.serviceUrl, true)
        xhr.send(form)
    }
}


function shorten(url, callback) {
    const service = new GitioUrlShortener()
    return service.shorten(url, callback)
}


module.exports = {
    shorten,
}

},{}],10:[function(require,module,exports){

const sharer = require('./sharer')
    , renderer = require('./renderer')


function app() {
    const loc = window.location
    const baseUrl = `${loc.protocol}//${loc.host}${loc.pathname}`
    const share = new sharer.Sharer(baseUrl)
    const empty = {rules: {}}

    try {
        var table = share.decodeShareLink(document.URL)
    }
    catch (e) {
        console.log(e)
    }

    renderer.render(table || empty)
}


window.addEventListener('load', () => app())

},{"./renderer":6,"./sharer":7}]},{},[10]);
