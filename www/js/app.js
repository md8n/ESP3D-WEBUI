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
	let tabletTab = "";

	let failSafe = 10;

	let startUpInt = setInterval(() => {
		// Check for various key HTML panels and load them up
		if (!connectDlg && id("connectdlg.html")) {
			connectDlg = "loading";
			try {
				connectdlg(true);
				connectDlg = "loaded";
			} catch (err) {
				console.error("Error loading connect dialog:", err);
				connectDlg = "failed";
			}
		}

		if (!controlsPanel && id("controlPanel")) {
			controlsPanel = "loading";
			try {
				ControlsPanel();
				controlsPanel = "loaded";
			} catch (err) {
				console.error("Error loading controls panel:", err);
				controlsPanel = "failed";
			}
		}

		if (!navbarLoaded && id("navbar")) {
			navbarLoaded = "loading";
			try {
				navbar();
				navbarLoaded = "loaded";
			} catch (err) {
				console.error("Error loading navigation bar:", err);
				navbarLoaded = "failed";
			}
		}

		if (!tabletTab && id("tablettab")) {
			tabletTab = "loading";
			try {
				tabletInit();
				tabletTab = "loaded";
			} catch (err) {
				console.error("Error loading tablet tab:", err);
				tabletTab = "failed";
			}
		}

		if ((connectDlg && controlsPanel && navbarLoaded && tabletTab) || failSafe <= 0) {
			clearInterval(startUpInt);
			startUpInt = null;
		}

		// Ensure that we always break out of this
		failSafe--;
	}, 500);
};
