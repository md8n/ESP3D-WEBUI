/** Get the element identified with the supplied name */
const id = (name) => document.getElementById(name);

// The return value from class(name) can be use with forEach()
function classes(name) {
  return Array.from(document.getElementsByClassName(name))
}
function setValue(name, val) {
  id(name).value = val
}
function getValue(name, val) {
  return id(name).value
}
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
function setChecked(name, val) {
  id(name).checked = val
}
function getChecked(name) {
  return id(name).checked
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

export { conErr, disable_items, displayBlock, displayNone, id };
