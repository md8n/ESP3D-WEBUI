import { setactiveModal, showModal } from "./modaldlg";

//Credits dialog
function creditsdlg() {
    var modal = setactiveModal('creditsdlg.html');
    if (modal == null) return;
    showModal();
}