import { setactiveModal, showModal } from "./modaldlg";
import { saveSerialMessages } from "./tablet";
import { translate_text_item } from "./translate";
import { id, setHTML } from "./util";

//UIdisabled dialog
export const UIdisableddlg = (lostcon) => {
    var modal = setactiveModal('UIdisableddlg.html');
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