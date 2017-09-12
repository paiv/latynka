
const hex = require('./hex')


const fromCodePoint = (typeof String.fromCodePoint !== 'undefined') ?
    String.fromCodePoint : String.fromCharCode


class JaamlParserError {
    constructor(offset, message) {
        this.offset = offset
        this.message = message
    }

    toString() {
        return `JaamlParserError{${this.message}, offset:${this.offset}}`
    }
}


class JaamlGeneratorError {
    constructor(message) {
        this.message = message
    }

    toString() {
        return `JaamlGeneratorError{${this.message}}`
    }
}


class JaamlParser {

    parse(text) {
        const opts = {
            tab_spaces: 10,
        }

        if (typeof text !== 'string') {
            throw new JaamlParserError(0, 'Invalid argument')
        }

        let indent = 0
        let state = 0
        let state_transition = false
        let offset, key, value
        const doc = {}

        let current_indent = undefined
        let current_object = doc

        const indent_stack = []
        const parent_stack = [current_object]

        const text_len = text.length

        for (offset = 0; offset < text_len; offset++) {
            const char = text[offset]

            do {
                state_transition = false

                switch (state) {

                    // indent
                    case 0:
                        switch (char) {
                            case ' ':
                                indent++
                                break

                            case '\t':
                                indent += opts.tab_spaces
                                break

                            case '\n':
                                indent = 0
                                break

                            default:
                                if (current_indent === undefined) {
                                    current_indent = indent
                                    indent_stack.push(current_indent)
                                }
                                else if (indent > current_indent) {
                                    if (value) {
                                        throw new JaamlParserError(offset, 'Unexpected mapping')
                                    }

                                    const new_object = {}
                                    current_object[key] = new_object

                                    current_indent = indent
                                    current_object = new_object

                                    indent_stack.push(current_indent)
                                    parent_stack.push(current_object)
                                }
                                else if (indent < current_indent) {
                                    while (indent < current_indent && indent_stack.length > 1) {
                                        indent_stack.pop()
                                        parent_stack.pop()
                                        current_indent = indent_stack.slice(-1)[0]
                                        current_object = parent_stack.slice(-1)[0]
                                    }

                                    if (indent !== current_indent || parent_stack.length < 1) {
                                        throw new JaamlParserError(offset, 'Short indent')
                                    }
                                }

                                indent = 0
                                state = 1
                                state_transition = true
                                break
                        }
                        break

                    // key
                    case 1: {
                            const res = this._read_string(text, offset, [':', '\n'])

                            if (res === undefined) {
                                throw new JaamlParserError(offset, 'Invalid key')
                            }

                            key = res[0].trim()
                            offset = res[1]
                            state = 2
                        }
                        break

                    // sep
                    case 2:
                        switch (char) {
                            case ':':
                                state = 3
                                break

                            default:
                                throw new JaamlParserError(offset, 'Missing :')
                        }
                        break

                    // value
                    case 3: {
                            const res = this._read_string(text, offset, ['\n'])

                            if (res === undefined) {
                                throw new JaamlParserError(offset, 'Invalid value')
                            }

                            value = res[0].trim() || null
                            offset = res[1]

                            current_object[key] = value

                            // key = undefined
                            // value = undefined
                            state = 4
                        }
                        break

                    // new line
                    case 4:
                        switch (char) {
                            case '\n':
                                break

                            default:
                                state = 0
                                state_transition = 1
                                break
                        }
                        break
                }

            }
            while (state_transition && offset < text_len)
        }

        switch (state) {
            case 0:
            case 4:
                break

            case 3:
                value = null
                current_object[key] = value
                break

            default:
                throw new JaamlParserError(offset, 'Unexpected EOF while reading dictionary')
        }

        return doc
    }

    parse_string(text, ending_chars) {
        const res = this._read_string(text, 0, ending_chars)

        if (res) {
            return res[0]
        }
    }

    _read_string(text, offset, ending_chars) {
        const text_len = text.length
        const value = []
        ending_chars = new Set(ending_chars)

        for (; offset < text_len; offset++) {
            const char = text[offset]

            switch (char) {

                case '\\': {
                        const res = this._read_escaped_char(text, ++offset)
                        if (res === undefined) {
                            throw new JaamlParserError(offset, 'Invalid escape sequence')
                        }

                        value.push(res[0])
                        offset = res[1]
                    }
                    break

                default:
                    if (ending_chars.has(char)) {
                        return [value.join(''), offset - 1]
                    }
                    else {
                        value.push(char)
                    }
                    break
            }
        }

        return [value.join(''), offset]
    }

    _read_escaped_char(text, offset) {
        const char = text[offset]

        switch (char) {

            case '\\':
            case '\'':
            case ':':
            case '"':
                return [char, offset]

            case 't':
                return ['\t', offset]

            case 'x': {
                    const escaped = text.substr(offset + 1, 2)
                    const value = Number.parseInt(escaped, 16)
                    if (Number.isFinite(value)) {
                        if (hex.toHex(value, 2) === escaped.toLowerCase()) {
                            return [String.fromCharCode(value), offset + 2]
                        }
                    }
                }
                break

            case 'u': {
                    const escaped = text.substr(offset + 1, 4)
                    const value = Number.parseInt(escaped, 16)

                    if (Number.isFinite(value)) {
                        if (hex.toHex(value, 4) === escaped.toLowerCase()) {
                            const uvalue = fromCodePoint(value)
                            return [uvalue, offset + 4]
                        }
                    }
                }
                break

            default:
                return
        }
    }
}


class JaamlGenerator {

    stringify(value) {
        const opts = {
            indent: 2,
        }

        if (value === undefined) {
            return ''
        }

        if (typeof value !== 'object' || Array.isArray(value)) {
            throw new JaamlGeneratorError('Invalid argument')
        }

        const indent = Array(opts.indent + 1).join(' ')

        return this._print_object(value, 0, indent)
    }

    _print_object(value, depth, indent) {
        if (value === null) {
            return ''
        }

        const key_indent = Array(depth + 1).join(indent)

        const chunks = Object.keys(value)
            .map((key) => {
                const res = [key_indent, this._print_string(key, [':']), ':']
                const val = value[key]

                if (val === null) {
                }
                else if (typeof val === 'object') {
                    res.push('\n')
                    res.push(this._print_object(val, depth + 1, indent))
                }
                else {
                    res.push(' ')
                    res.push(this._print_string(val))
                }

                return res
            })

        return chunks
            .map((x) => x.join(''))
            .join('\n')
    }

    _print_string(value, escape_chars) {
        const table = {
            '\\': '\\\\',
            '\t': '\\t',
        }

        if (escape_chars) {
            escape_chars.forEach((char) => table[char] = '\\' + char)
        }

        const keys = Object.keys(table).map((key) => '\\' + key).join('')
        const rx = new RegExp(`[${keys}]`, 'g')

        value = value.replace(rx, (char) => {
            return table[char]
        })

        value = value.replace(/[\x00-\x1F]/g, (char) => {
            const xx = hex.toHex(char.charCodeAt(0), 2)
            return `\\x${xx}`
        })

        function codePoint(s) {
            if (s.codePointAt) {
                return s.codePointAt(0)
            }
            return s.charCodeAt(0)
        }

        value = value.replace(/[\u02b0-\u036f]/g, (char) => {
            const xx = hex.toHex(codePoint(char), 4)
            return `\\u${xx}`
        })

        return value
    }
}


class Jaaml {
    constructor() {
        this.parser = new JaamlParser()
        this.generator = new JaamlGenerator()
    }

    parse(text) {
        return this.parser.parse(text)
    }

    stringify(value) {
        return this.generator.stringify(value)
    }
}


function parse(text) {
    const jaaml = new JaamlParser()
    return jaaml.parse(text)
}


function stringify(value) {
    const jaaml = new JaamlGenerator()
    return jaaml.stringify(value)
}


module.exports = {
    JaamlParser,
    JaamlParserError,
    parse,
    JaamlGenerator,
    JaamlGeneratorError,
    stringify,
    Jaaml,
}
