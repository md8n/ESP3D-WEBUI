import { Common, setHTML, translate_text_item, logindlg, pageID } from "./common.js";

let http_cmd_list = [];
let processing_cmd = false;

const max_cmd = 100;

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
	console.info(`Success: ${response_text}`);;
}

function http_handleSuccess(command, response_text) {
	const resultfn = cleanFunc(command, "resultfn", http_resultfn);

	resultfn(response_text);

	http_cmd_list.shift();
	processing_cmd = false;
	process_cmd();
}

const authErrorFound = (error_code, response_text) => {
	if (error_code === 401) {
		logindlg();
		console.warn(`Authentication issue, please login. ${response_text}`);
		return true;
	}
	return false;
}

/** A default error function */
function http_errorfn(error_code, response_text) {
	console.error(`${error_code}:${response_text}`);
}

function http_handleError(command, error_code, response_text) {
	if (authErrorFound(error_code, response_text)) {
		// For now with an auth_error, we continue with regular error handling
	} else {
		const errorfn = cleanFunc(command, "errorfn", http_errorfn);
		errorfn(error_code, response_text);
	}

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

	processing_cmd = true;

	switch (cmdType) {
		case "GET":
			ProcessGetHttp(command);
			break;
		case "POST":
			// Note: Only used for uploading files
			ProcessFileHttp(command);
			break;
		case "CMD": {
			// Note: NOT an actual http command, just something else to be done
			const fn = command.fn;
			fn();
			http_cmd_list.shift();
			processing_cmd = false;
			process_cmd();
			break;
		}
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

/** NOT an http command, but rather just some other function to be performed.
 * Note: command.cmd and command.url will be meaningless
 */
const buildCmdCmd = (fn, id) => {
	const command = buildBasicCmd("", "CMD", id);
	command.fn = fn;
	return command;
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

const buildPostFileCmd = (cmd, postdata, result_fn, error_fn, progress_fn) => {
	const command = buildBasicCmd(cmd, "POST");
	command.isupload = true;
	command.data = postdata;
	command.progressfn = progress_fn;
	setCmdFn(command, "resultfn", http_resultfn, result_fn);
	setCmdFn(command, "errorfn", http_errorfn, error_fn);

	return command;
}

const checkForMaxListSize = (desc) => {
	if (http_cmd_list.length <= max_cmd) {
		return true;
	}

	http_errorfn(999, translate_text_item("Server not responding"));
	console.error(`${desc} could not be added to the http_cmd_list. Maximum pending commands length has been exceeded.`);

	console.info("Will attempt to continue processes commands");
	process_cmd();

	return false;
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
	const response = JSON.parse(response_text);
	if (typeof response.authentication_lvl !== "undefined") {
		if (response.authentication_lvl === "guest") {
			setHTML("current_ID", translate_text_item("guest"));
			setHTML("current_auth_level", "");
		}
	}
}

const CheckForHttpCommLock = () => {
	const common = new Common();
	if (common.http_communication_locked) {
		alertdlg(translate_text_item("Busy..."), translate_text_item("Communications are currently locked, please wait and retry."));
		console.warn("communication locked");
	}
	return common.http_communication_locked;
}

const SendGetHttp = (cmd, result_fn, error_fn, id, max_id) => {
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
};

function ProcessGetHttp(command) {
	const common = new Common();
	if (common.http_communication_locked) {
		http_errorfn(503, translate_text_item("Communication locked!"));
		console.warn("locked");
		return;
	}

	fetch(command.url, { method: 'GET' })
		.then(response => {
			if (response.status === 200) {
				return response.text();
			}

			if (response.status === 401) {
				GetIdentificationStatus();
			}
			throw new Error(response.status);
		})
		.then(responseText => http_handleSuccess(command, responseText))
		.catch(error => http_handleError(command, error.message, error.responseText));
}

function SendFileHttp(cmd, postdata, progress_fn, result_fn, error_fn) {
	if (!checkForMaxListSize(`The command '${cmd}'`)) {
		return;
	}

	if (http_cmd_list.length !== 0) {
		// TODO: figure out what, if anything this did
		// biome-ignore lint/suspicious/noGlobalAssign: <explanation>
		process = false;
	}
	http_cmd_list.push(buildPostFileCmd(cmd, postdata, progress_fn, result_fn, error_fn));
	process_cmd();
}

function ProcessFileHttp(command) {
	const common = new Common();
	if (common.http_communication_locked) {
		http_errorfn(503, translate_text_item("Communication locked!"));
		console.warn("locked");
		return;
	}

	common.http_communication_locked = true;
	fetch(command.url, { method: 'POST', body: command.postdata })
		.then(response => {
			common.http_communication_locked = false;
			if (response.status === 200) {
				return response.text();
			}

			if (response.status === 401) {
				GetIdentificationStatus();
			}
			throw new Error(response.status);
		})
		.then(responseText => http_handleSuccess(command, responseText))
		.catch(error => http_handleError(command, error.message, error.responseText));
}

export { AddCmd, clear_cmd_list, SendFileHttp, SendGetHttp, CheckForHttpCommLock };
