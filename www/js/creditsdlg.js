// import - closeModal, setactiveModal, showModal, id

//Credits dialog
const creditsdlg = () => {
	const modal = setactiveModal("creditsdlg.html");
	if (modal == null) {
		return;
	}

	id("creditsDlgCancel").addEventListener("click", (event) => closeModal("cancel"));
	id("creditsDlgClose").addEventListener("click", (event) => closeModal("Ok"));

	showModal();
};
