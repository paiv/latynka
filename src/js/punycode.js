"use strict";

/* paiv punycode - https://github.com/paiv/punycode-js

    LICENSE
    Refer to the end of the file for license information.

    Punycode
    https://www.rfc-editor.org/rfc/rfc3492.txt
*/


const _config_d2a = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","0","1","2","3","4","5","6","7","8","9"];
const _config_a2d = new Map([
    ["0",26], ["1",27], ["2",28], ["3",29], ["4",30], ["5",31], ["6",32], ["7",33], ["8",34], ["9",35],
    ["A",0], ["B",1], ["C",2], ["D",3], ["E",4], ["F",5], ["G",6], ["H",7], ["I",8], ["J",9], ["K",10], ["L",11], ["M",12], ["N",13], ["O",14], ["P",15], ["Q",16], ["R",17], ["S",18], ["T",19], ["U",20], ["V",21], ["W",22], ["X",23], ["Y",24], ["Z",25],
    ["a",0], ["b",1], ["c",2], ["d",3], ["e",4], ["f",5], ["g",6], ["h",7], ["i",8], ["j",9], ["k",10], ["l",11], ["m",12], ["n",13], ["o",14], ["p",15], ["q",16], ["r",17], ["s",18], ["t",19], ["u",20], ["v",21], ["w",22], ["x",23], ["y",24], ["z",25],
]);


function _adapt(delta, numpoints, firsttime) {
    delta = firsttime ? Math.trunc(delta / 700) : Math.trunc(delta / 2);
    delta += Math.trunc(delta / numpoints);
    let k = 0;
    while (delta > 455) {
        delta = Math.trunc(delta / 35);
        k += 36;
    }
    return k + Math.trunc((36 * delta) / (delta + 38));
}


function encode(input) {
    let ilen = 0;
    let n = 128;
    let delta = 0;
    let bias = 72;
    let output = "";
    let b = 0;
    let m = Number.MAX_VALUE;
    for (let sp of input) {
        const c = sp.codePointAt(0);
        ilen += 1;
        if (c < n) {
            b += 1;
            output += sp;
        }
        else {
            if (c < m) {
                m = c;
            }
        }
    }
    if (b > 0) {
        output += "-";
    }
    let h = b;
    while (h < ilen) {
        delta += (m - n) * (h + 1);
        n = m;
        m = Number.MAX_VALUE;
        for (let sp of input) {
            const c = sp.codePointAt(0);
            if (c < n) {
                delta += 1;
            }
            else if (c > n) {
                if (c < m) {
                    m = c;
                }
            }
            else {
                let q = delta;
                let k = 36;
                while (true) {
                    let t = (k <= bias) ? 1 : ((k >= bias + 26) ? 26 : (k - bias));
                    if (q < t) { break; }
                    let x = t + ((q - t) % (36 - t));
                    output += _config_d2a[x];
                    q = Math.trunc((q - t) / (36 - t));
                    k += 36;
                }
                output += _config_d2a[q];
                bias = _adapt(delta, h + 1, h === b);
                delta = 0;
                h += 1;
            }
        }
        delta += 1;
        n += 1;
    }
    return output;
}


function decode(input) {
    let n = 128;
    let bias = 72;
    let output = new Array();
    let sep = input.lastIndexOf("-");
    if (sep >= 0) {
        output = [...input.substring(0, sep)];
        for (let sp of output) {
            const c = sp.codePointAt(0);
            if (c >= n) {
                throw new Error("invalid char in basic string: " + sp);
            }
        }
        input = input.substring(sep + 1);
    }
    let it = input[Symbol.iterator]();
    let i = 0;
    while (true) {
        let iv = it.next();
        if (iv.done) { break; }
        let oldi = i;
        let w = 1;
        let k = 36;
        while (true) {
            const sp = iv.value;
            const digit = _config_a2d.get(sp)
            i += digit * w;
            if (digit === undefined) {
                throw new Error("invalid char in delta encoding: " + sp);
            }
            let t = (k <= bias) ? 1 : ((k >= bias + 26) ? 26 : (k - bias));
            if (digit < t) { break; }
            w *= (36 - t);
            iv = it.next()
            if (iv.done) {
                throw new Error("truncated delta encoding");
            }
            k += 36;
        }
        const olen1 = output.length + 1;
        bias = _adapt(i - oldi, olen1, oldi === 0);
        n += Math.trunc(i / olen1);
        i = i % olen1;
        const sp = String.fromCodePoint(n);
        output.splice(i, 0, sp);
        i += 1;
    }
    return output.join("");
}


module.exports = {
    encode,
    decode,
};


/*
MIT License Copyright (c) 2024 Pavel Ivashkov https://github.com/paiv

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

