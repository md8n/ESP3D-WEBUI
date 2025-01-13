import {
    Common,
    classes,
    get_icon_svg,
    displayBlock,
    displayNone,
    displayUndoNone,
    id,
    setHTML,
    closeModal,
    setactiveModal,
    showModal,
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
    setClassName,
} from "./common.js";

const wizardSteps = [
    { "name": "startstep", "link": "startsteplink", "wizardLine": "", "next": "step1" },
    { "name": "step1", "link": "step1link", "wizardLine": "wizard_line1", "next": "step2" },
    { "name": "step2", "link": "step2link", "wizardLine": "wizard_line2", "next": "endstep" },
    { "name": "step3", "link": "step3link", "wizardLine": "wizard_line3", "next": "endstep" },
    { "name": "endstep", "link": "endsteplink", "wizardLine": "wizard_line4", "next": "close" },
];

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

    const modal = setactiveModal("setupdlg.html", setupdone);
    if (modal == null) {
        return;
    }

    id("setupDlgCancel").addEventListener("click", (event) => closeModal("cancel"));

    // biome-ignore lint/complexity/noForEach: <explanation>
    wizardSteps.forEach((step) => {
        id(step.link).addEventListener("click", (event) => startStep(event, step.name));
    });

    setHTML("wizard_button", translate_text_item("Start"));
    // point the wizard button at the current step
    id("wizard_button").title = wizardSteps[0].name;
    id("wizard_button").addEventListener("click", (event) => continueSetupWizard());

    // biome-ignore lint/complexity/noForEach: <explanation>
    wizardSteps.forEach((step) => {
        if (step.wizard) {
            disableStepLink(step.wizard, step.link);
        }
    });

    displayNone(["step3link", "wizard_line4"]);

    setupLanguageList();

    showModal();
    wizardNotDone("startsteplink");
    id("startsteplink").click();
};

const td = (content) => `<td>${content}</td>`;
const table = (content) => `<table><tr>${content}</tr></table>`;
const heading = (label) => `<h4>${translate_text_item(label)}</h4><hr>`;
const buildControlItem = (label, pos, actions, extra) => (translate_text_item(label) + table(build_control_from_pos(pos, actions, extra)));
const hardRule = () => "<hr>\n";
const div = (name) => `<div id='${name}'>`;
const endDiv = () => "</div>";
/** Mark the wizard step as 'not done' by removing the 'wizard_done' class */
const wizardNotDone = (element) => id(element).classList.remove("wizard_done");

const setupLanguageList = () => {
    const content = table(td(`${get_icon_svg("flag")}&nbsp;`) + td(build_language_list("language_selection")));
    setHTML("setup_langage_list", content);
    id("language_selection").addEventListener("change", (event) => translate_text(getPrefValue("language_list")));
}

function setupdone(response) {
    const common = new Common();
    common.setup_is_done = true;
    common.do_not_build_settings = false;
    build_HTML_setting_list(common.current_setting_filter);
    SavePreferences();
    translate_text(getPrefValue("language_list"));
    displayUndoNone("main_ui");
    closeModal("setup done");
}


const startStep = (evt, stepName) => {
    // if (evt.currentTarget.classList.contains("wizard_done")) {
    //     return;
    // }

    // biome-ignore lint/complexity/noForEach: <explanation>
    classes("stepcontent").forEach((stepcont) => {
        const stepId = stepcont.id;
        if (stepId !== stepName) {
            displayNone(stepId);
        }
    });

    displayBlock(stepName);
    evt.currentTarget.classList.add("active");
};

function openStepLink(wizardLine, stepLink) {
    id(wizardLine).style.background = "#337AB7";
    id(stepLink).disabled = "";
    id(stepLink).classList.remove("disabled");
}

/** Disable the wizard step and mark it as not done */
const disableStepLink = (wizardLine, stepLink) => {
    id(wizardLine).style.background = "#e0e0e0";
    id(stepLink).disabled = true;
    setClassName(stepLink, "steplinks disabled");
    wizardNotDone(stepLink);
}

const closeStepLink = (stepLink) => {
    const elem = id(stepLink);

    elem.classList.remove("active");
    if (elem.classList.contains("wizard_done")) {
        return;
    }

    elem.classList.add("wizard_done");
    elem.classList.add("no_revert_wizard");
}

const continueSetupWizard = () => {
    const currentStepName = id("wizard_button").title;

    if (currentStepName === "close") {
        // This also calls `setupdone` above
        closeModal("ok");
        return;
    }

    const currentStep = wizardSteps.find((step) => step.name === currentStepName);
    const nextStep = wizardSteps.find((step) => step.name === currentStep?.next);

    // Point the wizard button at the next step
    id("wizard_button").title = nextStep?.next || "close";

    // Close the current step link and open the new step link
    closeStepLink(currentStep.link);
    openStepLink(nextStep.wizardLine, nextStep.link);

    switch (nextStep.name) {
        case "step1":
            enablestep1();
            setPrefValue("language", getPrefValue("language_list"));
            break;
        case "step2":
            enablestep2();
            break;
        case "step3":
        // Pre-emptively step over step 3
        // id("wizard_line3").style.background = "#337AB7";
        // enablestep3();
        // break;
        case "endstep":
            enablestep4();
            break;
        default:
            console.error(`wizard page ${nextStep.name} is not defined`);
            break;
    }
}

const addActions = (actions) => {
    // biome-ignore lint/complexity/noForEach: <explanation>
    actions.forEach((action) => {
        const elem = id(action.id);
        if (elem) {
            elem.addEventListener(action.type, (event) => action.method);
        }
    });
};

function enablestep1() {
    const actions = [];
    const EP_HOSTNAME = "Hostname";

    setHTML("wizard_button", translate_text_item("Continue"));

    const content = heading("FluidNC Settings") + buildControlItem("Define ESP name:", EP_HOSTNAME, actions);
    setHTML("step1", content);
    addActions(actions);

    id("step1link").click();
}

function enablestep2() {
    const common = new Common();
    const actions = [];

    let content = "";
    content += heading("WiFi Configuration");

    content += buildControlItem("Define ESP role:", common.EP_WIFI_MODE, actions, define_esp_role);
    content += `${translate_text_item("AP define access point / STA allows to join existing network")}<br/>`;

    content += hardRule();

    content += div("setup_STA");
    content += buildControlItem("What access point ESP need to be connected to:", common.EP_STA_SSID, actions);
    content += `${translate_text_item("You can use scan button, to list available access points.")}<br/>`;
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

// const define_sd_role = (index) => {
//     if (setting_configList[index].defaultvalue === 1) {
//         displayBlock("setup_SD");
//         displayNone("setup_primary_SD");
//     } else {
//         displayNone(["setup_SD", "setup_primary_SD"]);
//     }
// };

// function enablestep3() {
//     const common = new Common();
//     const actions = [];

//     let content = "";
//     content += heading("SD Card Configuration");
//     content += buildControlItem("Is ESP connected to SD card:", common.EP_IS_DIRECT_SD, actions, define_sd_role);
//     content += hardRule();

//     content += div("setup_SD");
//     content += buildControlItem("Check update using direct SD access:", common.EP_DIRECT_SD_CHECK, actions);
//     content += hardRule();

//     content += div("setup_primary_SD");
//     content += buildControlItem("SD card connected to ESP", common.EP_PRIMARY_SD, actions);
//     content += hardRule();
//     content += buildControlItem("SD card connected to printer", common.EP_SECONDARY_SD, actions);
//     content += hardRule();
//     content += endDiv();

//     content += endDiv();

//     setHTML("step3", content);
//     addActions(actions);
//     define_sd_role(get_index_from_eeprom_pos(common.EP_IS_DIRECT_SD));

//     id("step3link").click();
// }

function enablestep4() {
    setHTML("wizard_button", translate_text_item("Close"));

    id("endsteplink").click();
}

export { setupdlg };
