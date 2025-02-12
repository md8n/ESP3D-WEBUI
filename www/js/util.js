/** Get the element identified with the supplied name */
const id = (name) => document.getElementById(name);

/** Returns an array of elements with the supplied class name, which can be use with forEach() or for ... of */
const classes = (name) => Array.from(document.getElementsByClassName(name));

/** Set an element's `value` value (if the element exists) */
const setValue = (name, val) => {
  const elem = id(name);
  if (elem) {
    elem.value = val;
  }
}

/** Set the className of the element with an id matching the supplied name.
 * If the element cannot be found - nothing happens
 */
const setClassName = (name, className) => {
  const elem = id(name);
  if (elem) {
    elem.className = className;
  }
}

/** Set the innerHTML of the element with an id matching the supplied name.
 * If the element cannot be found - nothing happens
 */
/** Set an element's `innerText` value (if the element exists) */
const setText = (name, val) => {
  const elem = id(name);
  if (elem) {
    elem.innerText = val;
  }
}

/** Set an element's `textContent` value (if the element exists) */
const setTextContent = (name, val) => {
  const elem = id(name);
  if (elem) {
    elem.textContent = val;
  }
}

/** Set an element's `innerHTML` value (if the element exists) */
const setHTML = (name, val) => {
  const elem = id(name);
  if (elem) {
    elem.innerHTML = val;
  }
}

/** Return an element's `value` value, or its `innerText` value.
 * If the element does not exist or does not have a `value` or `innerText` value `undefined` is returned.
 * Tries to get the `value` first then the `innerText`, this is the opposite of `getText` */
const getValue = (name) => id(name)?.value || id(name)?.innerText;

/** Return an element's `innerText` value, or its `value` value.
 * If the element does not exist or does not have an `innerText` or `value` value `undefined` is returned.
 * Tries to get the `innerText` first then the `value`, this is the opposite of `getValue` */
const getText = (name) => id(name)?.innerText || id(name)?.value;

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

/** Build a 'standard' format error message */
const stdErrMsg = (error_code, response = "", error_prefix = "Error") => `${error_prefix} ${error_code} : ${response}`;

/** Use `console.error` to report an error
 * If the response message is falsey, and the error_prefix is the default,
 * we assume that we've been supplied with a simple error message that's already structured correctly
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
  const decValue = tmpelement.textContent;
  tmpelement.textContent = '';
  return decValue;
}

/** Super basic browser check,
 * TODO: Fix this, it is extremely naive */
const browser_is = (bname) => {
	const ua = navigator.userAgent;
	switch (bname) {
		case "IE":
			if (ua.indexOf("Trident/") !== -1) return true;
			break;
		case "Edge":
			if (ua.indexOf("Edge") !== -1) return true;
			break;
		case "Chrome":
			if (ua.indexOf("Chrome") !== -1) return true;
			break;
		case "Firefox":
			if (ua.indexOf("Firefox") !== -1) return true;
			break;
		case "MacOSX":
			if (ua.indexOf("Mac OS X") !== -1) return true;
			break;
		default:
			return false;
	}
	return false;
}


export {
  classes,
  conErr,
  stdErrMsg,
  getChecked, setChecked,
  getValue, setValue,
  getText, setText, setTextContent,
  setClassName, setHTML,
  HTMLEncode, HTMLDecode,
  id,
  browser_is,
};
