/** Has its own class `common` that can function as an alternative to globals */

/** Selected values that were globals, now set up as members of a singleton */
class Common {
	constructor() {
		if (Common.instance instanceof Common) {
			// biome-ignore lint/correctness/noConstructorReturn: <explanation>
			return Common.instance;
		}

		/** See connectdlg.js */
		this.esp_hostname = "ESP3D WebUI";
		this.websocket_port = 0;
		this.websocket_ip = "";

		/** See controls.js */
		this.control_macrolist = [];

		/** See file.js */
		this.gCodeFilename = "";

		/** See grbl.js */
		this.calibrationResults = {};
		this.grblaxis = 3;
		this.grblzerocmd = "X0 Y0 Z0";
		this.spindleTabSpindleSpeed = 1;
		this.modal = {
			modes: "",
			plane: "G17",
			units: "G21",
			wcs: "G54",
			distance: "G90",
		};

		/** See http.js */
		this.http_communication_locked = false;
		this.page_id = "";
		this.xmlhttpupload;

		/** See loadHTML.js - coming soon */
		this.loadedHTML = [];

		/** See preferencesdlg.js */
		this.enable_ping = true;

		/** See settings.js */
		this.current_setting_filter = "nvs";
		this.setup_is_done = false;

		this.SETTINGS_AP_MODE = 1;
		this.SETTINGS_STA_MODE = 2;
		this.SETTINGS_FALLBACK_MODE = 3;

		/** See setupdlg.js */
		this.EP_STA_SSID = "Sta/SSID";

		/** See socket.js */
		this.async_webcommunication = false;

		/** See SPIFFSdlg.js */
		this.SPIFFS_currentpath = "/";

		/** See util.js */
		this.last_ping = 0;

		/** See wizard.js - this is always false for some reason */
		this.can_revert_wizard = false;

		this.ESP3D_authentication = false;
		this.esp_error_code = 0;
		this.esp_error_message = "";

		// Use Object.freeze(this.whatever) if you need something to stay unchanged

		Common.instance = this;
	}
}
