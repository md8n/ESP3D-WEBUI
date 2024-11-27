import { configtab } from "./configtab";
import { creditsdlg } from "./creditsdlg";
import { DisconnectLogin } from "./logindlg";
import { changepassworddlg } from "./passworddlg";
import { showpreferencesdlg } from "./preferencesdlg";
import { settingstab } from "./settingstab";
import { setupdlg } from "./setupdlg";
import { opentab } from "./tabs";
import { translate_text_item } from "./translate";
import { disable_items, displayNone, getChecked, id, setChecked } from "./util";

/** Set up the event handlers for the navbar */
const navbar = () => {
    id("toggleLockUI").addEventListener("click", (event) => ontoggleLock());

    id("showPreferencesDlg").addEventListener("click", (event) => showpreferencesdlg());
    id("showSetupDlg").addEventListener("click", (event) => setupdlg());
    id("showCreditsDlg").addEventListener("click", (event) => creditsdlg());

    // Note: for `maintab` see dashtab.html
    id("maintablink").addEventListener("click", (event) => opentab(event, 'maintab', 'mainuitabscontent', 'mainuitablinks'));
    id("camtablink").addEventListener("click", (event) => opentab(event, 'cameratab', 'mainuitabscontent', 'mainuitablinks'));
    id("configtablink").addEventListener("click", (event) => opentab(event, 'configtab', 'mainuitabscontent', 'mainuitablinks'));
    id("settingtablink").addEventListener("click", (event) => opentab(event, 'settingstab', 'mainuitabscontent', 'mainuitablinks'));
    id("tablettablink").addEventListener("click", (event) => opentab(event, 'tablettab', 'mainuitabscontent', 'mainuitablinks'));

    id("password_menu").addEventListener("click", (event) => changepassworddlg());
    id("showLoginDlg").addEventListener("click", (event) => logindlg());
    id("logout_menu").addEventListener("click", (event) => confirmdlg(translate_text_item('Disconnection requested'), translate_text_item('Please confirm disconnection.'), DisconnectLogin));

    configtab();
    settingstab();
}

const enableItem = (itemName) => {
    const itemElem = id(itemName);
    if (!itemElem) {
        return;
    }

    itemElem.disabled = false;
}

const ontoggleLock = (forcevalue) => {
    if (typeof forcevalue != 'undefined') setChecked('lock_UI', forcevalue);
    const jogUIElem = id('JogUI');
    if (getChecked('lock_UI') !== "false") {
        id('lock_UI_btn_txt').innerHTML = translate_text_item('Unlock interface');
        disable_items(id('maintab'), true);
        disable_items(id('configtab'), true);
        enableItem('progress_btn');
        enableItem('clear_monitor_btn');
        enableItem('monitor_enable_verbose_mode');
        enableItem('monitor_enable_autoscroll');
        enableItem('settings_update_fw_btn');
        enableItem('settings_restart_btn');
        if (jogUIElem) {
            disable_items(jogUIElem, false);
            displayNone('JogUI');
        }
    } else {
        id('lock_UI_btn_txt').innerHTML = translate_text_item('Lock interface');
        disable_items(id('maintab'), false);
        disable_items(id('configtab'), false);
        enableItem('settings_update_fw_btn');
        enableItem('settings_restart_btn');
        if (jogUIElem) {
            jogUIElem.style.pointerEvents = 'auto';
        }
    }
}

export { navbar, ontoggleLock };