// Selected values that were globals, now set up as members of a singleton

class Common {
	constructor() {
		if (Common.instance instanceof Common) {
			// biome-ignore lint/correctness/noConstructorReturn: <explanation>
			return Common.instance;
		}
		/** See controls.js */
		this.control_macrolist = [];
		/** See loadHTML.js */
		this.loadedHTML = [];

        /** See http.js */
        this.http_communication_locked = false;

        /** See socket.js */
        this.async_webcommunication = false;

        /** See SPIFFSdlg.js */
        this.SPIFFS_currentpath = "/";

        /** See util.js */
        this.last_ping = 0;

        /** See wizard.js - this is always false for some reason */
        this.can_revert_wizard = false;

		this.esp_error_code = 0;
		this.esp_error_message = "";

		// Use Object.freeze(this.whatever) if you need something to stay unchanged

		Common.instance = this;
	}
}

export { Common };