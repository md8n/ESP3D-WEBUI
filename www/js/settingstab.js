import {
	Common,
	id,
	refreshSettings,
	restart_esp,
	SPIFFSdlg,
	statusdlg,
} from "./common.js";
import { updatedlg } from "./updatedlg.js";

/** Set up the event handlers for the settings tab */
const settingstab = () => {
	id("nvs_setting_filter").addEventListener("click", (event) =>
		build_HTML_setting_list("nvs"),
	);
	id("tree_setting_filter").addEventListener("click", (event) =>
		build_HTML_setting_list("tree"),
	);

	id("settings_status_btn").addEventListener("click", (event) => statusdlg());
	id("settings_SPIFFS_btn").addEventListener("click", (event) =>
		SPIFFSdlg("/"),
	);
	id("settings_update_fw_btn").addEventListener("click", (event) =>
		updatedlg(),
	);
	id("settings_restart_btn").addEventListener("click", (event) =>
		restart_esp(),
	);

	const common = new Common();
	id("settings_refresh_btn").addEventListener("click", (event) =>
		refreshSettings(common.current_setting_filter),
	);
};

export { settingstab };
