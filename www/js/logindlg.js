import { SendGetHttp } from "./http.js";
import { closeModal, setactiveModal, showModal } from "./modaldlg.js";
import { translate_text_item } from "./langUtils.js";
import { conErr, displayBlock, displayNone, id, setHTML } from "./util.js";

/** login dialog */
const logindlg = (closefunc, check_first) => {
    const modal = setactiveModal('logindlg.html', closefunc);
    let need_query_auth = false;
    if (modal == null) {
        return;
    }

    id("login_user_text").addEventListener("keyup", (event) => login_id_OnKeyUp(event));
    id("login_password_text").addEventListener("keyup", (event) => login_password_OnKeyUp(event));
    id("login_submit_btn").addEventListener("click", (event) => SubmitLogin());

    setHTML('login_title', translate_text_item("Identification requested"));
    displayNone('login_loader');
    displayBlock('login_content');
    if (typeof check_first !== 'undefined') {
        need_query_auth = check_first;
    }
    if (need_query_auth) {
        const url = "/login";
        SendGetHttp(url, checkloginsuccess);
    } else {
        showModal();
    }
}

function checkloginsuccess(response_text) {
    const response = JSON.parse(response_text);
    if (typeof(response.authentication_lvl) !== 'undefined') {
        if (response.authentication_lvl != "guest") {
            if (typeof(response.authentication_lvl) !== 'undefined') {
                setHTML('current_auth_level', `(${translate_text_item(response.authentication_lvl)})`);
            }
            if (typeof(response.user) !== 'undefined') {
                setHTML('current_ID', response.user);
            }
            closeModal('cancel');
        } else showModal();
    } else {
        showModal();
    }
}

function login_id_OnKeyUp(event) {
    //console.log(event.keyCode);
    if ((event.keyCode == 13)) id('login_password_text').focus();
}

function login_password_OnKeyUp(event) {
    //console.log(event.keyCode);
    if ((event.keyCode == 13)) id('login_submit_btn').click();
}


function loginfailed(error_code, response_text) {
    var response = JSON.parse(response_text);
    setHTML('login_title', translate_text_item(response.status || "Identification invalid!"));
    conErr(error_code, response_text);
    displayBlock('login_content');
    displayNone('login_loader');
    setHTML('current_ID', translate_text_item("guest"));
    displayNone('logout_menu');
    displayNone('logout_menu_divider');
    displayNone("password_menu");
}

function loginsuccess(response_text) {
    var response = JSON.parse(response_text);
    if (typeof(response.authentication_lvl) !== 'undefined') {
        setHTML('current_auth_level', `(${translate_text_item(response.authentication_lvl)})`);
    }
    displayNone('login_loader');
    displayBlock('logout_menu');
    displayBlock('logout_menu_divider');
    displayBlock("password_menu");
    closeModal("Connection successful");
}

function SubmitLogin() {
    var user = id('login_user_text').value.trim();
    var password = id('login_password_text').value.trim();
    var url = "/login?USER=" + encodeURIComponent(user) + "&PASSWORD=" + encodeURIComponent(password) + "&SUBMIT=yes";
    setHTML('current_ID', user);
    setHTML('current_auth_level', "");
    displayNone('login_content');
    displayBlock('login_loader');
    SendGetHttp(url, loginsuccess, loginfailed);
}

function DisconnectionSuccess(response_text) {
    setHTML('current_ID', translate_text_item("guest"));
    setHTML('current_auth_level', "");
    displayNone('logout_menu');
    displayNone('logout_menu_divider');
    displayNone("password_menu");
}

function DisconnectionFailed(error_code, response) {
    setHTML('current_ID', translate_text_item("guest"));
    setHTML('current_auth_level', "");
    displayNone('logout_menu');
    displayNone('logout_menu_divider');
    displayNone("password_menu");
    conErr(error_code, response);
}

function DisconnectLogin(answer) {
    if (answer == "yes") {
        var url = "/login?DISCONNECT=yes";
        SendGetHttp(url, DisconnectionSuccess, DisconnectionFailed);
    }
}

export { DisconnectLogin, logindlg };
