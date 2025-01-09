import {
    Common,
    get_icon_svg,
    displayBlock,
    displayNone,
    displayUndoNone,
    id,
    setHTML,
    closeModal,
    setactiveModal,
    showModal,
    openstep,
    getPrefValue,
    setPrefValue,
    SavePreferences,
    build_language_list,
    translate_text_item,
    build_control_from_pos,
    build_HTML_setting_list,
    define_esp_role,
    define_esp_role_from_pos,
    translate_text,
} from "./common.js";

//setup dialog

let active_wizard_page = 0;


const td = (content) => `<td>${content}</td>`;
const table = (content) => `<table><tr>${content}</tr></table>`;
const heading = (label) => `<h4>${translate_text_item(label)}</h4><hr>`;

const buildControlItem = (label, pos, actions, extra) => (translate_text_item(label) + table(build_control_from_pos(pos, actions, extra)));

function wizardDone(element) {
    id(element).className = id(element).className.replace(" wizard_done", "");
}
function disableStep(wizard, step) {
    id(wizard).style.background = "#e0e0e0";
    id(step).disabled = true;
    id(step).className = "steplinks disabled";
    wizardDone(step);
}
function openStep(wizard, step) {
    id(wizard).style.background = "#337AB7";
    id(step).disabled = "";
    id(step).className = id(step).className.replace(" disabled", "");
}
function closeStep(step) {
    if (id(step).className.indexOf(" wizard_done") !== -1) {
        return;
    }

    id(step).className += " wizard_done";
    
    const common = new Common();
    if (!common.can_revert_wizard) {
        id(step).className += " no_revert_wizard";
    }
}

const hardRule = () => "<hr>\n";
const div = (name) => `<div id='${name}'>`;
const endDiv = () => "</div>";

/** Set up the event handlers and state machine for the setup wizard */
const setupdlg = () => {
    const common = new Common();
    common.setup_is_done = false;
    displayNone("main_ui");
    // From settingstab
    const settingstab_list_elem = id("settings_list_data");
    if (settingstab_list_elem) {
        settingstab_list_elem.innerHTML = "";
    }
    active_wizard_page = 0;

    const modal = setactiveModal("setupdlg.html", setupdone);
    if (modal == null) {
        return;
    }

    id("setupDlgCancel").addEventListener("click", (event) => closeModal("cancel"));

    id("startsteplink").addEventListener("click", (event) => openstep(event, "startstep"));
    id("step1link").addEventListener("click", (event) => openstep(event, "step1"));
    id("step2link").addEventListener("click", (event) => openstep(event, "step2"));
    id("step3link").addEventListener("click", (event) => openstep(event, "step3"));
    id("endsteplink").addEventListener("click", (event) => openstep(event, "endstep"));

    id("wizard_button").addEventListener("click", (event) => continue_setup_wizard());

    wizardDone("startsteplink");

    setHTML("wizard_button", translate_text_item("Start setup"));

    disableStep("wizard_line1", "step1link");
    disableStep("wizard_line2", "step2link");
    disableStep("wizard_line3", "step3link");

    displayNone(["step3link", "wizard_line4"]);
    disableStep("wizard_line4", "endsteplink");

    const content = table(td(`${get_icon_svg("flag")}&nbsp;`) + td(build_language_list("language_selection")));
    setHTML("setup_langage_list", content);
    id("language_selection").addEventListener("change", (event) => translate_text(getPrefValue("language_list")));

    showModal();
    id("startsteplink", true).click();
};

function setupdone(response) {
    const common = new Common();
    common.setup_is_done = true;
    common.do_not_build_settings = false;
    build_HTML_setting_list(common.current_setting_filter);
    translate_text(getPrefValue("language_list"));
    displayUndoNone("main_ui");
    closeModal("setup done");
}

function continue_setup_wizard() {
    active_wizard_page++;
    switch (active_wizard_page) {
        case 1:
            enablestep1();
            setPrefValue("language", getPrefValue("language_list"));
            SavePreferences(true);
            break;
        case 2:
            enablestep2();
            break;
        case 3:
            // Pre-emptively step over step 3
            active_wizard_page++;
            id("wizard_line3").style.background = "#337AB7";
            enablestep4();
            break;
        case 4:
            enablestep4();
            break;
        case 5:
            closeModal("ok");
            break;
        default:
            console.log("wizard page out of range");
            break;
    }
}

const addActions = (actions) => {
    // biome-ignore lint/complexity/noForEach: <explanation>
    actions.forEach((action) => {
        id(action.id).addEventListener(action.type, (event) => action.method);
    });
};

function enablestep1() {
    closeStep("startsteplink");
    setHTML("wizard_button", translate_text_item("Continue"));
    openStep("wizard_line1", "step1link");

    const actions = [];

    let content = heading("FluidNC Settings");
    const EP_HOSTNAME = "Hostname";
    content += buildControlItem("Define ESP name:", EP_HOSTNAME, actions);

    setHTML("step1", content);
    addActions(actions);

    id("step1link").click();
}

function enablestep2() {
    const common = new Common();
    const actions = [];

    let content = "";
    closeStep("step1link");
    openStep("wizard_line2", "step2link");
    content += heading("WiFi Configuration");

    content += buildControlItem("Define ESP role:", common.EP_WIFI_MODE, actions, define_esp_role);
    content += `${translate_text_item("AP define access point / STA allows to join existing network")}<br>`;

    content += hardRule();

    content += div("setup_STA");
    content += buildControlItem("What access point ESP need to be connected to:", common.EP_STA_SSID, actions);
    content += `${translate_text_item("You can use scan button, to list available access points.")}<br>`;
    content += hardRule();
    content += buildControlItem("Password to join access point:", common.EP_STA_PASSWORD, actions);
    content += endDiv();

    content += div("setup_AP");
    content += buildControlItem("What is ESP access point SSID:", common.EP_AP_SSID, actions);
    content += hardRule();
    content += buildControlItem("Password for access point:", common.EP_AP_PASSWORD, actions);
    content += endDiv();

    setHTML("step2", content);
    addActions(actions);
    define_esp_role_from_pos(common.EP_WIFI_MODE);

    id("step2link").click();
}

const define_sd_role = (index) => {
    if (setting_configList[index].defaultvalue === 1) {
        displayBlock("setup_SD");
        displayNone("setup_primary_SD");
    } else {
        displayNone(["setup_SD", "setup_primary_SD"]);
    }
};

function enablestep3() {
    const common = new Common();
    const actions = [];

    let content = "";
    closeStep("step2link");
    openStep("wizard_line3", "step3link");
    content += heading("SD Card Configuration");
    content += buildControlItem("Is ESP connected to SD card:", common.EP_IS_DIRECT_SD, actions, define_sd_role);
    content += hardRule();

    content += div("setup_SD");
    content += buildControlItem("Check update using direct SD access:", common.EP_DIRECT_SD_CHECK, actions);
    content += hardRule();

    content += div("setup_primary_SD");
    content += buildControlItem("SD card connected to ESP", common.EP_PRIMARY_SD, actions);
    content += hardRule();
    content += buildControlItem("SD card connected to printer", common.EP_SECONDARY_SD, actions);
    content += hardRule();
    content += endDiv();

    content += endDiv();

    setHTML("step3", content);
    addActions(actions);
    define_sd_role(get_index_from_eeprom_pos(common.EP_IS_DIRECT_SD));

    id("step3link").click();
}

function enablestep4() {
    closeStep("step3link");
    setHTML("wizard_button", translate_text_item("Close"));
    openStep("wizard_line4", "endsteplink");
    id("endsteplink").click();
}

export { setupdlg };
