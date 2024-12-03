import { prefDefs, HTMLDecode } from "./common.js";
import { translate_text_item } from "./langUtils.js";

// Add in the validation function definitions to the prefDefs
prefDefs.enable_grbl_panel.prefDefs.autoreport_interval.valFunc = (value) => {
	const vInt = Number.parseInt(value);
	return !Number.isNaN(vInt) && (vInt === 0 || (vInt >= 50 && vInt <= 30000))
		? ""
		: translate_text_item(
				"Value of auto-report must be 0 or between 50ms and 30000ms !!",
			);
};

prefDefs.enable_files_panel.prefDefs.f_filters.valFunc = (value) => {
	const extPat = /^[a-z0-9;]*$/i;
	return value.match(extPat)
		? ""
		: translate_text_item(
				"Only alphanumeric chars separated by ; for extensions filters !!",
			);
};

/** Return the `fieldId`, if defined, otherwise return the `key` */
const buildFieldId = (key, value) => value.fieldId || key;

/** Build a complete set of preferences from the prefDefs.
 * Useful for initialisation of preferences.json
 * * `defValue` - is the original value as defined in the prefDefs above
 * * `fileValue` - is the value as currently stored in the value (or that soon will be if the preferences are being saved)
 * * `value` - is the value as currently set and in use in the UI
 */
const buildPrefsFromDefs = (prefLevel = prefDefs) => {
	const prefs = {};
	for (const [key, value] of Object.entries(prefLevel)) {
		prefs[key] = {
			valueType: value.valueType,
			defValue: value.defValue,
			fileValue: value.defValue,
			value: value.defValue,
			fieldId: buildFieldId(key, value),
		};

		if (value.valueType === "enctext") {
			// all values are stored as HTML encoded text
			prefs[key].defValue = HTMLDecode(prefs[key].defValue);
			prefs[key].fileValue = HTMLDecode(prefs[key].fileValue);
			prefs[key].value = HTMLDecode(prefs[key].value);
		}

		if ("prefDefs" in value) {
			// Transfer the child level values back to this parent level
			for (const [cKey, cValue] of Object.entries(
				buildPrefsFromDefs(value.prefDefs),
			)) {
				prefs[cKey] = cValue;
			}
		}
	}

	return prefs;
};

/** Get the named preference object */
const getPref = (prefName) => {
	let pref = preferences[prefName];
	if (!pref) {
		// try to find it by looking for the fieldId
		for (const [key, value] of Object.entries(preferences)) {
			if (value.fieldId === prefName) {
				pref = value;
				break;
			}
		}
	}
	if (!pref) {
		console.error(
			stdErrMsg(
				"Unknown Preference",
				`'${prefName}' not found as a preference key or as the fieldId within a preference value`,
			),
		);
		return undefined;
	}
	return pref;
};

/** Get the part of the prefDefs structure identified by the name supplied.
 * If the name is not found then undefined is returned
 */
const getPrefDefPath = (prefName) => {
	const prefPath = prefName
		.trim()
		.replace(".", ".prefDefs.")
		.replace(".prefDefs.prefDefs.", ".prefDefs.");
	let pref = prefDefs;
	for (let ix = 0; ix < prefPath.length; ix++) {
		if (typeof pref[prefPath[ix]] === "undefined") {
			return undefined;
		}
		pref = pref[prefPath[ix]];
	}
	return pref;
};

/** Get the named preference value */
const getPrefValue = (prefName) => {
	const pref = getPref(prefName);
	if (!pref) {
		return undefined;
	}
	return pref.value;
};

/** Set the preference item to the supplied value.
 * Returns true for success, false for failure - usually because the preference item does not exist
 */
const setPrefValue = (prefName, value) => {
	const pref = getPrefDefPath(prefName);
	if (typeof pref === "undefined") {
		return false;
	}
	// TODO: test the typeof the value is compatible with the valueType
	pref.value = value;
	return true;
};

/** The actual preferences as used throught the app */
const preferences = buildPrefsFromDefs(prefDefs);

/** Helper method to get the `enable_ping` preference value */
const enable_ping = () => getPrefValue("enable_ping");

export {
	buildFieldId,
	enable_ping,
	getPref,
	getPrefValue,
	setPrefValue,
	preferences,
};
