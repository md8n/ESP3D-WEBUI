import {
	connectdlg,
	Common,
	displayBlock,
	displayFlex,
	displayNone,
	id,
	setHTML,
	closeModal,
	init_command_panel,
	ControlsPanel,
	init_controls_panel,
	getpreferenceslist,
	initpreferences,
	init_files_panel,
	build_axis_selection,
	tryAutoReport,
	grblpanel,
	build_HTML_setting_list,
	refreshSettings,
	navbar,
	setupdlg,
	tabletInit,
} from "./common.js";

window.onload = () => {
	//to check if javascript is disabled like in android preview
	displayNone("loadingmsg");
	console.log("Connect to board");

	// These are all falsey, indicating nothing has been loaded
	let connectDlg = "";
	let controlsPanel = "";
	let navbarLoaded = "";

	let failSafe = 10;

	let startUpInt = setInterval(() => {
		// Check for various key HTML panels and load them up
		if (!connectDlg && id("connectdlg.html")) {
			connectDlg = "loading";
			connectdlg();
			connectDlg = "loaded";
		}

		if (!controlsPanel && id("controlPanel")) {
			controlsPanel = "loading";
			ControlsPanel();
			controlsPanel = "loaded";
		}

		if (!navbarLoaded && id("navbar")) {
			navbarLoaded = "loading";
			navbar();
			tabletInit();
			navbarLoaded = "loaded";
		}

		if ((connectDlg && controlsPanel && navbarLoaded) || failSafe <= 0) {
			clearInterval(startUpInt);
			startUpInt = null;
		}

		// Ensure that we always break out of this
		failSafe--;
	}, 500);
};

//window.addEventListener("resize", OnresizeWindow);

//function OnresizeWindow(){
//}
const total_boot_steps = 5;
let current_boot_steps = 0;

function display_boot_progress(step) {
	let val = 1;
	if (typeof step !== "undefined") {
		val = step;
	}
	current_boot_steps += val;
	//console.log(current_boot_steps);
	//console.log(Math.round((current_boot_steps*100)/total_boot_steps));
	id("load_prg").value = Math.round((current_boot_steps * 100) / total_boot_steps);
}

function update_UI_firmware_target() {
	const common = new Common();
	initpreferences();
	setHTML("control_x_position_label", "X");
	setHTML("control_y_position_label", "Y");
	setHTML("control_z_position_label", "Z");
	showAxiscontrols();

	const fwName = "FluidNC";
	last_grbl_pos = "";
	displayNone(["configtablink", "auto_check_control", "progress_btn", "abort_btn", "motor_off_control"]);
	setHTML(
		"tab_title_configuration",
		"<span translate>GRBL configuration</span>",
	);
	setHTML("tab_printer_configuration", "<span translate>GRBL</span>");
	const fif = id("files_input_file");
	if (fif) {
		fif.accept = " .g, .gco, .gcode, .txt, .ncc, .G, .GCO, .GCODE, .TXT, .NC";
	}
	displayInitial("zero_xyz_btn");
	displayInitial("zero_x_btn");
	displayInitial("zero_y_btn");
	if (common.grblaxis > 2) {
		//displayInitial('control_z_position_display');
		setHTML("control_z_position_label", "Zw");
	} else {
		hideAxiscontrols();
		displayNone("z_feedrate_group");
	}
	if (common.grblaxis > 3) {
		id("zero_xyz_btn_txt").innerHTML += "A";
		common.grblzerocmd += " A0";
		build_axis_selection();
		displayBlock(["a_feedrate_group", "control_a_position_display"]);
		id("positions_labels2").style.display = "inline-grid";
	}
	if (common.grblaxis > 4) {
		displayBlock(["control_b_position_display", "b_feedrate_group"]);
		id("zero_xyz_btn_txt").innerHTML += "B";
		common.grblzerocmd += " B0";
	}
	if (common.grblaxis > 5) {
		displayBlock(["control_c_position_display", "c_feedrate_group"]);
		id("zero_xyz_btn_txt").innerHTML += "C";
	} else {
		displayNone("control_c_position_display");
	}
	displayFlex("grblPanel");
	grblpanel();
	// id('FW_github').href = 'https://github.com/bdring/FluidNC';
	displayBlock("settings_filters");
	setHTML("control_x_position_label", "Xw");
	setHTML("control_y_position_label", "Yw");

	// Swap AP Mode and STA Mode
	common.SETTINGS_AP_MODE = 2;
	common.SETTINGS_STA_MODE = 1;

	setHTML("fwName", fwName);
	//SD image or not
	setHTML(
		"showSDused",
		direct_sd
			? "<svg width='1.3em' height='1.2em' viewBox='0 0 1300 1200'><g transform='translate(50,1200) scale(1, -1)'><path  fill='#777777' d='M200 1100h700q124 0 212 -88t88 -212v-500q0 -124 -88 -212t-212 -88h-700q-124 0 -212 88t-88 212v500q0 124 88 212t212 88zM100 900v-700h900v700h-900zM500 700h-200v-100h200v-300h-300v100h200v100h-200v300h300v-100zM900 700v-300l-100 -100h-200v500h200z M700 700v-300h100v300h-100z' /></g></svg>"
			: "",
	);

	return fwName;
}

function Set_page_title(page_title) {
	const common = new Common();
	if (typeof page_title !== "undefined") {
		common.esp_hostname = page_title;
	}
	document.title = common.esp_hostname;
}

function initUI() {
	console.log("Init UI");
	const common = new Common();
	if (common.ESP3D_authentication) {
		connectdlg(false);
	}
	AddCmd(display_boot_progress);
	//initial check
	if (
		typeof target_firmware === "undefined" ||
		typeof web_ui_version === "undefined" ||
		typeof direct_sd === "undefined"
	)
		alert("Missing init data!");
	//check FW
	update_UI_firmware_target();
	//set title using hostname
	Set_page_title();
	//update UI version
	setHTML("UI_VERSION", web_ui_version);
	//update FW version
	setHTML("FW_VERSION", fw_version);
	// Get the element with id="defaultOpen" and click on it
	id("tablettablink").click();

	if (typeof id("grblcontroltablink") !== "undefined") {
		id("grblcontroltablink").click();
	}

	initUI_2();

	setTimeout(tryAutoReport, 500); //Not sure why this needs a delay but it seems like a hack
}

function initUI_2() {
	AddCmd(display_boot_progress);
	//get all settings from ESP3D
	console.log("Get settings");
	//query settings but do not update list in case wizard is showed
	refreshSettings(true);
	initUI_3();
}

function initUI_3() {
	AddCmd(display_boot_progress);
	//init panels
	console.log("Get macros");
	init_controls_panel();
	init_grbl_panel();
	console.log("Get preferences");
	getpreferenceslist();
	initUI_4();
}

function initUI_4() {
	AddCmd(display_boot_progress);
	init_command_panel();
	init_files_panel(false);
	//check if we need setup
	if (target_firmware === "???") {
		console.log("Launch Setup");
		AddCmd(display_boot_progress);
		closeModal("Connection successful");
		setupdlg();
	} else {
		//wizard is done UI can be updated
		const common = new Common();
		common.setup_is_done = true;
		common.do_not_build_settings = false;
		AddCmd(display_boot_progress);
		build_HTML_setting_list(common.current_setting_filter);
		AddCmd(closeModal);
		AddCmd(show_main_UI);
	}
}

function show_main_UI() {
	displayUndoNone("main_ui");
}

// var socket_response = ''
// var socket_is_settings = false
