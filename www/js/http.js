var http_communication_locked = false;
const cmd_list = [];
var processing_cmd = false;
var xmlhttpupload;

var max_cmd = 20;

function clear_cmd_list() {
    // Wipe the command list
    cmd_list.length = 0;
    processing_cmd = false;
}

/** Standard actions to take after completing processing a command's reply */
const postProcessCmd = () => {
    cmd_list.shift();
    processing_cmd = false;
    process_cmd();
}

function http_resultfn(response_text) {
    if ((cmd_list.length > 0) && (typeof cmd_list[0].resultfn != 'undefined')) {
        var fn = cmd_list[0].resultfn;
        fn(response_text);
    } //else console.log ("No resultfn");
    postProcessCmd();
}

function http_errorfn(error_code, response_text) {
    var fn = cmd_list[0].errorfn;
    if ((cmd_list.length > 0) && (typeof cmd_list[0].errorfn != 'undefined') && cmd_list[0].errorfn != null) {
        if (error_code == 401) {
            logindlg();
            console.log("Authentication issue pls log");
        }
        cmd_list[0].errorfn(error_code, response_text);
    } //else console.log ("No errorfn");
    postProcessCmd();
}

function process_cmd() {
    if (!cmd_list.length) {
        // No commands to process
        return;
    }

    if (processing_cmd) {
        // if (processing_cmd) { 
        //     console.log("Currently processing a command");
        // }
        return;
    }

    const command = cmd_list[0];
    const cmdType = command.type;
    if (!["GET", "POST", "CMD"].includes(cmdType)) {
        // This should never be true, but just in case we will handle it
        console.error(`Unknown command type ${cmdType} for command ${command.cmd}`);
        postProcessCmd();
        return;
    }
    // console.log("Processing 1/" + cmd_list.length);
    // console.log("Processing " + command.cmd);
    processing_cmd = true;
    if (cmdType === "CMD") {
        // Note: NOT an actual http command, just something else to be done
        const fn = command.cmd;
        fn();
        postProcessCmd();
        return;
    }

    switch (cmdType) {
        case "GET":
            ProcessGetHttp(command.cmd, http_resultfn, http_errorfn);
            break;
        case "POST":
            // POST is only ever used for file uploading
            //console.log("Uploading");
            ProcessFileHttp(command.cmd, command.data, command.progressfn, http_resultfn, http_errorfn);
            break;
    }

}

/** Add some arbitrary command to the cmd_list.
 * Note: This is assumed to NOT be an actual HTTP command
 */
function AddCmd(cmd_fn, id) {
    if (cmd_list.length > max_cmd) {
        http_errorfn(999, translate_text_item("Server not responding"));
        return;
    }
    const cmd_id = (typeof id !== 'undefined') ? id : 0;
    //console.log("adding command");
    var cmd = {
        cmd: cmd_fn,
        type: "CMD",
        id: cmd_id
    };
    cmd_list.push(cmd);
    //console.log("Now " + cmd_list.length);
    process_cmd();
}

function SendGetHttp(url, result_fn, error_fn, id, max_id) {
    if ((cmd_list.length > max_cmd) && (max_cmd != -1)) {
        error_fn(999, translate_text_item("Server not responding"));
        return;
    }
    var cmd_id = 0;
    var cmd_max_id = 1;
    //console.log("ID = " + id);
    //console.log("Max ID = " + max_id);
    //console.log("+++ " + url);
    if (typeof id != 'undefined') {
        cmd_id = id;
        if (typeof max_id != 'undefined') cmd_max_id = max_id;
        //else console.log("No Max ID defined");
        for (p = 0; p < cmd_list.length; p++) {
            //console.log("compare " + (max_id - cmd_max_id));
            if (cmd_list[p].id == cmd_id) {
                cmd_max_id--;
                //console.log("found " + cmd_list[p].id + " and " + cmd_id);
            }
            if (cmd_max_id <= 0) {
                console.log("Limit reached for " + id);
                return;
            }
        }
    } //else console.log("No ID defined");
    //console.log("adding " + url);
    var cmd = {
        cmd: url,
        type: "GET",
        isupload: false,
        resultfn: result_fn,
        errorfn: error_fn,
        id: cmd_id
    };
    cmd_list.push(cmd);
    //console.log("Now " + cmd_list.length);
    process_cmd();
}

function ProcessGetHttp(cmd, resultfn, errorfn) {
    if (http_communication_locked) {
        errorfn(503, translate_text_item("Communication locked!"));
        console.log("locked");
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

    //console.log("GET:" + cmd);
    xmlhttp.open("GET", cmd, true);
    xmlhttp.send();
}

function ProcessPostHttp(cmd, postdata, resultfn, errorfn) {
    if (http_communication_locked) {
        errorfn(503, translate_text_item("Communication locked!"));
        return;
    }
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4) {
            if (xmlhttp.status == 200) {
                if (typeof resultfn != 'undefined' && resultfn != null) resultfn(xmlhttp.responseText);
            } else {
                if (xmlhttp.status == 401) GetIdentificationStatus();
                if (typeof errorfn != 'undefined' && errorfn != null) errorfn(xmlhttp.status, xmlhttp.responseText);
            }
        }
    }
    //console.log(cmd);
    xmlhttp.open("POST", cmd, true);
    xmlhttp.send(postdata);
}

/** POST the file FormData */
function SendFileHttp(url, postdata, progress_fn, result_fn, error_fn) {
    if ((cmd_list.length > max_cmd) && (max_cmd != -1)) {
        error_fn(999, translate_text_item("Server not responding"));
        return;
    }
    if (cmd_list.length != 0) process = false;
    var cmd = {
        cmd: url,
        type: "POST",
        isupload: true,
        data: postdata,
        progressfn: progress_fn,
        resultfn: result_fn,
        errorfn: error_fn,
        id: 0
    };
    cmd_list.push(cmd);
    process_cmd();
}

function ProcessFileHttp(url, postdata, progressfn, resultfn, errorfn) {
    if (http_communication_locked) {
        errorfn(503, translate_text_item("Communication locked!"));
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
    //console.log(url);
    xmlhttpupload.open("POST", url, true);
    if (typeof progressfn != 'undefined' && progressfn != null) xmlhttpupload.upload.addEventListener("progress", progressfn, false);
    xmlhttpupload.send(postdata);
}
