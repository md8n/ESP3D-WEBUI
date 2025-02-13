// import - closeModal, setactiveModal, showModal, id

const creditsDlgCancel = () => closeModal("cancel");
const creditsDlgClose = () => closeModal("Ok");

//Credits dialog
const creditsdlg = () => {
	const modal = setactiveModal("creditsdlg.html");
	if (modal == null) {
		return;
	}

	id("creditsDlgCancel").addEventListener("click", creditsDlgCancel);
	id("creditsDlgClose").addEventListener("click", creditsDlgClose);

	showModal();
};
