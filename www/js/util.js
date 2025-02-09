/** Get the element identified with the supplied name */
const id = (name) => document.getElementById(name);

/** Returns an array of elements with the supplied class name, which can be use with forEach() or for ... of */
const elemsByClass = (name) => Array.from(document.getElementsByClassName(name));

/** Set an element's `value` value (if the element exists) */
const setValue = (name, val) => {
  const elem = id(name);
  if (elem) {
    elem.value = val;
  }
}

/** Return an element's `value` value, or its `innerText` value.
 * If the element does not exist or does not have a `value` or `innerText` value `undefined` is returned.
 * This does the opposite of getText, which checks the innerText value first. */
const getValue = (name) => id(name)?.value || id(name)?.innerText;

/** Gets an element's `value` value, or its `innerText` value.
 * Ensures that it is a string, and trims it.
 * If the element does not exist or does not have a `value` or `innerText` value an empty string is returned
 */
const getValueTrimmed = (name) => String(getValue(name) || "").trim();

/** Return an element's `innerText` value, or its `value` value.
 * If the element does not exist or does not have a `value` or `innerText` value `undefined` is returned.
 * This does the opposite of getValue, which checks the `value` value first. */
const getText = (name) => id(name)?.innerText || id(name)?.value;

/** Set the textContent of the element with an id matching the supplied name.
 * If the element cannot be found - nothing happens */
const setTextContent = (name, val) => {
  const elem = id(name);
  if (elem) {
    elem.textContent = val;
  }
}

/** Set the innerHTML of the element with an id matching the supplied name.
 * If the element cannot be found - nothing happens */
const setHTML = (name, val) => {
  const elem = id(name);
  if (elem) {
    elem.innerHTML = val;
  }
}

/** Set the innerText of the element with an id matching the supplied name.
 * If the element cannot be found - nothing happens */
const setText = (name, val) => {
  const elem = id(name);
  if (elem) {
    elem.innerText = val;
  }
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

/** Set the display style of the element identified by name to 'block' */
const displayBlock = (name) => setDisplay(name, 'block');

const disable_items = (item, state) => {
  if (!item) {
    return;
  }
  const liste = item.getElementsByTagName('*');
  for (let i = 0; i < liste.length; i++) {
    liste[i].disabled = state;
  }
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

/** Set the disabled value for the elements matching the selector */
function setDisabled(selector, value) {
  for ((element) of document.querySelectorAll(selector)) {
    element.disabled = value;
  }
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

/** HTML encode the supplied string */
const HTMLEncode = (value) => {
  const valChars = [...value];
  const aRet = valChars.map((vc) => {
    let iC = vc.charCodeAt();
    if (iC < 65 || iC > 127 || (iC > 90 && iC < 97)) {
      if (iC === 65533) {
        iC = 176;
      }
      return `&#${iC};`;
    }
    return vc;
  });

  return aRet.join('');
}

/** Decode an HTML encoded string */
const HTMLDecode = (value) => {
  const tmpelement = document.createElement('div');
  tmpelement.innerHTML = value;
  value = tmpelement.textContent;
  tmpelement.textContent = '';
  return value;
}