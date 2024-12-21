let interval_position = -1;

/** Set up the macro list for the Controls Panel */
const init_controls_panel = () => {
	loadmacrolist();
};

/** Set up the event handlers for the Controls Panel */
const ControlsPanel = () => {
	const common = new Common();
	id("autocheck_position").addEventListener("click", (event) => on_autocheck_position());
	id("controlpanel_interval_positions").addEventListener("change", (event) => onPosIntervalChange());

	id("zero_xyz_btn").addEventListener("click", (event) => SendZerocommand(common.grblzerocmd));
	id("zero_x_btn").addEventListener("click", (event) => SendZerocommand("X0"));
	id("zero_y_btn").addEventListener("click", (event) => SendZerocommand("Y0"));
	id("zero_z_btn").addEventListener("click", (event) => SendZerocommand("Z0"));
	id("zero_a_btn").addEventListener("click", (event) => SendZerocommand("A0"));
	id("zero_b_btn").addEventListener("click", (event) => SendZerocommand("B0"));
	id("zero_c_btn").addEventListener("click", (event) => SendZerocommand("C0"));

	id("controlpanel_xy_feedrate").addEventListener("change", (event) => onXYvelocityChange());
	id("controlpanel_z_feedrate").addEventListener("change", (event) => onZvelocityChange());

	id("motor_off_control").addEventListener("click", (event) => control_motorsOff());
};

function hideAxiscontrols() {
	displayNone("JogBar");
	displayNone("HomeZ");
	displayBlock("CornerZ");
	displayNone("control_z_position_display");
	displayNone("control_zm_position_row");
	displayNone("z_velocity_display");
}

function showAxiscontrols() {
	displayNone("CornerZ");
	displayBlock("JogBar");
	displayBlock("HomeZ");
	displayBlock("control_z_position_display");
	displayTable("control_zm_position_row");
	displayInline("z_velocity_display");
}

function loadmacrolist() {
	const common = new Common();
	common.control_macrolist = [];
	const url = "/macrocfg.json";
	SendGetHttp(url, processMacroGetSuccess, processMacroGetFailed);
}

function Macro_build_list(response_text) {
	const common = new Common();
	let response = [];
	try {
		if (response_text.length !== 0) {
			response = JSON.parse(response_text);
		}
	} catch (e) {
		console.error("Parsing error:", e);
	}
	for (let i = 0; i < 9; i++) {
		let entry;
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
		common.control_macrolist.push(entry);
	}
	control_build_macro_ui();
}

const processMacroGetSuccess = (response) => Macro_build_list(response.indexOf("<HTML>") === -1 ? response : "");

function processMacroGetFailed(error_code, response) {
	conErr(error_code, response);
	Macro_build_list("");
}

function on_autocheck_position(use_value) {
	if (typeof (use_value) !== 'undefined') {
		id('autocheck_position').checked = use_value;
	}
	if (id('autocheck_position').checked) {
		const interval = Number.parseInt(id('controlpanel_interval_positions').value);
		if (!Number.isNaN(interval) && interval > 0 && interval < 100) {
			if (interval_position !== -1) {
				clearInterval(interval_position);
			}
			interval_position = setInterval(() => { get_Position() }, interval * 1000);
		} else {
			id('autocheck_position').checked = false;
			id('controlpanel_interval_positions').value = 0;
			if (interval_position !== -1) {
				clearInterval(interval_position);
			}
			interval_position = -1;
		}
	} else {
		if (interval_position !== -1) {
			clearInterval(interval_position);
		}
		interval_position = -1;
	}
}

function onPosIntervalChange() {
	const interval = Number.parseInt(id('controlpanel_interval_positions').value);
	if (!Number.isNaN(interval) && interval > 0 && interval < 100) {
		on_autocheck_position();
	} else {
		id('autocheck_position').checked = false;
		id('controlpanel_interval_positions').value = 0;
		if (interval !== 0) {
			alertdlg(translate_text_item("Out of range"), translate_text_item("Value of auto-check must be between 0s and 99s !!"));
		}
		on_autocheck_position();
	}
}

const get_Position = () => SendPrinterCommand("?", false, null, null, 114, 1);

function Control_get_position_value(label, result_data) {
	let result = "";
	let pos1 = result_data.indexOf(label, 0);
	if (pos1 > -1) {
		pos1 += label.length;
		const pos2 = result_data.indexOf(" ", pos1);
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
	const common = new Common();
	let hCmd = "";
	switch (cmd) {
		case 'G28': hCmd = '$H'; break;
		case 'G28 X0': hCmd = '$HX'; break;
		case 'G28 Y0': hCmd = '$HY'; break;
		case 'G28 Z0': hCmd = (common.grblaxis > 3) ? `$H${id("control_select_axis").value}` : '$HZ'; break;
		default: hCmd = '$H'; break;
	}

	SendPrinterCommand(hCmd, true, get_Position);
}

function SendZerocommand(cmd) {
	const command = `G10 L20 P0 ${cmd}`;
	SendPrinterCommand(command, true, get_Position);
}

const buildFeedRateValueDef = (axis) => {
	return {
		"valueType": "float",
		"units": "mm/min",
		"label": axis.startsWith("Z") ? "Z axis feedrate" : "XY axis feedrate",
		"min": 0.00001,
		"defValue": 1,
	};
}

function JogFeedrate(axis) {
	const controlName = axis.startsWith("Z") ? "controlpanel_z_feedrate" : "controlpanel_xy_feedrate";
	const valueDef = buildFeedRateValueDef(axis);
	const feedrateValue = id(controlName).value;
	const errorList = valueIsFloat(feedrateValue, valueDef);
	if (errorList.length) {
		// error text was "Feedrate value must be at least 1 mm/min!"
		alertdlg(translate_text_item("Out of range"), errorList.join("\n"));
		return valueDef.defValue;
	}
	return Number.parseFloat(feedrateValue);
}

/** This is extensively used in the jog dial SVGs */
function SendJogcommand(cmd, feedrate) {
	if (getChecked("lock_UI") !== "false") {
		return;
	}

	const common = new Common();

	const controlName = feedrate.startsWith("Z") ? "controlpanel_z_feedrate" : "controlpanel_xy_feedrate";
	const prefName = feedrate.startsWith("Z") ? "z_feedrate" : "xy_feedrate";
	const valueDef = buildFeedRateValueDef(feedrate);

	let letter = "Z";
	let jCmd = "";
	if (common.grblaxis > 3) {
		letter = "Axis";
		valueDef.label = valueDef.label.replace("Z axis", letter);
		jCmd = cmd.replace("Z", id("control_select_axis").value);
	}

	const feedrateValue = id(controlName).value;
	const errorList = valueIsFloat(feedrateValue, valueDef);

	if (errorList.length) {
		// error text was "(something) Feedrate value must be at least 1 mm/min!"
		alertdlg(translate_text_item("Out of range"), errorList.join("\n"));
		id(controlName).value = feedrate.startsWith("Z") ? preferenceslist[0].z_feedrate : preferenceslist[0].xy_feedrate ;
		return;
	}

	const command = `$J=G91 G21 F${feedrateValue} ${jCmd}`;
	console.log(command);
	SendPrinterCommand(command, true, get_Position);
}

function onXYvelocityChange() {
	const feedratevalue = Number.parseFloat(id('control_xy_velocity').value);
	if (feedratevalue < 1 || feedratevalue > 9999 || Number.isNaN(feedratevalue) || (feedratevalue === null)) {
		//we could display error but we do not
	}
}

function onZvelocityChange() {
	const feedratevalue = Number.parseFloat(id('control_z_velocity').value);
	if (feedratevalue < 1 || feedratevalue > 999 || Number.isNaN(feedratevalue) || (feedratevalue === null)) {
		//we could display error but we do not
	}
}


function processMacroSave(answer) {
	if (answer === "ok") {
		//console.log("now rebuild list");
		control_build_macro_ui();
	}
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

function control_build_macro_ui() {
	const common = new Common();
	const actions = [];

	let content = "<div class='tooltip'>";
	content += "<span class='tooltip-text'>Manage macros</span>"
	content += "<button id='control_btn_show_macro_dlg' class='btn btn-primary'>";
	actions.push({ id: "control_btn_show_macro_dlg", type: "click", method: (event) => showmacrodlg(processMacroSave) });
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
	for (let i = 0; i < 9; i++) {
		const entry = common.control_macrolist[i];
		content += control_build_macro_button(i, entry);
		actions.push({ id: `control_macro_${i}`, type: "click", method: (event) => macro_command(entry.target, entry.filename) });
	}
	id("Macro_list").innerHTML = content;
	// biome-ignore lint/complexity/noForEach: <explanation>
	actions.forEach((action) => {
		id(action.id).addEventListener(action.type, (event) => action.method);
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
