import {
	CALIBRATION_EVENT_NAME,
	findMaxFitness,
	Common,
	get_icon_svg,
	getChecked,
	getValue,
	setValue,
	id,
	setChecked,
	setHTML,
	alertdlg,
	SendPrinterCommand,
	translate_text_item,
	sendCommand,
} from "./common.js";

/** interval timer ID */
var interval_status = -1;
var probe_progress_status = 0;
var grbl_error_msg = "";
var WCO = undefined;
var OVR = { feed: undefined, rapid: undefined, spindle: undefined };
var mpos = [0, 0, 0];
/** gets/sets MPOS array [x, y, z] */
const MPOS = (value) => {
	if (Array.isArray(value) && value.length == 3) {
		mpos = value;
	}
	return mpos;
};
let wpos = [0, 0, 0];
/** gets/sets WPOS array [x, y, z] */
const WPOS = (value) => {
	if (Array.isArray(value) && value.length == 3) {
		wpos = value;
	}
	return wpos;
};

var feedrate = [0, 0, 0, 0, 0, 0];
var last_axis_letter = "Z";

var axisNames = ["x", "y", "z", "a", "b", "c"];

function setClickability(element, visible) {
	setDisplay(element, visible ? "table-row" : "none");
}

var autocheck = "report_auto";
function getAutocheck() {
	return getChecked(autocheck) !== "false";
}
function setAutocheck(flag) {
	setChecked(autocheck, flag);
}

function build_axis_selection() {
	const common = new Common();
	if (common.grblaxis <= 3) {
		return;
	}

	var html = "<select class='form-control wauto' id='control_select_axis'>";
	for (var i = 3; i <= common.grblaxis; i++) {
		var letter;
		let sel = "";
		if (i == 3) {
			letter = "Z";
			sel = "selected";
		} else if (i == 4) letter = "A";
		else if (i == 5) letter = "B";
		else if (i == 6) letter = "C";
		html += `<option value='${letter}' ${sel}>${letter}</option>\n`;
	}
	html += "</select>\n";

	setHTML("axis_selection", html);
	id("control_select_axis").addEventListener("change", (event) =>
		control_changeaxis(),
	);
	setHTML("axis_label", `${translate_text_item("Axis")}:`);
	setClickability("axis_selection", true);
}

function control_changeaxis() {
	var letter = getValue("control_select_axis");
	setHTML("axisup", `+${letter}`);
	setHTML("axisdown", `-${letter}`);
	setHTML("homeZlabel", ` ${letter} `);
	switch (last_axis_letter) {
		case "Z":
			axis_feedrate[2] = getValue("z_feedrate");
			break;
		case "A":
			axis_feedrate[3] = getValue("a_feedrate");
			break;
		case "B":
			axis_feedrate[4] = getValue("b_feedrate");
			break;
		case "C":
			axis_feedrate[5] = getValue("c_feedrate");
			break;
	}

	last_axis_letter = letter;
	switch (last_axis_letter) {
		case "Z":
			setValue("z_feedrate", axis_feedrate[2]);
			break;
		case "A":
			setValue("a_feedrate", axis_feedrate[3]);
			break;
		case "B":
			setValue("b_feedrate", axis_feedrate[4]);
			break;
		case "C":
			setValue("c_feedrate", axis_feedrate[5]);
			break;
	}
}

function init_grbl_panel() {
	grbl_set_probe_detected(false);
}

function grbl_clear_status() {
	grbl_set_probe_detected(false);
	grbl_error_msg = "";
	setHTML("grbl_status_text", grbl_error_msg);
	setHTML("grbl_status", "");
}

function grbl_set_probe_detected(state) {
	var color = state ? "green" : "grey";
	var glyph = state ? "ok-circle" : "record";
	setHTML("touch_status_icon", get_icon_svg(glyph, "1.3em", "1.3em", color));
}

const onprobemaxtravelChange = () => {
	const travel = Number.parseFloat(getValue("grblpanel_probemaxtravel"));
	if (travel > 9999 || travel <= 0 || Number.isNaN(travel) || travel === null) {
		alertdlg(translate_text_item("Out of range"), translate_text_item("Value of maximum probe travel must be between 1 mm and 9999 mm !"));
		return false;
	}
	return true;
};

const onprobefeedrateChange = () => {
	const feedratevalue = Number.parseInt(getValue("grblpanel_probefeedrate"));
	if (feedratevalue <= 0 || feedratevalue > 9999 || Number.isNaN(feedratevalue) || feedratevalue === null) {
		alertdlg(translate_text_item("Out of range"), translate_text_item("Value of probe feedrate must be between 1 mm/min and 9999 mm/min !"));
		return false;
	}
	return true;
};

const onproberetractChange = () => {
	const thickness = Number.parseFloat(getValue("grblpanel_proberetract"));
	if (thickness < 0 || thickness > 999 || Number.isNaN(thickness) || thickness === null) {
		alertdlg(translate_text_item("Out of range"), translate_text_item("Value of probe retract must be between 0 mm and 9999 mm !"));
		return false;
	}
	return true;
};

const onprobetouchplatethicknessChange = () => {
	const thickness = Number.parseFloat(getValue("grblpanel_probetouchplatethickness"));
	if (thickness < 0 || thickness > 999 || Number.isNaN(thickness) || thickness === null) {
		alertdlg(translate_text_item("Out of range"), translate_text_item("Value of probe touch plate thickness must be between 0 mm and 9999 mm !"));
		return false;
	}
	return true;
};

var reportType = "none";

function disablePolling() {
	setAutocheck(false);
	// setValue('grblpanel_interval_status', 0);
	if (interval_status !== -1) {
		clearInterval(interval_status);
		interval_status = -1;
	}

	grbl_clear_status();
	reportType = "none";
}

function enablePolling() {
	const interval = Number.parseFloat(getValue("grblpanel_interval_status"));
	if (!Number.isNaN(interval) && interval === 0) {
		if (interval_status !== -1) {
			clearInterval(interval_status);
		}
		disablePolling();
		reportNone();
		return;
	}
	if (!Number.isNaN(interval) && interval > 0 && interval < 100) {
		if (interval_status !== -1) {
			clearInterval(interval_status);
		}
		interval_status = setInterval(() => get_status(), interval * 1000);
		reportType = "polled";
		setChecked("report_poll", true);
		return;
	}
	setValue("grblpanel_interval_status", 0);
	alertdlg( translate_text_item("Out of range"), translate_text_item("Value of auto-check must be between 0s and 99s !!") );
	disablePolling();
	reportNone();
}

function tryAutoReport() {
	if (reportType === "polled") {
		disablePolling();
	}
	reportType === "auto";
	const interval = getValue("grblpanel_autoreport_interval");
	if (interval === 0) {
		enablePolling();
		return;
	}
	setChecked("report_auto", true);
	reportType = "auto";
	SendPrinterCommand(
		`$Report/Interval=${interval}`,
		true,
		// Do nothing more on success
		() => { },
		// Fall back to polling if the firmware does not support auto-reports
		() => enablePolling(),
		99.1,
		1,
	);
}

const onAutoReportIntervalChange = () => tryAutoReport();

function disableAutoReport() {
	SendPrinterCommand("$Report/Interval=0", true, null, null, 99.0, 1);
	setChecked("report_auto", false);
}

const reportNone = () => {
	switch (reportType) {
		case "polled":
			disablePolling();
			break;
		case "auto":
			disableAutoReport();
			break;
	}
	setChecked("report_none", true);
	reportType = "none";
};

const reportPolled = () => {
	if (reportType === "auto") {
		disableAutoReport();
	}
	enablePolling();
};

const onstatusIntervalChange = () => enablePolling();

//TODO handle authentication issues
//errorfn cannot be NULL
function get_status() {
	//ID 114 is same as M114 as '?' cannot be an ID
	SendPrinterCommand("?", false, null, null, 114, 1);
}

function parseGrblStatus(response) {
	const grbl = {
		stateName: "",
		message: "",
		wco: undefined,
		mpos: undefined,
		wpos: undefined,
		feedrate: 0,
		spindle: undefined,
		spindleSpeed: undefined,
		ovr: undefined,
		lineNumber: undefined,
		flood: undefined,
		mist: undefined,
		pins: undefined,
	};
	response = response.replace("<", "").replace(">", "");
	var fields = response.split("|");
	fields.forEach(function (field) {
		var tv = field.split(":");
		var tag = tv[0];
		var value = tv[1];
		switch (tag) {
			case "Door":
				grbl.stateName = tag;
				grbl.message = field;
				break;
			case "Hold":
				grbl.stateName = tag;
				grbl.message = field;
				break;
			case "Run":
			case "Jog":
			case "Idle":
			case "Home":
			case "Alarm":
			case "Check":
			case "Sleep":
				grbl.stateName = tag;
				break;

			case "Ln":
				grbl.lineNumber = parseInt(value);
				break;
			case "MPos":
				grbl.mpos = value.split(",").map(function (v) {
					return parseFloat(v);
				});
				break;
			case "WPos":
				grbl.wpos = value.split(",").map(function (v) {
					return parseFloat(v);
				});
				break;
			case "WCO":
				grbl.wco = value.split(",").map(function (v) {
					return parseFloat(v);
				});
				break;
			case "FS":
				var rates = value.split(",");
				grbl.feedrate = parseFloat(rates[0]);
				grbl.spindleSpeed = parseInt(rates[1]);
				break;
			case "Ov":
				var rates = value.split(",");
				grbl.ovr = {
					feed: parseInt(rates[0]),
					rapid: parseInt(rates[1]),
					spindle: parseInt(rates[2]),
				};
				break;
			case "A":
				grbl.spindleDirection = "M5";
				Array.from(value).forEach(function (v) {
					switch (v) {
						case "S":
							grbl.spindleDirection = "M3";
							break;
						case "C":
							grbl.spindleDirection = "M4";
							break;
						case "F":
							grbl.flood = true;
							break;
						case "M":
							grbl.mist = true;
							break;
					}
				});
				break;
			case "SD":
				var sdinfo = value.split(",");
				grbl.sdPercent = parseFloat(sdinfo[0]);
				grbl.sdName = sdinfo[1];
				break;
			case "Pn":
				// pin status
				grbl.pins = value;
				break;
			default:
				// ignore other fields that might happen to be present
				break;
		}
	});
	return grbl;
}

function clickableFromStateName(state, hasSD) {
	var clickable = {
		resume: false,
		pause: false,
		reset: false,
	};
	switch (state) {
		case "Run":
			clickable.pause = true;
			clickable.reset = true;
			break;
		case "Hold":
			clickable.resume = true;
			clickable.reset = true;
			break;
		case "Alarm":
			if (hasSD) {
				//guess print is stopped because of alarm so no need to pause
				clickable.resume = true;
			}
			break;
		case "Idle":
		case "Jog":
		case "Home":
		case "Check":
		case "Sleep":
			break;
	}
	return clickable;
}

function show_grbl_position(wpos, mpos) {
	if (wpos) {
		wpos.forEach(function (pos, axis) {
			var element = "control_" + axisNames[axis] + "_position";
			setHTML(element, pos.toFixed(3));
		});
	}
	if (mpos) {
		mpos.forEach(function (pos, axis) {
			var element = "control_" + axisNames[axis] + "m_position";
			setHTML(element, pos.toFixed(3));
		});
	}
}

function show_grbl_status(stateName, message, hasSD) {
	if (stateName) {
		const clickable = clickableFromStateName(stateName, hasSD);
		setHTML("grbl_status", stateName);
		setHTML("systemStatus", stateName);
		if (stateName === "Alarm") {
			id("systemStatus").classList.add("system-status-alarm");
		} else {
			id("systemStatus").classList.remove("system-status-alarm");
		}
		setClickability("sd_resume_btn", clickable.resume);
		setClickability("sd_pause_btn", clickable.pause);
		setClickability("sd_reset_btn", clickable.reset);
		if (stateName === "Hold" && probe_progress_status !== 0) {
			probe_failed_notification();
		}
	}

	setHTML("grbl_status_text", translate_text_item(message));
	setClickability("clear_status_btn", stateName === "Alarm");
}

function finalize_probing() {
	// No need for this when using the FluidNC-specific G38.6 probe command.
	// SendPrinterCommand("G90", true, null, null, 90, 1);
	probe_progress_status = 0;
	setClickability("probingbtn", true);
	setClickability("probingtext", false);
	setClickability("sd_pause_btn", false);
	setClickability("sd_resume_btn", false);
	setClickability("sd_reset_btn", false);
}

function show_grbl_SD(sdName, sdPercent) {
	const status = sdName
		? `${sdName}&nbsp;<progress id="print_prg" value=${sdPercent} max="100"></progress>${sdPercent}%`
		: "";
	setHTML("grbl_SD_status", status);
}

function show_grbl_probe_status(probed) {
	grbl_set_probe_detected(probed);
}

const SendRealtimeCmd = (code) => {
	const cmd = String.fromCharCode(code);
	SendPrinterCommand(cmd, false, null, null, code, 1);
};

function pauseGCode() {
	SendRealtimeCmd(0x21); // '!'
}

function resumeGCode() {
	SendRealtimeCmd(0x7e); // '~'
}

function stopGCode() {
	grbl_reset(); // 0x18, ctrl-x
}

function grblProcessStatus(response) {
	var grbl = parseGrblStatus(response);
	// Record persistent values of data
	if (grbl.wco) {
		WCO = grbl.wco;
	}
	if (grbl.ovr) {
		OVR = grbl.ovr;
	}
	if (grbl.mpos) {
		MPOS(grbl.mpos);
		if (WCO) {
			WPOS(grbl.mpos.map((v, index) => v - WCO[index]));
		}
	} else if (grbl.wpos) {
		WPOS(grbl.wpos);
		if (WCO) {
			MPOS(grbl.wpos.map((v, index) => v + WCO[index]));
		}
	}
	show_grbl_position(WPOS(), MPOS());
	show_grbl_status(grbl.stateName, grbl.message, grbl.sdName);
	show_grbl_SD(grbl.sdName, grbl.sdPercent);
	show_grbl_probe_status(grbl.pins && grbl.pins.indexOf("P") != -1);
	tabletGrblState(grbl, response);
}

const grbl_reset = () => {
	if (probe_progress_status != 0) {
		probe_failed_notification();
	}
	SendRealtimeCmd(0x18);
};

function grblGetProbeResult(response) {
	const tab1 = response.split(":");
	if (tab1.length > 2) {
		const status = tab1[2].replace("]", "");
		if (Number.parseInt(status.trim()) === 1) {
			if (probe_progress_status !== 0) {
				const cmd = `$J=G90 G21 F1000 Z${Number.parseFloat(getValue("grblpanel_probetouchplatethickness")) + Number.parseFloat(getValue("grblpanel_proberetract"))}`;
				SendPrinterCommand(cmd, true, null, null, 0, 1);
				finalize_probing();
			}
		} else {
			probe_failed_notification();
		}
	}
}

function probe_failed_notification() {
	finalize_probing();
	alertdlg(translate_text_item("Error"), translate_text_item("Probe failed !"));
	beep(3, 140, 261);
}
const modalModes = [
	{
		name: "motion",
		values: ["G80", "G0", "G1", "G2", "G3", "G38.1", "G38.2", "G38.3", "G38.4"],
	},
	{ name: "wcs", values: ["G54", "G55", "G56", "G57", "G58", "G59"] },
	{ name: "plane", values: ["G17", "G18", "G19"] },
	{ name: "units", values: ["G20", "G21"] },
	{ name: "distance", values: ["G90", "G91"] },
	{ name: "arc_distance", values: ["G90.1", "G91.1"] },
	{ name: "feed", values: ["G93", "G94"] },
	{ name: "program", values: ["M0", "M1", "M2", "M30"] },
	{ name: "spindle", values: ["M3", "M4", "M5"] },
	{ name: "mist", values: ["M7"] }, // Also M9, handled separately
	{ name: "flood", values: ["M8"] }, // Also M9, handled separately
	{ name: "parking", values: ["M56"] },
];

function grblGetModal(msg) {
	modal("modes", msg.replace("[GC:", "").replace("]", ""));
	const modes = modal("modes").split(" ");
	Modal.parking = undefined; // Otherwise there is no way to turn it off
	modal("program", ""); // Otherwise there is no way to turn it off
	modes().forEach((mode) => {
		if (mode == "M9") {
			modal("flood", mode);
			modal("mist", mode);
		} else {
			if (mode.charAt(0) === "T") {
				modal("tool", mode.substring(1));
			} else if (mode.charAt(0) === "F") {
				modal("feedrate", mode.substring(1));
			} else if (mode.charAt(0) === "S") {
				modal("spindle", mode.substring(1));
			} else {
				modalModes.forEach((modeType) => {
					modeType.values.forEach((s) => {
						if (mode == s) {
							modal(modeType.name, mode);
						}
					});
				});
			}
		}
	});
	tabletUpdateModal();
}

// Whenever [MSG: BeginData] is seen, subsequent lines are collected
// in collectedData, until [MSG: EndData] is seen.  Then collectHander()
// is called, if it is defined.
// To run a command that generates such data, first set collectHandler
// to a callback function to receive the data, then issue the command.
var collecting = false;
var collectedData = "";
var collectHandler = undefined;

// Settings are collected separately because they bracket the data with
// the legacy protocol messages  $0= ... ok
var collectedSettings = null;

async function handleCalibrationData(measurements) {
	document.body.addEventListener(CALIBRATION_EVENT_NAME, (event) => {
		const calData = event.detail.dataToSend;
		const common = new Common();
		console.info(
			`Received calibration results that were ${calData.good ? "good" : "not good"} and ${calData.final ? "final" : "not final"}`,
		);
		if (calData.good && calData.final) {
			common.calibrationResults = calData.bestGuess;
		}
	});

	document.querySelector("#messages").textContent +=
		"\nComputing... This may take several minutes";
	sendCommand("$ACKCAL");

	// Wait half a second and then kick off the party
	setTimeout(() => findMaxFitness(measurements), 500);
}

const grblHandleMessage = (msg) => {
	tabletShowMessage(msg, collecting);

	// We handle these two before collecting data because they can be
	// sent at any time, maybe requested by a timer.

	if (msg.startsWith("CLBM:")) {
		const validJsonMSG = msg
			.replace(/(\b(?:bl|br|tr|tl)\b):/g, '"$1":')
			.replace("CLBM:", "")
			.replace(/,]$/, "]");
		const measurements = JSON.parse(validJsonMSG);
		handleCalibrationData(measurements);
	}
	if (msg.startsWith("<")) {
		grblProcessStatus(msg);
		return;
	}
	if (msg.startsWith("[GC:")) {
		grblGetModal(msg);
		console.log(msg);
		return;
	}

	// Block data collection
	if (collecting) {
		if (msg.startsWith("[MSG: EndData]")) {
			collecting = false;
			// Finish collecting data
			if (collectHandler) {
				collectHandler(collectedData);
				collectHandler = undefined;
			}
			collectedData = "";
		} else {
			// Continue collecting data
			collectedData += msg;
		}
		return;
	}
	if (msg.startsWith("[MSG: BeginData]")) {
		// Start collecting data
		collectedData = "";
		collecting = true;
		return;
	}

	// Setting collection
	if (collectedSettings) {
		if (msg.startsWith("ok")) {
			// Finish collecting settings
			getESPconfigSuccess(collectedSettings);
			collectedSettings = null;
			if (grbl_errorfn) {
				grbl_errorfn();
				grbl_errorfn = null;
				grbl_processfn = null;
			}
		} else {
			// Continue collecting settings
			collectedSettings += msg;
		}
		return;
	}
	if (msg.startsWith("$0=") || msg.startsWith("$10=")) {
		// Start collecting settings
		collectedSettings = msg;
		return;
	}

	// Handlers for standard Grbl protocol messages

	if (msg.startsWith("ok")) {
		if (grbl_processfn) {
			grbl_processfn();
			grbl_processfn = null;
			grbl_errorfn = null;
		}
		return;
	}
	if (msg.startsWith("[PRB:")) {
		grblGetProbeResult(msg);
		return;
	}
	if (msg.startsWith("[MSG:")) {
		return;
	}
	if (msg.startsWith("error:")) {
		if (grbl_errorfn) {
			grbl_errorfn();
			grbl_errorfn = null;
			grbl_processfn = null;
		}
	}
	if (
		msg.startsWith("error:") ||
		msg.startsWith("ALARM:") ||
		msg.startsWith("Hold:") ||
		msg.startsWith("Door:")
	) {
		if (probe_progress_status !== 0) {
			probe_failed_notification();
		}
		if (grbl_error_msg.length === 0) {
			grbl_error_msg = translate_text_item(msg.trim());
		}
		return;
	}
	if (msg.startsWith("Grbl ")) {
		console.log("Reset detected");
		return;
	}
};

const StartProbeProcess = () => {
	// G38.6 is FluidNC-specific.  It is like G38.2 except that the units
	// are always G21 units, i.e. mm in the usual case, and distance is
	// always incremental.  This avoids problems with probing when in G20
	// inches mode and undoing a preexisting G91 incremental mode
	let cmd = "G38.2 Z-";
	if (
		!onprobemaxtravelChange() ||
		!onprobefeedrateChange() ||
		!onproberetractChange() ||
		!onprobetouchplatethicknessChange()
	) {
		return;
	}
	cmd += `${Number.parseFloat(getValue("grblpanel_probemaxtravel"))} F${Number.parseInt(getValue("grblpanel_probefeedrate"))} P${getValue("grblpanel_probetouchplatethickness")}`;
	console.log(cmd);
	probe_progress_status = 1;
	let restoreReport = false;
	if (reportType === "none") {
		tryAutoReport(); // will fall back to polled if autoreport fails
		restoreReport = true;
	}
	SendPrinterCommand(cmd, true, null, null, 38.6, 1);
	setClickability("probingbtn", false);
	setClickability("probingtext", true);
	grbl_error_msg = "";
	setHTML("grbl_status_text", grbl_error_msg);
	if (restoreReport) {
		reportNone();
	}
};

let spindleSpeedSetTimeout;

function setSpindleSpeed(speed) {
	const common = new Common();
	if (spindleSpeedSetTimeout) {
		clearTimeout(spindleSpeedSetTimeout);
	}
	if (speed >= 1) {
		common.spindleTabSpindleSpeed = speed;
		spindleSpeedSetTimeout = setTimeout(
			() =>
				SendPrinterCommand(
					`S${common.spindleTabSpindleSpeed}`,
					false,
					null,
					null,
					1,
					1,
				),
			500,
		);
	}
}

export {
	build_axis_selection,
	grblHandleMessage,
	grbl_reset,
	onAutoReportIntervalChange,
	onstatusIntervalChange,
	onprobemaxtravelChange,
	onprobefeedrateChange,
	onproberetractChange,
	onprobetouchplatethicknessChange,
	reportNone,
	tryAutoReport,
	reportPolled,
	SendRealtimeCmd,
	StartProbeProcess,
	MPOS,
	WPOS,
};
