import { SendGetHttp } from "./http";
import { closeModal, setactiveModal, showModal } from "./modaldlg";
import { translate_text_item } from "./translate";
import { conErr, displayBlock, displayNone, id } from "./util";

/** Change Password dialog */
const changepassworddlg = () => {
    var modal = setactiveModal('passworddlg.html');
    if (modal == null) {
        return;
    }

    id("passwordDlgClose").addEventListener("click", (event) => closeModal('cancel'));
    id("password_password_text1").addEventListener("keyup", (event) => checkpassword());
    id("password_password_text2").addEventListener("keyup", (event) => checkpassword());
    id("passwordDlgCancel").addEventListener("click", (event) => closeModal('cancel'));
    id("change_password_btn").addEventListener("click", (event) => SubmitChangePassword());

    displayNone('password_loader');
    displayBlock('change_password_content');
    displayNone('change_password_btn');
    id('password_content').innerHTML = "";
    id('password_password_text').innerHTML = "";
    id('password_password_text1').innerHTML = "";
    id('password_password_text2').innerHTML = "";
    showModal();
}

function checkpassword() {
    var pwd = id('password_password_text').value.trim();
    var pwd1 = id('password_password_text1').value.trim();
    var pwd2 = id('password_password_text2').value.trim();
    id('password_content').innerHTML = "";
    displayNone('change_password_btn');
    if (pwd1 != pwd2) id('password_content').innerHTML = translate_text_item("Passwords do not matches!");
    else if (pwd1.length < 1 || pwd1.length > 16 || pwd1.indexOf(" ") > -1) id('password_content').innerHTML = translate_text_item("Password must be >1 and <16 without space!");
    else displayBlock('change_password_btn');
}


function ChangePasswordfailed(error_code, response_text) {
    var response = JSON.parse(response_text);
    if (typeof(response.status) !== 'undefined') id('password_content').innerHTML = translate_text_item(response.status);
    conErr(error_code, response_text || "");
    displayNone('password_loader');
    displayBlock('change_password_content');
}

function ChangePasswordsuccess(response_text) {
    displayNone('password_loader');
    closeModal("Connection successful");
}

function SubmitChangePassword() {
    var user = id('current_ID').innerHTML.trim();
    var password = id('password_password_text').value.trim();
    var newpassword = id('password_password_text1').value.trim();
    var url = "/login?USER=" + encodeURIComponent(user) + "&PASSWORD=" + encodeURIComponent(password) + "&NEWPASSWORD=" + encodeURIComponent(newpassword) + "&SUBMIT=yes";
    displayBlock('password_loader');
    displayNone('change_password_content');
    SendGetHttp(url, ChangePasswordsuccess, ChangePasswordfailed);
}

export { changepassworddlg };
