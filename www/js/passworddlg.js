import {
	conErr,
	displayBlock,
	displayNone,
	id,
	setHTML,
	closeModal,
	setactiveModal,
	showModal,
	SendGetHttp,
	translate_text_item,
} from "./common.js";

/** Change Password dialog */
const changepassworddlg = () => {
	const modal = setactiveModal("passworddlg.html");
	if (modal == null) {
		return;
	}

	id("passwordDlgClose").addEventListener("click", (event) => closeModal("cancel"));
	id("password_password_text1").addEventListener("keyup", (event) => checkpassword());
	id("password_password_text2").addEventListener("keyup", (event) => checkpassword());
	id("passwordDlgCancel").addEventListener("click", (event) => closeModal("cancel"));
	id("change_password_btn").addEventListener("click", (event) => SubmitChangePassword());

	displayNone(["password_loader", "change_password_btn"]);
	displayBlock("change_password_content");
	setHTML("password_content", "");
	setHTML("password_password_text", "");
	setHTML("password_password_text1", "");
	setHTML("password_password_text2", "");

	setHTML("passwordChange", `${get_icon_svg("user")}<span>${translate_text_item("Change Password")}</span>`);

	showModal();
};

function checkpassword() {
	const pwd1 = id("password_password_text1").value.trim();
	const pwd2 = id("password_password_text2").value.trim();
	setHTML("password_content", "");
	displayNone("change_password_btn");
	if (pwd1 !== pwd2) {
		setHTML("password_content", translate_text_item("Passwords do not matches!"));
	} else if (pwd1.length < 1 || pwd1.length > 16 || pwd1.indexOf(" ") > -1) {
		setHTML("password_content", translate_text_item("Password must be >1 and <16 without space!"));
	} else {
		displayBlock("change_password_btn");
	}
}

function ChangePasswordfailed(error_code, response_text) {
	const response = JSON.parse(response_text);
	if (typeof response.status !== "undefined") {
		setHTML("password_content", translate_text_item(response.status));
	}
	conErr(error_code, response_text || "");
	displayNone("password_loader");
	displayBlock("change_password_content");
}

function ChangePasswordsuccess(response_text) {
	displayNone("password_loader");
	closeModal("Connection successful");
}

function SubmitChangePassword() {
	const user = encodeURIComponent(id("current_ID").innerHTML.trim());
	const password = encodeURIComponent(id("password_password_text").value.trim());
	const newpassword = encodeURIComponent(id("password_password_text1").value.trim());
	const url = `/login?USER=${user}&PASSWORD=${password}&NEWPASSWORD=${newpassword}&SUBMIT=yes`;
	displayBlock("password_loader");
	displayNone("change_password_content");
	SendGetHttp(url, ChangePasswordsuccess, ChangePasswordfailed);
}

export { changepassworddlg };
