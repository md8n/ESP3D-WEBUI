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

let interval_status = -1;
let probe_progress_status = 0;
let grbl_error_msg = '';
let WCO = undefined;
let OVR = { feed: undefined, rapid: undefined, spindle: undefined };
let last_axis_letter = 'Z';

const axisNames = ['x', 'y', 'z', 'a', 'b', 'c'];

function setClickability(element, visible) {
  setDisplay(element, visible ? 'table-row' : 'none');
}

const autocheck = 'report_auto';
function getAutocheck() {
  return getChecked(autocheck)
}
function setAutocheck(flag) {
  setChecked(autocheck, flag)
}

function build_axis_selection() {
  const common = new Common();

  let html = "<select class='form-control wauto' id='control_select_axis' onchange='control_changeaxis()' >"
  for (let i = 3; i <= common.grblaxis; i++) {
    let letter
    if (i === 3) letter = 'Z'
    else if (i === 4) letter = 'A'
    else if (i === 5) letter = 'B'
    else if (i === 6) letter = 'C'
    html += `<option value='${letter}'`
    if (i === 3) html += ' selected '
    html += '>'
    html += letter
    html += '</option>\n'
  }

  html += '</select>\n'
  if (common.grblaxis > 3) {
    setHTML('axis_selection', html)
    setHTML('axis_label', `${translate_text_item('Axis')}:`)
    setClickability('axis_selection', true)
  }
}

function control_changeaxis() {
  const letter = getValue('control_select_axis')
  setHTML('axisup', `+${letter}`)
  setHTML('axisdown', `-${letter}`)
  setHTML('homeZlabel', ` ${letter} `)
  switch (last_axis_letter) {
    case 'Z':
      axis_feedrate[2] = getValue('control_z_velocity')
      break
    case 'A':
      axis_feedrate[3] = getValue('control_a_velocity')
      break
    case 'B':
      axis_feedrate[4] = getValue('control_b_velocity')
      break
    case 'C':
      axis_feedrate[5] = getValue('control_c_velocity')
      break
  }

  last_axis_letter = letter
  switch (last_axis_letter) {
    case 'Z':
      setValue('control_z_velocity', axis_feedrate[2])
      break
    case 'A':
      setValue('control_a_velocity', axis_feedrate[3])
      break
    case 'B':
      setValue('control_b_velocity', axis_feedrate[4])
      break
    case 'C':
      setValue('control_c_velocity', axis_feedrate[5])
      break
  }
}

function init_grbl_panel() {
  grbl_set_probe_detected(false)
}

function grbl_clear_status() {
  grbl_set_probe_detected(false)
  grbl_error_msg = ''
  setHTML('grbl_status_text', grbl_error_msg)
  setHTML('grbl_status', '')
}

function grbl_set_probe_detected(state) {
  const color = state ? 'green' : 'grey'
  const glyph = state ? 'ok-circle' : 'record'
  setHTML('touch_status_icon', get_icon_svg(glyph, '1.3em', '1.3em', color))
}

function onprobemaxtravelChange() {
  const travel = Number.parseFloat(getValue('grblpanel_probemaxtravel'))
  if (travel > 9999 || travel <= 0 || Number.isNaN(travel) || travel === null) {
    alertdlg(
      translate_text_item('Out of range'),
      translate_text_item('Value of maximum probe travel must be between 1 mm and 9999 mm !')
    )
    return false
  }
  return true
}

function onprobefeedrateChange() {
  const feedratevalue = Number.parseInt(getValue('grblpanel_probefeedrate'))
  if (feedratevalue <= 0 || feedratevalue > 9999 || Number.isNaN(feedratevalue) || feedratevalue === null) {
    alertdlg(
      translate_text_item('Out of range'),
      translate_text_item('Value of probe feedrate must be between 1 mm/min and 9999 mm/min !')
    )
    return false
  }
  return true
}

function onproberetractChange() {
  const thickness = Number.parseFloat(getValue('grblpanel_proberetract'))
  if (thickness < 0 || thickness > 999 || Number.isNaN(thickness) || thickness === null) {
    alertdlg(
      translate_text_item('Out of range'),
      translate_text_item('Value of probe retract must be between 0 mm and 9999 mm !')
    )
    return false
  }
  return true
}

function onprobetouchplatethicknessChange() {
  const thickness = Number.parseFloat(getValue('grblpanel_probetouchplatethickness'))
  if (thickness < 0 || thickness > 999 || Number.isNaN(thickness) || thickness === null) {
    alertdlg(
      translate_text_item('Out of range'),
      translate_text_item('Value of probe touch plate thickness must be between 0 mm and 9999 mm !')
    )
    return false
  }
  return true
}

function disablePolling() {
  const common = new Common();
  setAutocheck(false)
  // setValue('grblpanel_interval_status', 0);
  if (interval_status !== -1) {
    clearInterval(interval_status)
    interval_status = -1
  }

  grbl_clear_status()
  common.reportType = 'none'
}

function enablePolling() {
  const common = new Common();
  const interval = Number.parseFloat(getValue('grblpanel_interval_status'))
  if (!Number.isNaN(interval) && interval === 0) {
    if (interval_status !== -1) {
      clearInterval(interval_status)
    }
    disablePolling()
    reportNone()
    return
  }
  if (!Number.isNaN(interval) && interval > 0 && interval < 100) {
    if (interval_status !== -1) {
      clearInterval(interval_status)
    }
    interval_status = setInterval(() => { get_status() }, interval * 1000)
    common.reportType = 'polled'
    setChecked('report_poll', true)
    return
  }
  setValue('grblpanel_interval_status', 0)
  alertdlg(translate_text_item('Out of range'), translate_text_item('Value of auto-check must be between 0s and 99s !!'))
  disablePolling()
  reportNone()
}

function tryAutoReport() {
  const common = new Common();
  if (common.reportType === 'polled') {
    disablePolling();
  }
  common.reportType = "auto";
  const interval = id("grblpanel_autoreport_interval").value ?? 0;
  if (interval === 0) {
    enablePolling();
    return;
  }
  setChecked("report_auto", true);
  common.reportType = 'auto'
  SendPrinterCommand(
    `$Report/Interval=${interval}`,
    true,
    // Do nothing more on success
    () => { },

    // Fall back to polling if the firmware does not support auto-reports
    () => {
      enablePolling();
    },

    99.1,
    1
  )
}
function onAutoReportIntervalChange() {
  tryAutoReport()
}

function disableAutoReport() {
  SendPrinterCommand('$Report/Interval=0', true, null, null, 99.0, 1)
  setChecked('report_auto', false)
}

function reportNone() {
  const common = new Common();

  switch (common.reportType) {
    case 'polled':
      disablePolling()
      break
    case 'auto':
      disableAutoReport()
      break
  }
  setChecked('report_none', true)
  common.reportType = 'none'
}

function reportPolled() {
  const common = new Common();
  if (common.reportType === 'auto') {
    disableAutoReport()
  }
  enablePolling()
}

function onstatusIntervalChange() {
  enablePolling()
}

//TODO handle authentication issues
//errorfn cannot be NULL
function get_status() {
  //ID 114 is same as M114 as '?' cannot be an ID
  SendPrinterCommand('?', false, null, null, 114, 1)
}

function parseGrblStatus(response) {
  const grbl = {
    stateName: '',
    message: '',
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
  }
  const fields = response.replace('<', '').replace('>', '').split('|')
  // biome-ignore lint/complexity/noForEach: <explanation>
  fields.forEach((field) => {
    const tv = field.split(':')
    const tag = tv[0]
    const value = tv[1]
    switch (tag) {
      case 'Door':
        grbl.stateName = tag
        grbl.message = field
        break
      case 'Hold':
        grbl.stateName = tag
        grbl.message = field
        break
      case 'Run':
      case 'Jog':
      case 'Idle':
      case 'Home':
      case 'Alarm':
      case 'Check':
      case 'Sleep':
        grbl.stateName = tag
        break
      case 'Ln':
        grbl.lineNumber = Number.parseInt(value)
        break
      case 'MPos':
        grbl.mpos = value.split(',').map((v) => Number.parseFloat(v))
        break
      case 'WPos':
        grbl.wpos = value.split(',').map((v) => Number.parseFloat(v))
        break
      case 'WCO':
        grbl.wco = value.split(',').map((v) => Number.parseFloat(v))
        break
      case 'FS': {
        const rates = value.split(',')
        grbl.feedrate = Number.parseFloat(rates[0])
        grbl.spindleSpeed = Number.parseInt(rates[1])
        break
      }
      case 'Ov': {
        const rates = value.split(',')
        grbl.ovr = {
          feed: Number.parseInt(rates[0]),
          rapid: Number.parseInt(rates[1]),
          spindle: Number.parseInt(rates[2]),
        }
        break
      }
      case 'A':
        grbl.spindleDirection = 'M5'
        // biome-ignore lint/complexity/noForEach: <explanation>
        Array.from(value).forEach((v) => {
          switch (v) {
            case 'S':
              grbl.spindleDirection = 'M3'
              break
            case 'C':
              grbl.spindleDirection = 'M4'
              break
            case 'F':
              grbl.flood = true
              break
            case 'M':
              grbl.mist = true
              break
          }
        })
        break
      case 'SD': {
        const sdinfo = value.split(',')
        grbl.sdPercent = Number.parseFloat(sdinfo[0])
        grbl.sdName = sdinfo[1]
        break
      }
      case 'Pn':
        // pin status
        grbl.pins = value
        break
      default:
        // ignore other fields that might happen to be present
        break
    }
  })
  return grbl
}

function clickableFromStateName(state, hasSD) {
  const clickable = {
    resume: false,
    pause: false,
    reset: false,
  }
  switch (state) {
    case 'Run':
      clickable.pause = true
      clickable.reset = true
      break
    case 'Hold':
      clickable.resume = true
      clickable.reset = true
      break
    case 'Alarm':
      if (hasSD) {
        //guess print is stopped because of alarm so no need to pause
        clickable.resume = true
      }
      break
    case 'Idle':
    case 'Jog':
    case 'Home':
    case 'Check':
    case 'Sleep':
      break
  }
  return clickable
}

function show_grbl_position(wpos, mpos) {
  if (wpos) {
    wpos.forEach((pos, axis) => {
      const element = `control_${axisNames[axis]}_position`
      setHTML(element, pos.toFixed(3))
    })
  }
  if (mpos) {
    mpos.forEach((pos, axis) => {
      const element = `control_${axisNames[axis]}m_position`
      setHTML(element, pos.toFixed(3))
    })
  }
}

function show_grbl_status(stateName, message, hasSD) {
  if (stateName) {
    const clickable = clickableFromStateName(stateName, hasSD)
    setHTML('grbl_status', stateName)
    setHTML('systemStatus', stateName)
    if (stateName === 'Alarm') {
      id('systemStatus').classList.add('system-status-alarm')
    } else {
      id('systemStatus').classList.remove('system-status-alarm')
    }
    setClickability('sd_resume_btn', clickable.resume)
    setClickability('sd_pause_btn', clickable.pause)
    setClickability('sd_reset_btn', clickable.reset)
    if (stateName === 'Hold' && probe_progress_status !== 0) {
      probe_failed_notification()
    }
  }

  setHTML('grbl_status_text', translate_text_item(message))
  setClickability('clear_status_btn', stateName === 'Alarm')
}

function finalize_probing() {
  // No need for this when using the FluidNC-specific G38.6 probe command.
  // SendPrinterCommand("G90", true, null, null, 90, 1);
  probe_progress_status = 0
  setClickability('probingbtn', true)
  setClickability('probingtext', false)
  setClickability('sd_pause_btn', false)
  setClickability('sd_resume_btn', false)
  setClickability('sd_reset_btn', false)
}

function show_grbl_SD(sdName, sdPercent) {
  const status = sdName
    ? `${sdName}&nbsp;<progress id="print_prg" value=${sdPercent} max="100"></progress>${sdPercent}%`
    : ''
  setHTML('grbl_SD_status', status)
}

function show_grbl_probe_status(probed) {
  grbl_set_probe_detected(probed)
}

function SendRealtimeCmd(code) {
  const cmd = String.fromCharCode(code)
  SendPrinterCommand(cmd, false, null, null, code, 1)
}

function pauseGCode() {
  SendRealtimeCmd(0x21) // '!'
}

function resumeGCode() {
  SendRealtimeCmd(0x7e) // '~'
}

function stopGCode() {
  grbl_reset() // 0x18, ctrl-x
}

function grblProcessStatus(response) {
  const common = new Common();
  const grbl = parseGrblStatus(response);
  // Record persistent values of data
  if (grbl.wco) {
    WCO = grbl.wco;
  }
  if (grbl.ovr) {
    OVR = grbl.ovr;
  }
  if (grbl.mpos) {
    common.MPOS = grbl.mpos;
    if (WCO) {
      common.WPOS = grbl.mpos.map((v, index) => v - WCO[index]);
    }
  } else if (grbl.wpos) {
    common.WPOS = grbl.wpos;
    if (WCO) {
      common.MPOS = grbl.wpos.map((v, index) => v + WCO[index]);
    }
  }
  show_grbl_position(common.WPOS, common.MPOS);
  show_grbl_status(grbl.stateName, grbl.message, grbl.sdName);
  show_grbl_SD(grbl.sdName, grbl.sdPercent);
  show_grbl_probe_status(grbl.pins && grbl.pins.indexOf('P') !== -1);
  tabletGrblState(grbl, response);
}

function grbl_reset() {
  if (probe_progress_status !== 0) probe_failed_notification()
  SendRealtimeCmd(0x18)
}

function grblGetProbeResult(response) {
  const tab1 = response.split(':')
  if (tab1.length > 2) {
    const status = tab1[2].replace(']', '')
    if (Number.parseInt(status.trim()) === 1) {
      if (probe_progress_status !== 0) {
        const cmd =
          `$J=G90 G21 F1000 Z${Number.parseFloat(getValue('probetouchplatethickness')) + Number.parseFloat(getValue('grblpanel_proberetract'))}`
        SendPrinterCommand(cmd, true, null, null, 0, 1)
        finalize_probing()
      }
    } else {
      probe_failed_notification()
    }
  }
}

function probe_failed_notification() {
  finalize_probing()
  alertdlg(translate_text_item('Error'), translate_text_item('Probe failed !'))
  beep(3, 140, 261)
}
const modalModes = [
  { name: 'motion', values: ['G80', 'G0', 'G1', 'G2', 'G3', 'G38.1', 'G38.2', 'G38.3', 'G38.4'] },
  { name: 'wcs', values: ['G54', 'G55', 'G56', 'G57', 'G58', 'G59'] },
  { name: 'plane', values: ['G17', 'G18', 'G19'] },
  { name: 'units', values: ['G20', 'G21'] },
  { name: 'distance', values: ['G90', 'G91'] },
  { name: 'arc_distance', values: ['G90.1', 'G91.1'] },
  { name: 'feed', values: ['G93', 'G94'] },
  { name: 'program', values: ['M0', 'M1', 'M2', 'M30'] },
  { name: 'spindle', values: ['M3', 'M4', 'M5'] },
  { name: 'mist', values: ['M7'] }, // Also M9, handled separately
  { name: 'flood', values: ['M8'] }, // Also M9, handled separately
  { name: 'parking', values: ['M56'] },
]

function grblGetModal(msg) {
  const common = new Common();
  common.modal.modes = msg.replace('[GC:', '').replace(']', '')
  const modes = common.modal.modes.split(' ')
  common.modal.parking = undefined // Otherwise there is no way to turn it off
  common.modal.program = '' // Otherwise there is no way to turn it off
  // biome-ignore lint/complexity/noForEach: <explanation>
  modes.forEach((mode) => {
    if (mode === 'M9') {
      common.modal.flood = mode
      common.modal.mist = mode
    } else {
      if (mode.charAt(0) === 'T') {
        common.modal.tool = mode.substring(1)
      } else if (mode.charAt(0) === 'F') {
        common.modal.feedrate = mode.substring(1)
      } else if (mode.charAt(0) === 'S') {
        common.modal.spindle = mode.substring(1)
      } else {
        // biome-ignore lint/complexity/noForEach: <explanation>
        modalModes.forEach((modeType) => {
          // biome-ignore lint/complexity/noForEach: <explanation>
          modeType.values.forEach((s) => {
            if (mode === s) {
              common.modal[modeType.name] = mode
            }
          })
        })
      }
    }
  })
  tabletUpdateModal()
}

// Whenever [MSG: BeginData] is seen, subsequent lines are collected
// in collectedData, until [MSG: EndData] is seen.  Then collectHander()
// is called, if it is defined.
// To run a command that generates such data, first set collectHandler
// to a callback function to receive the data, then issue the command.
let collecting = false
let collectedData = ''
let collectHandler = undefined

// Settings are collected separately because they bracket the data with
// the legacy protocol messages  $0= ... ok
let collectedSettings = null

async function handleCalibrationData(measurements) {
  document.querySelector('#messages').textContent += '\nComputing... This may take several minutes'
  sendCommand("$ACKCAL");
  const common = new Common();
  await sleep(500);
  try {
    common.calibrationResults = await findMaxFitness(measurements);
  } catch (error) {
    console.error('An error occurred:', error)
  }
}

function grblHandleMessage(msg) {
  tabletShowMessage(msg, collecting)

  // We handle these two before collecting data because they can be
  // sent at any time, maybe requested by a timer.

  if (msg.startsWith('CLBM:')) {
    const validJsonMSG = msg
      .replace(/(\b(?:bl|br|tr|tl)\b):/g, '"$1":')
      .replace('CLBM:', '')
      .replace(/,]$/, ']')
    const measurements = JSON.parse(validJsonMSG)
    handleCalibrationData(measurements)
  }
  if (msg.startsWith('<')) {
    grblProcessStatus(msg)
    return
  }
  if (msg.startsWith('[GC:')) {
    grblGetModal(msg)
    console.log(msg)
    return
  }

  // Block data collection
  if (collecting) {
    if (msg.startsWith('[MSG: EndData]')) {
      collecting = false
      // Finish collecting data
      if (collectHandler) {
        collectHandler(collectedData)
        collectHandler = undefined
      }
      collectedData = ''
    } else {
      // Continue collecting data
      collectedData += msg
    }
    return
  }
  if (msg.startsWith('[MSG: BeginData]')) {
    // Start collecting data
    collectedData = ''
    collecting = true
    return
  }

  // Setting collection
  const common = new Common();
  if (collectedSettings) {
    if (msg.startsWith('ok')) {
      // Finish collecting settings;
      getESPconfigSuccess(collectedSettings)
      collectedSettings = null;
      if (common.grbl_errorfn) {
        common.grbl_errorfn();
        common.grbl_errorfn = null;
        common.grbl_processfn = null;
      }
    } else {
      // Continue collecting settings
      collectedSettings += msg;
    }
    return;
  }
  if (msg.startsWith('$0=') || msg.startsWith('$10=')) {
    // Start collecting settings
    collectedSettings = msg;
    return;
  }

  // Handlers for standard Grbl protocol messages

  if (msg.startsWith('ok')) {
    if (common.grbl_processfn) {
      common.grbl_processfn();
      common.grbl_processfn = null;
      common.grbl_errorfn = null;
    }
    return
  }
  if (msg.startsWith('[PRB:')) {
    grblGetProbeResult(msg)
    return
  }
  if (msg.startsWith('[MSG:')) {
    return
  }
  if (msg.startsWith('error:')) {
    if (common.grbl_errorfn) {
      common.grbl_errorfn()
      common.grbl_errorfn = null
      common.grbl_processfn = null;
    }
  }
  if (msg.startsWith('error:') || msg.startsWith('ALARM:') || msg.startsWith('Hold:') || msg.startsWith('Door:')) {
    if (probe_progress_status !== 0) {
      probe_failed_notification()
    }
    if (grbl_error_msg.length === 0) {
      grbl_error_msg = translate_text_item(msg.trim())
    }
    return
  }
  if (msg.startsWith('Grbl ')) {
    console.log('Reset detected')
    return
  }
}

function StartProbeProcess() {
  // G38.6 is FluidNC-specific.  It is like G38.2 except that the units
  // are always G21 units, i.e. mm in the usual case, and distance is
  // always incremental.  This avoids problems with probing when in G20
  // inches mode and undoing a preexisting G91 incremental mode
  let cmd = 'G38.2 Z-'
  if (
    !onprobemaxtravelChange() ||
    !onprobefeedrateChange() ||
    !onproberetractChange() ||
    !onprobetouchplatethicknessChange()
  ) {
    return
  }
  cmd +=
    `${Number.parseFloat(getValue('grblpanel_probemaxtravel'))} F${Number.parseInt(getValue('grblpanel_probefeedrate'))} P${getValue('grblpanel_probetouchplatethickness')}`
  console.log(cmd)
  probe_progress_status = 1
  let restoreReport = false
  const common = new Common();

  if (commomn.reportType === 'none') {
    tryAutoReport() // will fall back to polled if autoreport fails
    restoreReport = true
  }
  SendPrinterCommand(cmd, true, null, null, 38.6, 1)
  setClickability('probingbtn', false)
  setClickability('probingtext', true)
  grbl_error_msg = ''
  setHTML('grbl_status_text', grbl_error_msg)
  if (restoreReport) {
    reportNone()
  }
}

let spindleSpeedSetTimeout

function setSpindleSpeed(speed) {
  const common = new Common();
  if (spindleSpeedSetTimeout) clearTimeout(spindleSpeedSetTimeout)
  if (speed >= 1) {
    common.spindleTabSpindleSpeed = speed
    spindleSpeedSetTimeout = setTimeout(
      () => SendPrinterCommand(`S${common.spindleTabSpindleSpeed}`, false, null, null, 1, 1),
      500
    )
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