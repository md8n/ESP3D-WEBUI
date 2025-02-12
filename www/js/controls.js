import {
	Common,
	get_icon_svg,
	conErr,
	getChecked,
	id,
	setChecked,
	setHTML,
	alertdlg,
	getAxisFromValue,
	AxisFeedRate,
	SendPrinterCommand,
	buildHttpFileGetCmd,
	SendGetHttp,
	trans_text_item,
	showmacrodlg,
} from "./common.js";

let interval_position = -1;

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
	const common = new Common();
	common.control_macrolist = [];

	const cmd = buildHttpFileGetCmd("macrocfg.json");
	SendGetHttp(cmd, processMacroGetSuccess, processMacroGetFailed);
}

function Macro_build_list(response_text) {
	let response = [];
	try {
		if (response_text.length) {
			response = JSON.parse(response_text);
		}
	} catch (e) {
		console.error("Parsing error:", e);
	}
	const common = new Common();
	for (let i = 0; i < 9; i++) {
		let entry;
		if (
			response.length &&
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
		common.control_macrolist.push(entry);
	}
	control_build_macro_ui();
}

const processMacroGetSuccess = (response) => Macro_build_list(response.indexOf("<HTML>") === -1 ? response : "");

function processMacroGetFailed(error_code, response) {
	conErr(error_code, response);
	Macro_build_list("");
}

const on_autocheck_position = (use_value) => {
	if (typeof use_value !== "undefined") {
		setChecked("autocheck_position", !!use_value);
	}

	clearInterval(interval_position);
	interval_position = -1;

	if (getChecked("autocheck_position") !== "false") {
		const intPosElem = id("controlpanel_interval_positions");
		const interval = Number.parseInt(intPosElem?.value || undefined);
		if (!Number.isNaN(interval) && interval > 0 && interval < 100) {
			interval_position = setInterval(() => { get_Position(); }, interval * 1000);
		} else {
			setChecked("autocheck_position", false);
			if (intPosElem) {
				intPosElem.value = 0;
			}
		}
	}
};

function onPosIntervalChange() {
	const interval = Number.parseInt(getValue("controlpanel_interval_positions"));
	if (!Number.isNaN(interval) && interval > 0 && interval < 100) {
		on_autocheck_position();
	} else {
		setChecked("autocheck_position", false);
		setValue("controlpanel_interval_positions", 0);
		if (interval !== 0) {
			alertdlg(trans_text_item("Out of range"), trans_text_item("Value of auto-check must be between 0s and 99s !!"));
		}
		on_autocheck_position();
	}
}

const get_Position = () => SendPrinterCommand("?", false, null, null, 114, 1);

// function Control_get_position_value(label, result_data) {
// 	let result = "";
// 	let pos1 = result_data.indexOf(label, 0);
// 	if (pos1 > -1) {
// 		pos1 += label.length;
// 		const pos2 = result_data.indexOf(" ", pos1);
// 		if (pos2 > -1) {
// 			result = result_data.substring(pos1, pos2);
// 		} else result = result_data.substring(pos1);
// 	}
// 	return result.trim();
// }

// function process_Position(response) {
// 	grblProcessStatus(response);
// }

function control_motorsOff() {
	SendPrinterCommand("$Motors/Disable", true);
}

// Referenced by jogdial.svg
function SendHomecommand(cmd) {
	if (getChecked("lock_UI") !== "false") {
		return;
	}
	const common = new Common();
	let grblCmd = "";
	switch (cmd) {
		case "G28": grblCmd = "$H"; break;
		case "G28 X0": grblCmd = "$HX"; break;
		case "G28 Y0": grblCmd = "$HY"; break;
		case "G28 Z0": grblCmd = (common.fwData.grblaxis > 3) ? `$H${id("control_select_axis").value}` : "$HZ"; break;
		default: grblCmd = "$H"; break;
	}

	SendPrinterCommand(grblCmd, true, get_Position);
}

function SendZerocommand(cmd) {
	const command = `G10 L20 P0 ${cmd}`;
	SendPrinterCommand(command, true, get_Position);
}

/** This is extensively used in the jog dial SVGs */
function SendJogcommand(cmd, feedrate) {
	if (getChecked("lock_UI") !== "false") {
		return;
	}

	// The SVGs are fixed and don't know that 'Z' could be something else
	const aCmd = (grblaxis <= 3) ? cmd : cmd.replace("Z", getValue("control_select_axis"));

	const feedrateValue = AxisFeedRate(getAxisFromValue(aCmd));

	const command = `$J=G91 G21 F${feedrateValue} ${aCmd}`;
	console.log(command);
	SendPrinterCommand(command, true, get_Position);
}

const getFeedRateValue = (name) => floatOrZero(getValue(name) || 0);

const control_resetaxis = (axis = "") => {
	const letter = (!axis ? getValue('control_select_axis') : axis).toUpperCase();
	const ctrlLetter = ["X", "Y", "XY"].includes(letter) ? "xy" : "z";

	// Change over to the new axis that's been selected
	setValue(`controlpanel_${ctrlLetter}_feedrate`, AxisFeedRate(letter));
}

function onXYFeedRateChange() {
	const feedratevalue = getFeedRateValue("controlpanel_xy_feedrate");
	if (feedratevalue < 1 || feedratevalue > 9999) {
		//we could display error but we do not
		control_resetaxis("XY");
	}

	// Set the XY feed rate value
	AxisFeedRate("XY", feedratevalue);
}

function onNonXYFeedRateChange() {
	const feedratevalue = getFeedRateValue("controlpanel_z_feedrate");
	if (feedratevalue < 1 || feedratevalue > 999) {
		//we could display error but we do not
		control_resetaxis();
		return;
	}

	// Flush the change through
	control_changeaxis(getValue('control_select_axis'), feedratevalue);
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
	const common = new Common();
	const actions = [];

	const iconOptions = { t: "translate(50,1200) scale(1,-1)" };

	let content = "<div class='tooltip'>";
	content += "<span class='tooltip-text'>Manage macros</span>"
	content += "<button id='control_btn_show_macro_dlg' class='btn btn-primary'>";
	actions.push({ id: "control_btn_show_macro_dlg", method: initMacroDlg });
	content += "<span class='badge'>";
	content += get_icon_svg("star", iconOptions);
	content += get_icon_svg("pencil", iconOptions);;
	content += "</span>";
	content += "</button>";
	content += "</div>";
	for (let i = 0; i < 9; i++) {
		const entry = common.control_macrolist[i];
		content += control_build_macro_button(i, entry);
		actions.push({ id: `control_macro_${i}`, method: (event) => macro_command(entry.target, entry.filename) });
	}
	setHTML("Macro_list", content);
	// biome-ignore lint/complexity/noForEach: <explanation>
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

export {
	ControlsPanel,
	get_Position,
	init_controls_panel,
	on_autocheck_position,
	SendHomecommand,
	SendJogcommand,
};
