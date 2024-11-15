import { showpreferencesdlg } from "./preferencesdlg";
import { translate_text_item } from "./translate";
import { disable_items, displayNone, id } from "./util";

/** Set up the event handlers for the navbar */
const navbar = () => {
    id("toggleLockUI").addEventListener("click", (event) => ontoggleLock());
    id("showPreferencesDlg").addEventListener("click", (event) => showpreferencesdlg());
}

const enableItem = (itemName) => {
    const itemElem = id(itemName);
    if (!itemElem) {
        return;
    }

    itemElem.disabled = false;
}

const ontoggleLock = (forcevalue) => {
    if (typeof forcevalue != 'undefined') id('lock_UI').checked = forcevalue;
    const jogUIElem = id('JogUI');
    if (id('lock_UI').checked) {
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