import { classes } from "./common.js";

const clear_drop_menu = (event) => {
	const item = get_parent_by_class(event.target, "dropdownselect");
	const ignore_id = item?.id || "-1";
	// biome-ignore lint/complexity/noForEach: <explanation>
	classes("dropmenu-content").forEach((item) => {
		const item2 = get_parent_by_class(item, "dropdownselect");
		if (item2?.id !== ignore_id) {
			item.classList.remove("show");
		}
	});
}

function get_parent_by_class(item, classname) {
	if (item === null || typeof item === "undefined") {
		return null;
	}
	if (item.classList.contains(classname)) {
		return item;
	}
	return get_parent_by_class(item.parentElement, classname);
}

function hide_drop_menu(event) {
	const item = get_parent_by_class(event.target, "dropmenu-content");
	if (item) {
		item.classList.remove("show");
	}
}

const showhide_drop_menu = (event) => {
	const item = get_parent_by_class(event.target, "dropdownselect");
	if (item === null) {
		return;
	}
	const menu = item.getElementsByClassName("dropmenu-content")[0];
	if (menu) {
		menu.classList.toggle("show");
	}
};

export { clear_drop_menu, hide_drop_menu, showhide_drop_menu };
