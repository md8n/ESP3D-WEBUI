/** Imports everything else, and re-exports them, helping to flatten out all of the myriad circular dependencies
 * Also has its own class `common` that can funtion as an alternative to globals
 */
// The following must be imported first, and in this order
import { M } from "./constants.js";
import {
	classes,
	conErr,
	stdErrMsg,
	getChecked,
	setChecked,
	getValue,
	setValue,
	setHTML,
	HTMLEncode,
	HTMLDecode,
	id,
	browser_is,
} from "./util.js";
import { displayBlock, displayFlex, displayTable, displayInitial, displayInline, displayNone, displayUndoNone } from "./utilDisplay.js";
import { numpad } from "./numpad.js";
import { checkValue, valueIsFloat } from "./utilValidation.js";

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
	JogFeedrate,
	on_autocheck_position,
} from "./controls.js";
import { creditsdlg } from "./creditsdlg.js";
import { clear_drop_menu, hide_drop_menu, showhide_drop_menu } from "./dropmenu.js";
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
	init_grbl_panel,
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
import { AddCmd, clear_cmd_list, SendFileHttp, SendGetHttp } from "./http.js";
import { get_icon_svg } from "./icons.js";
import { Set_page_title, update_UI_firmware_target, initUI } from "./initUI.js";
import { inputdlg } from "./inputdlg.js";
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
import { Toolpath } from "./simple-toolpath.js";
import {
	CancelCurrentUpload,
	handlePing,
	EventListenerSetup,
	pageID,
	process_socket_response,
	startSocket,
} from "./socket.js";
import { SPIFFSdlg } from "./SPIFFSdlg.js";
import { statusdlg } from "./statusdlg.js";
import { opentab } from "./tabs.js";
import {
	loadedValues,
	openModal,
	hideModal,
	goAxisByValue,
	onCalibrationButtonsClick,
	saveSerialMessages,
	tabletInit,
} from "./tablet.js";
import { translate_text } from "./translate.js";
import { UIdisableddlg } from "./UIdisableddlg.js";
import { updatedlg } from "./updatedlg.js";
import { openstep } from "./wizard.js";

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
		this.reportType = 'none';
		this.spindleTabSpindleSpeed = 1;
		this.modal = {
			modes: "",
			plane: "G17",
			units: "G21",
			wcs: "G54",
			distance: "G90",
		};
		this.MPOS = [0, 0, 0];
		this.WPOS = [0, 0, 0];

		/** See http.js */
		this.http_communication_locked = false;
		this.page_id = "";
		this.xmlhttpupload;

		/** See loadHTML.js - coming soon */
		this.loadedHTML = [];

		/** See preferencesdlg.js */
		this.enable_ping = true;
		/** This clunker piece of code works with/against `this.language` below */
		this.language_save = "en";

		/** See printercmd.js */
		this.grbl_errorfn = null;
		this.grbl_processfn = null;

		/** See settings.js */
		this.current_setting_filter = "nvs";
		this.setup_is_done = false;
		this.do_not_build_settings = false;

		this.SETTINGS_AP_MODE = 1;
		this.SETTINGS_STA_MODE = 2;
		this.SETTINGS_FALLBACK_MODE = 3;

		/** See setupdlg.js */
		this.EP_STA_SSID = "Sta/SSID";
		this.EP_STA_PASSWORD = "Sta/Password";
		this.EP_WIFI_MODE = "WiFi/Mode";
		this.EP_AP_SSID = "AP/SSID";
		this.EP_AP_PASSWORD = "AP/Password";
		this.EP_IS_DIRECT_SD = 850;
		this.EP_PRIMARY_SD = 851;
		this.EP_SECONDARY_SD = 852;
		this.EP_DIRECT_SD_CHECK = 853;

		/** Apparently unused ? */
		this.EP_STA_IP_MODE = "Sta/IPMode";
		this.EP_STA_IP_VALUE = "Sta/IP";
		this.EP_STA_GW_VALUE = "Sta/Gateway";
		this.EP_STA_MK_VALUE = "Sta/Netmask";
		this.EP_AP_IP_VALUE = "AP/IP";
		this.EP_BAUD_RATE = 112;
		this.EP_AUTH_TYPE = 119;
		this.EP_TARGET_FW = 461;

		/** See socket.js */
		this.async_webcommunication = false;
		/** Id of the interval timer */
		this.interval_ping = -1;

		/** See SPIFFSdlg.js */
		this.SPIFFS_currentpath = "/";

		/** see tablet.js */
		this.gCodeDisplayable = false;

		/** see translate.js */
		/** This clunker piece of code works with/against `this.language_save` above */
		this.language = 'en';

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
	JogFeedrate,
	on_autocheck_position,
	// from creditsdlg.js
	creditsdlg,
	// from dropmenu.js
	clear_drop_menu,
	hide_drop_menu,
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
	init_grbl_panel,
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
	AddCmd,
	clear_cmd_list,
	SendFileHttp,
	SendGetHttp,
	// from icons.js
	get_icon_svg,
	// from "./initUI.js";
	Set_page_title, update_UI_firmware_target, initUI,
	// from inputdlg.js
	inputdlg,
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
	// from simple-toolpath.js
	Toolpath,
	// from socket.js
	CancelCurrentUpload,
	handlePing,
	EventListenerSetup,
	pageID,
	process_socket_response,
	startSocket,
	// from SPIFFSdlg.js
	SPIFFSdlg,
	// from statusdlg.js
	statusdlg,
	// from tabs.js
	opentab,
	// from tablet.js
	loadedValues,
	openModal,
	hideModal,
	goAxisByValue,
	onCalibrationButtonsClick,
	saveSerialMessages,
	tabletInit,
	// from translate.js
	translate_text,
	// from UIdisableddlg.js
	UIdisableddlg,
	// from updatedlg.js
	updatedlg,
	// from util.js
	classes,
	conErr,
	stdErrMsg,
	getChecked,
	setChecked,
	getValue,
	setValue,
	setHTML,
	HTMLEncode,
	HTMLDecode,
	id,
	browser_is,
	// from utilDisplay.js
	displayBlock, displayFlex, displayTable, displayInitial, displayInline, displayNone, displayUndoNone,
	// from utilValidation.js
	checkValue,
	valueIsFloat,
	// from wizard.js
	openstep,
};
