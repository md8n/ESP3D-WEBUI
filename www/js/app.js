var ESP3D_authentication = false
var async_webcommunication = false
var websocket_port = 0
var websocket_ip = ''
var esp_hostname = 'ESP3D WebUI'
var EP_HOSTNAME
var EP_STA_SSID
var EP_STA_PASSWORD
var EP_STA_IP_MODE
var EP_STA_IP_VALUE
var EP_STA_GW_VALUE
var EP_STA_MK_VALUE
var EP_WIFI_MODE
var EP_AP_SSID
var EP_AP_PASSWORD
var EP_AP_IP_VALUE
var EP_BAUD_RATE = 112
var EP_AUTH_TYPE = 119
var EP_TARGET_FW = 461
var EP_IS_DIRECT_SD = 850
var EP_PRIMARY_SD = 851
var EP_SECONDARY_SD = 852
var EP_DIRECT_SD_CHECK = 853
var SETTINGS_AP_MODE = 1
var SETTINGS_STA_MODE = 2
var SETTINGS_FALLBACK_MODE = 3
var last_ping = 0
var enable_ping = true
var esp_error_message = ''
var esp_error_code = 0

//Check for IE
//Edge
//Chrome
function browser_is(bname) {
	const ua = navigator.userAgent;
	switch (bname) {
		case 'IE':
			if (ua.indexOf('Trident/') !== -1) return true;
			break;
		case 'Edge':
			if (ua.indexOf('Edge') !== -1) return true;
			break;
		case 'Chrome':
			if (ua.indexOf('Chrome') !== -1) return true;
			break;
		case 'Firefox':
			if (ua.indexOf('Firefox') !== -1) return true;
			break;
		case 'MacOSX':
			if (ua.indexOf('Mac OS X') !== -1) return true;
			break;
		default:
			return false;
	}
	return false;
}

window.onload = () => {
	//to check if javascript is disabled like in android preview
	displayNone("loadingmsg");
	console.log("Connect to board");

	// These are all falsey, indicating nothing has been loaded
	let connectDlg = "";
	let controlsPanel = "";
	let navbarLoaded = "";
	let tabletTab = "";

	let failSafe = 10;

	let startUpInt = setInterval(() => {
		// Check for various key HTML panels and load them up
		if (!connectDlg && id("connectdlg.html")) {
			connectDlg = "loading";
			try {
				connectdlg(true);
				connectDlg = "loaded";
			} catch (err) {
				console.error("Error loading connect dialog:", err);
				connectDlg = "failed";
			}
		}

		if (!controlsPanel && id("controlPanel")) {
			controlsPanel = "loading";
			try {
				ControlsPanel();
				controlsPanel = "loaded";
			} catch (err) {
				console.error("Error loading controls panel:", err);
				controlsPanel = "failed";
			}
		}

		if (!navbarLoaded && id("navbar")) {
			navbarLoaded = "loading";
			try {
				navbar();
				navbarLoaded = "loaded";
			} catch (err) {
				console.error("Error loading navigation bar:", err);
				navbarLoaded = "failed";
			}
		}

		if (!tabletTab && id("tablettab")) {
			tabletTab = "loading";
			try {
				tabletInit();
				tabletTab = "loaded";
			} catch (err) {
				console.error("Error loading tablet tab:", err);
				tabletTab = "failed";
			}
		}

		if ((connectDlg && controlsPanel && navbarLoaded && tabletTab) || failSafe <= 0) {
			clearInterval(startUpInt);
			startUpInt = null;
		}

		// Ensure that we always break out of this
		failSafe--;
	}, 500);
}
