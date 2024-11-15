import { Monitor_output_Update } from "./commands";
import { SendGetHttp } from "./http";
import { decode_entitie, translate_text_item } from "./translate";
import { conErr } from "./util";

var grbl_processfn = null;
var grbl_errorfn = null;

function noop() {}
export const SendPrinterCommand = (cmd, echo_on, processfn, errorfn, id, max_id, extra_arg) => {
    if (cmd.length == 0) {
        return;
    }
    const url = "/command?commandText=";
    let push_cmd = (typeof echo_on !== 'undefined') ? echo_on : true;
    if (push_cmd) {
        Monitor_output_Update(`[#]${cmd}\n`);
    }
    //removeIf(production)
    console.log(cmd);
    if (processfn instanceof Function) {
        processfn("Test response");
    } else {
        SendPrinterCommandSuccess("Test response");
    }
    return;
    //endRemoveIf(production)
    if (!(processfn instanceof Function)) processfn = SendPrinterCommandSuccess;
    if (!(errorfn instanceof Function)) errorfn = SendPrinterCommandFailed;
    if (!cmd.startsWith("[ESP")) {
        grbl_processfn = processfn;
        grbl_errorfn = errorfn;
        processfn = noop;
        errorfn = noop;
    }
    cmd = encodeURI(cmd);
    cmd = cmd.replace("#", "%23");
    if (extra_arg) {
        cmd += "&" + extra_arg;
    }
    SendGetHttp(url + cmd, processfn, errorfn, id, max_id);
    //console.log(cmd);
}

function SendPrinterSilentCommand(cmd, processfn, errorfn, id, max_id) {
    var url = "/command_silent?commandText=";
    if (cmd.length == 0) {
        return;
    }
    //removeIf(production)
    console.log(cmd);
    if (processfn instanceof Function) processfn("Test response");
    else SendPrinterCommandSuccess("Test response");
    return;
    //endRemoveIf(production)
    if (!(processfn instanceof Function)) processfn = SendPrinterSilentCommandSuccess;
    if (!(errorfn instanceof Function)) errorfn = SendPrinterCommandFailed;
    cmd = encodeURI(cmd);
    cmd = cmd.replace("#", "%23");
    SendGetHttp(url + cmd, processfn, errorfn, id, max_id);
    //console.log(cmd);
}

function SendPrinterSilentCommandSuccess(response) {
    //console.log(response);
}

function SendPrinterCommandSuccess(response) {
}

function SendPrinterCommandFailed(error_code, response) {
    let errMsg = (error_code == 0)
        ? translate_text_item("Connection error")
        : stdErrMsg(error_code, decode_entitie(response), translate_text_item("Error"));
    Monitor_output_Update(errMsg + "\n");

    conErr(error_code, decode_entitie(response), "printer cmd Error");
}
