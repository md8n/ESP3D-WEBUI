import { language_list } from "./languages.js";
import { getPrefValue } from "./preferencesdlg.js";
import { HTMLDecode } from "./util.js";


//removeIf(de_lang_disabled)
import { germantrans } from "./language/de.js";
//endRemoveIf(de_lang_disabled)
//removeIf(en_lang_disabled)
import { englishtrans } from "./language/en.js";
//endRemoveIf(en_lang_disabled)
//removeIf(es_lang_disabled)
import { spanishtrans } from "./language/es.js";
//endRemoveIf(es_lang_disabled)
//removeIf(fr_lang_disabled)
import { frenchtrans } from "./language/fr.js";
//endRemoveIf(fr_lang_disabled)
//removeIf(it_lang_disabled)
import { italiantrans } from "./language/it.js";
//endRemoveIf(it_lang_disabled)
//removeIf(ja_lang_disabled)
import { japanesetrans } from "./language/ja.js";
//endRemoveIf(ja_lang_disabled)
//removeIf(hu_lang_disabled)
import { hungariantrans } from "./language/hu.js";
//endRemoveIf(hu_lang_disabled)
//removeIf(pl_lang_disabled)
import { polishtrans } from "./language/pl.js";
//endRemoveIf(pl_lang_disabled)
//removeIf(ptbr_lang_disabled)
import { ptbrtrans } from "./language/ptbr.js";
//endRemoveIf(ptbr_lang_disabled)
//removeIf(ru_lang_disabled)
import { russiantrans } from "./language/ru.js";
//endRemoveIf(ru_lang_disabled)
//removeIf(tr_lang_disabled)
import { turkishtrans } from "./language/tr.js";
//endRemoveIf(tr_lang_disabled)
//removeIf(uk_lang_disabled)
import { ukrtrans } from "./language/uk.js";
//endRemoveIf(uk_lang_disabled)
//removeIf(zh_cn_lang_disabled)
import { zh_CN_trans } from "./language/zh_CN.js";
//endRemoveIf(zh_cn_lang_disabled)

//removeIf(production)
var translated_list = [];
//endRemoveIf(production)

/** Set up text translation to the selected language */
const translate_text = (lang) => {
    var currenttrans = {};
    var translated_content = "";
    for (var lang_i = 0; lang_i < language_list.length; lang_i++) {
        if (language_list[lang_i][0] == lang) {
            currenttrans = eval(language_list[lang_i][2]);
        }
    }
    var All = document.getElementsByTagName('*');
    for (var i = 0; i < All.length; i++) {
        if (All[i].hasAttribute('translate')) {
            var content = "";
            if (!All[i].hasAttribute('english_content')) {
                content = All[i].innerHTML;
                content.trim();
                All[i].setAttribute('english_content', content);
                //removeIf(production)        
                const item = {
                    content: content
                };
                translated_list.push(item);
                //endRemoveIf(production)
            }
            content = All[i].getAttribute('english_content');
            translated_content = translate_text_item(content);

            All[i].innerHTML = translated_content;
        }
        //add support for placeholder attribut
        if (All[i].hasAttribute('translateph') && All[i].hasAttribute('placeholder')) {
            var content = "";
            if (!All[i].hasAttribute('english_content')) {
                content = All[i].getAttribute('placeholder');
                content.trim();
                //removeIf(production) 
                var item = {
                    content: content
                };
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
const translate_text_item = (item_text, withtag) => {
    var currenttrans = {};
    var translated_content;
    const with_tag = (typeof withtag !== "undefined") ? !!withtag : false;

    for (let lang_i = 0; lang_i < language_list.length; lang_i++) {
        if (language_list[lang_i][0] === getPrefValue("language_list")) {
            currenttrans = eval(language_list[lang_i][2]);
        }
    }

    translated_content = currenttrans[item_text];
    if (typeof translated_content === 'undefined') translated_content = item_text;
    if (with_tag) {
        const translated_content_tmp = `<span english_content="${item_text}" translate>${translated_content}</span>`;
        translated_content = translated_content_tmp;
    }

    return translated_content;
}

export { translate_text, translate_text_item };
