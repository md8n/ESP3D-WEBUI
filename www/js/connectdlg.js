import { grblaxis } from "./grbl";
import { SendGetHttp } from "./http";
import { logindlg } from "./logindlg";
import { closeModal, setactiveModal, showModal } from "./modaldlg";
import { async_webcommunication, EventListenerSetup, startSocket } from "./socket";
import { conErr, displayBlock, displayInline, displayNone, id } from "./util";

/** Connect Dialog */
const connectdlg = (getFw) => {
    var modal = setactiveModal('connectdlg.html');
    if (modal == null) {
        return;
    }

    const btnElem = id("connectbtn");
    btnElem.addEventListener("click", (event) => retryconnect());

    showModal();

    let get_FW = (typeof getFw != 'undefined') ? getFw : true;
    if (get_FW) {
        retryconnect();
    }
}

const getFWdata = (response) => {
    var tlist = response.split("#");
    //FW version:0.9.200 # FW target:smoothieware # FW HW:Direct SD # primary sd:/ext/ # secondary sd:/sd/ # authentication: yes
    if (tlist.length < 3) {
        return false;
    }
    //FW version
    var sublist = tlist[0].split(":");
    if (sublist.length != 2) {
        return false;
    }
    fw_version = sublist[1].toLowerCase().trim();
    //FW target
    sublist = tlist[1].split(":");
    if (sublist.length != 2) {
        return false;
    }
    target_firmware = sublist[1].toLowerCase().trim();
    //FW HW
    sublist = tlist[2].split(":");
    if (sublist.length != 2) {
        return false;
    }
    var sddirect = sublist[1].toLowerCase().trim();
    if (sddirect == "direct sd") direct_sd = true;
    else direct_sd = false;
    //primary sd
    sublist = tlist[3].split(":");
    if (sublist.length != 2) {
        return false;
    }
    primary_sd = sublist[1].toLowerCase().trim();

    //secondary sd
    sublist = tlist[4].split(":");
    if (sublist.length != 2) {
        return false;
    }
    secondary_sd = sublist[1].toLowerCase().trim();

    //authentication
    sublist = tlist[5].split(":");
    if (sublist.length != 2) {
        return false;
    }
    if ((sublist[0].trim() == "authentication") && (sublist[1].trim() == "yes")) ESP3D_authentication = true;
    else ESP3D_authentication = false;
    //async communications
    if (tlist.length > 6) {
        sublist = tlist[6].split(":");
        if ((sublist[0].trim() == "webcommunication") && (sublist[1].trim() == "Async")) async_webcommunication(true);
        else {
            async_webcommunication(false);
            websocket_port = sublist[2].trim();
            if (sublist.length > 3) {
                websocket_ip = sublist[3].trim();
            } else {
                console.log("No IP for websocket, use default");
                websocket_ip = document.location.hostname;
            }
        }
    }
    if (tlist.length > 7) {
        sublist = tlist[7].split(":");
        if (sublist[0].trim() == "hostname") esp_hostname = sublist[1].trim();
    }

    if (tlist.length > 8) {
        sublist = tlist[8].split(":");
        if (sublist[0].trim() == "axis") {
            grblaxis(parseInt(sublist[1].trim()));
        }
    }

    EventListenerSetup();
    startSocket();

    return true;
}

const connectfailed = (error_code, response) => {
    displayBlock('connectbtn');
    displayBlock('failed_connect_msg');
    displayNone('connecting_msg');
    conErr(error_code, response, "Fw identification error");
}

const connectsuccess = (response) => {
    if (getFWdata(response)) {
        console.log("Fw identification:" + response);
        if (ESP3D_authentication) {
            closeModal("Connection successful");
            displayInline('menu_authentication');
            logindlg(initUI, true);
        } else {
            displayNone('menu_authentication');
            initUI();
        }
    } else {
        console.log(response);
        connectfailed(406, "Wrong data");
    }
}

const retryconnect = () => {
    displayNone('connectbtn');
    displayNone('failed_connect_msg');
    displayBlock('connecting_msg');
    var url = "/command?plain=" + encodeURIComponent("[ESP800]");
    SendGetHttp(url, connectsuccess, connectfailed)
}

export { connectdlg };
