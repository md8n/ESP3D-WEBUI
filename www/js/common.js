/** Imports everything else, and re-exports them, helping to flatten out all of the myriad circular dependencies
 * Also has its own class `common` that can funtion as an alternative to globals
 */
// The following must be imported first, and in this order
import { M } from "./constants.js";
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
import { numpad } from "./numpad.js";

import { alertdlg } from "./alertdlg.js";
import {
	CALIBRATION_EVENT_NAME,
	findMaxFitness,
} from "./calculatesCalibrationStuff.js";
import { cameratab, camera_GetAddress } from "./camera.js";
import {
	init_command_panel,
	Monitor_check_autoscroll,
	Monitor_check_verbose_mode,
	Monitor_output_Update,
} from "./commands.js";
import {
	Apply_config_override,
	Delete_config_override,
	refreshconfig,
} from "./config.js";
import { configtab } from "./configtab.js";
import { confirmdlg } from "./confirmdlg.js";
import { connectdlg } from "./connectdlg.js";
import {
	ControlsPanel,
	get_Position,
	init_controls_panel,
	on_autocheck_position,
} from "./controls.js";
import { creditsdlg } from "./creditsdlg.js";
import { clear_drop_menu, showhide_drop_menu } from "./dropmenu.js";
import {
	build_file_filter_list,
	files_list_success,
	files_select_upload,
	init_files_panel,
} from "./files.js";
import {
	build_axis_selection,
	grblHandleMessage,
	grbl_reset,
	onAutoReportIntervalChange,
	onstatusIntervalChange,
	onprobemaxtravelChange,
	onprobefeedrateChange,
	onproberetractChange,
	onprobetouchplatethicknessChange,
	reportNone,
	tryAutoReport,
	reportPolled,
	SendRealtimeCmd,
	StartProbeProcess,
	MPOS,
	WPOS,
} from "./grbl.js";
import { grblpanel } from "./grblpanel.js";
import { clear_cmd_list, SendFileHttp, SendGetHttp } from "./http.js";
import { get_icon_svg } from "./icons.js";
import { inputdlg } from "./inputdlg.js";
import { language_list } from "./languages.js";
import { build_language_list, translate_text_item } from "./langUtils.js";
import { DisconnectLogin, logindlg } from "./logindlg.js";
import { showmacrodlg } from "./macrodlg.js";
import {
	MaslowErrMsgKeyValueCantUse,
	MaslowErrMsgNoKey,
	MaslowErrMsgNoValue,
	MaslowErrMsgNoMatchingKey,
	MaslowErrMsgKeyValueSuffix,
	maslowInfoMsgHandling,
	maslowErrorMsgHandling,
	maslowMsgHandling,
	checkHomed,
	sendCommand,
	loadConfigValues,
	loadCornerValues,
	saveConfigValues,
} from "./maslow.js";
import {
	listmodal,
	closeModal,
	getactiveModal,
	setactiveModal,
	showModal,
} from "./modaldlg.js";
import { navbar, ontoggleLock } from "./navbar.js";
import { changepassworddlg } from "./passworddlg.js";
import { prefDefs } from "./prefDefs.js";
import {
	buildFieldId,
	enable_ping,
	getPref,
	getPrefValue,
	setPrefValue,
	preferences,
} from "./prefUtils.js";
import {
	getpreferenceslist,
	initpreferences,
	showpreferencesdlg,
	SavePreferences,
} from "./preferencesdlg.js";
import { SendPrinterCommand } from "./printercmd.js";
import { restartdlg } from "./restartdlg.js";
import { scanwifidlg } from "./scanwifidlg.js";
import {
	build_control_from_pos,
	build_HTML_setting_list,
	define_esp_role,
	define_esp_role_from_pos,
	refreshSettings,
	restart_esp,
	saveMaslowYaml,
} from "./settings.js";
import { settingstab } from "./settingstab.js";
import { setupdlg } from "./setupdlg.js";
import {
	CancelCurrentUpload,
	handlePing,
	EventListenerSetup,
	process_socket_response,
	startSocket,
} from "./socket.js";
import { SPIFFSdlg } from "./SPIFFSdlg.js";
import { statusdlg } from "./statusdlg.js";
import { opentab } from "./tabs.js";
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
	// from calculatesCalibrationStuff.js
	CALIBRATION_EVENT_NAME,
	findMaxFitness,
	// from camera.js
	cameratab,
	camera_GetAddress,
	// from commands.js
	init_command_panel,
	Monitor_check_autoscroll,
	Monitor_check_verbose_mode,
	Monitor_output_Update,
	// from config.js
	Apply_config_override,
	Delete_config_override,
	refreshconfig,
	// from configtab.js
	configtab,
	// from confirmdlg.js
	confirmdlg,
	// from connectdlg.js
	connectdlg,
	// from constants.js
	M,
	// from controls.js
	ControlsPanel,
	get_Position,
	init_controls_panel,
	on_autocheck_position,
	// from creditsdlg.js
	creditsdlg,
	// from dropmenu.js
	clear_drop_menu,
	showhide_drop_menu,
	// files.js
	build_file_filter_list,
	files_list_success,
	files_select_upload,
	init_files_panel,
	// from grbl.js
	build_axis_selection,
	grblHandleMessage,
	grbl_reset,
	onAutoReportIntervalChange,
	onstatusIntervalChange,
	onprobemaxtravelChange,
	onprobefeedrateChange,
	onproberetractChange,
	onprobetouchplatethicknessChange,
	reportNone,
	tryAutoReport,
	reportPolled,
	SendRealtimeCmd,
	StartProbeProcess,
	MPOS,
	WPOS,
	// from grblpanel.js
	grblpanel,
	// from http.js
	clear_cmd_list,
	SendFileHttp,
	SendGetHttp,
	// from icons.js
	get_icon_svg,
	// from inputdlg.js
	inputdlg,
	// from languages.js
	language_list,
	// from langUtils.js
	build_language_list,
	translate_text_item,
	// from logindlg.js
	DisconnectLogin,
	logindlg,
	// from macrodlg.js
	showmacrodlg,
	// from maslow.js
	MaslowErrMsgKeyValueCantUse,
	MaslowErrMsgNoKey,
	MaslowErrMsgNoValue,
	MaslowErrMsgNoMatchingKey,
	MaslowErrMsgKeyValueSuffix,
	maslowInfoMsgHandling,
	maslowErrorMsgHandling,
	maslowMsgHandling,
	checkHomed,
	sendCommand,
	loadConfigValues,
	loadCornerValues,
	saveConfigValues,
	// from modaldlg.js
	listmodal,
	closeModal,
	getactiveModal,
	setactiveModal,
	showModal,
	// from navbar.js
	navbar,
	ontoggleLock,
	// from numpad.js
	numpad,
	// from passworddlg.js
	changepassworddlg,
	// from prefDefs.js
	prefDefs,
	// from prefUtils.js
	buildFieldId,
	enable_ping,
	getPref,
	getPrefValue,
	setPrefValue,
	preferences,
	// from preferencesdlg.js
	getpreferenceslist,
	initpreferences,
	showpreferencesdlg,
	SavePreferences,
	// from printercmd.js
	SendPrinterCommand,
	// from restartdlg.js
	restartdlg,
	// from scanwifidlg.js
	scanwifidlg,
	// from settings.js
	build_control_from_pos,
	build_HTML_setting_list,
	define_esp_role,
	define_esp_role_from_pos,
	refreshSettings,
	restart_esp,
	saveMaslowYaml,
	// from setupdlg.js
	setupdlg,
	// from settingstab.js
	settingstab,
	// from socket.js
	CancelCurrentUpload,
	handlePing,
	EventListenerSetup,
	process_socket_response,
	startSocket,
	// from SPIFFSdlg.js
	SPIFFSdlg,
	// from statusdlg.js
	statusdlg,
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
