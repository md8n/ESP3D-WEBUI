import { Common, HTMLDecode } from "./common.js";

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

//removeIf(production)
const translated_list = [];
//endRemoveIf(production)

/** Build a language list select element */
const build_language_list = (id_item) => {
    const common = new Common();

    const content = [`<select class='form-control' id='${id_item}'>`];
    for (let lang_i = 0; lang_i < language_list.length; lang_i++) {
        const langCode = language_list[lang_i][0];
        const langName = language_list[lang_i][1];
        const langEnabled = language_list[lang_i][2] ? "" : "disabled";
        const isSelected = (langCode === common.language) ? "selected" : "";

        content.push(`<option value='${langCode}' ${isSelected} ${langEnabled}>${langName}</option>`);
    }
    content.push("</select>");
    return content.join("\n");
}

function translate_text(lang) {
    let currenttrans = {};
    let translated_content = "";
    const common = new Common();

    common.language = lang;
    for (let lang_i = 0; lang_i < language_list.length; lang_i++) {
        if (language_list[lang_i][0] === lang) {
            // biome-ignore lint/security/noGlobalEval: <explanation>
            currenttrans = eval(language_list[lang_i][2]);
        }
    }
    const All = document.getElementsByTagName('*');
    for (let i = 0; i < All.length; i++) {
        if (All[i].hasAttribute('translate')) {
            let content = "";
            if (!All[i].hasAttribute('english_content')) {
                content = All[i].innerHTML;
                content.trim();
                All[i].setAttribute('english_content', content);
                //removeIf(production)        
                const item = { content: content };
                translated_list.push(item);
                //endRemoveIf(production)
            }
            content = All[i].getAttribute('english_content');
            translated_content = translate_text_item(content);

            All[i].innerHTML = translated_content;
        }
        //add support for placeholder attribut
        if (All[i].hasAttribute('translateph') && All[i].hasAttribute('placeholder')) {
            let content = "";
            if (!All[i].hasAttribute('english_content')) {
                content = All[i].getAttribute('placeholder');
                content.trim();
                //removeIf(production) 
                const item = { content: content  };
                translated_list.push(item);
                //endRemoveIf(production)
                All[i].setAttribute('english_content', content);
            }
            content = All[i].getAttribute('english_content');

            translated_content = HTMLDecode(translate_text_item(content));
            All[i].setAttribute('placeholder', translated_content)
        }
    }
};

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

export { build_language_list, translate_text, translate_text_item };