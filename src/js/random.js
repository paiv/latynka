

function randomBytes(n) {
    const buf = new Uint8Array(n)
    crypto.getRandomValues(buf)
    return buf
}


const abcdef = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'


function string(n) {
    const scale = (abcdef.length - 1) / 255.0

    return [...randomBytes(n)]
        .map((x) => abcdef[Math.floor(x * scale)])
        .join('')
}


module.exports = {
    randomBytes,
    string,
}
