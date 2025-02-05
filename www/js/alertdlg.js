// This uses: closeModal, setactiveModal, showModal, id

const alertDlgCancel = () => closeModal("cancel");
const alertDlgClose = () => closeModal("Ok");

/** alert dialog */
const alertdlg = (titledlg, textdlg, closefunc) => {
	const modal = setactiveModal("alertdlg.html", closefunc);
	if (modal === null) {
		return;
	}

	id("cancelAlertDlg").addEventListener("click", alertDlgCancel);
	id("closeAlertDlg").addEventListener("click", alertDlgClose);

	const title = modal.element.getElementsByClassName("modal-title")[0];
	const body = modal.element.getElementsByClassName("modal-text")[0];
	title.innerHTML = titledlg;
	body.innerHTML = textdlg;
	showModal();
};
