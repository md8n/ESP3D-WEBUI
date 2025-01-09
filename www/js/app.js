import {
	connectdlg,
	displayNone,
	id,
	ControlsPanel,
	navbar,
	tabletInit,
} from "./common.js";

window.onload = () => {
	//to check if javascript is disabled like in android preview
	displayNone("loadingmsg");
	console.log("Connect to board");

	// These are all falsey, indicating nothing has been loaded
	let connectDlg = "";
	let controlsPanel = "";
	let navbarLoaded = "";

	let failSafe = 10;

	let startUpInt = setInterval(() => {
		// Check for various key HTML panels and load them up
		if (!connectDlg && id("connectdlg.html")) {
			connectDlg = "loading";
			connectdlg();
			connectDlg = "loaded";
		}

		if (!controlsPanel && id("controlPanel")) {
			controlsPanel = "loading";
			ControlsPanel();
			controlsPanel = "loaded";
		}

		if (!navbarLoaded && id("navbar")) {
			navbarLoaded = "loading";
			navbar();
			tabletInit();
			navbarLoaded = "loaded";
		}

		if ((connectDlg && controlsPanel && navbarLoaded) || failSafe <= 0) {
			clearInterval(startUpInt);
			startUpInt = null;
		}

		// Ensure that we always break out of this
		failSafe--;
	}, 500);
};
