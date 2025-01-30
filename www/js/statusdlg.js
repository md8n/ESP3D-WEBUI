// import get_icon_svg, conErr, stdErrMsg, displayBlock, displayNone, id, setHTML, closeModal, getactiveModal, setactiveModal, showModal, SendGetHttp, translate_text_item

let statuspage = 0;
let statuscontent = "";
//status dialog
const statusdlg = () => {
	const modal = setactiveModal("statusdlg.html");
	if (modal == null) {
		return;
	}

	id("status_dlg_close").addEventListener("click", (event) => closeModal("cancel"));
	id("next_status_btn").addEventListener("click", (event) => next_status());
	id("status_dlg_btn_close").addEventListener("click", (event) => closeModal("cancel"));
	id("status_dlg_refreshstatus").addEventListener("click", (event) => refreshstatus());

	showModal();
	refreshstatus();
	update_btn_status(0);
};

function next_status() {
	const modal = getactiveModal();
	const text = modal.element.getElementsByClassName("modal-text")[0];
	text.innerHTML =
		statuspage === 0
			? statuscontent
			: `<table><tr><td width='auto' style='vertical-align:top;'><label translate>Browser:</label></td><td>&nbsp;</td><td width='100%'><span class='text-info'><strong>${navigator.userAgent}</strong></span></td></tr></table>`;
	update_btn_status();
}

function update_btn_status(forcevalue) {
	if (typeof forcevalue !== "undefined") {
		statuspage = forcevalue;
	}
	setHTML(
		"next_status_btn",
		get_icon_svg(
			statuspage === 0 ? "triangle-right" : "triangle-left",
			"1em",
			"1em",
		),
	);
	statuspage = statuspage === 0 ? 1 : 0;
}

function statussuccess(response) {
	displayBlock("refreshstatusbtn");
	displayNone("status_loader");
	const modal = getactiveModal();
	if (modal == null) {
		return;
	}

	const text = modal.element.getElementsByClassName("modal-text")[0];
	const tresponse = response.split("\n");
	statuscontent = "";
	for (let i = 0; i < tresponse.length; i++) {
		const data = tresponse[i].split(":");
		if (data.length >= 2) {
			statuscontent += `<label>${translate_text_item(data[0])}: </label>&nbsp;<span class='text-info'><strong>`;
			const data2 = data[1].split(" (");
			statuscontent += translate_text_item(data2[0].trim());
			for (v = 1; v < data2.length; v++) {
				statuscontent += ` (${data2[v]}`;
			}
			for (v = 2; v < data.length; v++) {
				statuscontent += `:${data[v]}`;
			}
			statuscontent += "</strong></span><br>";
		} //else statuscontent += tresponse[i] + "<br>";
	}
	statuscontent += `<label>${translate_text_item("WebUI version")}: </label>&nbsp;<span class='text-info'><strong>`;
	statuscontent += web_ui_version;
	statuscontent += "</strong></span><br>";
	text.innerHTML = statuscontent;
	update_btn_status(0);
	//console.log(response);
}

function statusfailed(error_code, response) {
	displayBlock("refreshstatusbtn");
	displayNone("status_loader");
	displayBlock("status_msg");
	const errMsg = stdErrMsg(error_code, response);
	conErr(errMsg);
	setHTML("status_msg", errMsg);
}

function refreshstatus() {
	displayNone("refreshstatusbtn");
	displayBlock("status_loader");
	const modal = getactiveModal();
	if (modal == null) {
		return;
	}

	const text = modal.element.getElementsByClassName("modal-text")[0];
	text.innerHTML = "";
	displayNone("status_msg");

	const cmd = buildHttpCommandCmd(httpCmdType.plain, "[ESP420]plain");
	SendGetHttp(cmd, statussuccess, statusfailed);
}
