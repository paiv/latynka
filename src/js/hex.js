
function toHex(value, width) {
    return (Array(width + 1).join('0') + value.toString(16).toLowerCase()).slice(-width)
}


module.exports = {
    toHex,
}
