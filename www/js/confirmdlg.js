// import - closeModal, setactiveModal, showModal, id

const confirmDlgCancel = () => closeModal("cancel");
const confirmDlgYes = () => closeModal("yes");
const confirmDlgNo = () => closeModal("no");

/** confirm dialog */
const confirmdlg = (titledlg, textdlg, closefunc) => {
	const modal = setactiveModal("confirmdlg.html", closefunc);
	if (!modal) {
		return;
	}

	id("ConfirmDialogClose").addEventListener("click", confirmDlgCancel);
	id("ConfirmDialogYes").addEventListener("click", confirmDlgYes);
	id("ConfirmDialogNo").addEventListener("click", confirmDlgNo);

	const title = modal.element.getElementsByClassName("modal-title")[0];
	const body = modal.element.getElementsByClassName("modal-text")[0];
	title.innerHTML = titledlg;
	body.innerHTML = textdlg;
	showModal();
};
