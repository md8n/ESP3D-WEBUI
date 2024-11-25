import { closeModal, setactiveModal, showModal } from "./modaldlg";
import { id } from "./util";

//input dialog
const inputdlg = (titledlg, textdlg, closefunc, preset) => {
    var modal = setactiveModal('inputdlg.html', closefunc);
    if (modal == null) {
        return;
    }

    var title = modal.element.getElementsByClassName("modal-title")[0];
    var body = modal.element.getElementsByClassName("modal-text")[0];
    title.innerHTML = titledlg;
    body.innerHTML = textdlg;
    id('inputldg_text').value = (typeof preset !== 'undefined') ? preset : "";

    showModal();
}

function closeInputModal(response) {
    var answer = "";
    if (response == "ok") {
        var input = id('inputldg_text').value;
        answer = input.trim();
    }
    closeModal(answer);
}

export { inputdlg };