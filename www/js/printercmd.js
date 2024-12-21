function noop() {}
function SendPrinterCommand(cmd, echo_on, processfn, errorfn, id, max_id, extra_arg) {
    if (cmd.length === 0) {
        return;
    }

    const url = "/command?commandText=";
    const push_cmd = (typeof echo_on !== 'undefined') ? echo_on : true;
    if (push_cmd) {
        Monitor_output_Update(`[#]${cmd}\n`);
    }

    let procFn = (typeof processfn === 'undefined' || processfn == null) ? SendPrinterCommandSuccess : processfn;
    let errFn = (typeof errorfn === 'undefined' || errorfn == null) ? SendPrinterCommandFailed : errorfn;

    //removeIf(production)
    console.log(cmd);
    procFn("Test response");
    return;
    //endRemoveIf(production)

    // biome-ignore lint/correctness/noUnreachable: <explanation>
    const common = new Common();
    if (!cmd.startsWith("[ESP")) {
        common.grbl_processfn = procFn;
        common.grbl_errorfn = errFn;
        procFn = noop;
        errFn = noop;
    }
    let encCmd = encodeURI(cmd).replace("#", "%23");
    if (extra_arg) {
        encCmd += `&${extra_arg}`;
    }
    SendGetHttp(url + encCmd, procFn, errFn, id, max_id);
    //console.log(cmd);
}

function SendPrinterSilentCommand(cmd, processfn, errorfn, id, max_id) {
    if (cmd.length === 0) {
        return;
    }
    const url = "/command_silent?commandText=";

    const procFn = (typeof processfn === 'undefined' || processfn == null) ? SendPrinterSilentCommandSuccess : processfn;
    const errFn = (typeof errorfn === 'undefined' || errorfn == null) ? SendPrinterCommandFailed : errorfn;

    //removeIf(production)
    console.log(cmd);
    // This might not show up
    procFn("Test response");
    return;
    //endRemoveIf(production)

    // biome-ignore lint/correctness/noUnreachable: <explanation>
    const encCmd = encodeURI(cmd).replace("#", "%23");
    SendGetHttp(url + encCmd, procFn, errFn, id, max_id);
    //console.log(cmd);
}

function SendPrinterSilentCommandSuccess(response) {
    //console.log(response);
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
