import { translate_text_item } from "./langUtils.js";
import { HTMLDecode } from "./common.js";

//removeIf(production)
var translated_list = [];
//endRemoveIf(production)

/** Set up text translation to the selected language */
const translate_text = (lang) => {
	let translated_content = "";

	const All = document.getElementsByTagName("*");
	for (let i = 0; i < All.length; i++) {
		if (All[i].hasAttribute("translate")) {
			let content = "";
			if (!All[i].hasAttribute("english_content")) {
				content = All[i].innerHTML;
				content.trim();
				All[i].setAttribute("english_content", content);
				//removeIf(production)
				const item = {
					content: content,
				};
				translated_list.push(item);
				//endRemoveIf(production)
			}
			content = All[i].getAttribute("english_content");
			translated_content = translate_text_item(content);

			All[i].innerHTML = translated_content;
		}
		//add support for placeholder attribut
		if (
			All[i].hasAttribute("translateph") &&
			All[i].hasAttribute("placeholder")
		) {
			let content = "";
			if (!All[i].hasAttribute("english_content")) {
				content = All[i].getAttribute("placeholder");
				content.trim();
				//removeIf(production)
				const item = {
					content: content,
				};
				translated_list.push(item);
				//endRemoveIf(production)
				All[i].setAttribute("english_content", content);
			}
			content = All[i].getAttribute("english_content");

			translated_content = HTMLDecode(translate_text_item(content));
			All[i].setAttribute("placeholder", translated_content);
		}
	}
};

export { translate_text };
