import { Common, setHTML, translate_text_item, logindlg, pageID } from "./common.js";

let http_cmd_list = [];
let processing_cmd = false;
let xmlhttpupload;

const max_cmd = 20;

const clear_cmd_list = () => {
	http_cmd_list = [];
	processing_cmd = false;
};

function http_resultfn(response_text) {
	if (
		http_cmd_list.length > 0 &&
		typeof http_cmd_list[0].resultfn !== "undefined"
	) {
		const fn = http_cmd_list[0].resultfn;
		fn(response_text);
	} //else console.log ("No resultfn");
	http_cmd_list.shift();
	processing_cmd = false;
	process_cmd();
}

function http_errorfn(error_code, response_text) {
	const fn = http_cmd_list[0].errorfn;
	if (
		http_cmd_list.length > 0 &&
		typeof http_cmd_list[0].errorfn !== "undefined" &&
		http_cmd_list[0].errorfn != null
	) {
		if (error_code === 401) {
			logindlg();
			console.log("Authentication issue pls log");
		}
		http_cmd_list[0].errorfn(error_code, response_text);
	} //else console.log ("No errorfn");
	http_cmd_list.shift();
	processing_cmd = false;
	process_cmd();
}

function process_cmd() {
	if (!http_cmd_list.length || processing_cmd) {
		// if (processing_cmd) { 
		//     console.log("Currently processing a command");
		// }
		return;
	}

	const cmdType = http_cmd_list[0].type;
	if (!["GET", "POST", "CMD"].includes(cmdType)) {
		console.error(`Unknown command type ${cmdType} for command ${http_cmd_list[0].cmd}`);
		// This should never be true, but just in case we'll deliberately set it to false
		processing_cmd = false;
		return;
	}
	// console.log("Processing 1/" + http_cmd_list.length);
	// console.log("Processing " + http_cmd_list[0].cmd);
	processing_cmd = true;
	switch (cmdType) {
		case "GET":
			ProcessGetHttp(http_cmd_list[0].cmd, http_resultfn, http_errorfn);
			break;
		case "POST":
			if (!(http_cmd_list[0].isupload)) {
				ProcessPostHttp(http_cmd_list[0].cmd, http_cmd_list[0].data, http_resultfn, http_errorfn);
			} else {
				//console.log("Uploading");
				ProcessFileHttp(http_cmd_list[0].cmd, http_cmd_list[0].data, http_cmd_list[0].progressfn, http_resultfn, http_errorfn);
			}
			break;
		case "CMD": {
			const fn = http_cmd_list[0].cmd;
			fn();
			http_cmd_list.shift();
			processing_cmd = false;
			process_cmd();
			break;
		}
	}
}

function AddCmd(cmd_fn, id) {
	if (http_cmd_list.length > max_cmd) {
		http_errorfn(999, translate_text_item("Server not responding"));
		return;
	}
	let cmd_id = 0;
	if (typeof id !== "undefined") cmd_id = id;
	//console.log("adding command");
	const cmd = {
		cmd: cmd_fn,
		type: "CMD",
		id: cmd_id,
	};
	http_cmd_list.push(cmd);
	//console.log("Now " + http_cmd_list.length);
	process_cmd();
}

function GetIdentificationStatus() {
	const url = "/login";
	SendGetHttp(url, GetIdentificationStatusSuccess);
}

/** This expects the logindlg to be visible */
function GetIdentificationStatusSuccess(response_text) {
	const response = JSON.parse(response_text);
	if (typeof response.authentication_lvl !== "undefined") {
		if (response.authentication_lvl === "guest") {
			setHTML("current_ID", translate_text_item("guest"));
			setHTML("current_auth_level", "");
		}
	}
}

const SendGetHttp = (url, result_fn, error_fn, id, max_id) => {
	if (http_cmd_list.length > max_cmd && max_cmd !== -1) {
		error_fn(999, translate_text_item("Server not responding"));
		return;
	}
	let cmd_id = 0;
	let cmd_max_id = 1;
	//console.log("ID = " + id);
	//console.log("Max ID = " + max_id);
	//console.log("+++ " + url);
	if (typeof id !== "undefined") {
		cmd_id = id;
		if (typeof max_id !== "undefined") cmd_max_id = max_id;
		//else console.log("No Max ID defined");
		for (let p = 0; p < http_cmd_list.length; p++) {
			//console.log("compare " + (max_id - cmd_max_id));
			if (http_cmd_list[p].id === cmd_id) {
				cmd_max_id--;
				//console.log("found " + http_cmd_list[p].id + " and " + cmd_id);
			}
			if (cmd_max_id <= 0) {
				console.log(`Limit reached for ${id}`);
				return;
			}
		}
	} //else console.log("No ID defined");
	//console.log("adding " + url);
	const cmd = {
		cmd: url,
		type: "GET",
		isupload: false,
		resultfn: result_fn,
		errorfn: error_fn,
		id: cmd_id,
	};
	http_cmd_list.push(cmd);
	//console.log("Now " + http_cmd_list.length);
	process_cmd();
};

function ProcessGetHttp(url, resultfn, errorfn) {
	const common = new Common();
	if (common.http_communication_locked) {
		errorfn(503, translate_text_item("Communication locked!"));
		console.log("locked");
		return;
	}
	const xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = () => {
		if (xmlhttp.readyState === 4) {
			if (xmlhttp.status === 200) {
				//console.log("*** " + url + " done");
				if (typeof resultfn !== "undefined" && resultfn != null)
					resultfn(xmlhttp.responseText);
			} else {
				if (xmlhttp.status === 401) GetIdentificationStatus();
				if (typeof errorfn !== "undefined" && errorfn != null)
					errorfn(xmlhttp.status, xmlhttp.responseText);
			}
		}
	};

	let gUrl = url;
	if (gUrl.startsWith("/command")) {
		gUrl += gUrl.indexOf("?") === -1 ? "?" : "&";
		gUrl += `PAGEID=${pageID()}`;
	}
	//console.log("GET:" + url);
	xmlhttp.open("GET", gUrl, true);
	xmlhttp.send();
}

// function SendPostHttp(url, postdata, result_fn, error_fn, id, max_id) {
// 	if (http_cmd_list.length > max_cmd && max_cmd !== -1) {
// 		error_fn(999, translate_text_item("Server not responding"));
// 		return;
// 	}
// 	let cmd_id = 0;
// 	let cmd_max_id = 1;
// 	if (typeof id !== "undefined") {
// 		cmd_id = id;
// 		if (typeof max_id !== "undefined") cmd_max_id = max_id;
// 		for (p = 0; p < http_cmd_list.length; p++) {
// 			if (http_cmd_list[p].id === cmd_id) cmd_max_id--;
// 			if (cmd_max_id <= 0) return;
// 		}
// 	}

// 	//console.log("adding " + url);
// 	const cmd = {
// 		cmd: url,
// 		type: "POST",
// 		isupload: false,
// 		data: postdata,
// 		resultfn: result_fn,
// 		errorfn: error_fn,
// 		initfn: init_fn,
// 		id: cmd_id,
// 	};
// 	http_cmd_list.push(cmd);
// 	process_cmd();
// }

function ProcessPostHttp(url, postdata, resultfn, errorfn) {
	const common = new Common();
	if (common.http_communication_locked()) {
		errorfn(503, translate_text_item("Communication locked!"));
		return;
	}
	const xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = () => {
		if (xmlhttp.readyState === 4) {
			if (xmlhttp.status === 200) {
				if (typeof resultfn !== "undefined" && resultfn != null)
					resultfn(xmlhttp.responseText);
			} else {
				if (xmlhttp.status === 401) GetIdentificationStatus();
				if (typeof errorfn !== "undefined" && errorfn != null)
					errorfn(xmlhttp.status, xmlhttp.responseText);
			}
		}
	};
	let pUrl = url;
	pUrl += pUrl.indexOf("?") === -1 ? "?" : "&";
	pUrl += `PAGEID=${pageID()}`;
	//console.log(pUrl);
	xmlhttp.open("POST", pUrl, true);
	xmlhttp.send(postdata);
}

function SendFileHttp(url, postdata, progress_fn, result_fn, error_fn) {
	if (http_cmd_list.length > max_cmd && max_cmd !== -1) {
		error_fn(999, translate_text_item("Server not responding"));
		return;
	}
	if (http_cmd_list.length !== 0) {
		// TODO: figure out what, if anything this did
		// biome-ignore lint/suspicious/noGlobalAssign: <explanation>
		process = false;
	}
	const cmd = {
		cmd: url,
		type: "POST",
		isupload: true,
		data: postdata,
		progressfn: progress_fn,
		resultfn: result_fn,
		errorfn: error_fn,
		id: 0,
	};
	http_cmd_list.push(cmd);
	process_cmd();
}

function ProcessFileHttp(url, postdata, progressfn, resultfn, errorfn) {
	const common = new Common();
	if (common.http_communication_locked) {
		errorfn(503, translate_text_item("Communication locked!"));
		return;
	}
	common.http_communication_locked = true;
	xmlhttpupload = new XMLHttpRequest();
	xmlhttpupload.onreadystatechange = () => {
		if (xmlhttpupload.readyState === 4) {
			common.http_communication_locked = false;
			if (xmlhttpupload.status === 200) {
				if (typeof resultfn !== "undefined" && resultfn != null)
					resultfn(xmlhttpupload.responseText);
			} else {
				if (xmlhttpupload.status === 401) GetIdentificationStatus();
				if (typeof errorfn !== "undefined" && errorfn != null)
					errorfn(xmlhttpupload.status, xmlhttpupload.responseText);
			}
		}
	};
	//console.log(url);
	xmlhttpupload.open("POST", url, true);
	if (typeof progressfn !== "undefined" && progressfn != null)
		xmlhttpupload.upload.addEventListener("progress", progressfn, false);
	xmlhttpupload.send(postdata);
}

export { clear_cmd_list, SendFileHttp, SendGetHttp };
