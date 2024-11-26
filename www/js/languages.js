import { translate_text } from "./translate";
import { id } from "./util";

const defLanguage = 'en';
let selLanguage = defLanguage;
/** The currently selected language code */
const language = (value) => {
    selLanguage = (typeof value !== "undefined") ? value : selLanguage || defLanguage;
    return selLanguage;
}

const language_list = [
//removeIf(de_lang_disabled)
    ['de', 'Deutsch', 'germantrans'],
//endRemoveIf(de_lang_disabled)
//removeIf(en_lang_disabled)
    ['en', 'English', 'englishtrans'],
//endRemoveIf(en_lang_disabled)
//removeIf(es_lang_disabled)
    ['es', 'Espa&ntilde;ol', 'spanishtrans'],
//endRemoveIf(es_lang_disabled)
//removeIf(fr_lang_disabled)
    ['fr', 'Fran&ccedil;ais', 'frenchtrans'],
//endRemoveIf(fr_lang_disabled)
//removeIf(it_lang_disabled)
    ['it', 'Italiano', 'italiantrans'],
//endRemoveIf(it_lang_disabled)
//removeIf(ja_lang_disabled)
    ['ja', '&#26085;&#26412;&#35486;', 'japanesetrans'],
//endRemoveIf(ja_lang_disabled)
//removeIf(hu_lang_disabled)
    ['hu', 'Magyar', 'hungariantrans'],
//endRemoveIf(hu_lang_disabled)
//removeIf(pl_lang_disabled)
    ['pl', 'Polski', 'polishtrans'],
//endRemoveIf(pl_lang_disabled)
//removeIf(ptbr_lang_disabled)
    ['ptbr', 'Português-Br', 'ptbrtrans'],
//endRemoveIf(ptbr_lang_disabled)
//removeIf(ru_lang_disabled)
    ['ru', 'Русский', 'russiantrans'],
//endRemoveIf(ru_lang_disabled)
//removeIf(tr_lang_disabled)
    ['tr', 'T&uuml;rk&ccedil;e', 'turkishtrans'],
//endRemoveIf(tr_lang_disabled)
//removeIf(uk_lang_disabled)
    ['uk', 'Українська', 'ukrtrans'],
//endRemoveIf(uk_lang_disabled)
//removeIf(zh_cn_lang_disabled)
    ['zh_CN', '&#31616;&#20307;&#20013;&#25991;', 'zh_CN_trans'],
//endRemoveIf(zh_cn_lang_disabled)
];

const build_language_list = (id_item) => {
    let content = [`<select class='form-control' id='${id_item}'>`];
    for (let lang_i = 0; lang_i < language_list.length; lang_i++) {
        const isSelected = (language_list[lang_i][0] == language()) ? "selected" : "";
        content.push(`<option value='${language_list[lang_i][0]}' ${isSelected}>${language_list[lang_i][1]}</option>`);
    }
    content.push("</select>");
    return content.join("\n");
}

/** Adds the event handler to the select.
 * IMPORTANT only call this after the language_list has been added to the DOM */
const add_language_list_event_handler = (id_item) => {
    id(id_item).addEventListener("change", (event) => translate_text(language()));
}

export { add_language_list_event_handler, build_language_list, language, language_list };
