import { setactiveModal, showModal } from "./modaldlg";
import { id } from "./util";

//Credits dialog
const creditsdlg = () => {
    var modal = setactiveModal('creditsdlg.html');
    if (modal == null) {
        return;
    }

    id("creditsDlgCancel").addEventListener("click", (event) => closeModal('cancel'));
    id("creditsDlgClose").addEventListener("click", (event) => closeModal('Ok'));

    showModal();
}

export { creditsdlg };