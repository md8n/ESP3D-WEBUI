/** Imports everything else, and re-exports them, helping to flatten out all of the myriad circular dependencies
 * Also has its own class `common` that can funtion as an alternative to globals
 */
import { alertdlg } from "./alertdlg.js";
import { M } from "./constants.js";
import { confirmdlg } from "./confirmdlg.js";
import { creditsdlg } from "./creditsdlg.js";
import { clear_drop_menu, showhide_drop_menu } from "./dropmenu.js";
import { get_icon_svg } from "./icons.js";
import { inputdlg } from "./inputdlg.js";
import { language_list } from "./languages.js";
import { listmodal, closeModal, getactiveModal, setactiveModal, showModal } from "./modaldlg.js"
import { numpad } from "./numpad.js";
import { prefDefs } from "./prefDefs.js";
import { opentab } from "./tabs.js";
import {
	classes,
	conErr,
	stdErrMsg,
	disable_items,
	displayBlock,
	displayFlex,
	displayInline,
	displayNone,
	getChecked,
	setChecked,
	getValue,
	setValue,
	setHTML,
	HTMLEncode,
	HTMLDecode,
	id,
} from "./util.js";
import { openstep } from "./wizard.js";


/** Selected values that were globals, now set up as members of a singleton */
class Common {
	constructor() {
		if (Common.instance instanceof Common) {
			// biome-ignore lint/correctness/noConstructorReturn: <explanation>
			return Common.instance;
		}
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

		/** See loadHTML.js */
		this.loadedHTML = [];

		/** See settings.js */
		this.current_setting_filter = "nvs";
		this.setup_is_done = false;

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

export {
	Common,
    // from alertdlg.js
    alertdlg,
    // from confirmdlg.js
    confirmdlg,
	// from constants.js
	M,
    // from creditsdlg.js
    creditsdlg,
    // from dropmenu.js
    clear_drop_menu, showhide_drop_menu,
	// from icons.js
	get_icon_svg,
    // from inputdlg.js
    inputdlg,
	// from languages.js
	language_list,
    // from modaldlg.js
    listmodal, closeModal, getactiveModal, setactiveModal, showModal,
    // from numpad.js
    numpad,
	// from prefDefs.js
	prefDefs,
    // from tabs.js
    opentab,
	// from util.js
	classes,
	conErr,
	stdErrMsg,
	disable_items,
	displayBlock,
	displayFlex,
	displayInline,
	displayNone,
	getChecked,
	setChecked,
	getValue,
	setValue,
	setHTML,
	HTMLEncode,
	HTMLDecode,
	id,
    // from wizard.js
    openstep,
};
