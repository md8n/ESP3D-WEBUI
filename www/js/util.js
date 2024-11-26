/** Get the element identified with the supplied name */
const id = (name) => document.getElementById(name);

// Returns an array of elements with the supplied class name, which can be use with forEach()
const classes = (name) => Array.from(document.getElementsByClassName(name));

/** Set an element's `value` value (if the element exists) */
const setValue = (name, val) => {
  const elem = id(name);
  if (elem) {
    elem.value = val;
  }
}
/** Return an element's `value` value. If the element does not exist or does not have a `value` value `undefined` is returned */
const getValue = (name) => id(name)?.value;

function setTextContent(name, val) {
  id(name).textContent = val
}
function setHTML(name, val) {
  id(name).innerHTML = val
}
function setText(name, val) {
  id(name).innerText = val
}
function getText(name) {
  return id(name).innerText
}

/** Set the display style of the element identified by name to the supplied value */
const setDisplay = (name, val) => {
  const elem = id(name);
  if (!elem) {
    return;
  }
  id(name).style.display = val;
}

/** Set the display style of the element identified by name to 'none' */
const displayNone = (name) => setDisplay(name, 'none');

/** Set the display style of the element identified by name to 'none' */
const displayBlock = (name) => setDisplay(name, 'block');

const disable_items = (item, state) => {
  const liste = item.getElementsByTagName('*');
  for (let i = 0; i < liste.length; i++) liste[i].disabled = state;
}

function displayFlex(name) {
  setDisplay(name, 'flex')
}
function displayTable(name) {
  setDisplay(name, 'table-row')
}
function displayInline(name) {
  setDisplay(name, 'inline')
}
function displayInitial(name) {
  setDisplay(name, 'initial')
}
function displayUndoNone(name) {
  setDisplay(name, '')
}
function selectDisabled(selector, value) {
  document.querySelectorAll(selector).forEach(function (element) {
    element.disabled = value
  })
}
function click(name) {
  id(name).click()
}
function files(name) {
  return id(name).files
}
/** Set a checkbox element's `value` (if the element exists) */
const setChecked = (name, val) => {
  const checkBox = id(name);
  if (checkBox) {
    checkBox.value = String(val);
  }
}
/** Return a checkbox element's `value`.
 * Note that this is a string.
 * If the element does not exist a "false" string is returned */
const getChecked = (name) => {
  const checkBox = id(name);
  return checkBox?.value || "false";
}

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

/** Build a 'standard' format error message */
const stdErrMsg = (error_code, response = "", error_prefix = "Error") => `${error_prefix} ${error_code} : ${response}`;
/** Use `console.error` to report an error
 * If the response message is falsey, and the error_prefix is the default, we assume that we've been supplied with a stdErrMsg
 * Otherwise, we build a stdErrMsg with what was supplied
 */
const conErr = (error_code, response, error_prefix = "Error") => {
  const errMsg = (!response && error_prefix === "Error")
      ? error_code
      : stdErrMsg(error_code, response || "", error_prefix);
  console.error(errMsg);
}

let lastPing = 0;
const last_ping = (value) => {
  if (typeof value === "number") {
    lastPing = value;
  }
  return lastPing;
}

export {
  classes,
  conErr,
  stdErrMsg,
  disable_items,
  displayBlock, displayFlex, displayInline, displayNone,
  last_ping,
  getChecked, setChecked,
  getValue, setValue,
  id
};
