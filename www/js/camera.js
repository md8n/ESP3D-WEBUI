import { getPrefValue, setPrefValue, SavePreferences } from "./preferencesdlg";
import { displayBlock, displayNone, id, HTMLEncode, HTMLDecode } from "./util";

/** Set up the event handlers for the camera tab */
const cameratab = () => {
    id("camera_webaddress").addEventListener("keyup", (event) => camera_OnKeyUp(event));

    id("cameratab_loadframe").addEventListener("click", (event) => camera_loadframe());
    id("cameratab_getaddress").addEventListener("click", (event) => camera_GetAddress());
    id("cameratab_saveaddress").addEventListener("click", (event) => camera_saveaddress());
    id("camera_detach_button").addEventListener("click", (event) => camera_detachcam());
}

function cameraformataddress() {
    var saddress = id('camera_webaddress').value;
    var saddressl = saddress.trim().toLowerCase();
    saddress = saddress.trim();
    if (saddress.length > 0) {
        if (!(saddressl.indexOf("https://") != -1 || saddressl.indexOf("http://") != -1 || saddressl.indexOf("rtp://") != -1 || saddressl.indexOf("rtps://") != -1 || saddressl.indexOf("rtp://") != -1)) {
            saddress = "http://" + saddress;
        }
    }
    id('camera_webaddress').value = saddress;
}

function camera_loadframe() {
    var saddress = id('camera_webaddress').value;
    saddress = saddress.trim();
    if (saddress.length == 0) {
        id('camera_frame').src = "";
        displayNone('camera_frame_display');
        displayNone('camera_detach_button');
    } else {
        cameraformataddress();
        id('camera_frame').src = id('camera_webaddress').value;
        displayBlock('camera_frame_display');
        displayTable('camera_detach_button');
    }
}

function camera_OnKeyUp(event) {
    if (event.keyCode == 13) {
        camera_loadframe();
    }
    return true;
}

function camera_saveaddress() {
    cameraformataddress();
    setPrefValue("camera_address", id('camera_webaddress').value);
    SavePreferences(true);
}

function camera_detachcam() {
    var webaddress = id('camera_frame').src;
    id('camera_frame').src = "";
    displayNone('camera_frame_display');
    displayNone('camera_detach_button');
    window.open(webaddress);
}

function camera_GetAddress() {
    id('camera_webaddress').value = (typeof(getPrefValue("camera_address")) !== 'undefined')
        ? getPrefValue("camera_address") : "";
}

export { cameratab, camera_GetAddress };