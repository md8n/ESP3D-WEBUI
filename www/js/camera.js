// import: displayBlock, displayNone, id, SavePreferences

/** Set up the event handlers for the camera tab */
const cameratab = () => {
	id("camera_webaddress").addEventListener("keyup", camera_OnKeyUp);

	id("cameratab_loadframe").addEventListener("click", camera_loadframe);
	id("cameratab_getaddress").addEventListener("click", camera_GetAddress);
	id("cameratab_saveaddress").addEventListener("click", camera_saveaddress);
	id("camera_detach_button").addEventListener("click", camera_detachcam);
};

function cameraformataddress() {
	let saddress = getValueTrimmed("camera_webaddress");
	const saddressl = saddress.toLowerCase();
	if (saddress.length > 0) {
		if (
			!(
				saddressl.indexOf("https://") !== -1 ||
				saddressl.indexOf("http://") !== -1 ||
				saddressl.indexOf("rtp://") !== -1 ||
				saddressl.indexOf("rtps://") !== -1 ||
				saddressl.indexOf("rtp://") !== -1
			)
		) {
			saddress = `http://${saddress}`;
		}
	}
	setValue("camera_webaddress", saddress);
}

function camera_loadframe() {
	const saddress = getValueTrimmed("camera_webaddress");
	if (saddress.length === 0) {
		id("camera_frame").src = "";
		displayNone("camera_frame_display");
		displayNone("camera_detach_button");
	} else {
		cameraformataddress();
		id("camera_frame").src = getValue("camera_webaddress");
		displayBlock("camera_frame_display");
		displayTable("camera_detach_button");
	}
}

function camera_OnKeyUp(event) {
	if (event.keyCode === 13) {
		camera_loadframe();
	}
	return true;
}

function camera_saveaddress() {
	cameraformataddress();
	preferenceslist[0].camera_address = HTMLEncode(getValue('camera_webaddress'));
	SavePreferences(true);
}

function camera_detachcam() {
	const webaddress = id("camera_frame").src;
	id("camera_frame").src = "";
	displayNone("camera_frame_display");
	displayNone("camera_detach_button");
	window.open(webaddress);
}

function camera_GetAddress() {
	setValue("camera_webaddress",
		typeof (preferenceslist[0].camera_address) !== "undefined"
			? HTMLDecode(preferenceslist[0].camera_address)
			: "");
}
