// import conErr, displayBlock, displayNone, id, setHTML, closeModal, setactiveModal, showModal, SendGetHttp, translate_text_item 

const passwordDlgCancel = () => closeModal("cancel");

/** Change Password dialog */
const changepassworddlg = () => {
	const modal = setactiveModal("passworddlg.html");
	if (modal == null) {
		return;
	}

	id("passwordDlgClose").addEventListener("click", passwordDlgCancel);
	id("password_password_text1").addEventListener("keyup", checkpassword);
	id("password_password_text2").addEventListener("keyup", checkpassword);
	id("passwordDlgCancel").addEventListener("click", passwordDlgCancel);
	id("change_password_btn").addEventListener("click", SubmitChangePassword);

	displayNone("password_loader");
	displayBlock("change_password_content");
	displayNone("change_password_btn");
	setHTML("password_content", "");
	setHTML("password_password_text", "");
	setHTML("password_password_text1", "");
	setHTML("password_password_text2", "");
	showModal();
};

function checkpassword() {
	const pwd1 = getValueTrimmed("password_password_text1");
	const pwd2 = getValueTrimmed("password_password_text2");
	setHTML("password_content", "");
	displayNone("change_password_btn");
	if (pwd1 !== pwd2) {
		setHTML(
			"password_content",
			translate_text_item("Passwords do not matches!"),
		);
	} else if (pwd1.length < 1 || pwd1.length > 16 || pwd1.indexOf(" ") > -1) {
		setHTML(
			"password_content",
			translate_text_item("Password must be >1 and <16 without space!"),
		);
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
	displayBlock("password_loader");
	displayNone("change_password_content");

	const user = id("current_ID").innerHTML.trim();
	const password = getValueTrimmed("password_password_text");
	const newpassword = getValueTrimmed("password_password_text1");

	const cmd = buildHttpLoginCmd({ USER: user, PASSWORD: password, NEWPASSWORD: newpassword });
	SendGetHttp(cmd, ChangePasswordsuccess, ChangePasswordfailed);
}
