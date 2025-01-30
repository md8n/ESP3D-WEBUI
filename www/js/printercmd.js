var grbl_processfn = null;
var grbl_errorfn = null;

function noop() {}
function SendPrinterCommand(prnCmd, echo_on, processfn, errorfn, id, max_id, extra_arg) {
    if (prnCmd.trim().length === 0) {
        return;
    }

    var push_cmd = typeof echo_on !== 'undefined' ? echo_on : true;
    if (push_cmd) {
        Monitor_output_Update(`[#]${prnCmd.trim()}\n`);
    }

    //removeIf(production)
    console.log(prnCmd);
    if (typeof processfn !== 'undefined') {
        processfn("Test response");
    } else {
        SendPrinterCommandSuccess("Test response");
    }
    return;
    //endRemoveIf(production)

    // Ensure that we have valid functions defined for process and error returns
    let procFn = typeof processfn === "function" ? processfn : SendPrinterCommandSuccess;
    let errFn = typeof errorfn === "function" ? errorfn : SendPrinterCommandFailed;
    if (!prnCmd.startsWith("[ESP")) {
        grbl_processfn = procFn;
        grbl_errorfn = errFn;
        procFn = noop;
        errFn = noop;
    }

	let cmd = buildHttpCommandCmd(httpCmdType.commandText, prnCmd);
    if (extra_arg) {
        cmd += `&${extra_arg}`;
    }

    SendGetHttp(cmd, procFn, errFn, id, max_id);
    //console.log(cmd);
}

function SendPrinterCommandSuccess(response) {
}

function SendPrinterCommandFailed(error_code, response) {
    const errMsg = (error_code === 0)
        ? translate_text_item("Connection error")
        : stdErrMsg(error_code, HTMLDecode(response), translate_text_item("Error"));

    Monitor_output_Update(`${errMsg}\n`);

    conErr(error_code, HTMLDecode(response), "printer cmd Error");
}
