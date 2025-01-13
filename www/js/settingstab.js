import {
	Common,
	id,
	build_HTML_setting_list,
	refreshSettings,
	restart_esp,
	setHTML,
	get_icon_svg,
	SPIFFSdlg,
	statusdlg,
	updatedlg,
} from "./common.js";

/** Set up the event handlers for the settings tab */
const settingstab = () => {
	id("nvs_setting_filter").addEventListener("click", (event) => build_HTML_setting_list("nvs"));
	id("tree_setting_filter").addEventListener("click", (event) => build_HTML_setting_list("tree"));

	id("settings_status_btn").addEventListener("click", (event) => statusdlg());
	id("settings_SPIFFS_btn").addEventListener("click", (event) => SPIFFSdlg("/"));
	id("settings_update_fw_btn").addEventListener("click", (event) => updatedlg());
	id("settings_restart_btn").addEventListener("click", (event) => restart_esp());

	const common = new Common();
	id("settings_refresh_btn").addEventListener("click", (event) => refreshSettings(common.current_setting_filter));

	const iconOptions = { t: "translate(50,1200) scale(1,-1)" };
	setHTML("settings_status_btn", get_icon_svg("th-list", iconOptions));
	setHTML("settings_update_fw_btn", get_icon_svg("cloud-download", iconOptions));
	setHTML("settings_restart_btn", get_icon_svg("off", iconOptions));
	setHTML("settings_refresh_btn", get_icon_svg("refresh", iconOptions));
	setHTML("settings_SPIFFS_btn", get_icon_svg("folder-open", iconOptions));
};

export { settingstab };
