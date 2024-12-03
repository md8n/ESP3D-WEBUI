import { closeModal, setactiveModal, showModal, id } from "./common.js";

//input dialog
const inputdlg = (titledlg, textdlg, closefunc, preset) => {
	const modal = setactiveModal("inputdlg.html", closefunc);
	if (modal == null) {
		return;
	}

	id("inputdlg_close").addEventListener("click", (event) =>
		closeInputModal("cancel"),
	);
	id("inputdlg_cancel").addEventListener("click", (event) =>
		closeInputModal("cancel"),
	);
	id("inputdlg_ok").addEventListener("click", (event) => closeInputModal("ok"));

	const title = modal.element.getElementsByClassName("modal-title")[0];
	const body = modal.element.getElementsByClassName("modal-text")[0];
	title.innerHTML = titledlg;
	body.innerHTML = textdlg;
	id("inputldg_text").value = typeof preset !== "undefined" ? preset : "";

	showModal();
};

function closeInputModal(response) {
	let answer = "";
	if (response === "ok") {
		const input = id("inputldg_text").value;
		answer = input.trim();
	}
	closeModal(answer);
}

export { inputdlg };
