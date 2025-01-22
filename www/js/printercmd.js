var grbl_processfn = null;
var grbl_errorfn = null;

function noop() {}
function SendPrinterCommand(cmd, echo_on, processfn, errorfn, id, max_id, extra_arg) {
    var cmdTxt = "/command?commandText=";
    var push_cmd = true;
    if (typeof echo_on !== 'undefined') {
        push_cmd = echo_on;
    }
    if (cmd.length == 0) return;
    if (push_cmd) {
        Monitor_output_Update("[#]" + cmd + "\n");
    }
    //removeIf(production)
    console.log(cmd);
    if (typeof processfn !== 'undefined') processfn("Test response");
    else SendPrinterCommandSuccess("Test response");
    return;
    //endRemoveIf(production)
    if (typeof processfn === 'undefined' || processfn == null) processfn = SendPrinterCommandSuccess;
    if (typeof errorfn === 'undefined' || errorfn == null) errorfn = SendPrinterCommandFailed;
    if (!cmd.startsWith("[ESP")) {
        grbl_processfn = processfn;
        grbl_errorfn = errorfn;
        processfn = noop;
        errorfn = noop;
    }
    cmd = encodeURI(cmd).replace("#", "%23");
    if (extra_arg) {
        cmd += "&" + extra_arg;
    }
    SendGetHttp(cmdTxt + cmd, processfn, errorfn, id, max_id);
    //console.log(cmd);
}

function SendPrinterSilentCommand(cmd, processfn, errorfn, id, max_id) {
    if (!cmd) {
        return;
    }
    //removeIf(production)
    console.info(cmd);
    if (typeof processfn !== 'undefined') processfn("Test response");
    else SendPrinterCommandSuccess("Test response");
    return;
    //endRemoveIf(production)
    if (typeof processfn === 'undefined' || processfn == null) processfn = SendPrinterSilentCommandSuccess;
    if (typeof errorfn === 'undefined' || errorfn == null) errorfn = SendPrinterCommandFailed;
    cmd = encodeURI(cmd);
    cmd = cmd.replace("#", "%23");
    var cmdTxt = `/command_silent?commandText=${cmd}`;
    SendGetHttp(cmdTxt, processfn, errorfn, id, max_id);
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
