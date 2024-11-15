(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){const i18n=require("./i18n");module.exports={i18n:i18n}},{"./i18n":3}],2:[function(require,module,exports){class DomBuilder{static el(e,t){const l=document.createElement(e);return t&&t.forEach(e=>l.classList.add(e)),l}static text(e){return document.createTextNode(e)}static resetChildren(e,t){let l;for(;l=e.lastElementChild;)e.removeChild(l);t&&e.appendChild(t)}}module.exports={DomBuilder:DomBuilder}},{}],3:[function(require,module,exports){const messages={en:{rules_label_apostrophe:{message:"apostrophe"},rules_label_at_word_start:{message:"at the beginning of a word"},rules_label_after_consonants:{message:"after consonants"},extension_action_install:{message:"Install browser extension"},extension_action_import:{message:"Import"},extension_action_copy_to_clipboard:{message:"Copy to clipboard"}},ru:{rules_label_apostrophe:{message:"апостроф"},rules_label_at_word_start:{message:"в начале слова"},rules_label_after_consonants:{message:"после согласных"},extension_action_install:{message:"Установить расширение для браузера"},extension_action_import:{message:"Импортировать"},extension_action_copy_to_clipboard:{message:"Копировать в буфер обмена"}},uk:{rules_label_apostrophe:{message:"апостроф"},rules_label_at_word_start:{message:"на початку слова"},rules_label_after_consonants:{message:"після приголосних"},extension_action_install:{message:"Встановити розширення до браузера"},extension_action_import:{message:"Зберегти"},extension_action_copy_to_clipboard:{message:"Скопіювати в буфер"}}};class Localizator{constructor(){const e=(window.navigator||window.browser||window).language;this.lang=(e||"en").toLowerCase().substr(0,2),this.messages=messages[this.lang]||messages.en}getMessage(e){return(this.messages[e]||{}).message||e}}module.exports=new Localizator},{}],4:[function(require,module,exports){"use strict";const _config_d2a=["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","0","1","2","3","4","5","6","7","8","9"],_config_a2d=new Map([["0",26],["1",27],["2",28],["3",29],["4",30],["5",31],["6",32],["7",33],["8",34],["9",35],["A",0],["B",1],["C",2],["D",3],["E",4],["F",5],["G",6],["H",7],["I",8],["J",9],["K",10],["L",11],["M",12],["N",13],["O",14],["P",15],["Q",16],["R",17],["S",18],["T",19],["U",20],["V",21],["W",22],["X",23],["Y",24],["Z",25],["a",0],["b",1],["c",2],["d",3],["e",4],["f",5],["g",6],["h",7],["i",8],["j",9],["k",10],["l",11],["m",12],["n",13],["o",14],["p",15],["q",16],["r",17],["s",18],["t",19],["u",20],["v",21],["w",22],["x",23],["y",24],["z",25]]);function _adapt(t,e,n){t=n?Math.trunc(t/700):Math.trunc(t/2),t+=Math.trunc(t/e);let o=0;for(;t>455;)t=Math.trunc(t/35),o+=36;return o+Math.trunc(36*t/(t+38))}function encode(t){let e=0,n=128,o=0,r=72,i="",c=0,a=Number.MAX_VALUE;for(let o of t){const t=o.codePointAt(0);e+=1,t<n?(c+=1,i+=o):t<a&&(a=t)}c>0&&(i+="-");let d=c;for(;d<e;){o+=(a-n)*(d+1),n=a,a=Number.MAX_VALUE;for(let e of t){const t=e.codePointAt(0);if(t<n)o+=1;else if(t>n)t<a&&(a=t);else{let t=o,e=36;for(;;){let n=e<=r?1:e>=r+26?26:e-r;if(t<n)break;i+=_config_d2a[n+(t-n)%(36-n)],t=Math.trunc((t-n)/(36-n)),e+=36}i+=_config_d2a[t],r=_adapt(o,d+1,d===c),o=0,d+=1}}o+=1,n+=1}return i}function decode(t){let e=128,n=72,o=new Array,r=t.lastIndexOf("-");if(r>=0){o=[...t.substring(0,r)];for(let t of o){if(t.codePointAt(0)>=e)throw new Error("invalid char in basic string: "+t)}t=t.substring(r+1)}let i=t[Symbol.iterator](),c=0;for(;;){let t=i.next();if(t.done)break;let r=c,a=1,d=36;for(;;){const e=t.value,o=_config_a2d.get(e);if(c+=o*a,void 0===o)throw new Error("invalid char in delta encoding: "+e);let r=d<=n?1:d>=n+26?26:d-n;if(o<r)break;if(a*=36-r,(t=i.next()).done)throw new Error("truncated delta encoding");d+=36}const f=o.length+1;n=_adapt(c-r,f,0===r),e+=Math.trunc(c/f),c%=f;const l=String.fromCodePoint(e);o.splice(c,0,l),c+=1}return o.join("")}module.exports={encode:encode,decode:decode}},{}],5:[function(require,module,exports){class RegexBuilder{constructor(e,r){this.op=e,this.args=r&&r.filter(e=>"string"==typeof e||!e.is_none())}regex(e){return new RegExp(this.toString(),e)}toString(){switch(this.op){case"NONE":return null;case"CAPT_GROUP":return["(",this.args.join(""),")"].join("");case"CAPT_OR_GROUP":return["(",this.args.join("|"),")"].join("");case"NONCAPT_GROUP":return["(?:",this.args.join(""),")"].join("");case"AND":return this.args.join("");case"OR":return["(?:",this.args.join("|"),")"].join("");case"CHARS":return["[",this.args.join(""),"]"].join("");case"XCHARS":return["[^",this.args.join(""),"]"].join("")}}none(){return new RegexBuilder("NONE")}is_none(){return"NONE"===this.op}group(){return new RegexBuilder("CAPT_GROUP",[...arguments])}orgroup(){return new RegexBuilder("CAPT_OR_GROUP",[...arguments])}ngroup(){return new RegexBuilder("NONCAPT_GROUP",[...arguments])}and(){return new RegexBuilder("AND",[...arguments])}or(){return new RegexBuilder("OR",[...arguments])}chars(){return new RegexBuilder("CHARS",[...arguments])}xchars(){return new RegexBuilder("XCHARS",[...arguments])}}module.exports={RegexBuilder:RegexBuilder}},{}],6:[function(require,module,exports){const Dom=require("./dom_builder").DomBuilder,browserapi=require("./browserapi"),translit=require("./translit"),urlshortener=require("./urlshortener");class Renderer{constructor(e){this.dom=Dom,this.details_pane=e.querySelector(".app .app-rules"),this.details_actions_pane=e.querySelector(".app .app-actions"),this.preview_pane=e.querySelector(".app .app-preview"),this._localize()}_localize(){this.details_actions_pane.querySelector(".install a").textContent=browserapi.i18n.getMessage("extension_action_install"),this.details_actions_pane.querySelector(".import button span").textContent=browserapi.i18n.getMessage("extension_action_import")}show_table_details(e,t){this._show_table_rules(e)}_show_table_rules(e){let t=this.details_pane.querySelector("div"),o=t.querySelector(".rules");if(!o){const e=t;t=Dom.el("div"),this.details_pane.replaceChild(t,e),o=Dom.el("div",["rules"]),t.appendChild(o)}const l=" ",r="◌";function i(e){return e.codePointAt?e.codePointAt(0):e.charCodeAt(0)}const n=e=>"rule-"+i(e).toString(16),s=e=>{const t=i(e);return t>=688&&t<880?[r,e].join(""):e};"абвгґдеєжзиіїйклмнопрстуфхцчшщьюя".split("").forEach(t=>{((e,t,o)=>{const r=o.toLocaleLowerCase(),i=o.toLocaleUpperCase(),a="'"+r;let d=e.querySelector("#"+n(r));d?Dom.resetChildren(d):((d=Dom.el("div",["rule-cell"])).id=n(r),e.appendChild(d));{const e=Dom.el("div",["rule-main"]),n=Dom.el("div",["rule-thumb"]);n.appendChild(Dom.text([i,l,r].join(""))),e.appendChild(n);let a=t[o];null==a&&(a="");let p=a;"object"==typeof a&&(p=a.other);const c=Dom.el("div",["rule-thumb"]);if(c.appendChild(Dom.text([s(p.toLocaleUpperCase()),l,s(p.toLocaleLowerCase())].join(""))),e.appendChild(c),d.appendChild(e),"object"==typeof a&&"start"in a){const e=Dom.el("div",["rule-extra"]);let t=a.start;const o=Dom.el("div",["rule-thumb"]);o.appendChild(Dom.text(s(t.toLocaleLowerCase()))),e.appendChild(o);const l=Dom.el("div");l.appendChild(Dom.text(browserapi.i18n.getMessage("rules_label_at_word_start"))),e.appendChild(l),d.appendChild(e)}if("object"==typeof a&&"cons"in a){const e=Dom.el("div",["rule-extra"]);let t=a.cons;const o=Dom.el("div",["rule-thumb"]);o.appendChild(Dom.text(s(t.toLocaleLowerCase()))),e.appendChild(o);const l=Dom.el("div");l.appendChild(Dom.text(browserapi.i18n.getMessage("rules_label_after_consonants"))),e.appendChild(l),d.appendChild(e)}}Object.keys(t).filter(e=>e.startsWith(r)&&e!==r||e.startsWith(a)).forEach(e=>{const o=Dom.el("div",["rule-extra"]),l=Dom.el("div",["rule-thumb"]);l.appendChild(Dom.text(e)),o.appendChild(l);let r=t[e];null==r&&(r="");let i=r;"object"==typeof r&&(i=r.other);const n=Dom.el("div",["rule-thumb"]);n.appendChild(Dom.text(s(i.toLocaleLowerCase()))),o.appendChild(n),d.appendChild(o)})})(o,e.rules,t)}),((e,t,o)=>{const l=o;let r=e.querySelector("#"+n(l));r?Dom.resetChildren(r):((r=Dom.el("div",["rule-cell"])).id=n(l),e.appendChild(r));const i=Dom.el("div",["rule-extra"]),a=Dom.el("div",["rule-thumb"]);a.appendChild(Dom.text(o)),i.appendChild(a);let d=t[o];null==d&&(d="");const p=Dom.el("div",["rule-thumb"]);p.appendChild(Dom.text(s(d.toLocaleLowerCase()))),i.appendChild(p);const c=Dom.el("div");c.appendChild(Dom.text(browserapi.i18n.getMessage("rules_label_apostrophe"))),i.appendChild(c),r.appendChild(i)})(o,e.rules,"'")}show_preview(e){const t=Dom.el("div",["content"]);(e||"").split("\n\n").forEach(e=>{const o=Dom.el("p");o.appendChild(Dom.text(e)),t.appendChild(o)}),Dom.resetChildren(this.preview_pane,t)}}class Controller{constructor(){this.view=new Renderer(document)}_request_url(e,t){var o=new XMLHttpRequest;o.onreadystatechange=()=>{4===o.readyState&&200===o.status&&t(o.responseText)},o.open("GET",e,!0),o.send()}render(e){const t=new translit.Transliterator(e.rules);this.view.show_table_details(e,[]),this._request_url("preview.txt",e=>{e=t.convert(e),this.view.show_preview(e)})}}function render(e){return(new Controller).render(e)}module.exports={render:render}},{"./browserapi":1,"./dom_builder":2,"./translit":8,"./urlshortener":9}],7:[function(require,module,exports){const punycode=require("./punycode");class SharerDecoderError{constructor(e){this.message=e}toString(){return`SharerDecoderError{${this.message}}`}}class Sharer{constructor(e){this.baseUrl=(e||"https://paiv.github.io/latynka/v1").toLowerCase()}makeShareLink(e){const r=e.rules||{};function n(e){if(null==e)return[0];if(e.length>5)throw"Value is too long: "+JSON.stringify(e);return[e.length,e]}const t=Object.keys(r).sort((e,r)=>e.localeCompare(r)).map(e=>{const t=r[e];if(null==t)return[...n(e),...n(t)];if("object"==typeof t){let r=n(e);return"start"in t&&(r=r.concat([7,...n(t.start)])),"cons"in t&&(r=r.concat([8,...n(t.cons)])),"other"in t&&(r=r.concat([9,...n(t.other)])),r}return[...n(e),...n(t)]}).reduce((e,r)=>e.concat(r),[]).join("");if(!t)return this.baseUrl;const o=encodeURIComponent(punycode.encode(t)).replace(/\-/g,"%2D");return`${this.baseUrl}?r=${o}`}decodeShareLink(e){const r={rules:{}},n=new URL(e);if(`${n.protocol}//${n.host}${n.pathname}`.toLowerCase()!==this.baseUrl)throw new SharerDecoderError("Unknown URI "+JSON.stringify(e));const t=(n.search||"").substr(1).split("&").filter(e=>"r="===e.substring(0,2)).map(e=>e.substring(2));if(!t.length)return r;const o=punycode.decode(decodeURIComponent(t[0])),s={};function a(e,r){const n=parseInt(e.substr(r++,1),10);return[r+n,e.substr(r,n)]}function c(e,r){let n,t,s;for(;!s;){const c=parseInt(o.substr(r,1),10);switch(c){case 7:case 8:case 9:t=a(e,++r),n||(n={}),r=t[0],n[7==c?"start":8==c?"cons":"other"]=t[1];break;default:n||(n=e.substr(++r,c),r+=c),s=!0}}return[r,n]}for(var i=0;i<o.length;){const e=a(o,i);i=e[0];const r=e[1],n=c(o,i);i=n[0];const t=n[1];s[r]=t}return r.rules=s,r}}function makeShareLink(e){return(new Sharer).makeShareLink(e)}function decodeShareLink(e){return(new Sharer).decodeShareLink(e)}function normalize(e){return makeShareLink(decodeShareLink(e))}module.exports={Sharer:Sharer,makeShareLink:makeShareLink,decodeShareLink:decodeShareLink,normalize:normalize}},{"./punycode":4}],8:[function(require,module,exports){const RegexBuilder=require("./regex_builder").RegexBuilder;class Transliterator{constructor(e){this.compiled=Transliterator.compileTable(e)}static compileTable(e){const o="абвгґдеєжзиіїйклмнопрстуфхцчшщьюя",r=o.toLocaleUpperCase(),t=["'","’","ʼ"],a={},c={},s={},l=e=>e.toLocaleLowerCase().replace(/^./,e=>e.toLocaleUpperCase()),n=e=>e.toLocaleLowerCase().replace(/.$/,e=>e.toLocaleUpperCase());Object.keys(e).forEach(o=>{const r=o.toLocaleLowerCase(),p=r.toLocaleUpperCase();let i=e[o];if(null==i&&(i=""),"object"==typeof i){if("start"in i){const e=i.start||"";c[r]=e,c[p]=l(e),o.length>1&&(c[n(o)]=n(e),c[l(o)]=l(e))}if("cons"in i){const e=i.cons||"";s[r]=e,s[p]=l(e)}const e=i.other||"";a[r]=e,a[p]=l(e),o.length>1&&(a[n(o)]=n(e),a[l(o)]=l(e))}else o.indexOf("'")>=0?t.forEach(e=>{const r=o.replace("'",e);a[r]=i}):(a[r]=i,a[p]=l(i),o.length>1&&(a[n(o)]=n(i),a[l(o)]=l(i)))});const p=Object.keys(a).filter(e=>1===e.length).map(e=>[e.toLocaleLowerCase(),e.toLocaleUpperCase()]).reduce((e,o)=>e.concat(o),[]),i=Object.keys(a).filter(e=>e.length>1).sort((e,o)=>o.length-e.length).map(e=>[e.toLocaleLowerCase(),e.toLocaleUpperCase(),l(e),n(e)]).reduce((e,o)=>e.concat(o),[]),u=Object.keys(c).map(e=>[e.toLocaleLowerCase(),e.toLocaleUpperCase()]).reduce((e,o)=>e.concat(o),[]),L="бвгґджзйклмнпрстфхцчшщ"+"бвгґджзйклмнпрстфхцчшщ".toLocaleUpperCase(),g=Object.keys(s).map(e=>[e.toLocaleLowerCase(),e.toLocaleUpperCase()]).reduce((e,o)=>e.concat(o),[]),h=new RegexBuilder;return{regex:h.or(h.ngroup(h.orgroup("^",h.xchars(o,r,...t)),h.orgroup(h.chars(...u))),h.or(h.orgroup(...i.length>0?i:["￼￼"]),h.group(h.chars(L),h.chars(...g)),h.orgroup(h.chars(...p)))).regex("g"),callback:(e,o,r,t,l,n)=>{if(r)return o+c[r];if(t)return a[t];if(l)return a[l[0]]+s[l[1]];return a[n]}}}convert(e){return e.replace(this.compiled.regex,this.compiled.callback)}processTextNodes(e){e.forEach(e=>{const o=e.data||"";e.data=this.convert(o)})}}module.exports={Transliterator:Transliterator}},{"./regex_builder":5}],9:[function(require,module,exports){class GitioUrlShortener{constructor(){this.serviceUrl="https://git.io/"}shorten(e,t){const r=new XMLHttpRequest,n=new FormData;n.append("url",e),r.onreadystatechange=()=>{4===r.readyState&&201===r.status&&t(r.getResponseHeader("Location"))},r.open("POST",this.serviceUrl,!0),r.send(n)}}function shorten(e,t){return(new GitioUrlShortener).shorten(e,t)}module.exports={shorten:shorten}},{}],10:[function(require,module,exports){const sharer=require("./sharer"),renderer=require("./renderer");function app(){const e=window.location,r=`${e.protocol}//${e.host}${e.pathname}`,n=new sharer.Sharer(r);try{var o=n.decodeShareLink(document.URL)}catch(e){console.log(e)}renderer.render(o||{rules:{}})}window.addEventListener("load",()=>app())},{"./renderer":6,"./sharer":7}]},{},[10]);