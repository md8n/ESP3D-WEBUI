import M from "constants";

/** Maslow Status */
let maslowStatus = { homed: false, extended: false };

/** This keeps track of when we saw the last heartbeat from the machine */
let lastHeartBeatTime = new Date().getTime();

export const MaslowErrMsgKeyValueCantUse = "error: Could not use supplied key-value pair.";
export const MaslowErrMsgKeyValueSuffix = "This is probably a programming error\nKey-Value pair supplied was:";

/** Perform maslow specific-ish info message handling */
export const maslowInfoMsgHandling = (msg) => {
    if (msg.startsWith('MINFO: ')) {
        maslowStatus = JSON.parse(msg.substring(7));
        return true;
    }

    if (msg.startsWith('[MSG:INFO: Heartbeat')) {
        lastHeartBeatTime = new Date().getTime();
        return true;
    }

    //Catch the calibration complete message and alert the user
    if (msg.startsWith('[MSG:INFO: Calibration complete')) {
        alert('Calibration complete. You do not need to do calibration ever again unless your frame changes size. You might want to store a backup of your maslow.yaml file in case you need to restore it later.');
        return true;
    }

    return false;
}

/** Perform maslow specific-ish error message handling */
export const maslowErrorMsgHandling = (msg) => {
    if (msg.startsWith('error:')) {
        const msgExtra = {
            "8": " - Command requires idle state. Unlock machine?",
            "152": " - Configuration is invalid. Maslow.yaml file may be corrupt. Turning off and back on again can often fix this issue.",
            "153": " - Configuration is invalid. ESP32 probably did a panic reset. Config changes cannot be saved. Try restarting",
        };

        msg += msgExtra[msg.split(":")[1]] || "";
    }

    return msg;
}

/** Handle Maslow specific configuration messages
 * These would have all started with `$/Maslow_` which is expected to have been stripped away before calling this function
 */
export const maslowMsgHandling = (msg) => {
    const keyValue = msg.split("=");
    const errMsgSuffix = `${MaslowErrMsgKeyValueSuffix}${msg}`;
    if (keyValue.length != 2) {
        return maslowErrorMsgHandling(`${MaslowErrMsgKeyValueCantUse} ${errMsgSuffix}`);
    }
    const key = keyValue[0] || "";
    const value = (keyValue[1] || "").trim();
    if (!key) {
        return maslowErrorMsgHandling(`error: No key supplied for value. ${errMsgSuffix}`);
    }
    if (!value) {
        return maslowErrorMsgHandling(`error: No value supplied for key. ${errMsgSuffix}`);
    }

    const stdAction = (id, value) => {
        document.getElementById(id).value = value;
        loadedValues[id] = value;
    }
    const fullDimensionAction = (id, value, initGuessMember) => {
        stdAction(id, value);
        stdDimensionAction(value, initGuessMember);
    }
    const stdDimensionAction = (value, initGuessMember) => {
        initGuessMember = parseFloat(value);
    }
    const nullAction = () => { };

    const msgExtra = {
        "calibration_grid_size": (value) => stdAction("gridSize", value),
        "calibration_grid_width_mm_X": (value) => stdAction("gridWidth", value),
        "calibration_grid_height_mm_Y": (value) => stdAction("gridHeight", value),
        "Retract_Current_Threshold": (value) => stdAction("retractionForce", value),
        "vertical": (value) => stdAction("machineOrientation", value === "false" ? "horizontal" : "vertical"),
        "trX": (value) => fullDimensionAction("machineWidth", value, initialGuess.tr.x),
        "trY": (value) => fullDimensionAction("machineHeight", value, initialGuess.tr.y),
        "trZ": (value) => stdDimensionAction(value, initialGuess.tr.z),
        "tlX": (value) => stdDimensionAction(value, initialGuess.tl.x),
        "tlY": (value) => stdDimensionAction(value, initialGuess.tl.y),
        "tlZ": (value) => stdDimensionAction(value, initialGuess.tl.z),
        "brX": (value) => stdDimensionAction(value, initialGuess.br.x),
        "brY": (value) => nullAction(),
        "brZ": (value) => stdDimensionAction(value, initialGuess.br.z),
        "blX": (value) => nullAction(),
        "blY": (value) => nullAction(),
        "blZ": (value) => stdDimensionAction(value, initialGuess.bl.z),
        "Acceptable_Calibration_Threshold": (value) => stdDimensionAction(value, acceptableCalibrationThreshold),
    }
    const action = msgExtra[key] || "";
    if (!action) {
        return maslowErrorMsgHandling(`error: Could not find key for value in reference table. ${errMsgSuffix}`);
    }
    action(value);

    // Success - return an empty string
    return "";
}

export const checkHomed = () => {
    if (!maslowStatus.homed) {
        const err_msg = `${M} does not know belt lengths. Please retract and extend before continuing.`;
        alert(err_msg);

        // Write to the console too, in case the system alerts are not visible
        const msgWindow = document.getElementById('messages')
        msgWindow.textContent = `${msgWindow.textContent}\n${err_msg}`;
        msgWindow.scrollTop = msgWindow.scrollHeight;
    }

    return maslowStatus.homed;
}

/** Short hand convenience call to SendPrinterCommand with some preset values.
 * Uses the global function get_position, which is also a SendPrinterCommand with presets
 */
export const sendCommand = (cmd) => {
    SendPrinterCommand(cmd, true, get_Position);
}

// The following functions are all defined as global functions, and are used by tablettab.html and other places
// They rely on the global function SendPrinterCommand defined in printercmd.js

/** Used to populate the config popup when it loads */
function loadConfigValues() {
    SendPrinterCommand(`$/${M}_vertical`);
    SendPrinterCommand(`$/${M}_calibration_grid_width_mm_X`);
    SendPrinterCommand(`$/${M}_calibration_grid_height_mm_Y`);
    SendPrinterCommand(`$/${M}_calibration_grid_size`);
    SendPrinterCommand(`$/${M}_Retract_Current_Threshold`);
    SendPrinterCommand(`$/${M}_trX`);
    SendPrinterCommand(`$/${M}_trY`);
    SendPrinterCommand(`$/${M}_Acceptable_Calibration_Threshold`);
}

/** Load all of the corner values */
function loadCornerValues() {
    SendPrinterCommand(`$/${M}_tlX`);
    SendPrinterCommand(`$/${M}_tlY`);
    SendPrinterCommand(`$/${M}_trX`);
    SendPrinterCommand(`$/${M}_trY`);
    SendPrinterCommand(`$/${M}_brX`);
}

/** Save the Maslow configuration values */
function saveConfigValues() {
    let gridWidth = document.getElementById('gridWidth').value;
    let gridHeight = document.getElementById('gridHeight').value;
    let gridSize = document.getElementById('gridSize').value;
    let retractionForce = document.getElementById('retractionForce').value;
    let machineOrientation = document.getElementById('machineOrientation').value;
    let machineWidth = document.getElementById('machineWidth').value;
    let machineHeight = document.getElementById('machineHeight').value;

    var gridSpacingWidth = gridWidth / (gridSize - 1);
    var gridSpacingHeight = gridHeight / (gridSize - 1);

    //If the grid spacing is going to be more than 200 don't save the values
    if (gridSpacingWidth > 260 || gridSpacingHeight > 260) {
        alert('Grid spacing is too large. Please reduce the grid size or increase the number of points.');
        return;
    }

    if (gridWidth != loadedValues['gridWidth']) {
        sendCommand(`$/${M}_calibration_grid_width_mm_X=${gridWidth}`);
    }
    if (gridHeight != loadedValues['gridHeight']) {
        sendCommand(`$/${M}_calibration_grid_height_mm_Y=${gridHeight}`);
    }
    if (gridSize != loadedValues['gridSize']) {
        sendCommand(`$/${M}_calibration_grid_size=${gridSize}`);
    }
    if (retractionForce != loadedValues['retractionForce']) {
        sendCommand(`$/${M}_Retract_Current_Threshold=${retractionForce}`);
    }
    if (machineOrientation != loadedValues['machineOrientation']) {
        sendCommand(`$/${M}_vertical=${machineOrientation === 'horizontal' ? 'false' : 'true'}`);
    }
    if (machineWidth != loadedValues['machineWidth'] || machineHeight != loadedValues['machineHeight']) {
        sendCommand(`$/${M}_tlX=0`);
        sendCommand(`$/${M}_tlY=${machineHeight}`);
        sendCommand(`$/${M}_trX=${machineWidth}`);
        sendCommand(`$/${M}_trY=${machineHeight}`);
        sendCommand(`$/${M}_brX=${machineWidth}`);
    }

    refreshSettings(current_setting_filter);
    saveMaslowYaml();
    loadCornerValues();

    hideModal('configuration-popup');
}

