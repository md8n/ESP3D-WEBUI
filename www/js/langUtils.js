import { language_list } from "./languages";
import { getPrefValue } from "./prefUtils";

/** Build a language list select element */
const build_language_list = (id_item) => {
    const content = [`<select class='form-control' id='${id_item}'>`];
    for (let lang_i = 0; lang_i < language_list.length; lang_i++) {
        const isSelected = (language_list[lang_i][0] === getPrefValue("language_list")) ? "selected" : "";
        content.push(`<option value='${language_list[lang_i][0]}' ${isSelected}>${language_list[lang_i][1]}</option>`);
    }
    content.push("</select>");
    return content.join("\n");
}

const getCurrentTrans = () => {
    let currenttrans = {};

    for (let lang_i = 0; lang_i < language_list.length; lang_i++) {
        if (language_list[lang_i][0] === getPrefValue("language_list")) {
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
    if (typeof translated_content === 'undefined') translated_content = item_text;
    if (withtag) {
        const translated_content_tmp = `<span english_content="${item_text}" translate>${translated_content}</span>`;
        translated_content = translated_content_tmp;
    }

    return translated_content;
}

export { build_language_list, translate_text_item };
