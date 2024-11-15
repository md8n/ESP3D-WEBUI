import { closeModal, setactiveModal, showModal } from "./modaldlg";

//alert dialog
export const alertdlg = (titledlg, textdlg, closefunc) => {
    var modal = setactiveModal('alertdlg.html', closefunc);
    if (modal == null) {
        return;
    }

    const btnElem = id("closeAlertDlg");
    btnElem.addEventListener("click", (event) => closeModal('Ok'));

    var title = modal.element.getElementsByClassName("modal-title")[0];
    var body = modal.element.getElementsByClassName("modal-text")[0];
    title.innerHTML = titledlg;
    body.innerHTML = textdlg;
    showModal();
}