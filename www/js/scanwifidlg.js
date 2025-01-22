// import get_icon_svg, conErr, stdErrMsg, displayBlock, displayNone, id, getValue, setValue, setHTML, closeModal, setactiveModal, showModal, SendGetHttp, translate_text_item

let ssid_item_scanwifi = -1;
let ssid_subitem_scanwifi = -1;

/** scanwifi dialog */
const scanwifidlg = (item, subitem) => {
	const modal = setactiveModal("scanwifidlg.html", scanwifidlg_close);
	if (modal == null) {
		return;
	}

	id("scanWiFiDlgCancel").addEventListener("click", (event) => closeModal("cancel"));
	id("scanWiFiDlgClose").addEventListener("click", (event) => closeModal("cancel"));
	id("refresh_scanwifi_btn").addEventListener("click", (event) => refresh_scanwifi());

	ssid_item_scanwifi = item;
	ssid_subitem_scanwifi = subitem;
	showModal();
	refresh_scanwifi();
};

function refresh_scanwifi() {
	displayBlock("AP_scan_loader");
	displayNone("AP_scan_list");
	displayBlock("AP_scan_status");
	setHTML("AP_scan_status", translate_text_item("Scanning"));
	displayNone("refresh_scanwifi_btn");
	//removeIf(production)
	const testResponse = [
		'{"AP_LIST":[',
		'{"SSID":"HP-Setup>71-M277LaserJet","SIGNAL":"90","IS_PROTECTED":"0"},',
		'{"SSID":"NETGEAR_2GEXT_OFFICE2","SIGNAL":"58","IS_PROTECTED":"1"},',
		'{"SSID":"NETGEAR_2GEXT_OFFICE","SIGNAL":"34","IS_PROTECTED":"1"},',
		'{"SSID":"NETGEAR_2GEXT_COULOIR","SIGNAL":"18","IS_PROTECTED":"1"},',
		'{"SSID":"HP-Print-D3-ColorLaserJetPro","SIGNAL":"14","IS_PROTECTED":"0"},',
		'{"SSID":"external-wifi","SIGNAL":"20","IS_PROTECTED":"1"},',
		'{"SSID":"Livebox-4D0F","SIGNAL":"24","IS_PROTECTED":"1"},',
		'{"SSID":"SFR_2000","SIGNAL":"20","IS_PROTECTED":"1"}',
		'{"SSID":"SFR_0D90","SIGNAL":"26","IS_PROTECTED":"1"},',
		'{"SSID":"SFRWiFiFON","SIGNAL":"18","IS_PROTECTED":"0"},',
		'{"SSID":"SFRWiFiMobile","SIGNAL":"18","IS_PROTECTED":"1"},',
		'{"SSID":"FreeWifi","SIGNAL":"16","IS_PROTECTED":"0"}',
		']}'
	];
	getscanWifiSuccess(testResponse.join(""));
	return;
	//endRemoveIf(production)
	const cmd = `/command?plain=${encodeURIComponent("[ESP410]")}`;
	SendGetHttp(cmd, getscanWifiSuccess, getscanWififailed);
}

function process_scanWifi_answer(response_text) {
	let result = true;
	let content = "";
	const actions = [];
	try {
		const response = JSON.parse(response_text);
		if (typeof response.AP_LIST === "undefined") {
			result = false;
		} else {
			const aplist = response.AP_LIST;
			//console.log("found " + aplist.length + " AP");
			aplist.sort((a, b) => Number.parseInt(a.SIGNAL) < Number.parseInt(b.SIGNAL)
					? -1
					: Number.parseInt(a.SIGNAL) > Number.parseInt(b.SIGNAL) ? 1 : 0);
			for (let i = aplist.length - 1; i >= 0; i--) {
				const protIcon = aplist[i].IS_PROTECTED === "1" ? get_icon_svg("lock") : "";
				const escapedSSID = aplist[i].SSID.replace("'", "\\'").replace('"', '\\"',);
				const btnId = `scanWiFiDlg_btn_select_${i}`;
				content += "<tr>";
				content += `<td style='vertical-align:middle'>${aplist[i].SSID}</td>`;
				content += `<td style='text-align:center;vertical-align:middle;'>${aplist[i].SIGNAL}%</td>`;
				content += `<td style='text-align:center;vertical-align:middle'>${protIcon}</td>`;
				content += `<td><button id="${btnId}" class='btn btn-primary'>${get_icon_svg("ok")}</button></td>`;
				content += "</tr>";
				actions.push({ id: btnId, type: "click", method:select_ap_ssid, index:escapedSSID });
			}
		}
	} catch (e) {
		console.error("Parsing error:", e);
		result = false;
	}
	setHTML("AP_scan_data", content);

	actions.forEach((action) => {
		id(action.id).addEventListener("click", (event) => action.method(action.index));
	});

	return result;
}

function select_ap_ssid(ssid_name) {
	const settingName = `setting_${ssid_item_scanwifi}_${ssid_subitem_scanwifi}`;
	const val = getValue(settingName);
	setValue(settingName, ssid_name);
	id(settingName).focus();
	if (val !== ssid_name) {
		setsettingchanged(ssid_item_scanwifi, ssid_subitem_scanwifi);
	}
	closeModal("Ok");
}

function getscanWifiSuccess(response) {
	if (!process_scanWifi_answer(response)) {
		getscanWififailed(406, translate_text_item("Wrong data"));
		return;
	}
	displayNone("AP_scan_loader");
	displayBlock("AP_scan_list");
	displayNone("AP_scan_status");
	displayBlock("refresh_scanwifi_btn");
}

function getscanWififailed(error_code, response) {
	conErr(error_code, response);
	displayNone("AP_scan_loader");
	displayBlock("AP_scan_status");
	setHTML(
		"AP_scan_status",
		stdErrMsg(error_code, response, translate_text_item("Failed")),
	);
	displayBlock("refresh_scanwifi_btn");
}

function scanwifidlg_close(response) {
	//console.log(response);
}
