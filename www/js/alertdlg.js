import { closeModal, setactiveModal, showModal } from "./modaldlg.js";
import { id } from "./util.js";

/** alert dialog */
export const alertdlg = (titledlg, textdlg, closefunc) => {
    const modal = setactiveModal('alertdlg.html', closefunc);
    if (modal == null) {
        return;
    }

    id("cancelAlertDlg").addEventListener("click", (event) => closeModal('cancel'));
    id("closeAlertDlg").addEventListener("click", (event) => closeModal('Ok'));

    const title = modal.element.getElementsByClassName("modal-title")[0];
    const body = modal.element.getElementsByClassName("modal-text")[0];
    title.innerHTML = titledlg;
    body.innerHTML = textdlg;
    showModal();
}