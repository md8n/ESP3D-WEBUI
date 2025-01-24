var http_communication_locked = false;
var http_cmd_list = [];
var processing_cmd = false;
var xmlhttpupload;

var max_cmd = 100;

/** Clear all current commands, used by socket.js */
const clear_cmd_list = () => {
    http_cmd_list.length = 0;
    processing_cmd = false;
};

/** Do the final steps to 'complete' a command */
const complete_cmd = () => {
    http_cmd_list.shift();
    processing_cmd = false;
    // This should already be false, but we'll make sure
    http_communication_locked = false;
    process_cmd();
}

/** Add a cmd to the http_cmd_list and trigger processing */
const add_cmd = (command) => {
    http_cmd_list.push(command);
    process_cmd();
}

/** A default success function */
const http_resultfn = (response_text) => {
    console.info(`Success: ${response_text}`);
}

const http_handleSuccess = (command, response_text) => {
    command.resultfn(response_text);
    complete_cmd();
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
const http_errorfn = (error_code, response_text) => {
    console.error(`${error_code}:${response_text}`);
}

function http_handleError(command, error_code, response_text) {
    if (authErrorFound(error_code, response_text)) {
        // For now with an auth_error, we continue with regular error handling
    } else {
        command.errorfn(error_code, response_text);
    }

    complete_cmd();
}

/** A default progress event handler function */
const http_progressfn = (oEvent) => {
    let percentComplete = (oEvent.lengthComputable) ? `${((oEvent.loaded / oEvent.total) * 100).toFixed(0)}%` : "";
    console.info(`Upload progress continues ${percentComplete}`);
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
    if (cmdType === "CMD") {
        // Note: NOT an actual http command, just something else to be done
        const fn = command.fn;
        fn();
        complete_cmd();
    } else {
        ProcessHttpCommand(command);
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
    setCmdFn(command, "resultfn", http_resultfn, result_fn);
    setCmdFn(command, "errorfn", http_errorfn, error_fn);
    setCmdFn(command, "progressfn", http_progressfn, progress_fn);

    return command;
}

const checkForMaxListSize = (desc) => {
    if (http_cmd_list.length <= max_cmd) {
        return true;
    }

    http_errorfn(999, translate_text_item("Server not responding"));
    console.error(`${desc} could not be added to the http_cmd_list. Maximum pending commands length has been exceeded.`);

    console.info("Will attempt to continue processing commands");
    process_cmd();

    return false;
}

/** Add some arbitrary command to the http_cmd_list.
 * Note: This is assumed to NOT be an actual HTTP command
 */
const SendCmdCmd = (fn, id) => {
    if (!checkForMaxListSize("An arbitrary function")) {
        return;
    }

    add_cmd(buildCmdCmd(fn, id));
}

function GetIdentificationStatus() {
    const cmd = "/login";
    SendGetHttp(cmd, GetIdentificationStatusSuccess);
}

/** This expects the logindlg to be visible */
function GetIdentificationStatusSuccess(response_text) {
    if (!response_text) {
        // treat as guest
        setHTML("current_ID", translate_text_item("guest"));
        setHTML("current_auth_level", "");
        return;
    }
    const response = JSON.parse(response_text);
    if (typeof response.authentication_lvl !== "undefined") {
        if (response.authentication_lvl === "guest") {
            setHTML("current_ID", translate_text_item("guest"));
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

    add_cmd(buildGetCmd(cmd, cmd_id, result_fn, error_fn));
}

function SendFileHttp(cmd, postdata, result_fn, error_fn, progress_fn) {
    if (!checkForMaxListSize(`The command '${cmd}'`)) {
        return;
    }

    if (http_cmd_list.length) {
        // TODO: figure out what, if anything this did
        // biome-ignore lint/suspicious/noGlobalAssign: <explanation>
        process = false;
    }
    add_cmd(buildPostFileCmd(cmd, postdata, result_fn, error_fn, progress_fn));
}

const ProcessHttpCommand = (command) => {
    const cmdType = command.type;

    if (!["GET", "POST"].includes(cmdType)) {
        // This is a safety check - if we're here then there's been a programmer error
        return;
    }
    
    if (http_communication_locked && cmdType !== "CMD") {
        http_errorfn(503, translate_text_item("Communication locked!"));
        console.warn("locked");
        return;
    }

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        http_communication_locked = false;
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {
            if (xmlhttp.status === 0 || (xmlhttp.status >= 200 && xmlhttp.status < 400)) {
                //console.log("*** " + command.cmd + " done");
                http_handleSuccess(command, xmlhttp.responseText);
            } else {
                if (xmlhttp.status == 401) {
                    GetIdentificationStatus();
                }
                http_handleError(command, xmlhttp.status, xmlhttp.responseText);
            }
        }
    }
    if (cmdType === "POST") {
        xmlhttp.upload.addEventListener("progress", command.progressfn, false);
    }

    http_communication_locked = true;
    //console.log("GET:" + cmd);
    xmlhttp.open(cmdType, command.cmd, true);
    if (cmdType === "GET") {
        xmlhttp.send();
    } else {
        // Note: Only used for uploading files
        xmlhttp.send(command.postdata);
    }
}
