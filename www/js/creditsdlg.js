import { closeModal, setactiveModal, showModal } from "./modaldlg.js";
import { id } from "./util.js";

//Credits dialog
const creditsdlg = () => {
    const modal = setactiveModal('creditsdlg.html');
    if (modal == null) {
        return;
    }

    id("creditsDlgCancel").addEventListener("click", (event) => closeModal('cancel'));
    id("creditsDlgClose").addEventListener("click", (event) => closeModal('Ok'));

    showModal();
}

export { creditsdlg };