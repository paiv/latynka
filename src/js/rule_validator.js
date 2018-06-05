
class Validator {

    validate(rules, dothrow) {
        const loabc = 'абвгґдеєжзиіїйклмнопрстуфхцчшщьюя'

        let filtered_rules = rules
        if (!dothrow) {
            filtered_rules = JSON.parse(JSON.stringify(rules))
        }

        loabc.split('').forEach((char) => {
            if (rules[char] === undefined) {
                if (dothrow) {
                    throw 'Missing rule for ' + JSON.stringify(char)
                }
            }
        })

        const key_rx = new RegExp(`^[${loabc}']+$`)
        const max_key_size = 5
        const max_value_size = 5
        const special = new Set(['start', 'cons', 'other'])
        const special_hint = [...special].join(', ')

        Object.keys(rules).forEach((key) => {

            if (!key_rx.test(key)) {
                if (dothrow) {
                    throw 'Unsupported rule ' + JSON.stringify(key)
                }
                else {
                    delete filtered_rules[key]
                }
            }

            if (key.length > max_key_size) {
                if (dothrow) {
                    throw 'Rule is too long ' + JSON.stringify(key)
                }
                else {
                    delete filtered_rules[key]
                }
            }

            const value = rules[key]

            if (value) {
                if (typeof value === 'object') {

                    Object.keys(value).forEach((sub) => {

                        if (!special.has(sub)) {
                            if (dothrow) {
                                throw `Unsupported rule ${JSON.stringify(sub)} (expecting one of: ${special_hint})`
                            }
                            else {
                                delete filtered_rules[key]
                            }
                        }

                        const subvalue = value[sub]

                        if (subvalue) {
                            if (typeof subvalue !== 'string') {
                                if (dothrow) {
                                    throw 'Unsupported value ' + JSON.stringify(subvalue)
                                }
                                else {
                                    delete filtered_rules[key]
                                }
                            }
                            else if (subvalue.length > max_value_size) {
                                if (dothrow) {
                                    throw 'Value is too long ' + JSON.stringify(subvalue)
                                }
                                else {
                                    delete filtered_rules[key]
                                }
                            }
                        }
                    })

                }
                else if (value.length > max_value_size) {
                    if (dothrow) {
                        throw 'Value is too long ' + JSON.stringify(value)
                    }
                    else {
                        delete filtered_rules[key]
                    }
                }
            }
        })

        return filtered_rules
    }
}


function validate(rules) {
    const val = new Validator()
    return val.validate(rules, true)
}


function filter(rules) {
    const val = new Validator()
    return val.validate(rules, false)
}


module.exports = {
    validate,
    filter,
}
