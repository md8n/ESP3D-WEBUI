import { camera_GetAddress } from "./camera.js";
import {
	Monitor_check_autoscroll,
	Monitor_check_verbose_mode,
} from "./commands.js";
import {
	Common,
	get_icon_svg,
	prefDefs,
	conErr,
	displayBlock,
	displayFlex,
	displayNone,
	getChecked,
	getValue,
	id,
	setChecked,
	setValue,
	setHTML,
	stdErrMsg,
	clear_drop_menu,
	closeModal,
	setactiveModal,
	showModal,
	alertdlg,
	confirmdlg,
} from "./common.js";
import { build_file_filter_list } from "./files.js";
import { onAutoReportIntervalChange, reportNone } from "./grbl.js";
import { grblpanel } from "./grblpanel.js";
import { SendFileHttp, SendGetHttp } from "./http.js";
import { build_language_list, translate_text_item } from "./langUtils.js";
import { ontoggleLock } from "./navbar.js";
import {
	buildFieldId,
	getPref,
	getPrefValue,
	preferences,
} from "./prefUtils.js";
import { build_HTML_setting_list } from "./settings.js";
import { handlePing } from "./socket.js";
import { translate_text } from "./translate.js";

//Preferences dialog

const prefFile = "/preferences.json";

const buildElem = (elem, contents, classVal) => {
	const elemPanel = document.createElement(elem);
	if (classVal) {
		elemPanel.setAttribute("class", classVal);
	}
	elemPanel.innerHTML = contents;
	return elemPanel;
};

const buildDiv = (contents, classVal) => buildElem("div", contents, classVal);
const buildTable = (contents, classVal) =>
	buildElem("table", contents, classVal);

const buildDivPanel = (contents) =>
	buildDiv(
		`<div class="panel-heading">${contents}</div>`,
		"panel panel-default",
	);

const buildTdIcon = (icon) => `<td>${get_icon_svg(icon)}&nbsp;</td>`;
const buildTdLabel = (key, value) =>
	`<td><span>${translate_text_item(value.label || key, true)}:&nbsp;</span></td>`;
const buildTdInp = (inpFld, key, value) =>
	`<td><div class="input-group has-control">${inpFld}${buildSpnErrFld(key, value)}</div></td>`;
const buildSpnErrFld = (key, value) =>
	`<span id="${buildFieldId(key, value)}_icon" class="form-control-feedback ico_feedback"></span>`;

const buildFieldIdAttr = (key, value) => `id="${buildFieldId(key, value)}"`;
const buildMinMaxAttr = (value) =>
	`${typeof value.min !== "undefined" ? ` min="${value.min}"` : ""}${typeof value.max !== "undefined" ? ` max="${value.max}"` : ""}`;
const buildPlaceholderAttr = (value) =>
	value.placeholder ? `placeholder="${value.placeholder}" translateph` : "";

const setGroupId = (elem, fId) => elem.setAttribute("id", `${fId}_group`);

/** Build an input within a label for a checkbox element */
const buildCheckBox = (key, value) => {
	const inpCheckBox = `<input type="checkbox" ${buildFieldIdAttr(key, value)}/>`;
	return `<label>${inpCheckBox}${translate_text_item(value.label || key, true)}</label>`;
};

/** Generate a panel controlled by a checkbox */
const buildPanel = (key, value, parentElem, isFirstLevel = false) => {
	const fId = buildFieldId(key, value);
	const inpCheckBox = buildCheckBox(key, value);
	const panelCheckBox = isFirstLevel
		? buildDivPanel(`<div class="checkbox">${inpCheckBox}</div>`)
		: buildDiv(inpCheckBox, "checkbox");

	setGroupId(panelCheckBox, fId);
	parentElem.append(panelCheckBox);

	// prefDefs is tested for, but we do expect it always to be present
	if ("prefDefs" in value) {
		const pBody = buildDiv("", "panel-body");
		if ("panel" in value) {
			pBody.setAttribute("id", value.panel);
		}
		panelCheckBox.append(pBody);
		id(fId).addEventListener("click", (event) => togglePanel(fId, value.panel));
		// Loop around for the child elements
		buildDialog(pBody, value.prefDefs);
	}
};

/** Generate a checkbox that represents a boolean value */
const buildBoolean = (key, value, parentElem) => {
	const fId = buildFieldId(key, value);
	const panelCheckBox = buildDiv(buildCheckBox(key, value), "checkbox");

	setGroupId(panelCheckBox, fId);
	parentElem.append(panelCheckBox);
	id(fId).addEventListener("click", (event) => handleCheckboxClick(fId));
};

/** Generate a mini table for various numeric inputs */
const buildNumeric = (key, value, parentElem) => {
	const fId = buildFieldId(key, value);
	const inpNFld = `<input type="number" ${buildFieldIdAttr(key, value)}${buildMinMaxAttr(value)} class="form-control ${value.inpClass || ""}"/>`;
	const inpNTd = buildTdInp(inpNFld, key, value);

	const unitTd = `<td><div class="input-group"><input class="hide_it" /><span class="input-group-addon form_control" translate>${value.units}</span></div></td>`;

	const inpNTable = buildTable(
		`<tr>${buildTdLabel(key, value)}${inpNTd}${unitTd}</tr>`,
	);
	setGroupId(inpNTable, fId);
	// Check for feedrate that might not be visible
	if (fId.endsWith("_feedrate")) {
		if (["a_feedrate", "b_feedrate", "c_feedrate"].includes(fId)) {
			inpNTable.setAttribute("class", "hide_it topmarginspace");
		}
	}

	parentElem.append(inpNTable);
	id(fId).addEventListener("change", (event) => {
		if (CheckValue(fId, value)) {
			handleInputChange(fId);
		}
	});
};

/** Generate a mini table for text inputs */
const buildText = (key, value, parentElem) => {
	const fId = buildFieldId(key, value);
	const inpTFld = `<input type="text" ${buildFieldIdAttr(key, value)} class="form-control ${value.inpClass || ""}" ${buildPlaceholderAttr(value)}/>`;
	const inpTTd = `<td><div class="input-group has-control">${inpTFld}${buildSpnErrFld(value, key)}</div></td>`;

	const inpTTable = buildTable(`<tr>${buildTdLabel(key, value)}${inpTTd}</tr>`);
	setGroupId(inpTTable, fId);

	parentElem.append(inpTTable);
	id(fId).addEventListener("change", (event) => {
		if (CheckValue(fId, value)) {
			handleInputChange(fId);
		}
	});
};

/** Generate a mini table for selects */
const buildSelect = (key, value, parentElem) => {
	const fId = buildFieldId(key, value);
	const inpSTable = buildTable(
		`<tr>${buildTdIcon("flag")}<td>${build_language_list(fId)}</td></tr>`,
	);
	// Use the key for the containing table, instead of the fId, which has been used for the select
	inpSTable.setAttribute("id", key);
	setGroupId(inpSTable, fId);

	parentElem.append(inpSTable);
	id(fId).addEventListener("change", (event) => {
		if (CheckValue(fId, value)) {
			handleInputChange(fId);
		}
	});
};

/** Build the dialog from the prefDefs metadata */
const buildDialog = (parentElem, definitions, isFirstLevel = false) => {
	for (const [key, value] of Object.entries(definitions)) {
		const fId = buildFieldId(key, value);
		// Check if the dialog has already been built
		if (id(fId)) {
			return;
		}
		switch (value.valueType) {
			case "panel":
				buildPanel(key, value, parentElem, isFirstLevel);
				break;
			case "bool":
				buildBoolean(key, value, parentElem);
				break;
			case "int":
			case "float":
				buildNumeric(key, value, parentElem);
				break;
			case "enctext":
			case "text":
				buildText(key, value, parentElem);
				break;
			case "select":
				buildSelect(key, value, parentElem);
				break;
			default:
				console.log(`${key}: ${JSON.stringify(value)}`);
				break;
		}
	}
};

/** Set the values into the dialog, and then for any checkbox, trigger the default behaviour */
const setDialog = (prefs) => {
	for (const [key, value] of Object.entries(prefs)) {
		// It is possible for the field element to not exist based on what happens in buildDialog
		const fElem = id(value.fieldId);
		switch (value.valueType) {
			case "panel":
			case "bool":
				if (fElem) {
					// Set the `checked` attribute of a checkbox to the default value
					// - note that `checked` does not change, once set, it functions as the starting default value.
					// The actual value is in the checkbox `value`
					fElem.checked =
						"defValue" in value
							? typeof value.defValue === "string" &&
								value.defValue.toLowerCase() === "false"
								? false
								: !!value.defValue
							: false;
					// Because `click`ing the checkbox will toggle it (one way or another) we click it twice
					fElem.value =
						typeof value.value === "string" &&
						value.value.toLowerCase() === "false"
							? "false"
							: `${!!value.value}`;
					fElem.click();
					fElem.click();
				}
				break;
			case "int":
			case "float":
			case "text":
			case "select":
				if (fElem) {
					fElem.value = value.value;
				}
				break;
			case "enctext":
				if (fElem) {
					fElem.value = value.value;
				}
				break;
			default:
				console.log(`${key}: ${JSON.stringify(value)}`);
				break;
		}
	}
};

/** Initialise the preferences dialog */
const initpreferences = () => {
	buildDialog(id("preferences_body"), prefDefs, true);
	setDialog(preferences);

	// And handlers for the other parts of the app
	setupNavbarHandlers();
	setupPreferenceHandlers();
	setupControlsHandlers();
	setupFilesHandlers();
	setupGRBLHandlers();
	setupCommandsHandlers();

	// Do final setup for other parts of the app
	setupNavbar();
	setupPreference();
	setupControls();
	setupGRBL();
	setupFiles();
	setupCommands();
};

const elemBlockOrNone = (elemName, enable) => {
	if (enable) {
		displayBlock(elemName);
	} else {
		displayNone(elemName);
	}
};

const navbar_lockUI = (enable) => {
	elemBlockOrNone("lock_ui_btn", enable);
	ontoggleLock(enable);
};

const navbar_enableDHT = (enable) => {
	elemBlockOrNone("DHT_humidity", enable);
	elemBlockOrNone("DHT_temperature", enable);
};

const navbar_enableCamTab = (enable) => {
	if (typeof id("camtab") === "undefined") {
		return;
	}

	let camoutput = false;

	elemBlockOrNone("camtablink", enable);
	if (enable) {
		camera_GetAddress();
		if (getPrefValue("auto_load_camera")) {
			camera_loadframe();
			camoutput = true;
		}
	} else {
		id("tablettablink").click();
	}

	if (!camoutput) {
		id("camera_frame").src = "";
		displayNone("camera_frame_display");
		displayNone("camera_detach_button");
	}
};

/** Initial setup of the navbar from the preferences coming from the file */
const setupNavbar = () => {
	navbar_lockUI(getPrefValue("enable_lock_UI"));
	navbar_enableDHT(getPrefValue("enable_DHT"));
	navbar_enableCamTab(getPrefValue("show_camera_panel"));
};

const setupNavbarHandlers = () => {
	id("enable_lock_UI").addEventListener("change", (event) =>
		navbar_lockUI(getPrefValue("enable_lock_UI")),
	);
	id("enable_DHT").addEventListener("change", (event) =>
		navbar_enableDHT(getPrefValue("enable_DHT")),
	);
	id("show_camera_panel").addEventListener("change", (event) =>
		navbar_enableCamTab(getPrefValue("show_camera_panel")),
	);
};

const language_pref = (value) => {
	translate_text(value);
};

/** Initial setup of other preferences coming from the file */
const setupPreference = () => {
	language_pref(getPrefValue("language_preferences"));
};

const setupPreferenceHandlers = () => {
	id("language_preferences").addEventListener("change", (event) =>
		language_pref(getPrefValue("language_preferences")),
	);
};

const controls_showControlsPanel = (enable) => {
	elemBlockOrNone("control_preferences", enable);
};

/** Initial setup of the Controls Panel from the preferences coming from the file */
const setupControls = () => {
	controls_showControlsPanel(getPrefValue("show_control_panel"));
};

const setupControlsHandlers = () => {
	id("show_control_panel").addEventListener("change", (event) =>
		controls_showControlsPanel(getPrefValue("show_control_panel")),
	);
};

const grbl_showGRBLPanel = (enable) => {
	elemBlockOrNone("grblPanel", enable);
	if (enable) {
		grblpanel();
	} else {
		reportNone(false);
	}
};

const grbl_ReportIntervalChange = (changed) => {
	if (changed) {
		onAutoReportIntervalChange();
	}
};

const grbl_showProbeTab = (enable) => {
	elemBlockOrNone("grblprobetablink", enable);
	if (!enable) {
		id("grblcontroltablink").click();
	}
};

/** Initial setup of the GRBL Panel from the preferences coming from the file */
const setupGRBL = () => {
	grbl_showGRBLPanel(getPrefValue("show_grbl_panel"));
	grbl_ReportIntervalChange(
		getPrefValue("autoreport_interval") || getPrefValue("interval_status"),
	);
	grbl_showProbeTab(getPrefValue("show_grbl_probe_tab"));
};

const setupGRBLHandlers = () => {
	id("show_grbl_panel").addEventListener("change", (event) =>
		grbl_showGRBLPanel(getPrefValue("show_grbl_panel")),
	);
	id("autoreport_interval").addEventListener("change", (event) =>
		grbl_ReportIntervalChange(
			getPrefValue("autoreport_interval") || getPrefValue("interval_status"),
		),
	);
	id("interval_status").addEventListener("change", (event) =>
		grbl_ReportIntervalChange(
			getPrefValue("autoreport_interval") || getPrefValue("interval_status"),
		),
	);
	id("show_grbl_probe_tab").addEventListener("change", (event) =>
		grbl_showProbeTab(getPrefValue("show_grbl_probe_tab")),
	);
};

const files_showFilesPanel = (enable) => elemBlockOrNone("filesPanel", enable);

const files_refreshBtns = (enableSD, enableUSB) => {
	if (enableSD || enableUSB) {
		displayFlex("files_refresh_printer_sd_btn");
		displayNone("files_refresh_btn");
	} else {
		displayNone("files_refresh_printer_sd_btn");
		displayFlex("files_refresh_btn");
	}
};

const files_TFTSD = (enableSD, enableUSB) => {
	elemBlockOrNone("files_refresh_tft_sd", enableSD, enableUSB);
	files_refreshBtns(enableSD, enableUSB);
};

const files_TFTUSB = (enableSD, enableUSB) => {
	elemBlockOrNone("files_refresh_tft_usb", enableSD, enableUSB);
	files_refreshBtns(enableSD, enableUSB);
};

const files_filterList = (value) => build_file_filter_list(value);

/** Initial setup of the Files Dialog from the preferences coming from the file */
const setupFiles = () => {
	files_showFilesPanel(getPrefValue("show_files_panel"));
	files_TFTUSB(getPrefValue("has_TFT_SD"), getPrefValue("has_TFT_USB"));
	files_TFTUSB(getPrefValue("has_TFT_SD"), getPrefValue("has_TFT_USB"));
	files_filterList(getPrefValue("f_filters"));
};

const setupFilesHandlers = () => {
	id("show_files_panel").addEventListener("change", (event) =>
		files_showFilesPanel(getPrefValue("show_files_panel")),
	);
	id("has_TFT_SD").addEventListener("change", (event) =>
		files_TFTSD(getPrefValue("has_TFT_SD"), getPrefValue("has_TFT_USB")),
	);
	id("has_TFT_USB").addEventListener("change", (event) =>
		files_TFTUSB(getPrefValue("has_TFT_SD"), getPrefValue("has_TFT_USB")),
	);
	// TODO: Check if this one needs a debounce
	id("f_filters").addEventListener("change", (event) =>
		files_filterList(getPrefValue("f_filters")),
	);
};

const commands_showCommandsPanel = (enable) =>
	elemBlockOrNone("commandsPanel", enable);

const commands_autoScroll = (enable) => {
	setChecked("monitor_enable_autoscroll", enable);
	if (enable) {
		Monitor_check_autoscroll();
	}
};

const commands_verboseMode = (enable) => {
	setChecked("monitor_enable_verbose_mode", enable);
	if (enable) {
		Monitor_check_verbose_mode();
	}
};

/** Initial setup of the Commands Panel from the preferences coming from the file */
const setupCommands = () => {
	commands_showCommandsPanel(getPrefValue("show_commands_panel"));
	commands_autoScroll(getPrefValue("enable_autoscroll"));
	commands_verboseMode(getPrefValue("enable_verbose_mode"));
};

const setupCommandsHandlers = () => {
	id("show_commands_panel").addEventListener("change", (event) =>
		commands_showCommandsPanel(getPrefValue("show_commands_panel")),
	);
	id("enable_autoscroll").addEventListener("change", (event) =>
		commands_autoScroll(getPrefValue("enable_autoscroll")),
	);
	id("enable_verbose_mode").addEventListener("change", (event) =>
		commands_verboseMode(getPrefValue("enable_verbose_mode")),
	);
};

function getpreferenceslist() {
	var url = prefFile;
	//removeIf(production)
	var response = defaultpreferenceslist;
	processPreferencesGetSuccess(response);
	return;
	//endRemoveIf(production)
	SendGetHttp(url, processPreferencesGetSuccess, processPreferencesGetFailed);
}

/** Gets a Select, Text, Int or Float's new value after a change, and stores it in the preferences */
const handleInputChange = (fieldId) => {
	const newValue = getValue(fieldId);
	if (typeof newValue === "undefined") {
		console.error(
			stdErrMsg(
				"Unknown Field",
				`'${fieldId}' not found as an input field with a value`,
			),
		);
		return undefined;
	}
	const pref = getPref(fieldId);
	pref.value = newValue;
	return newValue;
};

/** Gets the checkbox's current value, reverses it, and stores the reversed value in the preferences */
const handleCheckboxClick = (checkboxId) => {
	const currentValue = getChecked(checkboxId);
	const newValue = !(currentValue !== "false");
	const pref = getPref(checkboxId);
	pref.value = newValue;
	setChecked(checkboxId, newValue);
	return newValue;
};

const togglePanel = (checkboxId, panelId) => {
	if (handleCheckboxClick(checkboxId)) {
		displayBlock(panelId);
	} else {
		displayNone(panelId);
	}
};

function processPreferencesGetSuccess(response) {
	if (response.indexOf("<HTML>") == -1) Preferences_build_list(response);
	else Preferences_build_list(defaultpreferenceslist);
}

function processPreferencesGetFailed(error_code, response) {
	conErr(error_code, response);
	Preferences_build_list(defaultpreferenceslist);
}

function Preferences_build_list(response_text) {
	preferenceslist = [];
	try {
		if (response_text.length != 0) {
			//console.log(response_text);
			preferenceslist = JSON.parse(response_text);
		} else {
			preferenceslist = JSON.parse(defaultpreferenceslist);
		}
	} catch (e) {
		console.error("Parsing error:", e);
		preferenceslist = JSON.parse(defaultpreferenceslist);
	}
	applypreferenceslist();
}

function applypreferenceslist() {
	//Assign each control state
	const common = new Common();
	build_HTML_setting_list(common.current_setting_filter);

	handlePing();
}

const showpreferencesdlg = () => {
	const modal = setactiveModal("preferencesdlg.html");
	if (modal == null) {
		return;
	}

	initpreferences();

	id("preferencesdlg.html").addEventListener("click", (event) =>
		clear_drop_menu(event),
	);
	id("PreferencesDialogClose").addEventListener("click", (event) =>
		closePreferencesDialog(),
	);
	id("PreferencesDialogCancel").addEventListener("click", (event) =>
		closePreferencesDialog(),
	);
	id("PreferencesDialogSave").addEventListener("click", (event) =>
		SavePreferences(),
	);

	displayNone("preferencesdlg_upload_msg");
	showModal();
};

function closePreferencesDialog() {
	var modified = false;
	//check dialog compare to global state
	if (typeof getPrefValue("enable_ping") === "undefined") {
		modified = true;
	} else {
		//camera address
		if (getChecked("camera_address") != getPrefValue("camera_address"))
			modified = true;
		//Monitor connection
		if (getChecked("enable_ping") != getPrefValue("enable_ping"))
			modified = true;
	}
	if (modified) {
		confirmdlg(
			translate_text_item("Data modified"),
			translate_text_item("Do you want to save?"),
			process_preferencesCloseDialog,
		);
	} else {
		closeModal("cancel");
	}
}

function process_preferencesCloseDialog(answer) {
	if (answer === "no") {
		//console.log("Answer is no so exit");
		translate_text(getPrefValue("language_list"));
		closeModal("cancel");
	} else {
		// console.log("Answer is yes so let's save");
		SavePreferences();
	}
}

const SavePreferences = (save_current_preferences = false) => {
	const common = new Common();
	if (common.http_communication_locked) {
		alertdlg(
			translate_text_item("Busy..."),
			translate_text_item(
				"Communications are currently locked, please wait and retry.",
			),
		);
		return;
	}
	console.log("save prefs");

	if (!!save_current_preferences) {
		preferenceslist = [];
		var saveprefs = '[{"language":"' + getPrefValue("language_list");
		saveprefs += '","enable_ping":"' + getChecked("enable_ping");
		preferenceslist = JSON.parse(saveprefs);
	}
	var blob = new Blob([JSON.stringify(preferenceslist, null, " ")], {
		type: "application/json",
	});
	var file = new File([blob], prefFile);
	var formData = new FormData();
	var url = "/files";
	formData.append("path", "/");
	formData.append("myfile[]", file, prefFile);
	if (!!save_current_preferences) {
		SendFileHttp(url, formData);
	} else {
		SendFileHttp(
			url,
			formData,
			preferencesdlgUploadProgressDisplay,
			preferencesUploadsuccess,
			preferencesUploadfailed,
		);
	}
};

function preferencesdlgUploadProgressDisplay(oEvent) {
	if (oEvent.lengthComputable) {
		var percentComplete = (oEvent.loaded / oEvent.total) * 100;
		setValue("preferencesdlg_prg", percentComplete);
		setHTML("preferencesdlg_upload_percent", percentComplete.toFixed(0));
		displayBlock("preferencesdlg_upload_msg");
	} else {
		// Impossible because size is unknown
	}
}

function preferencesUploadsuccess(response) {
	displayNone("preferencesdlg_upload_msg");
	applypreferenceslist();
	closeModal("ok");
}

function preferencesUploadfailed(error_code, response) {
	alertdlg(
		translate_text_item("Error"),
		translate_text_item("Save preferences failed!"),
	);
}

/** Test the supplied numeric value against any defined `min` test */
const valueMinTest = (value, valueDef) => {
	return "min" in valueDef && value < valueDef.min
		? translate_text_item(
				`${valueDef.label} must be greater than or equal to ${valueDef.min}"`,
			)
		: "";
};

/** Test the supplied numeric value against any defined `max` test */
const valueMaxTest = (value, valueDef) => {
	return "max" in valueDef && value > valueDef.max
		? translate_text_item(
				`${valueDef.label} must be less than or equal to ${valueDef.max}"`,
			)
		: "";
};

const CheckValue = (fId, valueDef) => {
	const errorList = [];
	if (typeof valueDef === "undefined") {
		errorList.push(
			`No definition provided for the field '${fId}'. Its value cannot be checked`,
		);
	} else {
		const elem = id(fId);
		const value = elem ? elem.value : valueDef.defValue;
		// Check for any specific test and use that in preference
		if ("valFunc" in valueDef) {
			const vfTest = valueDef.valFunc(value);
			if (vfTest) {
				errorList.push(vfTest);
			}
		} else {
			switch (valueDef.valueType) {
				case "panel":
				case "bool":
					// These are both boolean values
					break;
				case "int":
					const vInt = parseInt(value);
					if (isNaN(vInt)) {
						errorList.push(
							translate_text_item(`${valueDef.label} must be an integer"`),
						);
					} else {
						errorList.push(valueMinTest(vInt, valueDef));
						errorList.push(valueMaxTest(vInt, valueDef));
					}
					break;
				case "float":
					const vFlt = parseFloat(value);
					if (isNaN(vFlt)) {
						errorList.push(
							translate_text_item(`${valueDef.label} must be an float"`),
						);
					} else {
						errorList.push(valueMinTest(vFlt, valueDef));
						errorList.push(valueMaxTest(vFlt, valueDef));
					}
					break;
				case "enctext":
					break;
				case "text":
					break;
				case "select":
					break;
				default:
					console.log(`${key}: ${JSON.stringify(value)}`);
					break;
			}
		}
	}

	// Old skul hack to remove unwanted entries from an array, faster than filter
	for (let ix = errorList.length - 1; ix >= 0; ix--) {
		if (!errorList[ix]) {
			errorList.splice(ix, 1);
		}
	}

	const elemIdGroup = id(`${fId}_group`);
	const elemIdIcon = id(`${fId}_icon`);
	if (errorList.length == 0) {
		if (elemIdGroup) {
			elemIdGroup.classList.remove("has-feedback");
			elemIdGroup.classList.remove("has-error");
		}
		if (elemIdIcon) {
			elemIdIcon.innerHTML = "";
		}
	} else {
		if (elemIdGroup) {
			// has-feedback hides the value so it is hard to fix it
			// elemIdGroup.classList.add("has-feedback");
			elemIdGroup.classList.add("has-error");
		}
		if (elemIdIcon) {
			// elemIdIcon.innerHTML = get_icon_svg("remove");
		}
		alertdlg(
			translate_text_item("Errors with settings & preferences"),
			errorList.join("\n"),
		);
	}
	return errorList.length == 0;
};

export {
	getpreferenceslist,
	initpreferences,
	showpreferencesdlg,
	SavePreferences,
};
