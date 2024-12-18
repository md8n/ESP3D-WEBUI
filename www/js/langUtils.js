import { getPrefValue} from "./common.js";

/** List of currently support languages
 * There should be a json file for each one of these in js/language
 * Also check serve.ts when serving locally
 */
const language_list = [
	["de", "Deutsch", typeof germantrans === "undefined" ? null : germantrans],
	["en", "English", typeof englishtrans === "undefined" ? null : englishtrans],
	["es", "Espa&ntilde;ol", typeof spanishtrans === "undefined" ? null : spanishtrans],
	["fr", "Fran&ccedil;ais", typeof frenchtrans === "undefined" ? null : frenchtrans],
	["it", "Italiano", typeof italiantrans === "undefined" ? null : italiantrans],
	["ja", "&#26085;&#26412;&#35486;", typeof japanesetrans === "undefined" ? null : japanesetrans],
	["hu", "Magyar", typeof hungariantrans === "undefined" ? null : hungariantrans],
	["pl", "Polski", typeof polishtrans === "undefined" ? null : polishtrans],
	["ptbr", "Português-Br", typeof ptbrtrans === "undefined" ? null : ptbrtrans],
	["ru", "Русский", typeof russiantrans === "undefined" ? null : russiantrans],
	["tr", "T&uuml;rk&ccedil;e", typeof turkishtrans === "undefined" ? null : turkishtrans],
	["uk", "Українська", typeof ukrtrans === "undefined" ? null : ukrtrans],
	["zh_CN", "&#31616;&#20307;&#20013;&#25991;", typeof zh_CN_trans === "undefined" ? null : zh_CN_trans],
];

/** Build a language list select element */
const build_language_list = (id_item) => {
    const content = [`<select class='form-control' id='${id_item}'>`];
    for (let lang_i = 0; lang_i < language_list.length; lang_i++) {
        const langCode = language_list[lang_i][0];
        const langName = language_list[lang_i][1];
        const langEnabled = language_list[lang_i][2] ? "" : "disabled";
        const isSelected = (langCode === getPrefValue("language_list")) ? "selected" : "";
        
        content.push(`<option value='${langCode}' ${isSelected} ${langEnabled}>${langName}</option>`);
    }
    content.push("</select>");
    return content.join("\n");
}

const getCurrentTrans = () => {
    let currenttrans = {};

    for (let lang_i = 0; lang_i < language_list.length; lang_i++) {
        const langCode = language_list[lang_i][0];
        const langEnabled = language_list[lang_i][2];
        if (langCode === getPrefValue("language_list") && langEnabled) {
            currenttrans = language_list[lang_i][2];
            break;
        }
    }

    return currenttrans;
}

/** Translate the supplied item_text, putting it into a `<span>` tag if required */
const translate_text_item = (item_text, withtag = false) => {
    const currenttrans = getCurrentTrans();

    let translated_content = currenttrans[item_text];
    if (typeof translated_content === 'undefined') {
        translated_content = item_text;
    }
    if (withtag) {
        return `<span english_content="${item_text}" translate>${translated_content}</span>`;
    }

    return translated_content;
}

export { build_language_list, translate_text_item };