let interval_position = -1;
var control_macrolist = [];

/** Set up the macro list for the Controls Panel */
const init_controls_panel = () => {
	loadmacrolist();
};

const controlsPanelZeroGrbl = () => SendZerocommand(grblzerocmd);
const controlsPanelZeroX = () => SendZerocommand("X0");
const controlsPanelZeroY = () => SendZerocommand("Y0");
const controlsPanelZeroZ = () => SendZerocommand("Z0");
const controlsPanelZeroA = () => SendZerocommand("A0");
const controlsPanelZeroB = () => SendZerocommand("B0");
const controlsPanelZeroC = () => SendZerocommand("C0");

/** Set up the event handlers for the Controls Panel */
const ControlsPanel = () => {
	id("autocheck_position").addEventListener("click", on_autocheck_position);
	id("controlpanel_interval_positions").addEventListener("change", onPosIntervalChange);

	id("zero_xyz_btn").addEventListener("click", controlsPanelZeroGrbl);
	id("zero_x_btn").addEventListener("click", controlsPanelZeroX);
	id("zero_y_btn").addEventListener("click", controlsPanelZeroY);
	id("zero_z_btn").addEventListener("click", controlsPanelZeroZ);
	id("zero_a_btn").addEventListener("click", controlsPanelZeroA);
	id("zero_b_btn").addEventListener("click", controlsPanelZeroB);
	id("zero_c_btn").addEventListener("click", controlsPanelZeroC);

	id("controlpanel_xy_feedrate").addEventListener("change", onXYFeedRateChange);
	id("controlpanel_z_feedrate").addEventListener("change", onNonXYFeedRateChange);

	id("motor_off_control").addEventListener("click", control_motorsOff);
};

function loadmacrolist() {
	control_macrolist = [];
	const cmd = buildHttpFileGetCmd("macrocfg.json");
	SendGetHttp(cmd, processMacroGetSuccess, processMacroGetFailed);
}

function Macro_build_list(response_text) {
	var response = [];
	try {
		if (response_text.length != 0) {
			response = JSON.parse(response_text);
		}
	} catch (e) {
		console.error("Parsing error:", e);
	}
	for (var i = 0; i < 9; i++) {
		var entry;
		if (
			response.length !== 0 &&
			typeof response[i].name !== "undefined" &&
			typeof response[i].glyph !== "undefined" &&
			typeof response[i].filename !== "undefined" &&
			typeof response[i].target !== "undefined" &&
			typeof response[i].class !== "undefined" &&
			typeof response[i].index !== "undefined"
		) {
			entry = {
				name: response[i].name,
				glyph: response[i].glyph,
				filename: response[i].filename,
				target: response[i].target,
				class: response[i].class,
				index: response[i].index
			};
		} else {
			entry = {
				name: "",
				glyph: "",
				filename: "",
				target: "",
				class: "",
				index: i
			};
		}
		control_macrolist.push(entry);
	}
	control_build_macro_ui();
}

const processMacroGetSuccess = (response) => Macro_build_list(response.indexOf("<HTML>") == -1 ? response : "");

function processMacroGetFailed(error_code, response) {
	conErr(error_code, response);
	Macro_build_list("");
}

function on_autocheck_position(use_value) {
	if (typeof (use_value) !== 'undefined') {
		id('autocheck_position').checked = use_value;
	}
	if (id('autocheck_position').checked) {
		var interval = parseInt(getValue('controlpanel_interval_positions'));
		if (!Number.isNaN(interval) && interval > 0 && interval < 100) {
			if (interval_position != -1) {
				clearInterval(interval_position);
			}
			interval_position = setInterval(function () { get_Position() }, interval * 1000);
		} else {
			id('autocheck_position').checked = false;
			setValue('controlpanel_interval_positions', 0);
			if (interval_position != -1) {
				clearInterval(interval_position);
			}
			interval_position = -1;
		}
	} else {
		if (interval_position != -1) {
			clearInterval(interval_position);
		}
		interval_position = -1;
	}
}

function onPosIntervalChange() {
	var interval = parseInt(getValue('controlpanel_interval_positions'));
	if (!Number.isNaN(interval) && interval > 0 && interval < 100) {
		on_autocheck_position();
	} else {
		id('autocheck_position').checked = false;
		setValue('controlpanel_interval_positions', 0);
		if (interval != 0) {
			alertdlg(translate_text_item("Out of range"), translate_text_item("Value of auto-check must be between 0s and 99s !!"));
		}
		on_autocheck_position();
	}
}

const get_Position = () => SendPrinterCommand("?", false, null, null, 114, 1);

function Control_get_position_value(label, result_data) {
	var result = "";
	var pos1 = result_data.indexOf(label, 0);
	if (pos1 > -1) {
		pos1 += label.length;
		var pos2 = result_data.indexOf(" ", pos1);
		if (pos2 > -1) {
			result = result_data.substring(pos1, pos2);
		} else result = result_data.substring(pos1);
	}
	return result.trim();
}

function process_Position(response) {
	grblProcessStatus(response);
}

function control_motorsOff() {
	SendPrinterCommand("$Motors/Disable", true);
}

function SendHomecommand(cmd) {
	if (id('lock_UI').checked) {
		return;
	}
	switch (cmd) {
		case 'G28': cmd = '$H'; break;
		case 'G28 X0': cmd = '$HX'; break;
		case 'G28 Y0': cmd = '$HY'; break;
		case 'G28 Z0': cmd = (grblaxis > 3) ? `$H${getValue("control_select_axis") || ""}` : '$HZ'; break;
		default: cmd = '$H'; break;
	}

	SendPrinterCommand(cmd, true, get_Position);
}

function SendZerocommand(cmd) {
	const command = `G10 L20 P0 ${cmd}`;
	SendPrinterCommand(command, true, get_Position);
}

/** Get the Relevant Feed Rate for the Axis. It does not have to be the selected Axis */
const GetAxisFeedRate = (axis = "XY") => {
	switch (axis.toUpperCase()) {
		case "XY": return AxisFeedrate()[0];
		case "Z": return AxisFeedrate()[2];
		case "A": return AxisFeedrate()[3];
		case "B": return AxisFeedrate()[4];
		case "C": return AxisFeedrate()[5];
		default:
			// "x", "y", "XY"
			return AxisFeedrate()[0];
	}
}

/** Get the relevant feed rate for jogging */
function JogFeedrate(axis) {
	const isZAxis = axis[0].toUpperCase() === "Z";
	return GetAxisFeedRate(isZAxis ? "Z" : "XY");
}

/** This is extensively used in the jog dial SVGs */
function SendJogcommand(cmd, feedrate) {
	if (getChecked("lock_UI") !== "false") {
		return;
	}

	if (grblaxis > 3) {
		cmd = cmd.replace("Z", getValue("control_select_axis"));
	}

	const feedrateValue = GetAxisFeedRate(feedrate[0].toUpperCase() === "Z" ? getValue("control_select_axis") : "XY");

	const command = `$J=G91 G21 F${feedrateValue} ${cmd}`;
	console.log(command);
	SendPrinterCommand(command, true, get_Position);
}

const getFeedRateValue = (name) => floatOrZero(getValue(name) || 0);

function control_resetaxis(axis = "") {
	const letter = !axis ? getValue('control_select_axis') : axis;

	// Change over to the new axis that's been selected
	switch (letter) {
		case "XY": setValue('controlpanel_xy_feedrate', AxisFeedrate()[0]); break;
		case 'Z': setValue('controlpanel_z_feedrate', AxisFeedrate()[2]); break;
		case 'A': setValue('controlpanel_z_feedrate', AxisFeedrate()[3]); break;
		case 'B': setValue('controlpanel_z_feedrate', AxisFeedrate()[4]); break;
		case 'C': setValue('controlpanel_z_feedrate', AxisFeedrate()[5]); break;
	}
}

function onXYFeedRateChange() {
	const feedratevalue = getFeedRateValue("controlpanel_xy_feedrate");
	if (feedratevalue < 1 || feedratevalue > 9999) {
		//we could display error but we do not
		control_resetaxis("XY");
	}

	// Set the XY feed rate values
	AxisFeedrate()[0] = feedratevalue;
	AxisFeedrate()[1] = feedratevalue;
}

function onNonXYFeedRateChange() {
	const feedratevalue = getFeedRateValue("controlpanel_z_feedrate");
	if (feedratevalue < 1 || feedratevalue > 999) {
		//we could display error but we do not
		control_resetaxis();
		return;
	}

	// Flush the change through
	control_changeaxis();
}

function control_build_macro_button(index, entry) {
	const noGlyph = entry.glyph.length === 0;
	const btnStyle = noGlyph ? " style='display:none'" : "";
	const entryIcon = get_icon_svg(noGlyph ? "star" : entry.glyph);

	let content = `<button id="control_macro_${index}" class='btn fixedbutton ${entry.class}' type='text'${btnStyle}>`;
	content += `<span style='position:relative; top:3px;'>${entryIcon}</span>${entry.name.length > 0 ? "&nbsp;" : ""}${entry.name}`;
	content += "</button>";

	return content;
}

const processMacroSave = (answer) => {
	if (answer !== "ok") {
		return;
	}
	//console.log("now rebuild list");
	control_build_macro_ui();
}

const initMacroDlg = () => showmacrodlg(processMacroSave);

function control_build_macro_ui() {
	const actions = [];

	var content = "<div class='tooltip'>";
	content += "<span class='tooltip-text'>Manage macros</span>"
	content += "<button id='control_btn_show_macro_dlg' class='btn btn-primary'>";
	actions.push({ id: "control_btn_show_macro_dlg", method: initMacroDlg});
	content += "<span class='badge'>";
	content += "<svg width='1.3em' height='1.2em' viewBox='0 0 1300 1200'>";
	content += "<g transform='translate(50,1200) scale(1, -1)'>";
	content += "<path  fill='currentColor' d='M407 800l131 353q7 19 17.5 19t17.5 -19l129 -353h421q21 0 24 -8.5t-14 -20.5l-342 -249l130 -401q7 -20 -0.5 -25.5t-24.5 6.5l-343 246l-342 -247q-17 -12 -24.5 -6.5t-0.5 25.5l130 400l-347 251q-17 12 -14 20.5t23 8.5h429z'></path>";
	content += "</g>";
	content += "</svg>";
	content += "<svg width='1.3em' height='1.2em' viewBox='0 0 1300 1200'>";
	content += "<g transform='translate(50,1200) scale(1, -1)'>";
	content += "<path  fill='currentColor' d='M1011 1210q19 0 33 -13l153 -153q13 -14 13 -33t-13 -33l-99 -92l-214 214l95 96q13 14 32 14zM1013 800l-615 -614l-214 214l614 614zM317 96l-333 -112l110 335z'></path>";
	content += "</g>";
	content += "</svg>";
	content += "</span>";
	content += "</button>";
	content += "</div>";
	for (var i = 0; i < 9; i++) {
		const entry = control_macrolist[i];
		content += control_build_macro_button(i, entry);
		actions.push({ id: `control_macro_${i}`, method: (event) => macro_command(entry.target, entry.filename) });
	}
	setHTML("Macro_list", content);
	actions.forEach((action) => {
		const elem = id(action.id);
		if (elem) {
			elem.addEventListener("click", action.method);
		}
	});
}

function macro_command(target, filename) {
	switch (target) {
		case "ESP": SendPrinterCommand(`$LocalFS/Run=${filename}`); break;
		case "SD": files_print_filename(filename); break;
		case "URI": window.open(filename); break;
		default: break; // do nothing
	}
}
