
import { current_setting_filter, refreshSettings, restart_esp } from "./settings";
import { SPIFFSdlg } from "./SPIFFSdlg";
import { statusdlg } from "./statusdlg";
import { updatedlg } from "./updatedlg";
import { id } from "./util";

/** Set up the event handlers for the settings tab */
const settingstab = () => {
    id("nvs_setting_filter").addEventListener("click", (event) => build_HTML_setting_list('nvs'));
    id("tree_setting_filter").addEventListener("click", (event) => build_HTML_setting_list('tree'));

    id("settings_status_btn").addEventListener("click", (event) => statusdlg());
    id("settings_SPIFFS_btn").addEventListener("click", (event) => SPIFFSdlg('/'));
    id("settings_update_fw_btn").addEventListener("click", (event) => updatedlg());
    id("settings_restart_btn").addEventListener("click", (event) => restart_esp());
    id("settings_refresh_btn").addEventListener("click", (event) => refreshSettings(current_setting_filter()));
}

export { settingstab };
