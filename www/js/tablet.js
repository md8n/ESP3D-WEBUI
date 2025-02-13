// When we can change to proper ESM - uncomment this
// import { checkHomed, maslowErrorMsgHandling, maslowInfoMsgHandling, maslowMsgHandling, sendCommand } from "maslow";

var gCodeLoaded = false
var gCodeDisplayable = false

var snd = null
var sndok = true

var versionNumber = 0.88

const addMessage = (msg, scroll = true, clear = false) => {
  const msgWindow = id("messages");
  if (msgWindow) {
    msgWindow.textContent = clear ? msg : `${msgWindow.textContent}\n${msg}`;
    if (scroll) {
      msgWindow.scrollTop = msgWindow.scrollHeight;
    }
  }
}

/** Print the version number to the console */
const showVersionNumber = () => addMessage(`Index.html Version: ${versionNumber}`);

function beep(vol, freq, duration) {
  if (snd == null) {
    if (sndok) {
      try {
        snd = new Audio(
          'data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU='
        )
      } catch (error) {
        snd = null
        sndok = false
      }
    }
  }
  if (snd) {
    snd.play()
  }
}

function tabletClick() {
  if (window.navigator?.vibrate) {
    window.navigator.vibrate(200)
  }
  // beep(3, 400, 10)
}

const MDIcmd = (value) => {
  tabletClick();
  sendCommand(value);
}

// const MDI = (field) => {
//   MDIcmd(getValue(field))
// }

// const enterFullscreen = () => {
//   try {
//     document.documentElement.requestFullscreen()
//   } catch (exception) {
//     try {
//       document.documentElement.webkitRequestFullscreen()
//     } catch (exception) {
//       return
//     }
//   }
// }
// const exitFullscreen = () => {
//   try {
//     document.exitFullscreen()
//   } catch (exception) {
//     try {
//       document.webkitExitFullscreen()
//     } catch (exception) {
//       return
//     }
//   }
// }

/** This does nothing, but it does get called */
const toggleFullscreen = () => { }

// const inputFocused = () => { isInputFocused = true; };

// const inputBlurred = () => { isInputFocused = false; };

// Define XY Home functions
let xyHomeTimerId = null;
const xyHomeBtnId = "tablettab_set_xy_home";
const xyHomeLabelDefault = "Define XY Home";
const xyHomeLabelInstr = "Press+Hold Tap_x2";
const xyHomeLabelRedefined = "XY Home Redefined";

const getXYHomeBtnText = () => getText(xyHomeBtnId) || "";
const setXYHomeBtnText = (xyText = xyHomeLabelDefault) => { setText(xyHomeBtnId, xyText); };

const clearXYHomeTimer = () => {
  if (xyHomeTimerId) {
    clearTimeout(xyHomeTimerId);
  }
  xyHomeTimerId = null;
  // Reset the button label
  setTimeout(setXYHomeBtnText, 1000);
}

const setXYHome = () => {
  clearXYHomeTimer();
  zeroAxis("X");
  zeroAxis("Y");
  // This changed label will only show for 1 second before being reset
  setXYHomeBtnText(xyHomeLabelRedefined);
  setTimeout(refreshGcode, 100);
}

const xyHomeTimer = () => {
  const buttonText = getXYHomeBtnText();
  const buttonValue = Number.isNaN(+buttonText) ? 0 : +buttonText;
  if (buttonValue > 1) {
    setXYHomeBtnText(buttonValue - 1);
    xyHomeTimerId = setTimeout(xyHomeTimer, 1000);
  } else if (buttonValue === 1) {
    // We're actually now at 0 in the countdown
    // Note: nanosecond-scale possible race condition here - quite frankly not a major issue user experience wise
    setXYHome();
  } else {
    // The user clicked / tapped once or didn't press+hold for 5 full seconds
    setTimeout(setXYHomeBtnText, 1000);
  }
}

/** Click down starts the xyHomeTimer function and sets the button text to 5 */
const setHomeClickDown = () => {
  setXYHomeBtnText(5);
  xyHomeTimer();
}

/** Click up cancels the xyHomeTimer and cleans up */
const setHomeClickUp = () => {
  if (xyHomeTimerId != null) {
    setXYHomeBtnText(xyHomeLabelInstr);
  }
}

const zeroAxis = (axis) => {
  tabletClick()
  setAxisByValue(axis, 0)
  addMessage(`Home pos set for: ${axis}`);
}

const toggleUnits = () => {
  tabletClick()
  sendCommand(gCodeModal.units === 'G21' ? 'G20' : 'G21');
  // The button label will be fixed by the response to $G
  sendCommand('$G');
}

// const btnSetDistance = () => {
//   tabletClick()
//   var distance = event.target.innerText
//   setValue('jog-distance', distance)
// }

// const setDistance = (distance) => {
//   tabletClick()
//   setValue('jog-distance', distance)
// }

const goAxisByValue = (axis, coordinate) => {
  tabletClick()
  moveTo(axis + coordinate)
}

const setAxisByValue = (axis, coordinate) => {
  tabletClick();
  const cmd = `G10 L20 P0 ${axis}${coordinate}`;
  sendCommand(cmd);
}

const setAxis = (axis, field) => {
  tabletClick();
  const cmd = `G10 L20 P1 ${axis}${getValue(field)}`;
  sendCommand(cmd);
}

var timeout_id = 0,
  hold_time = 1000

/** Check the parameters used by jog and move commands,
 * and return them as a composite string */
const checkParams = (params = {}) => {
  if (!Object.keys(params).length) {
    addMessage("Could not perform Jog. No jog parameters supplied. Programmer error.");
    return "";
  }

  if (!("Z" in params) && !checkHomed()) {
    addMessage("Could not perform Jog. Belt lengths are unknown.");
    return "";
  }

  const s = [];
  for (key in params) {
    s.push(`${key}${params[key]}`);
  }
  return s.join();
}

/** Perform a jog command */
const jog = (params = {}) => {
  const axisAndDistance = checkParams(params);
  if (!axisAndDistance) {
    return;
  }

  jogTo(axisAndDistance);
}

const jogTo = (axisAndDistance) => {
  // Always force G90 mode because synchronization of gCodeModal reports is unreliable
  // JogFeedRate is defined in controls.js
  let feedrate = JogFeedrate(axisAndDistance);
  if (gCodeModal.units === "G20") {
    feedrate /= 25.4;
    feedrate = feedrate.toFixed(2);
  }

  const cmd = `$J=G91F${feedrate}${axisAndDistance}\n`;
  addMessage(`JogTo: '${cmd}'`);
  sendCommand(cmd);
}

/** Peform a move command */
const move = (params = {}) => {
  const location = checkParams(params);
  if (!location) {
    return;
  }

  moveTo(location);
}

const moveTo = (location) => {
  // Always force G90 mode because synchronization of gCodeModal reports is unreliable
  const cmd = `G90 G0 ${location}`;
  sendCommand(cmd);
}

/** Perform jog or move commands based on the supplied command */
const sendMove = (cmd) => {
  tabletClick();

  let distance = cmd.includes('Z')
    ? Number(getText('disZ')) || 0
    : Number(getText('disM')) || 0;

  const jogMoveFnList = {
    G28: () => sendCommand('G28'),
    G30: () => sendCommand('G30'),
    X0Y0Z0: () => move({ X: 0, Y: 0, Z: 0 }),
    X0: () => move({ X: 0 }),
    Y0: () => move({ Y: 0 }),
    Z0: () => move({ Z: 0 }),
    'X-Y+': () => jog({ X: -distance, Y: distance }),
    'X+Y+': () => jog({ X: distance, Y: distance }),
    'X-Y-': () => jog({ X: -distance, Y: -distance }),
    'X+Y-': () => jog({ X: distance, Y: -distance }),
    'X-': () => jog({ X: -distance }),
    'X+': () => jog({ X: distance }),
    'Y-': () => jog({ Y: -distance }),
    'Y+': () => jog({ Y: distance }),
    'Z-': () => jog({ Z: -distance }),
    'Z+': () => jog({ Z: distance }),
    'Z_TOP': () => {
      // She's got legs ♫
      move({ Z: 70 });
    },
  };

  if (cmd in jogMoveFnList) {
    jogMoveFnList[cmd]();
  } else {
    addMessage(`Invalid jog/move command: ${cmd}`);
  }
}

const moveHome = () => {
  if (!checkHomed()) {
    return;
  }

  //We want to move to the opposite of the machine's current X,Y cordinates
  const x = Number.parseFloat(getText('mpos-x'));
  const y = Number.parseFloat(getText('mpos-y'));

  jog({ X: -1 * x, Y: -1 * y })
}

function saveSerialMessages() {
  // save off the serial messages
  const msgs = getValue('messages') || "";
  const link = document.createElement('a');
  link.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURI(msgs)}`);
  link.setAttribute('download', "Maslow-serial.log");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/** Loaded Values of the maslow config, this can be a const because we only change the fields within it */
const loaded_values = {};
/** Work with the maslow config loaded values.
 * If `fieldName` is undefined, or `value` is undefined and `fieldname` is not in the values, then return the values we have.
 * If `value` is undefined, but `fieldname` exists, just return the value for `fieldname`
 * Otherwise set `fieldname` to the `value` and return it
 */
const loadedValues = (fieldName, value) => {
  if (typeof fieldName === "undefined") {
    return loaded_values;
  }
  if (typeof value === "undefined") {
    return !(fieldName in loaded_values)
      ? loaded_values
      : loaded_values[fieldName];
  }
  loaded_values[fieldName] = value;
  return loaded_values[fieldName];
};

function tabletShowMessage(msg, collecting) {
  if (collecting || !msg) {
    return;
  }
  if (valueStartsWith(msg, ["<", "ok", "\n", "\r"])) {
    return;
  }

  if (maslowInfoMsgHandling(msg)) {
    return;
  }

  if (valueStartsWith(msg, ["[GC"])) {
    return;
  }

  // let errMsg = "";

  //These are used for populating the configuration popup
  if (valueStartsWith(msg, ["$/Maslow_", "$/maslow_"])) {
    errMsg = maslowMsgHandling(msg.substring(9));
    return; //We don't want to display these messages
  }

  addMessage(`${maslowErrorMsgHandling(msg) || msg}`);
}

function tabletShowResponse(response) { }

function clearAlarm() {
  if (getText('systemStatus') === 'Alarm') {
    id('systemStatus').classList.remove('system-status-alarm')
    SendPrinterCommand('$X', true, null, null, 114, 1)
  }
}

function setJogSelector(units) {
  let buttonDistances = [];
  let menuDistances = [];
  let selected = 0;
  if (units === "G20") {
    // Inches
    buttonDistances = [0.001, 0.01, 0.1, 1, 0.003, 0.03, 0.3, 3, 0.005, 0.05, 0.5, 5];
    menuDistances = [0.00025, 0.0005, 0.001, 0.003, 0.005, 0.01, 0.03, 0.05, 0.1, 0.3, 0.5, 1, 3, 5, 10, 30];
    selected = "1";
  } else {
    // millimeters
    buttonDistances = [0.1, 1, 10, 100, 0.3, 3, 30, 300, 0.5, 5, 50, 500];
    menuDistances = [0.005, 0.01, 0.03, 0.05, 0.1, 0.3, 0.5, 1, 3, 5, 10, 30, 50, 100, 300, 500, 1000];
    selected = "10";
  }
  // const buttonNames = [
  //   'jog00',
  //   'jog01',
  //   'jog02',
  //   'jog03',
  //   'jog10',
  //   'jog11',
  //   'jog12',
  //   'jog13',
  //   'jog20',
  //   'jog21',
  //   'jog22',
  //   'jog23',
  // ]
  //buttonNames.forEach( function(n, i) { setHTML(n, buttonDistances[i]); } );

  // var selector = id('jog-distance');
  // selector.length = 0;
  // selector.innerText = null;
  // menuDistances.forEach(function(v) {
  //     var option = document.createElement("option");
  //     option.textContent=v;
  //     option.selected = (v == selected);
  //     selector.appendChild(option);
  // });
}
function removeJogDistance(option, oldIndex) {
  //selector = id('jog-distance');
  //selector.removeChild(option);
  //selector.selectedIndex = oldIndex;
}
function addJogDistance(distance) {
  //selector = id('jog-distance');
  //var option = document.createElement("option");
  //option.textContent=distance;
  //option.selected = true;
  //return selector.appendChild(option);
}

var runTime = 0

function setButton(name, isEnabled, color, text) {
  const button = id(name);
  if (!button) {
    return;
  }
  button.disabled = !isEnabled;
  button.style.backgroundColor = color;
  button.innerText = text;
}

var playButtonHandler
function setPlayButton(isEnabled, color, text, click) {
  setButton('playBtn', isEnabled, color, text);
  playButtonHandler = click;
}
function doPlayButton() {
  if (playButtonHandler) {
    playButtonHandler()
  }

  addMessage(`Starting File: ${id('filelist').options[selectElement.selectedIndex].text}`);
}

// var pauseButtonHandler
// function setPauseButton(isEnabled, color, text, click) {
//   setButton('pauseBtn', isEnabled, color, text);
//   pauseButtonHandler = click
// }
// function doPauseButton() {
//   if (pauseButtonHandler) {
//     pauseButtonHandler()
//   }
// }

const green = "#86f686";
const red = "#f64646";
const gray = "#f6f6f6";

function setRunControls() {
  if (gCodeLoaded) {
    // A GCode file is ready to go
    setPlayButton(true, green, 'Start', runGCode)
    //setPauseButton(false, gray, 'Pause', null)
  } else {
    // Can't start because no GCode to run
    setPlayButton(false, gray, 'Start', null)
    //setPauseButton(false, gray, 'Pause', null)
  }
}

var grblReportingUnits = 0
var startTime = 0

var spindleDirection = ''
var spindleSpeed = ''

function stopAndRecover() {
  stopGCode()
  // To stop GRBL you send a reset character, which causes some modes
  // be reset to their default values.  In particular, it sets G21 mode,
  // which affects the coordinate display and the jog distances.
  requestModes()
}

var oldCannotClick = null

function scaleUnits(target) {
  //Scale the units to move when jogging down or up by 25.4 to keep them reasonable
  let distanceElement = id(target);
  let currentValue = Number(distanceElement.innerText);

  if (!Number.isNaN(currentValue)) {
    distanceElement.innerText = gCodeModal.units == 'G20' ? currentValue / 25.4 : currentValue * 25.4;
  } else {
    console.error('Invalid number in disM element');
  }
}

function tabletUpdateModal() {
  const newUnits = gCodeModal.units === "G21" ? "mm" : "Inch";
  if (getValue("tablettab_toggle_units") === newUnits) {
    return;
  }

  setText("tablettab_toggle_units", newUnits);
  setJogSelector(gCodeModal.units);
  scaleUnits("disM");
  scaleUnits("disZ");
}

function tabletGrblState(grbl, response) {
  // tabletShowResponse(response)
  var stateName = grbl.stateName

  // Unit conversion factor - depends on both $13 setting and parser units
  var factor = 1.0

  //  spindleSpeed = grbl.spindleSpeed;
  //  spindleDirection = grbl.spindle;
  //
  //  feedOverride = OVR.feed/100.0;
  //  rapidOverride = OVR.rapid/100.0;
  //  spindleOverride = OVR.spindle/100.0;

  var mmPerInch = 25.4
  switch (gCodeModal.units) {
    case 'G20':
      factor = grblReportingUnits === 0 ? 1 / mmPerInch : 1.0
      break
    case 'G21':
      factor = grblReportingUnits === 0 ? 1.0 : mmPerInch
      break
  }

  const cannotClick = stateName === 'Run' || stateName === 'Hold'
  // Recompute the layout only when the state changes
  if (oldCannotClick !== cannotClick) {
    setDisabled('.dropdown-toggle', cannotClick)
    setDisabled('.axis-position .position', cannotClick)
    setDisabled('.axis-position .form-control', cannotClick)
    setDisabled('.axis-position .btn', cannotClick)
    setDisabled('.axis-position .position', cannotClick)
    // if (!cannotClick) {
    //     contractVisualizer();
    // }
  }
  oldCannotClick = cannotClick

  tabletUpdateModal()

  switch (stateName) {
    case 'Sleep':
    case 'Alarm':
      setPlayButton(true, gray, 'Start', null)
      //setPauseButton(false, gray, 'Pause', null)
      break
    case 'Idle':
      setRunControls()
      break
    case 'Hold':
      setPlayButton(true, green, 'Resume', resumeGCode)
      //setPauseButton(true, red, 'Stop', stopAndRecover)
      break
    case 'Jog':
    case 'Home':
    case 'Run':
      setPlayButton(false, gray, 'Start', null)
      //setPauseButton(true, red, 'Pause', pauseGCode)
      break
    case 'Check':
      setPlayButton(true, gray, 'Start', null)
      //setPauseButton(true, red, 'Stop', stopAndRecover)
      break
  }

  if (grbl.spindleDirection) {
    switch (grbl.spindleDirection) {
      case "M3": spindleDirection = "CW"; break;
      case "M4": spindleDirection = "CCW"; break;
      case "M5": spindleDirection = "Off"; break;
      default: spindleDirection = ""; break;
    }
  }

  //setText('spindle-direction', spindleDirection);

  spindleSpeed = grbl.spindleSpeed ? Number(grbl.spindleSpeed) : "";
  //setText('spindle-speed', spindleSpeed);

  var now = new Date();
  //setText('time-of-day', now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0'));
  if (stateName == 'Run') {
    var elapsed = now.getTime() - startTime;
    if (elapsed < 0) {
      elapsed = 0;
    }
    var seconds = Math.floor(elapsed / 1000);
    var minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;
    if (seconds < 10) {
      seconds = `0${seconds}`;
    };
    runTime = `${minutes}:${seconds}`;
  } else {
    startTime = now.getTime();
  }

  //setText('runtime', runTime);

  //setText('wpos-label', gCodeModal.wcs);
  var distanceText = gCodeModal.distance == 'G90' ? gCodeModal.distance : `<div style='color:red'>${gCodeModal.distance}</div>`;
  //setHTML('distance', distanceText);

  var stateText = ''
  if (stateName == 'Run') {
    var rateNumber = gCodeModal.units == 'G21'
      ? Number(grbl.feedrate).toFixed(0)
      : Number(grbl.feedrate / 25.4).toFixed(2)

    var rateText = rateNumber + (gCodeModal.units == 'G21' ? ' mm/min' : ' in/min')

    stateText = `${rateText} ${spindleSpeed} ${spindleDirection}`;
  } else {
    // var stateText = errorText == 'Error' ? "Error: " + errorMessage : stateName;
    stateText = stateName;
  }
  //setText('active-state', stateText);

  // var modeText = `${gCodeModal.distance} ${gCodeModal.wcs} ${gCodeModal.units} T${gCodeModal.tool} F${gCodeModal.feedrate} S${gCodeModal.spindle}`;

  if (grbl.lineNumber && ["Run", "Hold", "Stop"].includes(stateName)) {
    //setText('line', grbl.lineNumber);
    if (gCodeDisplayable) {
      scrollToLine(grbl.lineNumber);
    }
  }
  if (gCodeDisplayable) {
    tpDisplayer().reDrawTool(gCodeModal, arrayToXYZ(WPOS));
  }

  var digits = gCodeModal.units == 'G20' ? 4 : 2;

  if (WPOS) {
    WPOS.forEach(function (pos, index) {
      setTextContent(`mpos-${axisNames[index]}`, Number(pos * factor).toFixed(index > 2 ? 2 : digits));
    })
  }

  MPOS.forEach(function (pos, index) {
    //setTextContent('mpos-'+axisNames[index], Number(pos*factor).toFixed(index > 2 ? 2 : digits));
  })
}

var gCodeFilename = '';

var filename = 'TEST.NC';
var watchPath = '';

function tabletGetFileList(path) {
  // Clear/reset the gCodeFilename
  gCodeFilename = "";
  const cmd = buildHttpFileCmd({ path: path });
  SendGetHttp(cmd, files_list_success);
}

const tabletDOMActivate = () => {
  fullscreenIfMobile();
  setBottomHeight();
}

// Button event handlers - First Row
const tabletMoveZUp = () => sendMove("Z+");
const tabletMoveTopLeft = () => sendMove("X-Y+");
const tabletMoveTop = () => sendMove("Y+");
const tabletMoveTopRight = () => sendMove("X+Y+");
const tabletCalibrationOpen = () => {
  loadCornerValues();
  openModal("calibration-popup");
}
// Button event handlers - Second Row
const tabletMoveLeft = () => sendMove("X-");
const tabletMoveRight = () => sendMove("X+");
// Button event handlers - Third Row
const tabletMoveZDown = () => sendMove("Z-");
const tabletMoveBottomLeft = () => sendMove("X-Y-");
const tabletMoveBottom = () => sendMove("Y-");
const tabletMoveBottomRight = () => sendMove("X+Y-");
// Button event handlers - Fourth Row
const tabletSetZHomeMDown = () => zeroAxis("Z");
const tabletSetZHomeMUp = () => refreshGcode();
// Button event handlers - Fifth Row - nothing special here, move on
// Button event handlers - Sixth Row
const tabletGCodeStop = () => onCalibrationButtonsClick("$STOP", "Stop Maslow and Gcode");
// Control event handlers - Calibration Popup
const tabletCalPopupHide = () => hideModal("calibration-popup");
const tabletCalRetract = () => onCalibrationButtonsClick("$ALL", "Retract All");
const tabletCalExtend = () => onCalibrationButtonsClick("$EXT", "Extend All");
const tabletCalCalibrate = () => {
  onCalibrationButtonsClick("$CAL", "Calibrate");
  setTimeout(() => { hideModal("calibration-popup"); }, 1000);
};
const tabletCalTense = () => {
  onCalibrationButtonsClick("$TKSLK", "Apply Tension");
  setTimeout(() => { hideModal("calibration-popup"); }, 1000);
};
// const tabletCalZHome = () => onCalibrationButtonsClick("$TKSLK", "Home Z");
const tabletCalOpenConfig = () => {
  loadConfigValues();
  openModal("configuration-popup");
};
const tabletCalStop = () => onCalibrationButtonsClick("$STOP", "Stop");
const tabletCalSetZStop = () => onCalibrationButtonsClick("$SETZSTOP", "Set Z-Stop");
const tabletCalTest = () => onCalibrationButtonsClick("$TEST", "Test");
const tabletCalRelax = () => onCalibrationButtonsClick("$CMP", "Release Tension");
// Control event handlers - Configuration Popup
const tabletConfigPopupHide = () => hideModal("configuration-popup");
// Control event handlers - Common
const tabletPopupStopProp = (event) => event.stopPropagation();

function tabletInit() {
  // put in a timeout to allow things to settle. when they were here at startup ui froze from time to time.
  setTimeout(() => {
    showVersionNumber();

    // get grbl status
    SendRealtimeCmd(0x3f); // ?
    // print startup messages in serial
    SendPrinterCommand("$SS");
    // get maslow info
    SendPrinterCommand("$MINFO");
    tabletGetFileList("/");
    requestModes();
    loadConfigValues();
    loadCornerValues();

    numpad.attach({ target: "disM", axis: "D" });
    numpad.attach({ target: "disZ", axis: "Z" });
    //numpad.attach({target: "wpos-y", axis: "Y"});
    //numpad.attach({target: "wpos-z", axis: "Z"});
    //numpad.attach({target: "wpos-a", axis: "A"});

    setJogSelector('mm');
    loadJogDists();

    id("tablettablink").addEventListener("DOMActivate", tabletDOMActivate, false);

    // Buttons - First Row
    id("tablettab_zUp").addEventListener("click", tabletMoveZUp);
    id("tablettab_topLeft").addEventListener("click", tabletMoveTopLeft);
    id("tablettab_top").addEventListener("click", tabletMoveTop);
    id("tablettab_topRight").addEventListener("click", tabletMoveTopRight);
    id("calibrationBTN").addEventListener("click", tabletCalibrationOpen);

    // Buttons - Second Row
    id("tablettab_left").addEventListener("click", tabletMoveLeft);
    id("tablettab_right").addEventListener("click", tabletMoveRight);

    // Buttons - Third Row
    id("tablettab_zDown").addEventListener("click", tabletMoveZDown);
    id("tablettab_bottomLeft").addEventListener("click", tabletMoveBottomLeft);
    id("tablettab_bottom").addEventListener("click", tabletMoveBottom);
    id("tablettab_bottomRight").addEventListener("click", tabletMoveBottomRight);

    // Buttons - Fourth Row
    id("tablettab_set_z_home").addEventListener("mousedown", tabletSetZHomeMDown);
    id("tablettab_set_z_home").addEventListener("mouseup", tabletSetZHomeMUp);
    id("tablettab_move_to_xy_home").addEventListener("click", moveHome);
    id("tablettab_toggle_units").addEventListener("click", toggleUnits);
    id("tablettab_set_xy_home").addEventListener("mousedown", setHomeClickDown);
    id("tablettab_set_xy_home").addEventListener("mouseup", setHomeClickUp);
    id("tablettab_set_xy_home").addEventListener("dblclick", setXYHome);

    // Controls - Fifth Row
    id("filelist").addEventListener("change", selectFile);
    id("tablettab_gcode_upload").addEventListener("click", files_select_upload);

    // Buttons - Sixth Row
    id("tablettab_gcode_play").addEventListener("click", doPlayButton);
    // id("tablettab_gcode_pause").addEventListener("click", doPauseButton);
    id("tablettab_gcode_stop").addEventListener("click", tabletGCodeStop);
    id("systemStatus").addEventListener("click", clearAlarm);

    id("tablettab_save_serial_msg").addEventListener("click", saveSerialMessages);

    // Buttons - Calibration Pop-up
    id("calibration-popup").addEventListener("click", tabletCalPopupHide);
    id("calibration_popup_content").addEventListener("click", tabletPopupStopProp);
    id("tablettab_cal_retract").addEventListener("click", tabletCalRetract);
    id("tablettab_cal_extend").addEventListener("click", tabletCalExtend);
    id("tablettab_cal_calibrate").addEventListener("click", tabletCalCalibrate);
    id("tablettab_cal_tense").addEventListener("click", tabletCalTense);
    // id("tablettab_cal_homez").addEventListener("click", tabletCalZHome);
    id("tablettab_cal_config").addEventListener("click", tabletCalOpenConfig);
    id("tablettab_cal_stop").addEventListener("click", tabletCalStop);
    id("tablettab_cal_zstop").addEventListener("click", tabletCalSetZStop);
    id("tablettab_cal_test").addEventListener("click", tabletCalTest);
    id("tablettab_cal_relax").addEventListener("click", tabletCalRelax);

    // Buttons - Configuration Pop-up
    id("configuration-popup").addEventListener("click", tabletConfigPopupHide);
    id("configuration_popup_content").addEventListener("click", tabletPopupStopProp);
    id("tablettab_config_save").addEventListener("click", saveConfigValues);

  }, 1000);
}

const showGCode = (gcode) => {
  gCodeLoaded = gcode !== "";
  if (!gCodeLoaded) {
    setValue("tablettab_gcode", "(No GCode loaded)");
    tpDisplayer().clear();
  } else {
    setValue("tablettab_gcode", gcode);
    if (gCodeDisplayable) {
      tpDisplayer().showToolpath(gcode, gCodeModal, arrayToXYZ(WPOS));
    }
  }

  // TODO: this needs to take into account error states
  setRunControls();
}

function nthLineEnd(str, n) {
  if (n <= 0) {
    return 0;
  }
  const L = str.length;
  let i = -1;
  let count = n;
  while (count-- && i++ < L) {
    i = str.indexOf('\n', i);
    if (i < 0) {
      break;
    }
  }
  return i;
}

function scrollToLine(lineNumber) {
  const gCodeLines = id("tablettab_gcode");
  const lineHeight = Number.parseFloat(getComputedStyle(gCodeLines).getPropertyValue('line-height'));
  const gCodeText = gCodeLines.value;

  gCodeLines.scrollTop = lineNumber * lineHeight

  let start;
  let end;
  if (lineNumber <= 0) {
    start = 0;
    end = 1;
  } else {
    start = lineNumber === 1 ? 0 : nthLineEnd(gCodeText, lineNumber) + 1;
    end = gCodeText.indexOf("\n", start);
  }

  gCodeLines.select();
  gCodeLines.setSelectionRange(start, end);
}

function runGCode() {
  if (gCodeFilename) {
    const cmd = `$sd/run=${gCodeFilename}`;
    sendCommand(cmd);
  }
  setTimeout(() => { SendRealtimeCmd(0x7e); }, 1500);
  // expandVisualizer()
}

function tabletLoadGCodeFile(path, size) {
  gCodeFilename = path
  if ((Number.isNaN(size) && size.endsWith('GB')) || size > 10000000) {
    showGCode('GCode file too large to display (> 1MB)');
    gCodeDisplayable = false;
    tpDisplayer().clear();
  } else {
    gCodeDisplayable = true;
    fetch(encodeURIComponent(`SD${gCodeFilename}`))
      .then((response) => response.text())
      .then((gcode) => showGCode(gcode));
  }
}

function selectFile() {
  tabletClick()
  const filelist = id("filelist");
  const index = Number(filelist.options[filelist.selectedIndex].value);
  if (index === -3) {
    // No files
    return;
  }
  if (index === -2) {
    // Blank entry selected
    return;
  }
  if (index === -1) {
    // Go up
    gCodeFilename = "";
    files_go_levelup()
    return
  }
  const file = files_file_list[index];
  const filename = file.name;
  if (file.isdir) {
    gCodeFilename = "";
    files_enter_dir(filename);
  } else {
    tabletLoadGCodeFile(`${files_currentPath()}${filename}`, file.size);
  }
}
// function toggleDropdown() {
//   id("tablet-dropdown-menu").classList.toggle("show");
// }
// function hideMenu() {
//   toggleDropdown();
// }
// function menuFullscreen() {
//   toggleFullscreen();
//   hideMenu();
// }
// function menuReset() {
//   stopAndRecover();
//   hideMenu();
// }
// function menuUnlock() {
//   sendCommand("$X");
//   hideMenu();
// }
// function menuHomeAll() {
//   sendCommand("$H");
//   hideMenu();
// }
// function menuHomeA() {
//   sendCommand("$HA");
//   hideMenu();
// }
// function menuSpindleOff() {
//   sendCommand("M5");
//   hideMenu();
// }

function requestModes() {
  sendCommand("$G");
}

const cycleDistance = (up) => {
  //var sel = id('jog-distance');
  //var newIndex = sel.selectedIndex + (up ? 1 : -1);
  //if (newIndex >= 0 && newIndex < sel.length) {
  //    tabletClick();
  //    sel.selectedIndex = newIndex;
  //}
}

/** "Click" on the named button/element */
const clickon = (name) => {
  //    $('[data-route="workspace"] .btn').removeClass('active');
  const button = id(name);
  button.classList.add("active");
  button.dispatchEvent(new Event("click"));
}
var ctrlDown = false;
var oldIndex = null;
var newChild = null;

function shiftUp() {
  if (!newChild) {
    return;
  }
  removeJogDistance(newChild, oldIndex);
  newChild = null;
}
function altUp() {
  if (!newChild) {
    return;
  }
  removeJogDistance(newChild, oldIndex);
  newChild = null;
}

function shiftDown() {
  if (newChild) {
    return;
  }
  const sel = id('jog-distance');
  const distance = sel.value;
  oldIndex = sel.selectedIndex;
  newChild = addJogDistance(distance * 10);
}
function altDown() {
  if (newChild) {
    return;
  }
  const sel = id('jog-distance');
  const distance = sel.value;
  oldIndex = sel.selectedIndex;
  newChild = addJogDistance(distance / 10);
}

/** Reports whether a text input box has focus - see the next comment.
 * TODO: Currently this is always false. Maybe we should remove all usages of it
 */
var isInputFocused = false
function tabletIsActive() {
  const elem = id("tablettab");
  return !elem ? false : elem.style.display !== "none";
}

function handleKeyDown(event) {
  // When we are in a gCodeModal input field like the MDI text boxes
  // or the numeric entry boxes, disable keyboard jogging so those
  // keys can be used for text editing.
  if (!tabletIsActive()) {
    return;
  }
  if (isInputFocused) {
    return;
  }

  const dirKeyToBtnId = {
    'ArrowRight': 'jog-x-plus',
    'ArrowLeft': 'jog-x-minus',
    'ArrowUp': 'jog-y-plus',
    'ArrowDown': 'jog-y-minus',
    'PageUp': 'jog-z-plus',
    'PageDown': 'jog-z-minus',
  }
  if (event.key in dirKeyToBtnId) {
    clickon(dirKeyToBtnId[event.key]);
    event.preventDefault();
    return;
  }

  const mathKeyToDir = {
    '=': true,
    '+': true,
    '-': false,
  }
  if (event.key in mathKeyToDir) {
    cycleDistance(mathKeyToDir[event.key]);
    event.preventDefault();
    return;
  }

  switch (event.key) {
    case 'Escape':
    case 'Pause':
      //clickon('pauseBtn')
      break
    case 'Shift':
      shiftDown()
      break
    case 'Control':
      ctrlDown = true
      break
    case 'Alt':
      altDown()
      break
    default:
      console.warn(`Received an unmatched keydown event for ${event.key}`);
  }
}

function handleKeyUp(event) {
  if (!tabletIsActive()) {
    return;
  }
  if (isInputFocused) {
    return;
  }
  switch (event.key) {
    case 'Shift': shiftUp(); break;
    case 'Control': ctrlDown = false; break;
    case 'Alt': altUp(); break;
  }
}

function mdiEnterKey(event) {
  if (event.key === "Enter") {
    MDIcmd(event.target.value);
    event.target.blur();
  }
}

// The listener could be added to the tablettab element by setting tablettab's
// contentEditable property.  The problem is that it is too easy for tablettab
// to lose focus, in which case it does not receive keys.  The solution is to
// delegate the event to window and then have the handler check to see if the
// tablet is active.
window.addEventListener("keydown", handleKeyDown);
window.addEventListener("keyup", handleKeyUp);

function saveJogDists() {
  localStorage.setItem("disM", getText("disM"));
  localStorage.setItem("disZ", getText("disZ"));
}

function loadJogDists() {
  const disM = localStorage.getItem("disM");
  if (disM != null) {
    setText("disM", disM);
  }
  const disZ = localStorage.getItem("disZ");
  if (disZ != null) {
    setText("disZ", disZ);
  }
}

function fullscreenIfMobile() {
  if (/Mobi|Android/i.test(navigator.userAgent)) {
    toggleFullscreen();
  }
}

// setMessageHeight(), with these helper functions, adjusts the size of the message
// window to fill the height of the screen.  It would be nice if we could do that
// solely with CSS, but I did not find a way to do that.  Everything I tried either
// a) required setting a fixed message window height, or
// b) the message window would extend past the screen bottom when messages were added
function height(element) {
  return element?.getBoundingClientRect()?.height;
}
function heightId(eid) {
  return height(id(eid));
}
function bodyHeight() {
  return height(document.body);
}
function controlHeight() {
  return heightId('nav-panel') + heightId('axis-position') + heightId('setAxis');
}
function setBottomHeight() {
  if (!tabletIsActive()) {
    return;
  }
  const residue = bodyHeight() - heightId('navbar') - controlHeight();
  const tStyle = getComputedStyle(id('tablettab'));
  let tPad = Number.parseFloat(tStyle.paddingTop) + Number.parseFloat(tStyle.paddingBottom);
  tPad += 20;
}
window.onresize = setBottomHeight

const tabletDocumentClick = (event) => {
  const elemIdsToTest = ["calibration-popup", "calibrationBTN", "numPad"];
  const turnOffCalPopup = elemIdsToTest.every((elemId) => {
    const elem = document.getElementById(elemId);
    return !elem || !elem.contains(event.target);
  });
  if (turnOffCalPopup) {
    document.getElementById("calibration-popup").style.display = "none";
  }
};

document.addEventListener('click', tabletDocumentClick);

/* Calibration modal */

const openModal = (modalId) => {
  const modal = document.getElementById(modalId);

  if (modal) {
    modal.style.display = "flex";
  }
};

const hideModal = (modalId) => {
  const modal = document.getElementById(modalId);

  if (modal) {
    modal.style.display = "none";
  }
};

const onCalibrationButtonsClick = async (command, msg = "") => {
  if (msg) {
    addMessage(msg);
  }
  sendCommand(command);

  //Prints out the index.html version number when test is pressed
  if (command === '$TEST') {
    addMessage(`Index.html Version: ${versionNumber}`);
  }

  if (command !== '$MINFO') {
    setTimeout(() => { sendCommand('$MINFO'); }, 1000);
  }
}

/* Calibration modal END */
