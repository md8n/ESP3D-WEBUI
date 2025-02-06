// Various helper methods for building http commands
import { files_currentPath } from "./common.js";

var page_id = ""

/** 'Commands' to be sent as the first part of the URL after the host name */
const httpCmd = {
    command: "/command",
    fileGet: "/",
    /** Perform a GET file action. Mostly used by files.js (i.e. not SPIFFs) */
    fileUpload: "/upload",
    /** Perform a files action.
     * For a POST this is used with FormData.
     * For a GET this is used with parameters */
    files: "/files",
    /** Perform a firmware action.
     * For a POST this is used with FormData the firmware.
     * For a GET this this does something else? */
    fwUpdate: "/updatefw",
    /** Perform some auth related GET action */
    login: "/login",
};

/** Command Types for the http `/command` command */
const httpCmdType = {
    "plain": "plain",
    "commandText": "commandText"
};

/** Extract a named parameter value from the supplied params value,
 * if it's falsey use the defaultValue */
const getParam = (params, paramName, defaultValue = "") => {
    return (paramName in params && params[paramName].trim())
        ? params[paramName].trim()
        : defaultValue;
}

/** Build a full `/login` GET command, encoding the supplied params excluding DISCONNECT (and SUBMIT) */
const buildHttpLoginCmd = (params = {}) => {
    const cmd = [];
    // Do a deep copy of the params
    let prms = JSON.parse(JSON.stringify(params));

    if ("DISCONNECT" in prms && prms.DISCONNECT === "yes") {
        // Disconnect - throw away any other parameters
        prms = { "DISCONNECT": "yes" };
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
            if (cmd.length) {
                cmd.push(`${key}=${pVal}`);
            } else {
                cmd.push(`${httpCmd.login}?${key}=${pVal}`);
            }
        }
    });

    return cmd.join("&");
}

/** Build a full `/files` GET command, encoding all the supplied params excluding `action` */
const buildHttpFilesCmd = (params = {}) => {
    const cmd = [];

    Object.keys(params).forEach((key) => {
        let pVal = getParam(params, key);
        if (pVal) {
            if (!["action"].includes(key)) {
                pVal = encodeURIComponent(pVal);
            }
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
    const path = getParam(params, "path", files_currentPath());
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

/** Build a simple file GET command. For some reason the filename is not encoded */
const buildHttpFileGetCmd = (filename) => `${httpCmd.fileGet}${filename}`;

/** Build either form of the `command` GET command, fully encoding the supplied `cmd` value.
 * * Note: this includes replacing '#', because '#' is not encoded by `encodeURIComponent`.
 */
const buildHttpCommandCmd = (cmdType, cmd) => `${httpCmd.command}?${cmdType}=${encodeURIComponent(cmd).replace("#", "%23")}&PAGEID=${page_id}`;

export { httpCmd, httpCmdType, buildHttpLoginCmd, buildHttpFilesCmd, buildHttpFileCmd, buildHttpFileGetCmd, buildHttpCommandCmd };