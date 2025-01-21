import {
	conErr,
	HTMLDecode,
	stdErrMsg,
	Monitor_output_Update,
	SendGetHttp,
	trans_text_item,
	Common,
} from "./common.js";

function noop() { }

const cleanFunc = (fn, cleanFn) => fn instanceof Function ? fn : cleanFn;

const SendPrinterCommand = (cmd, echo_on, processfn, errorfn, id, max_id, extra_arg) => {
	if (!cmd) {
		return;
	}
	const push_cmd = typeof echo_on !== "undefined" ? echo_on : true;
	if (push_cmd) {
		Monitor_output_Update(`[#]${cmd}\n`);
	}

	let procFn = cleanFunc(processfn, SendPrinterCommandSuccess);
	let errFn = cleanFunc(errorfn, SendPrinterCommandFailed);

	if (!cmd.startsWith("[ESP")) {
        const common = new Common();
		common.grbl_processfn = procFn;
		common.grbl_errorfn = errFn;
		procFn = noop;
		errFn = noop;
	}
	let encCmd = encodeURI(cmd).replace("#", "%23");
	if (extra_arg) {
		encCmd += `&${extra_arg}`;
	}
	const fullcmd = `/command?commandText=${encCmd}`;
	SendGetHttp(fullcmd, procFn, errFn, id, max_id);
	//console.log(fullcmd);
};

function SendPrinterCommandSuccess(response) { }

function SendPrinterCommandFailed(error_code, response) {
	const errMsg = (error_code === 0)
		? trans_text_item("Connection error")
		: stdErrMsg(error_code, HTMLDecode(response), trans_text_item("Error"));
	Monitor_output_Update(`${errMsg}\n`);

	conErr(error_code, HTMLDecode(response), "SendPrinterCommand error");
}

export { SendPrinterCommand };
