import { closeModal, setactiveModal, showModal } from "./modaldlg";
import { id } from "./util";

/** alert dialog */
export const alertdlg = (titledlg, textdlg, closefunc) => {
    var modal = setactiveModal('alertdlg.html', closefunc);
    if (modal == null) {
        return;
    }

    id("cancelAlertDlg").addEventListener("click", (event) => closeModal('cancel'));
    id("closeAlertDlg").addEventListener("click", (event) => closeModal('Ok'));

    var title = modal.element.getElementsByClassName("modal-title")[0];
    var body = modal.element.getElementsByClassName("modal-text")[0];
    title.innerHTML = titledlg;
    body.innerHTML = textdlg;
    showModal();
}