
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

const language_list = [
//removeIf(de_lang_disabled)
    ['de', 'Deutsch', germantrans],
//endRemoveIf(de_lang_disabled)
//removeIf(en_lang_disabled)
    ['en', 'English', englishtrans],
//endRemoveIf(en_lang_disabled)
//removeIf(es_lang_disabled)
    ['es', 'Espa&ntilde;ol', spanishtrans],
//endRemoveIf(es_lang_disabled)
//removeIf(fr_lang_disabled)
    ['fr', 'Fran&ccedil;ais', frenchtrans],
//endRemoveIf(fr_lang_disabled)
//removeIf(it_lang_disabled)
    ['it', 'Italiano', italiantrans],
//endRemoveIf(it_lang_disabled)
//removeIf(ja_lang_disabled)
    ['ja', '&#26085;&#26412;&#35486;', japanesetrans],
//endRemoveIf(ja_lang_disabled)
//removeIf(hu_lang_disabled)
    ['hu', 'Magyar', hungariantrans],
//endRemoveIf(hu_lang_disabled)
//removeIf(pl_lang_disabled)
    ['pl', 'Polski', polishtrans],
//endRemoveIf(pl_lang_disabled)
//removeIf(ptbr_lang_disabled)
    ['ptbr', 'Português-Br', ptbrtrans],
//endRemoveIf(ptbr_lang_disabled)
//removeIf(ru_lang_disabled)
    ['ru', 'Русский', russiantrans],
//endRemoveIf(ru_lang_disabled)
//removeIf(tr_lang_disabled)
    ['tr', 'T&uuml;rk&ccedil;e', turkishtrans],
//endRemoveIf(tr_lang_disabled)
//removeIf(uk_lang_disabled)
    ['uk', 'Українська', ukrtrans],
//endRemoveIf(uk_lang_disabled)
//removeIf(zh_cn_lang_disabled)
    ['zh_CN', '&#31616;&#20307;&#20013;&#25991;', zh_CN_trans],
//endRemoveIf(zh_cn_lang_disabled)
];

export { language_list };
