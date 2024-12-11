var ESP3D_authentication = false
var log_off = false
var async_webcommunication = false
var websocket_port = 0
var websocket_ip = ''
var esp_hostname = 'ESP3D WebUI'
var EP_HOSTNAME
var EP_STA_SSID
var EP_STA_PASSWORD
var EP_STA_IP_MODE
var EP_STA_IP_VALUE
var EP_STA_GW_VALUE
var EP_STA_MK_VALUE
var EP_WIFI_MODE
var EP_AP_SSID
var EP_AP_PASSWORD
var EP_AP_IP_VALUE
var EP_BAUD_RATE = 112
var EP_AUTH_TYPE = 119
var EP_TARGET_FW = 461
var EP_IS_DIRECT_SD = 850
var EP_PRIMARY_SD = 851
var EP_SECONDARY_SD = 852
var EP_DIRECT_SD_CHECK = 853
var SETTINGS_AP_MODE = 1
var SETTINGS_STA_MODE = 2
var SETTINGS_FALLBACK_MODE = 3

var last_ping = 0
var enable_ping = true
var esp_error_message = ''
var esp_error_code = 0

//Check for IE
//Edge
//Chrome
function browser_is(bname) {
  var ua = navigator.userAgent
  switch (bname) {
    case 'IE':
      if (ua.indexOf('Trident/') != -1) return true
      break
    case 'Edge':
      if (ua.indexOf('Edge') != -1) return true
      break
    case 'Chrome':
      if (ua.indexOf('Chrome') != -1) return true
      break
    case 'Firefox':
      if (ua.indexOf('Firefox') != -1) return true
      break
    case 'MacOSX':
      if (ua.indexOf('Mac OS X') != -1) return true
      break
    default:
      return false
  }
  return false
}

window.onload = function () {
  //to check if javascript is disabled like in anroid preview
  displayNone('loadingmsg')
  console.log('Connect to board')
  connectdlg()
  //ugly hack for IE
  console.log(navigator.userAgent)
  if (browser_is('IE')) {
    id('control-body').className = 'panel-body'
    id('command-body').className = 'panel-body'
    id('file-body').className = 'panel-body panel-height panel-max-height panel-scroll'
  }
  tabletInit()
}

function disable_items(item, state) {
  var liste = item.getElementsByTagName('*')
  for (i = 0; i < liste.length; i++) liste[i].disabled = state
}

function ontogglePing(forcevalue) {
  if (typeof forcevalue != 'undefined') enable_ping = forcevalue
  else enable_ping = !enable_ping
  if (enable_ping) {
    if (interval_ping != -1) clearInterval(interval_ping)
    last_ping = Date.now()
    interval_ping = setInterval(function () {
      check_ping()
    }, 10 * 1000)
    console.log('enable ping')
  } else {
    if (interval_ping != -1) clearInterval(interval_ping)
    console.log('disable ping')
  }
}

function ontoggleLock(forcevalue) {
  if (typeof forcevalue != 'undefined') id('lock_UI').checked = forcevalue
  if (id('lock_UI').checked) {
    id('lock_UI_btn_txt').innerHTML = translate_text_item('Unlock interface')
    disable_items(id('maintab'), true)
    disable_items(id('configtab'), true)
    id('progress_btn').disabled = false
    id('clear_monitor_btn').disabled = false
    id('monitor_enable_verbose_mode').disabled = false
    id('monitor_enable_autoscroll').disabled = false
    id('settings_update_fw_btn').disabled = true
    id('settings_restart_btn').disabled = true
    disable_items(id('JogUI'), false)
    displayNone('JogUI')
  } else {
    id('lock_UI_btn_txt').innerHTML = translate_text_item('Lock interface')
    disable_items(id('maintab'), false)
    disable_items(id('configtab'), false)
    id('settings_update_fw_btn').disabled = false
    id('settings_restart_btn').disabled = false
    id('JogUI').style.pointerEvents = 'auto'
  }
}

//window.addEventListener("resize", OnresizeWindow);

//function OnresizeWindow(){
//}
var total_boot_steps = 5
var current_boot_steps = 0

function display_boot_progress(step) {
  var val = 1
  if (typeof step != 'undefined') val = step
  current_boot_steps += val
  //console.log(current_boot_steps);
  //console.log(Math.round((current_boot_steps*100)/total_boot_steps));
  id('load_prg').value = Math.round((current_boot_steps * 100) / total_boot_steps)
}

function update_UI_firmware_target() {
  var fwName
  initpreferences()
  id('control_x_position_label').innerHTML = 'X'
  id('control_y_position_label').innerHTML = 'Y'
  id('control_z_position_label').innerHTML = 'Z'
  showAxiscontrols()

  fwName = 'FluidNC'
  last_grbl_pos = ''
  displayNone('configtablink')
  displayNone('auto_check_control')
  displayNone('progress_btn')
  displayNone('abort_btn')
  displayNone('motor_off_control')
  id('tab_title_configuration').innerHTML = '<span translate>GRBL configuration</span>'
  id('tab_printer_configuration').innerHTML = '<span translate>GRBL</span>'
  id('files_input_file').accept = ' .g, .gco, .gcode, .txt, .ncc, .G, .GCO, .GCODE, .TXT, .NC'
  displayInitial('zero_xyz_btn')
  displayInitial('zero_x_btn')
  displayInitial('zero_y_btn')
  if (grblaxis > 2) {
    //displayInitial('control_z_position_display');
    id('control_z_position_label').innerHTML = 'Zw'
  } else {
    hideAxiscontrols()
    displayNone('preferences_control_z_velocity_group')
  }
  if (grblaxis > 3) {
    id('zero_xyz_btn_txt').innerHTML += 'A'
    grblzerocmd += ' A0'
    build_axis_selection()
    displayBlock('preferences_control_a_velocity_group')
    id('positions_labels2').style.display = 'inline-grid'
    displayBlock('control_a_position_display')
  }
  if (grblaxis > 4) {
    displayBlock('control_b_position_display')
    id('zero_xyz_btn_txt').innerHTML += 'B'
    grblzerocmd += ' B0'
    displayBlock('preferences_control_b_velocity_group')
  }
  if (grblaxis > 5) {
    displayBlock('control_c_position_display')
    id('zero_xyz_btn_txt').innerHTML += 'C'
    displayBlock('preferences_control_c_velocity_group')
  } else {
    displayNone('control_c_position_display')
  }
  displayFlex('grblPanel')
  // id('FW_github').href = 'https://github.com/bdring/FluidNC';
  displayBlock('settings_filters')
  id('control_x_position_label').innerHTML = 'Xw'
  id('control_y_position_label').innerHTML = 'Yw'

  EP_HOSTNAME = 'Hostname'
  EP_STA_SSID = 'Sta/SSID'
  EP_STA_PASSWORD = 'Sta/Password'
  EP_STA_IP_MODE = 'Sta/IPMode'
  EP_STA_IP_VALUE = 'Sta/IP'
  EP_STA_GW_VALUE = 'Sta/Gateway'
  EP_STA_MK_VALUE = 'Sta/Netmask'
  EP_WIFI_MODE = 'WiFi/Mode'
  EP_AP_SSID = 'AP/SSID'
  EP_AP_PASSWORD = 'AP/Password'
  EP_AP_IP_VALUE = 'AP/IP'
  SETTINGS_AP_MODE = 2
  SETTINGS_STA_MODE = 1

  if (typeof id('fwName') != 'undefined') id('fwName').innerHTML = fwName
  //SD image or not
  if (direct_sd && typeof id('showSDused') != 'undefined')
    id('showSDused').innerHTML =
      "<svg width='1.3em' height='1.2em' viewBox='0 0 1300 1200'><g transform='translate(50,1200) scale(1, -1)'><path  fill='#777777' d='M200 1100h700q124 0 212 -88t88 -212v-500q0 -124 -88 -212t-212 -88h-700q-124 0 -212 88t-88 212v500q0 124 88 212t212 88zM100 900v-700h900v700h-900zM500 700h-200v-100h200v-300h-300v100h200v100h-200v300h300v-100zM900 700v-300l-100 -100h-200v500h200z M700 700v-300h100v300h-100z' /></g></svg>"
  else id('showSDused').innerHTML = ''
  return fwName
}

function Set_page_title(page_title) {
  if (typeof page_title != 'undefined') esp_hostname = page_title
  document.title = esp_hostname
}

function initUI() {
  console.log('Init UI')
  if (ESP3D_authentication) connectdlg(false)
  AddCmd(display_boot_progress)
  //initial check
  if (typeof target_firmware == 'undefined' || typeof web_ui_version == 'undefined' || typeof direct_sd == 'undefined')
    alert('Missing init data!')
  //check FW
  update_UI_firmware_target()
  //set title using hostname
  Set_page_title()
  //update UI version
  if (typeof id('UI_VERSION') != 'undefined') id('UI_VERSION').innerHTML = web_ui_version
  //update FW version
  if (typeof id('FW_VERSION') != 'undefined') id('FW_VERSION').innerHTML = fw_version
  // Get the element with id="defaultOpen" and click on it
  id('tablettablink').click()

  if (typeof id('grblcontroltablink') !== 'undefined') {
    id('grblcontroltablink').click()
  }

  //removeIf(production)
  console.log(JSON.stringify(translated_list))
  //endRemoveIf(production)
  initUI_2()

  setTimeout(tryAutoReport, 500); //Not sure why this needs a delay but it seems like a hack
}

function initUI_2() {
  AddCmd(display_boot_progress)
  //get all settings from ESP3D
  console.log('Get settings')
  //query settings but do not update list in case wizard is showed
  refreshSettings(true)
  initUI_3()
}

function initUI_3() {
  AddCmd(display_boot_progress)
  //init panels
  console.log('Get macros')
  init_controls_panel()
  init_grbl_panel()
  console.log('Get preferences')
  getpreferenceslist()
  initUI_4()
}

function initUI_4() {
	AddCmd(display_boot_progress);
	init_command_panel();
	init_files_panel(false);
	//check if we need setup
	if (target_firmware == "???") {
		console.log("Launch Setup");
		AddCmd(display_boot_progress);
		closeModal("Connection successful");
		setupdlg();
	} else {
		//wizard is done UI can be updated
		setup_is_done = true;
		do_not_build_settings = false;
		AddCmd(display_boot_progress);
		build_HTML_setting_list(current_setting_filter);
		AddCmd(closeModal);
		AddCmd(show_main_UI);
	}
}

function show_main_UI() {
  displayUndoNone('main_ui')
}
