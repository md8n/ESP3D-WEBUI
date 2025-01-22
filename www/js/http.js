var http_communication_locked = false;
var http_cmd_list = [];
var processing_cmd = false;
var xmlhttpupload;

var max_cmd = 100;

const clear_cmd_list = () => {
    http_cmd_list = [];
    processing_cmd = false;
};

const cleanFunc = (command, funcName, defFn) => {
    return typeof command !== "undefined" && typeof command[funcName] === "function"
        ? command[funcName]
        : http_cmd_list.length > 0 && typeof http_cmd_list[0][funcName] === "function"
            ? http_cmd_list[0][funcName]
            : defFn;
}

function http_resultfn(response_text) {
    if ((http_cmd_list.length > 0) && (typeof http_cmd_list[0].resultfn !== 'undefined')) {
        var fn = http_cmd_list[0].resultfn;
        fn(response_text);
    } //else console.log ("No resultfn");
    http_cmd_list.shift();
    processing_cmd = false;
    process_cmd();
}

function http_errorfn(error_code, response_text) {
    var fn = http_cmd_list[0].errorfn;
    if ((http_cmd_list.length > 0) && (typeof http_cmd_list[0].errorfn != 'undefined') && http_cmd_list[0].errorfn != null) {
        if (error_code == 401) {
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

    const command = http_cmd_list[0];
    const cmdType = command.type;
    if (!["GET", "POST", "CMD"].includes(cmdType)) {
        console.error(`Unknown command type ${cmdType} for command ${command.cmd}`);
        // This should never be true, but just in case we'll deliberately set it to false
        processing_cmd = false;
        return;
    }
    // console.log("Processing 1/" + http_cmd_list.length);
    // console.log("Processing " + command.cmd);
    processing_cmd = true;
    switch (cmdType) {
        case "GET":
            ProcessGetHttp(command.cmd, http_resultfn, http_errorfn);
            break;
        case "POST":
            // Only used for uploading files
            //console.log("Uploading");
            ProcessFileHttp(command.cmd, command.data, command.progressfn, http_resultfn, http_errorfn);
            break;
        case "CMD":
            // Note: NOT an actual http command, just something else to be done
            const fn = command.fn;
            fn();
            http_cmd_list.shift();
            processing_cmd = false;
            process_cmd();
    }
}

const buildBasicCmd = (cmd, cmd_type, id) => {
	const cmd_id = typeof id !== "undefined" ? id : 0;

	return {
		cmd: cmd,
		url: new URL(`${document.location.origin}${cmd}`),
		type: cmd_type,
		id: cmd_id,
	};
}

const setCmdFn = (command, funcName, defFn, fn) => {
	command[funcName] = (typeof fn === "function") ? fn : defFn;
}

const buildGetCmd = (cmd, id, result_fn, error_fn) => {
	const command = buildBasicCmd(cmd, "GET", id);
	if (cmd.startsWith("/command")) {
		command.url.searchParams.append("PAGEID", pageID());
	}
	command.isupload = false;
	setCmdFn(command, "resultfn", http_resultfn, result_fn);
	setCmdFn(command, "errorfn", http_errorfn, error_fn);

	return command;
}

const buildPostFileCmd = (cmd, postdata, result_fn, error_fn) => {
	const command = buildBasicCmd(cmd, "POST");
	command.isupload = true;
	command.data = postdata;
	setCmdFn(command, "resultfn", http_resultfn, result_fn);
	setCmdFn(command, "errorfn", http_errorfn, error_fn);

	return command;
}

const checkForMaxListSize = (desc) => {
	if (http_cmd_list.length <= max_cmd) {
		return true;
	}

	http_errorfn(999, trans_text_item("Server not responding"));
	console.error(`${desc} could not be added to the http_cmd_list. Maximum pending commands length has been exceeded.`);

	console.info("Will attempt to continue processes commands");
	process_cmd();

	return false;
}

/** NOT an http command, but rather just some other function to be performed.
 * Note: command.cmd and command.url will be meaningless
 */
const buildCmdCmd = (fn, id) => {
	const command = buildBasicCmd("", "CMD", id);
	command.fn = fn;
	return command;
}

/** Add some arbitrary command to the http_cmd_list.
 * Note: This is assumed to NOT be an actual HTTP command
 */
const AddCmd = (fn, id) => {
	if (!checkForMaxListSize("An arbitrary function")) {
		return;
	}

	http_cmd_list.push(buildCmdCmd(fn, id));
	process_cmd();
}

function GetIdentificationStatus() {
	const cmd = "/login";
	SendGetHttp(cmd, GetIdentificationStatusSuccess);
}

/** This expects the logindlg to be visible */
function GetIdentificationStatusSuccess(response_text) {
	if (!response_text) {
		// treat as guest
		setHTML("current_ID", trans_text_item("guest"));
		setHTML("current_auth_level", "");
		return;
	}
	const response = JSON.parse(response_text);
	if (typeof response.authentication_lvl !== "undefined") {
		if (response.authentication_lvl === "guest") {
			setHTML("current_ID", trans_text_item("guest"));
			setHTML("current_auth_level", "");
		}
	}
}

/** Check if HTTP comms are locked */
const CheckForHttpCommLock = () => {
    if (http_communication_locked) {
        alertdlg(translate_text_item("Busy..."), translate_text_item("Communications are currently locked, please wait and retry."));
        console.warn("communication locked");
    }
    return http_communication_locked;
}

function SendGetHttp(cmd, result_fn, error_fn, id, max_id) {
	const cmd_id = (typeof id !== "undefined") ? id : 0;
	if (!checkForMaxListSize(`The command '${cmd}' with id:${cmd_id}`)) {
		return;
	}

	// Some commands have a limit to how many times they are allowed in the queue
	if (typeof id !== "undefined") {
		let cmd_max_id = (typeof max_id !== "undefined") ? max_id : 1;
		for (let p = 0; p < http_cmd_list.length; p++) {
			if (http_cmd_list[p].id === cmd_id) {
				cmd_max_id--;
			}
			if (cmd_max_id <= 0) {
				console.log(`Limit reached for command with id:${id}`);
				processing_cmd = false;
				process_cmd();
				return;
			}
		}
	}

    http_cmd_list.push(buildGetCmd(cmd, cmd_id, result_fn, error_fn));
    process_cmd();
}

function SendFileHttp(cmd, postdata, result_fn, error_fn) {
	if (!checkForMaxListSize(`The command '${cmd}'`)) {
		return;
	}

	if (http_cmd_list.length !== 0) {
		// TODO: figure out what, if anything this did
		// biome-ignore lint/suspicious/noGlobalAssign: <explanation>
		process = false;
	}
	http_cmd_list.push(buildPostFileCmd(cmd, postdata, result_fn, error_fn));
	process_cmd();
}

function ProcessGetHttp(cmd, resultfn, errorfn) {
    if (http_communication_locked) {
        errorfn(503, translate_text_item("Communication locked!"));
        console.warn("GET comms locked");
        return;
    }
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4) {
            if (xmlhttp.status == 200) {
                //console.log("*** " + cmd + " done");
                if (typeof resultfn != 'undefined' && resultfn != null) resultfn(xmlhttp.responseText);
            } else {
                if (xmlhttp.status == 401) GetIdentificationStatus();
                if (typeof errorfn != 'undefined' && errorfn != null) errorfn(xmlhttp.status, xmlhttp.responseText);
            }
        }
    }

    if (cmd.startsWith("/command")) {
        cmd += (url.indexOf("?") == -1) ? "?" : "&";
        cmd += `PAGEID=${pageID()}`;
    }
    //console.log("GET:" + cmd);
    xmlhttp.open("GET", cmd, true);
    xmlhttp.send();
}


function ProcessFileHttp(cmd, postdata, progressfn, resultfn, errorfn) {
    if (http_communication_locked) {
        errorfn(503, translate_text_item("Communication locked!"));
        console.warn("POST file comms locked");
        return;
    }
    http_communication_locked = true;
    xmlhttpupload = new XMLHttpRequest();
    xmlhttpupload.onreadystatechange = function () {
        if (xmlhttpupload.readyState == 4) {
            http_communication_locked = false;
            if (xmlhttpupload.status == 200) {
                if (typeof resultfn != 'undefined' && resultfn != null) resultfn(xmlhttpupload.responseText);
            } else {
                if (xmlhttpupload.status == 401) GetIdentificationStatus();
                if (typeof errorfn != 'undefined' && errorfn != null) errorfn(xmlhttpupload.status, xmlhttpupload.responseText);
            }
        }
    }
    //console.log(cmd);
    xmlhttpupload.open("POST", cmd, true);
    if (typeof progressfn != 'undefined' && progressfn != null) xmlhttpupload.upload.addEventListener("progress", progressfn, false);
    xmlhttpupload.send(postdata);
}
