// import conErr, displayBlock, displayInline, displayNone, id, closeModal, setactiveModal, showModal, SendGetHttp, logindlg, EventListenerSetup, startSocket,

/** Connect Dialog */
const connectdlg = (getFw = false) => {
	const modal = setactiveModal("connectdlg.html");
	if (modal == null) {
		return;
	}

	showModal();

	if (getFw) {
		retryconnect();
	}
};

const getFWdata = (response) => {
	const tlist = response.split("#");
	//FW version:0.9.200 # FW target:smoothieware # FW HW:Direct SD # primary sd:/ext/ # secondary sd:/sd/ # authentication: yes
	if (tlist.length < 3) {
		return false;
	}
	//FW version
	let sublist = tlist[0].split(":");
	if (sublist.length !== 2) {
		return false;
	}
	fw_version = sublist[1].toLowerCase().trim();
	//FW target
	sublist = tlist[1].split(":");
	if (sublist.length !== 2) {
		return false;
	}
	target_firmware = sublist[1].toLowerCase().trim();
	//FW HW
	sublist = tlist[2].split(":");
	if (sublist.length !== 2) {
		return false;
	}
	const sddirect = sublist[1].toLowerCase().trim();
	direct_sd = sddirect === "direct sd";
	//primary sd
	sublist = tlist[3].split(":");
	if (sublist.length !== 2) {
		return false;
	}
	primary_sd = sublist[1].toLowerCase().trim();

	//secondary sd
	sublist = tlist[4].split(":");
	if (sublist.length !== 2) {
		return false;
	}
	secondary_sd = sublist[1].toLowerCase().trim();

	//authentication
	sublist = tlist[5].split(":");
	if (sublist.length !== 2) {
		return false;
	}
	ESP3D_authentication = sublist[0].trim() === "authentication" && sublist[1].trim() === "yes";
	//async communications
	if (tlist.length > 6) {
		sublist = tlist[6].split(":");
		if (
			sublist[0].trim() === "webcommunication" &&
			sublist[1].trim() === "Async"
		) {
			async_webcommunication = true;
		} else {
			async_webcommunication = false;
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
		if (sublist[0].trim() === "hostname") esp_hostname = sublist[1].trim();
	}

	if (tlist.length > 8) {
		sublist = tlist[8].split(":");
		if (sublist[0].trim() === "axis") {
			grblaxis = Number.parseInt(sublist[1].trim());
		}
	}

	EventListenerSetup();
	startSocket();

	return true;
};

const connectfailed = (error_code, response) => {
	displayBlock("connectbtn");
	displayBlock("failed_connect_msg");
	displayNone("connecting_msg");

	id("connectbtn").addEventListener("click", retryconnect);

	conErr(error_code, response, "FW identification error");
};

const connectsuccess = (response) => {
	if (getFWdata(response)) {
		console.log(`FW identification:${response}`);
		if (ESP3D_authentication) {
			closeModal("Connection successful");
			displayInline("menu_authentication");
			logindlg(initUI, true);
		} else {
			displayNone("menu_authentication");
			initUI();
		}
	} else {
		console.log(response);
		connectfailed(406, "Wrong data");
	}
};

const retryconnect = () => {
	displayNone("connectbtn");
	displayNone("failed_connect_msg");
	displayBlock("connecting_msg");

	id("connectbtn").removeEventListener("click", retryconnect);

	const cmd = buildHttpPlainCmd("[ESP800]");
	SendGetHttp(cmd, connectsuccess, connectfailed);
};
