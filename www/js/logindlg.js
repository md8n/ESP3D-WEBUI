import { SendGetHttp } from "./http";
import { setactiveModal, showModal } from "./modaldlg";
import { translate_text_item } from "./translate";
import { conErr, displayBlock, displayNone } from "./util";

//login dialog
function logindlg(closefunc, check_first) {
    var modal = setactiveModal('logindlg.html', closefunc);
    var need_query_auth = false;
    if (modal == null) return;
    id('login_title').innerHTML = translate_text_item("Identification requested");
    displayNone('login_loader');
    displayBlock('login_content');
    if (typeof check_first !== 'undefined') need_query_auth = check_first;
    if (need_query_auth) {
        var url = "/login";
        SendGetHttp(url, checkloginsuccess);
    } else {
        showModal();
    }
}

function checkloginsuccess(response_text) {
    var response = JSON.parse(response_text);
    if (typeof(response.authentication_lvl) !== 'undefined') {
        if (response.authentication_lvl != "guest") {
            if (typeof(response.authentication_lvl) !== 'undefined') id('current_auth_level').innerHTML = "(" + translate_text_item(response.authentication_lvl) + ")";
            if (typeof(response.user) !== 'undefined') id('current_ID').innerHTML = response.user;
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
    id('login_title').innerHTML = translate_text_item(response.status || "Identification invalid!");
    conErr(error_code, response_text);
    displayBlock('login_content');
    displayNone('login_loader');
    id('current_ID').innerHTML = translate_text_item("guest");
    displayNone('logout_menu');
    displayNone('logout_menu_divider');
    displayNone("password_menu");
}

function loginsuccess(response_text) {
    var response = JSON.parse(response_text);
    if (typeof(response.authentication_lvl) !== 'undefined') id('current_auth_level').innerHTML = "(" + translate_text_item(response.authentication_lvl) + ")";
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
    id('current_ID').innerHTML = user;
    id('current_auth_level').innerHTML = "";
    displayNone('login_content');
    displayBlock('login_loader');
    SendGetHttp(url, loginsuccess, loginfailed);
}

function GetIdentificationStatus() {
    var url = "/login";
    SendGetHttp(url, GetIdentificationStatusSuccess);
}

function GetIdentificationStatusSuccess(response_text) {
    var response = JSON.parse(response_text);
    if (typeof(response.authentication_lvl) !== 'undefined') {
        if (response.authentication_lvl == "guest") {
            id('current_ID').innerHTML = translate_text_item("guest");
            id('current_auth_level').innerHTML = "";
        }
    }
}

function DisconnectionSuccess(response_text) {
    id('current_ID').innerHTML = translate_text_item("guest");
    id('current_auth_level').innerHTML = "";
    displayNone('logout_menu');
    displayNone('logout_menu_divider');
    displayNone("password_menu");
}

function DisconnectionFailed(error_code, response) {
    id('current_ID').innerHTML = translate_text_item("guest");
    id('current_auth_level').innerHTML = "";
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
