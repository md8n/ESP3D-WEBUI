import {
	get_icon_svg,
	conErr,
	stdErrMsg,
	displayBlock,
	displayNone,
	id,
	setChecked,
	setClassName,
	setHTML,
	alertdlg,
	SendGetHttp,
	trans_text_item,
	CheckForHttpCommLock,
} from "./common.js";

let config_configList = [];
let config_override_List = [];
let config_lastindex = -1;
let config_error_msg = "";
let config_lastindex_is_override = false;
const commandtxt = "$$";
let is_override_config = false;

const refreshconfig = (is_override) => {
	if (CheckForHttpCommLock()) {
		return;
	}
	is_override_config = false;
	if (typeof is_override !== "undefined" && is_override) {
		is_override_config = is_override;
	}
	config_display_override(is_override_config);
	displayBlock("config_loader");
	displayNone(["config_list_content", "config_status", "config_refresh_btn"]);
	if (!is_override) {
		config_configList = [];
	}
	config_override_List = [];
	getprinterconfig(is_override_config);
};

function config_display_override(display_it) {
	if (display_it) {
		displayBlock("config_overrdisplayBlocke_list_content");
		displayNone("config_main_content");
		setChecked("config_override_file", true);
	} else {
		id("config_overrdisplayNonee_list_content");
		displayBlock("config_main_content");
		setChecked("config_main_file", true);
	}
}

function getprinterconfig(is_override = false) {
	is_override_config = is_override;
	if (is_override) {
		config_override_List.length = 0;
	}
	const cmd = `/command?plain=${encodeURIComponent((is_override) ? "M503" : commandtxt)}`;
	SendGetHttp(cmd);
}

const Apply_config_override = () => {
	const cmd = `/command?plain=${encodeURIComponent("M500")}`;
	SendGetHttp(cmd, getESPUpdateconfigSuccess);
};

const Delete_config_override = () => {
	const cmd = `/command?plain=${encodeURIComponent("M502")}`;
	SendGetHttp(cmd, getESPUpdateconfigSuccess);
};

function getESPUpdateconfigSuccess(response) {
	refreshconfig(true);
}

function build_HTML_config_list() {
	let content = "";
	const array_len = is_override_config
		? config_override_List.length
		: config_configList.length;
	const prefix = is_override_config ? "override" : "";
	const actions = [];
	for (let i = 0; i < array_len; i++) {
		const item = is_override_config
			? config_override_List[i]
			: config_configList[i];
		content += "<tr>";
		if (item.showcomment) {
			content += "<td colspan='3' class='info'>";
			content += item.comment;
		} else {
			const fullpref = `${prefix}${i}`;
			const statusId = `status_config_${fullpref}`;
			const revertId = `btn_revert_config_${fullpref}`;
			const configId = `config_${fullpref}}`;
			const iconId = `icon_config_${fullpref}`;
			const btnCfgId = `btn_config_${fullpref}`;

			content += `<td style='vertical-align:middle;'>${item.label}</td>`;
			content += "<td style='vertical-align:middle;'>";
			content += "<table><tr><td>";
			content += `<div id='${statusId}' class='form-group has-feedback' style='margin: auto;'>`;
			content += "<div class='item-flex-row'>";
			content += "<table><tr><td>";
			content += "<div class='input-group'>";
			content += "<span class='input-group-btn'>";
			content += `<button id='${revertId}' class='btn btn-default btn-svg'>${get_icon_svg("repeat")}</button>`;
			content += "</span>";
			actions.push({ id: revertId, type: "click", method: (event) => config_revert_to_default(i, is_override_config) });
			content += "<input class='hide_it'></input>";
			content += "</div>";
			content += "</td>";
			content += "<td>";
			content += "<div class='input-group'>";
			content += "<span class='input-group-addon hide_it'></span>";
			content += `<input id='${configId}' type='text' class='form-control' style='width:auto' value='${item.defaultvalue}'/>`;
			actions.push({ id: configId, type: "keyup", method: (event) => config_checkchange(i, is_override_config) });
			content += `<span id='${iconId}'class='form-control-feedback ico_feedback' ></span>`;
			content += "<span class='input-group-addon hide_it'></span>";
			content += "</div>";
			content += "</td></tr></table>";
			content += "<div class='input-group'>";
			content += "<input class='hide_it'></input>";
			content += "<span class='input-group-btn'>";
			content += `<button id='${btnCfgId}' class='btn btn-default' translate english_content='Set'>${trans_text_item("Set")}</button>&nbsp;`;
			content += "</span>";
			actions.push({ id: btnCfgId, type: "click", method: (event) => configGetvalue(i, is_override_config) });
			content += "</div>";
			content += "</div>";
			content += "</div>";
			content += "</td></tr></table>";
			content += "</td>";
			content += "<td style='vertical-align:middle'>";
			content += item.help;
		}
		content += "</td>";
		content += "</tr>\n";
	}
	if (content.length > 0) {
		setHTML("config_list_data", content);
		// biome-ignore lint/complexity/noForEach: <explanation>
		actions.forEach((action) => {
			const elem = id(action.id);
			if (elem) {
				elem.addEventListener(action.type, action.method);
			}
		});
	}
	displayNone(["config_loader", "config_status"]);
	displayBlock(["config_list_content", "config_refresh_btn"]);
}

function config_check_value(value, index, is_override) {
	let isvalid = true;
	const valTrim = value.trim();
	if (!valTrim || valTrim[0] === "-" || valTrim.includes.indexOf("#") !== -1) {
		isvalid = false;
		config_error_msg = trans_text_item("cannot have '-', '#' char or be empty");
	}
	return isvalid;
}

function process_config_answer(response_text) {
	let result = true;
	const tlines = response_text.split("\n");
	//console.log(tlines.length);
	//console.log("Config has " + tlines.length + " entries");
	let vindex = 0;
	for (let i = 0; i < tlines.length; i++) {
		if (create_config_entry(tlines[i], vindex)) {
			vindex++;
		}
	}
	if (vindex > 0) {
		build_HTML_config_list();
	} else {
		result = false;
	}

	return result;
}

function create_config_entry(sentry, vindex) {
	if (!is_config_entry(sentry)) {
		return false;
	}
	let ssentry = sentry.replaceAll("\t", " ")
	while (ssentry.indexOf("  ") > -1) {
		ssentry = ssentry.replaceAll("  ", " ");
	}
	while (ssentry.indexOf("##") > -1) {
		ssentry = ssentry.replaceAll("##", "#");
	}

	const iscomment = is_config_commented(ssentry);
	if (iscomment) {
		while (ssentry.indexOf("<") !== -1) {
			const m = ssentry.replace("<", "&lt;");
			ssentry = m.replace(">", "&gt;");
		}
		const config_entry = {
			comment: ssentry,
			showcomment: true,
			index: vindex,
			label: "",
			help: "",
			defaultvalue: "",
			cmd: "",
		};
		if (is_override_config) {
			config_override_List.push(config_entry);
		} else {
			config_configList.push(config_entry);
		}
	} else {
		const slabel = get_config_label(ssentry);
		const svalue = get_config_value(ssentry);
		const shelp = get_config_help(ssentry);
		const scmd = get_config_command(ssentry);
		const config_entry = {
			comment: ssentry,
			showcomment: false,
			index: vindex,
			label: slabel,
			help: shelp,
			defaultvalue: svalue,
			cmd: scmd,
			is_override: is_override_config,
		};
		if (is_override_config) {
			config_override_List.push(config_entry);
		} else {
			config_configList.push(config_entry);
		}
	}
	return true;
}
//check it is valid entry
function is_config_entry(sline) {
	const line = sline.trim();
	if (line.length === 0) return false;
	return line.indexOf("$") === 0 && line.indexOf("=") !== -1;
}

const get_config_label = (sline) => sline.trim().split("=")[0];

function get_config_value(sline) {
	const tline2 = sline.trim().split("=");
	return tline2.length > 1 ? tline2[1] : "???";
}

const get_config_help = (sline) => (is_override_config) ? "" : inline_help(get_config_label(sline));

const get_config_command = (sline) => `${get_config_label(sline)}=`;

function is_config_commented(sline) {
	const line = sline.trim();
	if (!line.length) {
		return false;
	}
	return (is_override_config) ? line.startsWith(";") : false;
}

const suffix = (index, is_override) => `${is_override ? "_override" : ""}${index}`;

const setInput = (id_suffix, btnType) => {
	let hasType = ""; // default
	let iconSVG = ""; // default
	switch (btnType) {
		case "danger": hasType = "has-error ico_feedback"; iconSVG = get_icon_svg("remove"); break;
		case "warning": hasType = "has-warning ico_feedback"; iconSVG = get_icon_svg("warning-sign"); break;
		case "success": hasType = "has-success ico_feedback"; iconSVG = get_icon_svg("ok"); break;
	}
	const statusClass = `form-group has-feedback ${btnType === "default" ? "" : `${hasType}`}`;

	setClassName(`btn_config_${id_suffix}`, `btn btn-${btnType}`);
	setClassName(`icon_config_${id_suffix}`, `form-control-feedback ${hasType}`);
	setClassName(`status_config_${id_suffix}`, statusClass);
	setHTML(`icon_config_${id_suffix}`, iconSVG);
}

function config_revert_to_default(index, is_override) {
	const id_suffix = suffix(index, is_override);
	const item = is_override ? config_override_List[index] : config_configList[index];

	id(`config_${id_suffix}`).value = item.defaultvalue;
	setInput(id_suffix, "default");
}

function configGetvalue(index, is_override) {
	const id_suffix = suffix(index, is_override);
	const item = is_override ? config_override_List[index] : config_configList[index];

	//remove possible spaces
	value = id(`config_${id_suffix}`).value.trim();
	if (value === item.defaultvalue) {
		return;
	}
	//check validity of value
	const isvalid = config_check_value(value, index, is_override);
	//if not valid show error
	if (!isvalid) {
		setInput(id_suffix, "danger");

		alertdlg(trans_text_item("Out of range"), `${trans_text_item("Value ") + config_error_msg} !`);
	} else {
		//value is ok save it
		config_lastindex = index;
		config_lastindex_is_override = is_override;
		item.defaultvalue = value;

		setInput(id_suffix, "success");

		const cmd = `/command?plain=${encodeURIComponent(item.cmd + value)}`;
		SendGetHttp(cmd, setESPconfigSuccess, setESPconfigfailed);
	}
}

function config_checkchange(index, is_override) {
	//console.log("check " + "config_"+index);
	const id_suffix = suffix(index, is_override);
	const item = is_override ? config_override_List[index] : config_configList[index];

	const val = id(`config_${id_suffix}`).value.trim();
	//console.log("value: " + val);
	if (item.defaultvalue === val) {
		setInput(id_suffix, "default");
	} else if (config_check_value(val, index, is_override)) {
		setInput(id_suffix, "warning");
		//console.log("change ok");
	} else {
		setInput(id_suffix, "danger");
		//console.log("change bad");
	}
}

function setESPconfigSuccess(response) {
	//console.log(response);
}

const grbl_help = {
	$0: "Step pulse, microseconds",
	$1: "Step idle delay, milliseconds",
	$2: "Step port invert, mask",
	$3: "Direction port invert, mask",
	$4: "Step enable invert, boolean",
	$5: "Limit pins invert, boolean",
	$6: "Probe pin invert, boolean",
	$10: "Status report, mask",
	$11: "Junction deviation, mm",
	$12: "Arc tolerance, mm",
	$13: "Report inches, boolean",
	$20: "Soft limits, boolean",
	$21: "Hard limits, boolean",
	$22: "Homing cycle, boolean",
	$23: "Homing dir invert, mask",
	$24: "Homing feed, mm/min",
	$25: "Homing seek, mm/min",
	$26: "Homing debounce, milliseconds",
	$27: "Homing pull-off, mm",
	$30: "Max spindle speed, RPM",
	$31: "Min spindle speed, RPM",
	$32: "Laser mode, boolean",
	$100: "X steps/mm",
	$101: "Y steps/mm",
	$102: "Z steps/mm",
	$103: "A steps/mm",
	$104: "B steps/mm",
	$105: "C steps/mm",
	$110: "X Max rate, mm/min",
	$111: "Y Max rate, mm/min",
	$112: "Z Max rate, mm/min",
	$113: "A Max rate, mm/min",
	$114: "B Max rate, mm/min",
	$115: "C Max rate, mm/min",
	$120: "X Acceleration, mm/sec^2",
	$121: "Y Acceleration, mm/sec^2",
	$122: "Z Acceleration, mm/sec^2",
	$123: "A Acceleration, mm/sec^2",
	$124: "B Acceleration, mm/sec^2",
	$125: "C Acceleration, mm/sec^2",
	$130: "X Max travel, mm",
	$131: "Y Max travel, mm",
	$132: "Z Max travel, mm",
	$133: "A Max travel, mm",
	$134: "B Max travel, mm",
	$135: "C Max travel, mm",
};

const inline_help = (label) => trans_text_item((label in grbl_help) ? grbl_help[label] : "");

function setESPconfigfailed(error_code, response) {
	const errMsg = stdErrMsg(error_code, response);
	alertdlg(trans_text_item("Set failed"), errMsg);
	conErr(errMsg);

	const id_suffix = suffix(config_lastindex, config_lastindex_is_override);
	setInput(id_suffix, "error");
}

function getESPconfigSuccess(response) {
	//console.log(response);
	if (process_config_answer(response)) {
		return;
	}

	getESPconfigfailed(406, trans_text_item("Wrong data"));
	displayNone(["config_loader", "config_status"]);
	displayBlock(["config_list_content", "config_refresh_btn"]);
}

function getESPconfigfailed(error_code, response) {
	conErr(error_code, response);
	displayNone("config_loader");
	displayBlock(["config_status", "config_refresh_btn"]);
	setHTML("config_status", stdErrMsg(error_code, response, trans_text_item("Failed")));
}


export { Apply_config_override, Delete_config_override, refreshconfig, getESPconfigSuccess };
