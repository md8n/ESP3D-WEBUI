var http_communication_locked = false;
var http_cmd_list = [];
var processing_cmd = false;
var xmlhttpupload;
var page_id = ""

var max_cmd = 20;

/** 'Commands' to be sent as the first part of the URL after the host name */
const httpCmd = {
    "command": "/command",
    "fileGet": "/",
    /** Perform a GET file action. Mostly used by files.js (i.e. not SPIFFs) */
    "fileUpload": "/upload",
    /** Perform a POST file action. Used with FormData */
    "files": "/files",
    /** Perform a POST file action to update the firmware. Used with FormData */
    "fwUpdate": "/updatefw",
    /** Perform some auth related GET action */
    "login": "/login",
};

function clear_cmd_list() {
    http_cmd_list = [];
    processing_cmd = false;
}

/** Standard actions to take after completing processing a command's reply */
const postProcessCmd = () => {
    http_cmd_list.shift();
    processing_cmd = false;
    process_cmd();
}

/** Extract a named parameter value from the supplied params value,
 * if it's falsey use the defaultValue */
const getParam = (params, paramName, defaultValue = "") => {
    return (paramName in params && params[paramName].trim())
        ? params[paramName].trim()
        : defaultValue;
}

/** Build a full `/login` GET command, encoding the supplied params excluding DISCONNECT (and SUBMIT) */
const buildHttpLoginCmd = (params = { }) => {
    const cmd = [];
    // Do a deep copy of the params
    let prms = JSON.parse(JSON.stringify(params));

    if ("DISCONNECT" in prms && prms.DISCONNECT === "yes") {
        // Disconnect - throw away any other parameters
        prms = {"DISCONNECT": "yes"};
    } else {
        // Login / Change Password - add the submit param
        prms.SUBMIT = "yes";
    }

    Object.keys(prms).forEach((key) => {
        let pVal = getParam(prms, key);
        if (pVal) {
            if (!["DISCONNECT", "SUBMIT"].includes(key)) {
                pVal = encodeURIComponent(pVal);
            }
            pVal = encodeURIComponent(pVal);
            if (cmd.length) {
                cmd.push(`${key}=${pVal}`);
            } else {
                cmd.push(`${httpCmd.login}?${key}=${pVal}`);
            }
        }
    });

    return cmd.join("&");
}

/** Build a full `/upload` GET command, encoding the supplied `name`, `newname` and `path` values */
const buildHttpFileCmd = (params = { action: "", path: "", filename: "" }) => {
    // `path` is special, it always goes into the command, and it always goes first
    const path = getParam(params, "path", files_currentPath);
    const cmdInfo = [`Performing http '${httpCmd.fileUpload}' GET command for path:'${path}'`];
    const cmd = [`${httpCmd.fileUpload}?path=${encodeURIComponent(path)}`];

    Object.keys(params).forEach((key) => {
        if (key !== "path") {
            let pVal = getParam(params, key);
            if (pVal) {
                cmdInfo.push(`with ${key}:'${pVal}'`);
                if (["name", "newname"].includes(key)) {
                    pVal = encodeURIComponent(pVal);
                }
                cmd.push(`${key}=${pVal}`);
            }
        }
    });

    console.info(cmdInfo.join(" "));
    return cmd.join("&");
}

/** Build a full `command/plain` GET command, fully encoding the supplied `plainCmd` value.
 * Note: this includes replacing '#', because '#' is not encoded by `encodeURIComponent`.
 */
const buildHttpPlainCmd = (plainCmd) => `${httpCmd.command}?plain=${encodeURIComponent(plainCmd).replace("#", "%23")}`;

/** Build a full `command\commandText=` GET command, fully encoding the supplied `command` value.
 * Note: this includes replacing '#', because '#' is not encoded by `encodeURIComponent`.
 */
const buildHttpCommandCmd = (command) => `${httpCmd.command}?commandText=${encodeURIComponent(command).replace("#", "%23")}`;

function http_resultfn(response_text) {
    if ((http_cmd_list.length > 0) && (typeof http_cmd_list[0].resultfn != 'undefined')) {
        var fn = http_cmd_list[0].resultfn;
        fn(response_text);
    } //else console.log ("No resultfn");
    postProcessCmd();
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
    postProcessCmd();
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
        // This should never be true, but just in case we will handle it
        console.error(`Unknown command type ${cmdType} for command ${command.cmd}`);
        postProcessCmd();
        return;
    }
    // console.log("Processing 1/" + http_cmd_list.length);
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

/** Add some arbitrary command to the http_cmd_list.
 * Note: This is assumed to NOT be an actual HTTP command
 */
function AddCmd(cmd_fn, id) {
    if (http_cmd_list.length > max_cmd) {
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
    http_cmd_list.push(cmd);
    //console.log("Now " + http_cmd_list.length);
    process_cmd();
}

function SendGetHttp(url, result_fn, error_fn, id, max_id) {
    if ((http_cmd_list.length > max_cmd) && (max_cmd != -1)) {
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
        for (p = 0; p < http_cmd_list.length; p++) {
            //console.log("compare " + (max_id - cmd_max_id));
            if (http_cmd_list[p].id == cmd_id) {
                cmd_max_id--;
                //console.log("found " + http_cmd_list[p].id + " and " + cmd_id);
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
    http_cmd_list.push(cmd);
    //console.log("Now " + http_cmd_list.length);
    process_cmd();
}

function ProcessGetHttp(url, resultfn, errorfn) {
    if (http_communication_locked) {
        errorfn(503, translate_text_item("Communication locked!"));
        console.log("locked");
        return;
    }
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4) {
            if (xmlhttp.status == 200) {
                //console.log("*** " + url + " done");
                if (typeof resultfn != 'undefined' && resultfn != null) resultfn(xmlhttp.responseText);
            } else {
                if (xmlhttp.status == 401) GetIdentificationStatus();
                if (typeof errorfn != 'undefined' && errorfn != null) errorfn(xmlhttp.status, xmlhttp.responseText);
            }
        }
    }

    if (url.startsWith("/command")) {
        url += (url.indexOf("?") == -1) ? "?" : "&";
        url += "PAGEID=" + page_id;
    }
    //console.log("GET:" + url);
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

function ProcessPostHttp(url, postdata, resultfn, errorfn) {
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
    url += (url.indexOf("?") == -1) ? "?" : "&";
    url += "PAGEID=" + page_id;
    //console.log(url);
    xmlhttp.open("POST", url, true);
    xmlhttp.send(postdata);
}

function SendFileHttp(url, postdata, progress_fn, result_fn, error_fn) {
    if ((http_cmd_list.length > max_cmd) && (max_cmd != -1)) {
        error_fn(999, translate_text_item("Server not responding"));
        return;
    }
    if (http_cmd_list.length != 0) process = false;
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
    http_cmd_list.push(cmd);
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
