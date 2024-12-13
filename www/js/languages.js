import germantrans from "./language/de.json" with {type: "json"};
import englishtrans from "./language/en.json" with {type: "json"};
import spanishtrans from "./language/es.json" with {type: "json"};
import frenchtrans from "./language/fr.json" with {type: "json"};
import italiantrans from "./language/it.json" with {type: "json"};
import japanesetrans from "./language/ja.json" with {type: "json"};
import hungariantrans from "./language/hu.json" with {type: "json"};
import polishtrans from "./language/pl.json" with {type: "json"};
import ptbrtrans from "./language/ptbr.json" with {type: "json"};
import russiantrans from "./language/ru.json" with {type: "json"};
import turkishtrans from "./language/tr.json" with {type: "json"};
import ukrtrans from "./language/uk.json" with {type: "json"};
import zh_CN_trans from "./language/zh_CN.json" with {type: "json"};

const language_list = [
	["de", "Deutsch", germantrans],
	["en", "English", englishtrans],
	["es", "Espa&ntilde;ol", spanishtrans],
	["fr", "Fran&ccedil;ais", frenchtrans],
	["it", "Italiano", italiantrans],
	["ja", "&#26085;&#26412;&#35486;", japanesetrans],
	["hu", "Magyar", hungariantrans],
	["pl", "Polski", polishtrans],
	["ptbr", "Português-Br", ptbrtrans],
	["ru", "Русский", russiantrans],
	["tr", "T&uuml;rk&ccedil;e", turkishtrans],
	["uk", "Українська", ukrtrans],
	["zh_CN", "&#31616;&#20307;&#20013;&#25991;", zh_CN_trans],
];

export {
	language_list,
	germantrans,
	englishtrans,
	spanishtrans,
	frenchtrans,
	italiantrans,
	japanesetrans,
	hungariantrans,
	polishtrans,
	ptbrtrans,
	russiantrans,
	turkishtrans,
	ukrtrans,
	zh_CN_trans,
};
