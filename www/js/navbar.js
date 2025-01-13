import {
	displayNone,
	getChecked,
	id,
	setChecked,
	setHTML,
	get_icon_svg,
	opentab,
	creditsdlg,
	cameratab,
	configtab,
	changepassworddlg,
	showpreferencesdlg,
	translate_text_item,
	DisconnectLogin,
	setupdlg,
	settingstab,
} from "./common.js";

/** Set up the event handlers for the navbar */
const navbar = () => {
	id("toggleLockUI").addEventListener("click", (event) => ontoggleLock());

	id("showPreferencesDlg").addEventListener("click", (event) => showpreferencesdlg());
	id("showSetupDlg").addEventListener("click", (event) => setupdlg());
	id("showCreditsDlg").addEventListener("click", (event) => creditsdlg());

	// Note: for `maintab` see dashtab.html
	id("maintablink").addEventListener("click", (event) => opentab(event, "maintab", "mainuitabscontent", "mainuitablinks"));
	id("camtablink").addEventListener("click", (event) => opentab(event, "cameratab", "mainuitabscontent", "mainuitablinks"));
	// id("configtablink").addEventListener("click", (event) => opentab(event, "configtab", "mainuitabscontent", "mainuitablinks"));
	id("settingtablink").addEventListener("click", (event) => opentab(event, "settingstab", "mainuitabscontent", "mainuitablinks"));
	id("tablettablink").addEventListener("click", (event) => opentab(event, "tablettab", "mainuitabscontent", "mainuitablinks"));

	id("password_menu").addEventListener("click", (event) => changepassworddlg());
	id("showLoginDlg").addEventListener("click", (event) => logindlg());
	id("logout_menu").addEventListener("click", (event) => confirmdlg(translate_text_item("Disconnection requested"), translate_text_item("Please confirm disconnection."), DisconnectLogin));

	const iconOptions = {t: "translate(50,1200) scale(1,-1)"};
	const buildTabLinkItem = (icon, label) => `${get_icon_svg(icon, iconOptions)}<span>${translate_text_item(label)}</span>`;
	// const buildConfigTabLinkItem = (icon, label) => `${get_icon_svg(icon, iconOptions)}<span id='tab_printer_configuration'><span>${translate_text_item(label)}</span></span>`;
	setHTML("maintablink", buildTabLinkItem("tasks", ""));
	setHTML("camtablink", buildTabLinkItem("facetime-video", "Camera"));
	// setHTML("configtablink", buildTabLinkItem("wrench", "Printer"));
	setHTML("settingtablink", buildTabLinkItem("scale", "FluidNC"));
	// setHTML("tablettablink", get_icon_svg("scale", iconOptions}));

	const iconDDOptions = iconOptions;
	iconDDOptions.color = "#337AB7";
	setHTML("dropdownSetup", get_icon_svg("align-justify", iconDDOptions));
	setHTML("dropdownAuth", `${get_icon_svg("align-justify", iconDDOptions)}<span id="current_ID"></span><span id="current_auth_level"></span>`);

	const buildDropDownItem = (title, icon) => `<span class="pull-right">${translate_text_item(title)}</span><span class="pull-left">${get_icon_svg(icon, iconOptions)}</span><span class="clearfix"></span>`
	// setHTML("FW_github", buildDropDownItem("Firmware", "cog"));
	// setHTML("UI_github", buildDropDownItem("Interface", "eye-open"));
	setHTML("showPreferencesDlg", buildDropDownItem("Preferences", "star"));
	setHTML("showSetupDlg", buildDropDownItem("Setup", "edit"));
	setHTML("showCreditsDlg", buildDropDownItem("Credits", "thumbs-up"));

	setHTML("password_menu", buildDropDownItem("Password", "lock"));
	setHTML("showLoginDlg", buildDropDownItem("Login", "login"));
	setHTML("logout_menu", buildDropDownItem("Log out", "log-out"));

	cameratab();
	configtab();
	settingstab();
};

const enableItem = (itemName) => {
	const itemElem = id(itemName);
	if (!itemElem) {
		return;
	}

	itemElem.disabled = false;
};

const disable_items = (item, state) => {
	if (!item) {
	  return;
	}
	const liste = item.getElementsByTagName('*');
	for (let i = 0; i < liste.length; i++) {
	  liste[i].disabled = state;
	}
  }
  

const ontoggleLock = (forcevalue) => {
	if (typeof forcevalue !== "undefined") {
		setChecked("lock_UI", forcevalue);
	}

	const jogUIElem = id("JogUI");
	if (getChecked("lock_UI") !== "false") {
		setHTML("lock_UI_btn_txt", translate_text_item("Unlock interface"));
		disable_items(id("maintab"), true);
		disable_items(id("configtab"), true);
		enableItem("progress_btn");
		enableItem("clear_monitor_btn");
		enableItem("monitor_enable_verbose_mode");
		enableItem("monitor_enable_autoscroll");
		enableItem("settings_update_fw_btn");
		enableItem("settings_restart_btn");
		if (jogUIElem) {
			disable_items(jogUIElem, false);
			displayNone("JogUI");
		}
	} else {
		setHTML("lock_UI_btn_txt", translate_text_item("Lock interface"));
		disable_items(id("maintab"), false);
		disable_items(id("configtab"), false);
		enableItem("settings_update_fw_btn");
		enableItem("settings_restart_btn");
		if (jogUIElem) {
			jogUIElem.style.pointerEvents = "auto";
		}
	}
};

export { navbar, ontoggleLock };
