import { setactiveModal, showModal } from "./modaldlg.js";
import { saveSerialMessages } from "./tablet.js";
import { translate_text_item } from "./translate.js";
import { id, setHTML } from "./util.js";

//UIdisabled dialog
const UIdisableddlg = (lostcon) => {
    const modal = setactiveModal('UIdisableddlg.html');
    if (modal == null) {
        return;
    }

    id('UIdisabled_reconnect').addEventListener('click', (event) => window.location.reload());
    id('UIdisabled_save_serial_msg').addEventListener('click', (event) => saveSerialMessages());

    if (lostcon) {
        setHTML('disconnection_msg', translate_text_item("Connection lost for more than 20s"));
    }
    showModal();
}

export { UIdisableddlg };