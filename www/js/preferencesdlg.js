import { alertdlg } from "./alertdlg";
import { camera_GetAddress } from "./camera";
import { Monitor_check_autoscroll, Monitor_check_verbose_mode } from "./commands";
import { confirmdlg } from "./confirmdlg";
import { on_autocheck_position } from "./controls";
import { clear_drop_menu } from "./dropmenu";
import { build_file_filter_list } from "./files";
import { grblaxis, onAutoReportIntervalChange, reportNone } from "./grbl";
import { grblpanel } from "./grblpanel";
import { http_communication_locked, SendFileHttp, SendGetHttp } from "./http";
import { get_icon_svg } from "./icons";
import { add_language_list_event_handler, build_language_list, language } from "./languages";
import { closeModal, setactiveModal, showModal } from "./modaldlg";
import { ontoggleLock } from "./navbar";
import { buildFieldId, buildPrefsFromDefs, getPrefDefPath, prefDefs } from "./prefDefs";
import { build_HTML_setting_list, current_setting_filter } from "./settings";
import { check_ping } from "./socket";
import { decode_entitie, translate_text, translate_text_item } from "./translate";
import { conErr, displayBlock, displayFlex, displayNone, last_ping, getChecked, getValue, id, setChecked, setValue, setHTML, stdErrMsg, HTMLEncode } from "./util";

//Preferences dialog

const prefFile = "/preferences.json";
let preferences = buildPrefsFromDefs(prefDefs);

var language_save = language();

const buildElem = (elem, contents, classVal) => {
    const elemPanel = document.createElement(elem);
    if (classVal) {
        elemPanel.setAttribute("class", classVal);
    }
    elemPanel.innerHTML = contents;
    return elemPanel;
}

const buildDiv = (contents, classVal) => buildElem("div", contents, classVal);
const buildTable = (contents, classVal) => buildElem("table", contents, classVal);

const buildDivPanel = (contents) => buildDiv(`<div class="panel-heading">${contents}</div>`, "panel panel-default");

const buildTdIcon = (icon) => `<td>${get_icon_svg(icon)}&nbsp;</td>`;
const buildTdLabel = (key, value) => `<td><span>${translate_text_item(value.label || key, true)}:&nbsp;</span></td>`;
const buildTdInp = (inpFld, key, value) => `<td><div class="input-group has-control">${inpFld}${buildSpnErrFld(key, value)}</div></td>`;
const buildSpnErrFld = (key, value) => `<span id="${buildFieldId(key, value)}_icon" class="form-control-feedback ico_feedback"></span>`;

const buildFieldIdAttr = (key, value) => `id="${buildFieldId(key, value)}"`;
const buildMinMaxAttr = (value) => `${typeof value.min !== "undefined" ? ' min="' + value.min + '"' : ''}${typeof value.max !== "undefined" ? ' max="' + value.max + '"' : ''}`;
const buildPlaceholderAttr = (value) => value.placeholder ? `placeholder="${value.placeholder}" translateph` : "";

const setGroupId = (elem, fId) => elem.setAttribute("id", `${fId}_group`);

/** Build an input within a label for a checkbox element */
const buildCheckBox = (key, value) => {
    const inpCheckBox = `<input type="checkbox" ${buildFieldIdAttr(key, value)}/>`;
    return `<label>${inpCheckBox}${translate_text_item(value.label || key, true)}</label>`;
}

/** Generate a panel controlled by a checkbox */
const buildPanel = (key, value, parentElem, isFirstLevel = false) => {
    const fId = buildFieldId(key, value);
    const inpCheckBox = buildCheckBox(key, value);
    const panelCheckBox = isFirstLevel ? buildDivPanel(`<div class="checkbox">${inpCheckBox}</div>`) : buildDiv(inpCheckBox, "checkbox");

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

    const inpNTable = buildTable(`<tr>${buildTdLabel(key, value)}${inpNTd}${unitTd}</tr>`);
    setGroupId(inpNTable, fId);
    // Check for feedrate that might not be visible
    if (fId.endsWith("_feedrate")) {
        if (["a_feedrate", "b_feedrate", "c_feedrate"].includes(fId)) {
            inpNTable.setAttribute("class", "hide_it topmarginspace");
        }
    }

    parentElem.append(inpNTable);
    id(fId).addEventListener("change", (event) => CheckValue(fId, value));
};

/** Generate a mini table for text inputs */
const buildText = (key, value, parentElem) => {
    const fId = buildFieldId(key, value);
    const inpTFld = `<input type="text" ${buildFieldIdAttr(key, value)} class="form-control ${value.inpClass || ""}" ${buildPlaceholderAttr(value)}/>`;
    const inpTTd = `<td><div class="input-group has-control">${inpTFld}${buildSpnErrFld(value, key)}</div></td>`;

    const inpTTable = buildTable(`<tr>${buildTdLabel(key, value)}${inpTTd}</tr>`);
    setGroupId(inpTTable, fId);

    parentElem.append(inpTTable);
    id(fId).addEventListener("change", (event) => CheckValue(fId, value));
};

/** Generate a mini table for selects */
const buildSelect = (key, value, parentElem) => {
    const fId = buildFieldId(key, value);
    const inpSTable = buildTable(`<tr>${buildTdIcon("flag")}<td>${build_language_list(fId)}</td></tr>`);
    // Use the key for the containing table, instead of the fId, which has been used for the select
    inpSTable.setAttribute("id", key);
    setGroupId(inpSTable, fId);

    parentElem.append(inpSTable);
    add_language_list_event_handler(fId);
}

/** Build the dialog from the prefDefs metadata */
const buildDialog = (parentElem, definitions, isFirstLevel = false) => {
    for (const [key, value] of Object.entries(definitions)) {
        const fId = buildFieldId(key, value);
        // Check if the dialog has already been built
        if (id(fId)) {
            return;
        }
        switch (value.valueType) {
            case "panel": buildPanel(key, value, parentElem, isFirstLevel); break;
            case "bool": buildBoolean(key, value, parentElem); break;
            case "int":
            case "float": buildNumeric(key, value, parentElem); break;
            case "text": buildText(key, value, parentElem); break;
            case "select": buildSelect(key, value, parentElem); break;
            default:
                console.log(`${key}: ${JSON.stringify(value)}`);
                break;
        }
    }
}

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
                    fElem.checked = ("defValue" in value)
                        ? (typeof value.defValue === "string" && value.defValue.toLowerCase() === "false") ? false : !!value.defValue
                        : false;
                    // Because `click`ing the checkbox will toggle it (one way or another) we click it twice
                    fElem.value = (typeof value.value === "string" && value.value.toLowerCase() === "false") ? "false" : `${!!value.value}`;
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
            default:
                console.log(`${key}: ${JSON.stringify(value)}`);
                break;
        }
    }
}

/** Initialise the preferences dialog */
const initpreferences = () => {
    buildDialog(id("preferences_body"), prefDefs, true);
    setDialog(preferences);

    // And handlers for the other parts of the app
    setupNavbarHandlers();
    setupFilesHandlers();
    setupCommandsHandlers();
    // displayNone('DHT_pref_panel');
    // displayBlock('grbl_pref_panel');
    // displayTable('has_TFT_SD');
    // displayTable('has_TFT_USB');

    // Do final setup for other parts of the app
    setupNavbar();
    setupFiles();
    setupCommands();
}

const navbar_lockUI = (enable) => {
    if (enable) {
        displayBlock('lock_ui_btn');
        ontoggleLock(true);
    } else {
        displayNone('lock_ui_btn');
        ontoggleLock(false);
    }
}

const navbar_enableDHT = (enable) => {
    if (enable) {
        displayBlock('DHT_humidity');
        displayBlock('DHT_temperature');
    } else {
        displayNone('DHT_humidity');
        displayNone('DHT_temperature');
    }
}

const navbar_enableCamTab = (enable) => {
    if (typeof id('camtab') === "undefined") {
        return;
    }

    let camoutput = false;

    if (enable) {
        displayBlock('camtablink');
        camera_GetAddress();
        if (getPrefValue("auto_load_camera")) {
            camera_loadframe();
            camoutput = true;
        }
    } else {
        id("tablettablink").click();
        displayNone('camtablink');
    }

    if (!camoutput) {
        id('camera_frame').src = "";
        displayNone('camera_frame_display');
        displayNone('camera_detach_button');
    }
}

/** Initial setup of the navbar from the preferences coming from the file */
const setupNavbar = () => {
    navbar_lockUI(getPrefValue("enable_lock_UI"));
    navbar_enableDHT(getPrefValue("enable_DHT"));
    navbar_enableCamTab(getPrefValue("enable_camera"));
}

const setupNavbarHandlers = () => {
    id("enable_lock_UI").addEventListener("change", (event) => navbar_lockUI(getPrefValue("enable_lock_UI")));
    id("enable_DHT").addEventListener("change", (event) => navbar_enableDHT(getPrefValue("enable_DHT")));
    id("show_camera_panel").addEventListener("change", (event) => navbar_enableCamTab(getPrefValue("enable_camera")));
}

const commands_showCommandsPanel = (enable) => {
    if (enable) {
        displayFlex('commandsPanel');
    } else {
        displayNone('commandsPanel');
    }
}

const commands_autoScroll = (enable) => {
    setChecked('monitor_enable_autoscroll', enable);
    if (enable) {
        Monitor_check_autoscroll();
    }
}

const commands_verboseMode = (enable) => {
    setChecked('monitor_enable_verbose_mode', enable);
    if (enable) {
        Monitor_check_verbose_mode();
    }
}

/** Initial setup of the Commands Panel from the preferences coming from the file */
const setupCommands = () => {
    commands_showCommandsPanel(getPrefValue("show_commands_panel"));
    commands_autoScroll(getPrefValue("enable_autoscroll"));
    commands_verboseMode(getPrefValue("enable_verbose_mode"));
}

const setupCommandsHandlers = () => {
    id("show_commands_panel").addEventListener("change", (event) => commands_showCommandsPanel(getPrefValue("show_commands_panel")));
    id("enable_autoscroll").addEventListener("change", (event) => commands_autoScroll(getPrefValue("enable_autoscroll")));
    id("enable_verbose_mode").addEventListener("change", (event) => commands_verboseMode(getPrefValue("enable_verbose_mode")));
}

const files_filterList = (value) => build_file_filter_list(value);

/** Initial setup of the Files Dialog from the preferences coming from the file */
const setupFiles = () => {
    files_filterList(getPrefValue("f_filters"));
}

const setupFilesHandlers = () => {
    // TODO: Check if this one needs a debounce
    id("f_filters").addEventListener("change", (event) => files_filterList(getPrefValue("f_filters")));
}

/** Get the named preference object */
const getPref = (prefName) => {
    let pref = preferences[prefName];
    if (!pref) {
        // try to find it by looking for the fieldId
        for (const [key, value] of Object.entries(preferences)) {
            if (value.fieldId === prefName) {
                pref = value;
                break;
            }
        }
    }
    if (!pref) {
        console.error(stdErrMsg("Unknown Preference", `'${prefName}' not found as a preference key or as the fieldId within a preference value`));
        return undefined;
    }
    return pref;
}

/** Get the named preference value */
const getPrefValue = (prefName) => {
    let pref = getPref(prefName);
    if (!pref) {
        return undefined;
    }
    return pref.value;
}

/** Set the preference item to the supplied value.
 * Returns true for success, false for failure - usually because the preference item does not exist
  */
const setPrefValue = (prefName, value) => {
    let pref = getPrefDefPath(prefName);
    if (typeof pref === "undefined") {
        return false;
    }
    // TODO: test the typeof the value is compatible with the valueType
    pref.value = value;
    return true;
}

/** Helper method to get the `enable_ping` preference value */
const enable_ping = () => getPrefValue("enable_ping");

let interval_ping = 0;
/** Turn ping on or off based on its current value */
const handlePing = () => {
    if (enable_ping()) {
        // First clear any existing interval
        if (interval_ping) {
            clearInterval(interval_ping);
        }
        last_ping(Date.now());
        interval_ping = setInterval(() => check_ping(), 10 * 1000);
        console.log('enable ping');
    } else {
        clearInterval(interval_ping);
        interval_ping = 0;
        console.log('disable ping');
    }
}

const bleh = () => {
    build_HTML_setting_list(current_setting_filter());

    handlePing();

    if (getPrefValue("enable_grbl_panel") === 'true') {
        displayFlex('grblPanel');
        grblpanel();
    } else {
        displayNone('grblPanel');
        reportNone(false);
    }

    // if (getPrefValue("enable_control_panel") === 'true') displayFlex('controlPanel');
    // else {
    //     displayNone('controlPanel');
    //     on_autocheck_position(false);
    // }

    if (getPrefValue("enable_files_panel") === 'true') displayFlex('filesPanel');
    else displayNone('filesPanel');

    if (getPrefValue("enable_files_panel.has_TFT_SD") === 'true') {
        displayFlex('files_refresh_tft_sd');
    }
    else {
        displayNone('files_refresh_tft_sd');
    }

    if (getPrefValue("enable_files_panel.has_TFT_USB") === 'true') {
        displayFlex('files_refresh_tft_usb');
    }
    else {
        displayNone('files_refresh_tft_usb');
    }

    if ((getPrefValue("enable_files_panel.has_TFT_SD") === 'true') || (getPrefValue("enable_files_panel.has_TFT_USB") === 'true')) {
        displayFlex('files_refresh_printer_sd');
        displayNone('files_refresh_btn');
    } else {
        displayNone('files_refresh_printer_sd');
        displayFlex('files_refresh_btn');
    }

    var autoReportValue = parseInt(getPrefValue("enable_grbl_panel.autoreport_interval"));
    var autoReportChanged = getValue('autoreport_interval') !== autoReportValue;
    if (autoReportChanged) {
        setValue('autoreport_interval', autoReportValue);
    }
    var statusIntervalValue = parseInt(getPrefValue("enable_grbl_panel.interval_status"));
    let statusIntervalChanged = getValue('interval_status') !== statusIntervalValue;
    if (statusIntervalChanged) {
        setValue('interval_status', statusIntervalValue);
    }
    if (autoReportChanged || statusIntervalChanged) {
        onAutoReportIntervalChange();
    }

    // setValue('interval_positions', parseInt(getPrefValue("enable_control_panel.interval_positions")));
    // setValue('xy_feedrate', parseInt(getPrefValue("enable_control_panel.xy_feedrate")));
    // setValue('z_feedrate', parseInt(getPrefValue("enable_control_panel.z_feedrate")));

    let axis_Z_feedrate, axis_A_feedrate, axis_B_feedrate, axis_C_feedrate;

    // if (grblaxis() > 2) axis_Z_feedrate = parseInt(getPrefValue("enable_control_panel.z_feedrate"));
    // if (grblaxis() > 3) axis_A_feedrate = parseInt(getPrefValue("enable_control_panel.a_feedrate"));
    // if (grblaxis() > 4) axis_B_feedrate = parseInt(getPrefValue("enable_control_panel.b_feedrate"));
    // if (grblaxis() > 5) axis_C_feedrate = parseInt(getPrefValue("enable_control_panel.c_feedrate"));

    // if (grblaxis() > 3) {
    //     var letter = getValue('control_select_axis');
    //     switch (letter) {
    //         case "Z":
    //             setValue('z_feedrate', axis_Z_feedrate);
    //             break;
    //         case "A":
    //             setValue('a_feedrate', axis_A_feedrate);
    //             break;
    //         case "B":
    //             setValue('b_feedrate', axis_B_feedrate);
    //             break;
    //         case "C":
    //             setValue('c_feedrate', axis_C_feedrate);
    //             break;
    //     }
    // }

    // setValue('probemaxtravel', parseFloat(getPrefValue("enable_grbl_panel.enable_grbl_probe_panel.probemaxtravel")));
    // setValue('probefeedrate', parseInt(getPrefValue("enable_grbl_panel.enable_grbl_probe_panel.probefeedrate")));
    // setValue('proberetract', parseFloat(getPrefValue("enable_grbl_panel.enable_grbl_probe_panel.proberetract")));
    // setValue('probetouchplatethickness', parseFloat(getPrefValue("enable_grbl_panel.enable_grbl_probe_panel.probetouchplatethickness")));
}

function getpreferenceslist() {
    var url = prefFile;
    //removeIf(production)
    var response = defaultpreferenceslist;
    processPreferencesGetSuccess(response);
    return;
    //endRemoveIf(production)
    SendGetHttp(url, processPreferencesGetSuccess, processPreferencesGetFailed);
}

/** Gets the checkbox's current value, reverses it, and stores the reversed value in the preferences */
const handleCheckboxClick = (checkboxId) => {
    const currentValue = getChecked(checkboxId);
    const newValue = !(currentValue !== "false");
    const pref = getPref(checkboxId);
    pref.value = newValue;
    setChecked(checkboxId, newValue);
    return newValue;
}

const togglePanel = (checkboxId, panelId) => {
    if (handleCheckboxClick(checkboxId)) {
        displayBlock(panelId);
    } else {
        displayNone(panelId);
    }
}

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
    translate_text(getPrefValue("language_list")?.valueDef);
    build_HTML_setting_list(current_setting_filter());

    if (getPrefValue("enable_grbl_panel.enable_grbl_probe_panel") === 'true') {
        displayBlock('grblprobetablink');
    } else {
        id("grblcontroltablink").click();
        displayNone('grblprobetablink');
    }

    handlePing();
    if (getPrefValue("enable_grbl_panel") === 'true') displayFlex('grblPanel');
    else {
        displayNone('grblPanel');
        reportNone(false);
    }

    // if (getPrefValue("enable_control_panel") === 'true') displayFlex('controlPanel');
    // else {
    //     displayNone('controlPanel');
    //     on_autocheck_position(false);
    // }

    if (getPrefValue("enable_files_panel") === 'true') displayFlex('filesPanel');
    else displayNone('filesPanel');

    if (getPrefValue("enable_files_panel.has_TFT_SD") === 'true') {
        displayFlex('files_refresh_tft_sd');
    }
    else {
        displayNone('files_refresh_tft_sd');
    }

    if (getPrefValue("enable_files_panel.has_TFT_USB") === 'true') {
        displayFlex('files_refresh_tft_usb');
    }
    else {
        displayNone('files_refresh_tft_usb');
    }

    if ((getPrefValue("enable_files_panel.has_TFT_SD") === 'true') || (getPrefValue("enable_files_panel.has_TFT_USB") === 'true')) {
        displayFlex('files_refresh_printer_sd_btn');
        displayNone('files_refresh_btn');
    } else {
        displayNone('files_refresh_printer_sd_btn');
        displayFlex('files_refresh_btn');
    }

    var autoReportValue = parseInt(getPrefValue("enable_grbl_panel.autoreport_interval"));
    var autoReportChanged = getValue('autoreport_interval') !== autoReportValue;
    if (autoReportChanged) {
        setValue('autoreport_interval', autoReportValue);
    }
    var statusIntervalValue = parseInt(getPrefValue("enable_grbl_panel.interval_status"));
    statusIntervalChanged = getValue('interval_status') !== statusIntervalValue;
    if (statusIntervalChanged) {
        setValue('interval_status', statusIntervalValue);
    }
    if (autoReportChanged || statusIntervalChanged) {
        onAutoReportIntervalChange();
    }

    setValue('interval_positions', parseInt(getPrefValue("enable_control_panel.interval_positions")));
    setValue('xy_feedrate', parseInt(getPrefValue("enable_control_panel.xy_feedrate")));
    setValue('z_feedrate', parseInt(getPrefValue("enable_control_panel.z_feedrate")));

    if (grblaxis() > 2) axis_Z_feedrate = parseInt(getPrefValue("enable_control_panel.z_feedrate"));
    if (grblaxis() > 3) axis_A_feedrate = parseInt(getPrefValue("enable_control_panel.a_feedrate"));
    if (grblaxis() > 4) axis_B_feedrate = parseInt(getPrefValue("enable_control_panel.b_feedrate"));
    if (grblaxis() > 5) axis_C_feedrate = parseInt(getPrefValue("enable_control_panel.c_feedrate"));

    if (grblaxis() > 3) {
        var letter = getValue('control_select_axis');
        switch (letter) {
            case "Z":
                setValue('z_feedrate', axis_Z_feedrate);
                break;
            case "A":
                setValue('a_feedrate', axis_A_feedrate);
                break;
            case "B":
                setValue('b_feedrate', axis_B_feedrate);
                break;
            case "C":
                setValue('c_feedrate', axis_C_feedrate);
                break;
        }
    }

    setValue('probemaxtravel', parseFloat(getPrefValue("enable_grbl_panel.enable_grbl_probe_panel.probemaxtravel")));
    setValue('probefeedrate', parseInt(getPrefValue("enable_grbl_panel.enable_grbl_probe_panel.probefeedrate")));
    setValue('proberetract', parseFloat(getPrefValue("enable_grbl_panel.enable_grbl_probe_panel.proberetract")));
    setValue('probetouchplatethickness', parseFloat(getPrefValue("enable_grbl_panel.enable_grbl_probe_panel.probetouchplatethickness")));
}

const showpreferencesdlg = () => {
    var modal = setactiveModal('preferencesdlg.html');
    if (modal == null) {
        return;
    }

    initpreferences();

    id("preferencesdlg.html").addEventListener("click", (event) => clear_drop_menu(event));
    id("PreferencesDialogClose").addEventListener("click", (event) => closePreferencesDialog());
    id("PreferencesDialogCancel").addEventListener("click", (event) => closePreferencesDialog());
    id("PreferencesDialogSave").addEventListener("click", (event) => SavePreferences());

    language_save = language();
    // build_dlg_preferences_list();
    displayNone('preferencesdlg_upload_msg');
    showModal();
}

const getDefPref = (memName) => { };
const setBoolElem = (idName, memName) => setChecked(idName, !!getPrefValue(memName));
const setIntElem = (idName, memName) => {
    const prefVal = parseInt(getPrefValue(memName) || "NaN");
    if (!isNaN(prefVal)) {
        setValue(idName, prefVal);
        return;
    }
    const defPrefVal = parseInt(getDefPref(memName) || "NaN");
    if (!isNaN(defPrefVal)) {
        setValue(idName, defPrefVal);
        return;
    }
    // else - quietly do nothing
}
const setFloatElem = (idName, memName) => {
    const prefVal = parseFloat(getPrefValue(memName) || "NaN");
    if (!isNaN(prefVal)) {
        setValue(idName, prefVal);
        return;
    }
    const defPrefVal = parseFloat(getDefPref(memName) || "NaN");
    if (!isNaN(defPrefVal)) {
        setValue(idName, defPrefVal);
        return;
    }
    // else - quietly do nothing
}
const setStringElem = (idName, memName) => {
    const prefVal = getPrefValue(memName);
    if (typeof prefVal === "string") {
        setValue(idName, prefVal);
        return;
    }
    const defPrefVal = getDefPref(memName);
    if (typeof defPrefVal === "string") {
        setValue(idName, defPrefVal);
        return;
    }
    // else - quietly do nothing
}

function build_dlg_preferences_list() {
    //camera address
    const camAddress = !!getPrefValue("enable_camera.auto_load_camera") ? decode_entitie(getPrefValue("camera_address")) : "";
    setValue('camera_address', !camAddress);
    setBoolElem('show_camera_panel', 'enable_camera');
    setBoolElem('autoload_camera_panel', 'auto_load_camera');

    //Monitor connection
    setBoolElem('enable_ping', 'enable_ping');

    setBoolElem('show_grbl_panel', 'enable_grbl_panel');
    setBoolElem('show_grbl_probe_tab', 'enable_grbl_probe_panel');

    // setBoolElem('show_control_panel', 'enable_control_panel');
    setBoolElem('show_files_panel', 'enable_files_panel');

    //TFT
    setBoolElem('has_TFT_SD', 'has_TFT_SD');
    setBoolElem('has_TFT_USB', 'has_TFT_USB');

    //interval
    setIntElem('autoreport_interval', 'autoreport_interval');
    setIntElem('interval_positions', 'interval_positions');
    setIntElem('interval_status', 'interval_status');

    // feedrate - using case fall through
    switch (grblaxis()) {
        case 6: setIntElem('c_feedrate', 'c_feedrate');
        case 5: setIntElem('b_feedrate', 'b_feedrate');
        case 4: setIntElem('a_feedrate', 'a_feedrate');
        case 3: setIntElem('z_feedrate', 'z_feedrate');
        default:
            setIntElem('xy_feedrate', 'xy_feedrate');
            break;
    }

    setFloatElem('probemaxtravel', 'probemaxtravel');
    setIntElem('probefeedrate', 'probefeedrate');
    setFloatElem('proberetract', 'proberetract');
    setFloatElem('probetouchplatethickness', 'probetouchplatethickness');
}

function closePreferencesDialog() {
    var modified = false;
    //check dialog compare to global state
    if ((typeof (getPrefValue("language_list")?.valueDef) === 'undefined') ||
        (typeof (getPrefValue("enable_camera")) === 'undefined') ||
        (typeof (getPrefValue("enable_camera.auto_load_camera")) === 'undefined') ||
        (typeof (getPrefValue("camera_address")) === 'undefined') ||
        (typeof (getPrefValue("enable_ping")) === 'undefined') ||
        (typeof (getPrefValue("enable_redundant")) === 'undefined') ||
        (typeof (getPrefValue("enable_probe")) === 'undefined') ||
        (typeof (getPrefValue("enable_control_panel.xy_feedrate")) === 'undefined') ||
        (typeof (getPrefValue("enable_control_panel.z_feedrate")) === 'undefined') ||
        // (typeof (getPrefValue("e_feedrate")) === 'undefined') ||
        // (typeof (getPrefValue("e_distance")) === 'undefined') ||
        (typeof (getPrefValue("enable_control_panel")) === 'undefined') ||
        (typeof (getPrefValue("enable_grbl_panel")) === 'undefined') ||
        (typeof (getPrefValue("enable_grbl_panel.enable_grbl_probe_panel")) === 'undefined') ||
        (typeof (getPrefValue("enable_grbl_panel.enable_grbl_probe_panel.probemaxtravel")) === 'undefined') ||
        (typeof (getPrefValue("enable_grbl_panel.enable_grbl_probe_panel.probefeedrate")) === 'undefined') ||
        (typeof (getPrefValue("enable_grbl_panel.enable_grbl_probe_panel.proberetract")) === 'undefined') ||
        (typeof (getPrefValue("enable_grbl_panel.enable_grbl_probe_panel.probetouchplatethickness")) === 'undefined') ||
        (typeof (getPrefValue("enable_files_panel")) === 'undefined') ||
        (typeof (getPrefValue("enable_files_panel.has_TFT_SD")) === 'undefined') ||
        (typeof (getPrefValue("enable_files_panel.has_TFT_USB")) === 'undefined') ||
        (typeof (getPrefValue("enable_grbl_panel.autoreport_interval")) === 'undefined') ||
        (typeof (getPrefValue("enable_control_panel.interval_positions")) === 'undefined') ||
        (typeof (getPrefValue("enable_grbl_panel.interval_status")) === 'undefined')) {
        modified = true;
    } else {
        //camera
        if (getChecked('show_camera_panel') != getPrefValue("enable_camera")) modified = true;
        //Autoload
        if (getChecked('autoload_camera_panel') != getPrefValue("enable_camera.auto_load_camera")) modified = true;
        //camera address
        if (getChecked('camera_address') != decode_entitie(getPrefValue("camera_address"))) modified = true;
        //Monitor connection
        if (getChecked('enable_ping') != getPrefValue("enable_ping")) modified = true;
        //probe
        if (getChecked('enable_probe_controls') != getPrefValue("enable_probe")) modified = true;
        //control panel
        if (getChecked('show_control_panel') != getPrefValue("enable_control_panel")) modified = true;
        //grbl panel
        if (getChecked('show_grbl_panel') != getPrefValue("enable_grbl_panel")) modified = true;
        //grbl probe panel
        if (getChecked('show_grbl_probe_tab') != getPrefValue("enable_grbl_panel.enable_grbl_probe_panel")) modified = true;
        //files panel
        if (getChecked('show_files_panel') != getPrefValue("enable_files_panel")) modified = true;
        //TFT SD
        if (getChecked('has_TFT_SD') != getPrefValue("enable_files_panel.has_TFT_SD")) modified = true;
        //TFT USB
        if (getChecked('has_TFT_USB') != getPrefValue("enable_files_panel.has_TFT_USB")) modified = true;
        //interval positions
        if (getValue('autoreport_interval') != parseInt(getPrefValue("enable_grbl_panel.autoreport_interval"))) modified = true;
        if (getValue('interval_positions') != parseInt(getPrefValue("enable_control_panel.interval_positions"))) modified = true;
        //interval status
        if (getValue('interval_status') != parseInt(getPrefValue("enable_grbl_panel.interval_status"))) modified = true;
        //xy feedrate
        if (getValue('xy_feedrate') != parseInt(getPrefValue("enable_control_panel.xy_feedrate"))) modified = true;
        if (grblaxis() > 2) {
            //z feedrate
            if (getValue('z_feedrate') != parseInt(getPrefValue("enable_control_panel.z_feedrate"))) modified = true;
        }
        if (grblaxis() > 3) {
            //a feedrate
            if (getValue('a_feedrate') != parseInt(getPrefValue("enable_control_panel.a_feedrate"))) modified = true;
        }
        if (grblaxis() > 4) {
            //b feedrate
            if (getValue('b_feedrate') != parseInt(getPrefValue("enable_control_panel.b_feedrate"))) modified = true;
        }
        if (grblaxis() > 5) {
            //c feedrate
            if (getValue('c_feedrate') != parseInt(getPrefValue("enable_control_panel.c_feedrate"))) modified = true;
        }
    }
    //probemaxtravel
    if (getValue('probemaxtravel') != parseFloat(getPrefValue("enable_grbl_panel.enable_grbl_probe_panel.probemaxtravel"))) modified = true;
    //probefeedrate
    if (getValue('probefeedrate') != parseInt(getPrefValue("enable_grbl_panel.enable_grbl_probe_panel.probefeedrate"))) modified = true;
    //proberetract
    if (getValue('proberetract') != parseFloat(getPrefValue("enable_grbl_panel.enable_grbl_probe_panel.proberetract"))) modified = true;
    //probetouchplatethickness
    if (getValue('probetouchplatethickness') != parseFloat(getPrefValue("enable_grbl_panel.enable_grbl_probe_panel.probetouchplatethickness"))) modified = true;

    if (language_save != language()) modified = true;
    if (modified) {
        confirmdlg(translate_text_item("Data modified"), translate_text_item("Do you want to save?"), process_preferencesCloseDialog)
    } else {
        closeModal('cancel');
    }
}

function process_preferencesCloseDialog(answer) {
    if (answer == 'no') {
        //console.log("Answer is no so exit");
        translate_text(language_save);
        closeModal('cancel');
    } else {
        // console.log("Answer is yes so let's save");
        SavePreferences();
    }
}

const SavePreferences = (save_current_preferences = false) => {
    if (http_communication_locked()) {
        alertdlg(translate_text_item("Busy..."), translate_text_item("Communications are currently locked, please wait and retry."));
        return;
    }
    console.log("save prefs");

    if (!!save_current_preferences) {
        if (!CheckValue("autoreport_interval", getPrefDefPath("enable_grbl_panel.autoreport_interval")) ||
            !CheckValue("interval_status", getPrefDefPath("enable_grbl_panel.interval_status")) ||
            !CheckValue("interval_positions", getPrefDefPath("enable_control_panel.interval_positions")) ||
            !CheckValue("xy_feedrate") ||
            !CheckValue("probemaxtravel") ||
            !CheckValue("probefeedrate") ||
            !CheckValue("proberetract") ||
            !CheckValue("probetouchplatethickness")
        ) return;
        if (grblaxis() > 2) {
            if (!CheckValue("z_feedrate")) return;
        }
        if ((grblaxis() > 3) && (!CheckValue("a_feedrate"))) return;
        if ((grblaxis() > 4) && (!CheckValue("b_feedrate"))) return;
        if ((grblaxis() > 5) && (!CheckValue("c_feedrate"))) return;

        preferenceslist = [];
        var saveprefs = "[{\"language\":\"" + language();
        saveprefs += "\",\"enable_camera\":\"" + getChecked('show_camera_panel');
        saveprefs += "\",\"auto_load_camera\":\"" + getChecked('autoload_camera_panel');
        saveprefs += "\",\"camera_address\":\"" + HTMLEncode(getValue('camera_address'));
        saveprefs += "\",\"enable_ping\":\"" + getChecked('enable_ping');
        saveprefs += "\",\"enable_control_panel\":\"" + getChecked('show_control_panel');
        saveprefs += "\",\"enable_grbl_probe_panel\":\"" + getChecked('show_grbl_probe_tab');
        saveprefs += "\",\"enable_grbl_panel\":\"" + getChecked('show_grbl_panel');
        saveprefs += "\",\"enable_files_panel\":\"" + getChecked('show_files_panel');
        saveprefs += "\",\"has_TFT_SD\":\"" + getChecked('has_TFT_SD');
        saveprefs += "\",\"has_TFT_USB\":\"" + getChecked('has_TFT_USB');
        saveprefs += "\",\"probemaxtravel\":\"" + getValue('probemaxtravel');
        saveprefs += "\",\"probefeedrate\":\"" + getValue('probefeedrate');
        saveprefs += "\",\"proberetract\":\"" + getValue('proberetract');
        saveprefs += "\",\"probetouchplatethickness\":\"" + getValue('probetouchplatethickness');
        saveprefs += "\",\"autoreport_interval\":\"" + getValue('autoreport_interval');
        saveprefs += "\",\"interval_positions\":\"" + getValue('interval_positions');
        saveprefs += "\",\"interval_status\":\"" + getValue('interval_status');
        saveprefs += "\",\"xy_feedrate\":\"" + getValue('xy_feedrate');
        if (grblaxis() > 2) {
            saveprefs += "\",\"z_feedrate\":\"" + getValue('z_feedrate');
        }
        if (grblaxis() > 3) {
            saveprefs += "\",\"a_feedrate\":\"" + getValue('a_feedrate');
        }
        if (grblaxis() > 4) {
            saveprefs += "\",\"b_feedrate\":\"" + getValue('b_feedrate');
        }
        if (grblaxis() > 5) {
            saveprefs += "\",\"c_feedrate\":\"" + getValue('c_feedrate');
        }
        preferenceslist = JSON.parse(saveprefs);
    }
    var blob = new Blob([JSON.stringify(preferenceslist, null, " ")], {
        type: 'application/json'
    });
    var file = new File([blob], prefFile);
    var formData = new FormData();
    var url = "/files";
    formData.append('path', '/');
    formData.append('myfile[]', file, prefFile);
    if (!!save_current_preferences) {
        SendFileHttp(url, formData);
    } else {
        SendFileHttp(url, formData, preferencesdlgUploadProgressDisplay, preferencesUploadsuccess, preferencesUploadfailed);
    }
}

function preferencesdlgUploadProgressDisplay(oEvent) {
    if (oEvent.lengthComputable) {
        var percentComplete = (oEvent.loaded / oEvent.total) * 100;
        setValue('preferencesdlg_prg', percentComplete);
        setHTML('preferencesdlg_upload_percent', percentComplete.toFixed(0));
        displayBlock('preferencesdlg_upload_msg');
    } else {
        // Impossible because size is unknown
    }
}

function preferencesUploadsuccess(response) {
    displayNone('preferencesdlg_upload_msg');
    applypreferenceslist();
    closeModal('ok');
}

function preferencesUploadfailed(error_code, response) {
    alertdlg(translate_text_item("Error"), translate_text_item("Save preferences failed!"));
}

/** Test the supplied numeric value against any defined `min` test */
const valueMinTest = (value, valueDef) => {
    return ("min" in valueDef && value < valueDef.min)
        ? translate_text_item(`${valueDef.label} must be greater than or equal to ${valueDef.min}"`)
        : "";
}

/** Test the supplied numeric value against any defined `max` test */
const valueMaxTest = (value, valueDef) => {
    return ("max" in valueDef && value > valueDef.max)
        ? translate_text_item(`${valueDef.label} must be less than or equal to ${valueDef.max}"`)
        : "";
}


const CheckValue = (fId, valueDef) => {
    const errorList = [];
    if (typeof valueDef === "undefined") {
        errorList.push(`No definition provided for the field '${fId}'. Its value cannot be checked`);
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
                        errorList.push(translate_text_item(`${valueDef.label} must be an integer"`));
                    } else {
                        errorList.push(valueMinTest(vInt, valueDef));
                        errorList.push(valueMaxTest(vInt, valueDef));
                    }
                    break;
                case "float":
                    const vFlt = parseFloat(value);
                    if (isNaN(vFlt)) {
                        errorList.push(translate_text_item(`${valueDef.label} must be an float"`));
                    } else {
                        errorList.push(valueMinTest(vFlt, valueDef));
                        errorList.push(valueMaxTest(vFlt, valueDef));
                    }
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
        alertdlg(translate_text_item("Errors with settings & preferences"), errorList.join("\n"));
    }
    return errorList.length == 0;
}

export { enable_ping, getPref, getPrefValue, setPrefValue, initpreferences, showpreferencesdlg, SavePreferences };
