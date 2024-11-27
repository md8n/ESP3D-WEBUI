import { get_icon_svg } from "./icons";
import { add_language_list_event_handler, build_language_list, language } from "./languages";
import { closeModal, setactiveModal, showModal } from "./modaldlg";
import { setPrefValue, SavePreferences } from "./preferencesdlg";
import { build_control_from_pos, build_HTML_setting_list, current_setting_filter, setup_is_done } from "./settings";
import { can_revert_wizard, openstep } from "./wizard";
import { translate_text, translate_text_item } from "./translate";
import { displayBlock, displayNone, id, setHTML } from "./util";

//setup dialog

var active_wizard_page = 0;
var maz_page_wizard = 5;

var EP_HOSTNAME = 'Hostname';

const td = (content) => `<td>${content}</td>`;

function table(value) {
    return "<table><tr>" + value + "</tr></table>";
}
function heading(label) {
    return "<h4>" + translate_text_item(label) + "</h4><hr>";
}
function item(label, pos, extra) {
    return translate_text_item(label) + table(build_control_from_pos(pos, extra));
}
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
    if (id(step).className.indexOf(" wizard_done") == -1) {
        id(step).className += " wizard_done";
        if (!can_revert_wizard()) {
            id(step).className += " no_revert_wizard";
        }
    }
}
function spacer() {
    return "<hr>\n";
}
function div(name) {
    return "<div id='" + name + "'>";
}
function endDiv() {
    return "</div>";
}

const setupdlg = () => {
    setup_is_done(false);
    displayNone('main_ui');
    // From settingstab
    const settingstab_list_elem = id('settings_list_data');
    if (settingstab_list_elem) {
        settingstab_list_elem.innerHTML = "";
    }
    active_wizard_page = 0;

    id("setupDlgCancel").addEventListener("click", (event) => closeModal('cancel'));

    id("startsteplink").addEventListener("click", (event) => openstep(event, 'startstep'));
    id("step1link").addEventListener("click", (event) => openstep(event, 'step1'));
    id("step2link").addEventListener("click", (event) => openstep(event, 'step2'));
    id("step3link").addEventListener("click", (event) => openstep(event, 'step3'));
    id("endsteplink").addEventListener("click", (event) => openstep(event, 'endstep'));

    id("wizard_button").addEventListener("click", (event) => continue_setup_wizard());

    wizardDone("startsteplink");

    setHTML("wizard_button", translate_text_item("Start setup"));

    disableStep("wizard_line1", "step1link");
    disableStep("wizard_line2", "step2link");
    disableStep("wizard_line3", "step3link");

    displayNone("step3link");
    displayNone("wizard_line4")
    disableStep("wizard_line4", "endsteplink");

    var content = table( td(get_icon_svg("flag") + "&nbsp;") + td(build_language_list("language_selection")));
    setHTML("setup_langage_list", content);
    add_language_list_event_handler("language_selection");

    var modal = setactiveModal('setupdlg.html', setupdone);
    if (modal == null) return;
    showModal();
    id("startsteplink", true).click();
}


function setupdone(response) {
    setup_is_done(true);
    do_not_build_settings = false;
    build_HTML_setting_list(current_setting_filter());
    translate_text(language());
    displayUndoNone('main_ui');
    closeModal("setup done");
}

function continue_setup_wizard() {
    active_wizard_page++;
    switch (active_wizard_page) {
        case 1:
            enablestep1();
            setPrefValue("language", language());
            SavePreferences(true);
            break;
        case 2:
            enablestep2();
            break;
        case 3:
            active_wizard_page++;
            id("wizard_line3").style.background = "#337AB7";
            enablestep4();
            break;
        case 4:
            enablestep4();
            break;
        case 5:
            closeModal('ok')
            break;
        default:
            console.log("wizard page out of range");
    }
}

function enablestep1() {
    closeStep("startsteplink")
    setHTML("wizard_button", translate_text_item("Continue"));
    openStep("wizard_line1", "step1link");
    let content = heading("FluidNC Settings");
    content += item("Define ESP name:", EP_HOSTNAME);

    setHTML("step1", content);
    id("step1link").click();
}

function enablestep2() {
    var content = "";
    closeStep("step1link");
    openStep("wizard_line2", "step2link");
    content += heading("WiFi Configuration");

    content += item("Define ESP role:", EP_WIFI_MODE, "define_esp_role");
    content += translate_text_item("AP define access point / STA allows to join existing network") + "<br>";
    content += spacer();

    content += div("setup_STA");

    content += item("What access point ESP need to be connected to:", EP_STA_SSID);
    content += translate_text_item("You can use scan button, to list available access points.") + "<br>";
    content += spacer();

    content += item("Password to join access point:", EP_STA_PASSWORD);
    content += endDiv();

    content += div("setup_AP");

    content += item("What is ESP access point SSID:", EP_AP_SSID);
    content += spacer();

    content += item("Password for access point:", EP_AP_PASSWORD);

    content += endDiv();

    setHTML("step2", content);
    define_esp_role_from_pos(EP_WIFI_MODE);
    id("step2link").click();
}

function define_sd_role(index) {
    if (setting_configList[index].defaultvalue == 1) {
        displayBlock("setup_SD");
        displayNone("setup_primary_SD");;
    } else {
        displayNone("setup_SD");
        displayNone("setup_primary_SD");
    }
}

function enablestep3() {
    var content = "";
    closeStep("step2link");
    openStep("wizard_line3", "step3link");
    content += heading("SD Card Configuration");
    content += item("Is ESP connected to SD card:", EP_IS_DIRECT_SD, "define_sd_role");
    content += spacer();

    content += div("setup_SD");
    content += item("Check update using direct SD access:", EP_DIRECT_SD_CHECK);
    content += spacer();

    content += div("setup_primary_SD");
    content += item("SD card connected to ESP", EP_PRIMARY_SD);
    content += spacer();

    content += item("SD card connected to printer", EP_SECONDARY_SD);
    content += spacer();
    content += endDiv();

    content += endDiv();

    setHTML("step3", content);
    define_sd_role(get_index_from_eeprom_pos(EP_IS_DIRECT_SD));
    id("step3link").click();
}

function enablestep4() {
    closeStep("step3link");
    setHTML("wizard_button", translate_text_item("Close"));
    openStep("wizard_line4", "endsteplink");
    id("endsteplink").click();
}

export { setupdlg };