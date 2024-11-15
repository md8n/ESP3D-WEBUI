import { setactiveModal, showModal } from "./modaldlg";
import { translate_text_item } from "./translate";

//UIdisabled dialog
export const UIdisableddlg = (lostcon) => {
    var modal = setactiveModal('UIdisableddlg.html');
    if (modal == null) return;
    if (lostcon) {
        id('disconnection_msg').innerHTML = translate_text_item("Connection lost for more than 20s");
    }
    showModal();
}