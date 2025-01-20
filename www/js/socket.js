import {
	Monitor_output_Update,
	Common,
	id,
	HTMLDecode,
	setHTML,
	on_autocheck_position,
	enable_ping,
	grblHandleMessage,
	reportNone,
	clear_cmd_list,
	trans_text_item,
	UIdisableddlg,
} from "./common.js";

const convertDHT2Fahrenheit = false;
let event_source;

let wsmsg = "";
let ws_source;

const CancelCurrentUpload = () => {
	xmlhttpupload.abort();
	//const common = new Common();
	//common.http_communication_locked = false;
	console.log("Cancel Upload");
};

const check_ping = () => {
	const common = new Common();
	if (Date.now() - common.last_ping > 20000) {
		Disable_interface(true);
		console.log("No heart beat for more than 20s");
	}
};

/** Turn ping on or off based on its current value */
const handlePing = () => {
	const common = new Common();

	// First clear any existing interval
	clearInterval(common.interval_ping);

	if (enable_ping()) {
		common.last_ping = Date.now();
		common.interval_ping = setInterval(() => check_ping(), 10 * 1000);
		console.log("enable ping");
	} else {
		console.log("disable ping");
	}
};

let log_off = false;
const Disable_interface = (lostconnection) => {
	const lostcon = typeof lostconnection !== "undefined" ? lostconnection : false;

	//block all communication
	const common = new Common();
	common.http_communication_locked = true;
	log_off = true;

	clearInterval(common.interval_ping);

	//clear all waiting commands
	clear_cmd_list();
	//no camera
	id("camera_frame").src = "";
	//No auto check
	on_autocheck_position(false);
	reportNone();
	if (common.fwData.async_webcommunication) {
		event_source.removeEventListener("ActiveID", ActiveID_events, false);
		event_source.removeEventListener("InitID", Init_events, false);
		event_source.removeEventListener("DHT", DHT_events, false);
	}
	ws_source.close();
	document.title += `('${HTMLDecode(trans_text_item("Disabled"))})`;
	UIdisableddlg(lostcon);
};

const EventListenerSetup = () => {
	const common = new Common();
	if (!common.fwData.async_webcommunication) {
		return;
	}
	if (window.EventSource) {
		event_source = new EventSource("/events");
		event_source.addEventListener("InitID", Init_events, false);
		event_source.addEventListener("ActiveID", ActiveID_events, false);
		event_source.addEventListener("DHT", DHT_events, false);
	}
};

let page_id = "";
/** Get/Set the current page_id */
const pageID = (value) => {
	if (typeof value !== "undefined") {
		page_id = value;
	}
	return page_id;
}

/** Initialiase the page_id from the event data */
const Init_events = (e) => console.log(`connection id = ${pageID(e.data)}`);

const ActiveID_events = (e) => {
	if (pageID() === e.data) {
		return;
	}

	Disable_interface();
	console.log("I am disabled");
	event_source.close();
};

const DHT_events = (e) => {
	Handle_DHT(e.data);
};

const Handle_DHT = (data) => {
	const tdata = data.split(" ");
	if (tdata.length !== 2) {
		console.log(`DHT data invalid: ${data}`);
		return;
	}

	const temp = convertDHT2Fahrenheit ? Number.parseFloat(tdata[0]) * 1.8 + 32 : Number.parseFloat(tdata[0]);
	setHTML("DHT_humidity", `${Number.parseFloat(tdata[1]).toFixed(2).toString()}%`);
	const temps = `${temp.toFixed(2).toString()}&deg;${convertDHT2Fahrenheit ? "F" : "C"}`;
	setHTML("DHT_temperature", temps);
};

const process_socket_response = (msg) => msg.split("\n").forEach(grblHandleMessage);

const startSocket = () => {
	const common = new Common();
	try {
		const wsUrl = !common.fwData.async_webcommunication
			? `${document.location.host}/ws`
			: `${common.fwData.websocket_ip}:${common.fwData.websocket_port}`;
		ws_source = new WebSocket(`ws://${wsUrl}`, ["arduino"]);
		if (!common.fwData.async_webcommunication) {
			console.log(`Socket is ${wsUrl}`);
		}
	} catch (exception) {
		console.error(exception);
	}
	ws_source.binaryType = "arraybuffer";
	ws_source.onopen = (e) => { console.log("Connected"); };
	ws_source.onclose = (e) => {
		console.log("Disconnected");
		//seems sometimes it disconnect so wait 3s and reconnect
		//if it is not a log off
		if (!log_off) setTimeout(startSocket, 3000);
	};
	ws_source.onerror = (e) => {
		//Monitor_output_Update("[#]Error "+ e.code +" " + e.reason + "\n");
		console.log("ws error", e);
	};
	ws_source.onmessage = (e) => {
		let msg = "";
		//bin
		if (e.data instanceof ArrayBuffer) {
			const bytes = new Uint8Array(e.data);
			for (let i = 0; i < bytes.length; i++) {
				msg += String.fromCharCode(bytes[i]);
				if (bytes[i] === 10) {
					wsmsg += msg.replace("\r\n", "\n");
					const thismsg = wsmsg.trim();
					wsmsg = "";
					msg = "";
					Monitor_output_Update(thismsg);
					process_socket_response(thismsg);
					const noNeedToShowMsg = ["<", "ok T:", "X:", "FR:", "echo:E0 Flow"].some((msgStart) => thismsg.startsWith(msgStart));
					if (!noNeedToShowMsg && thismsg !== "ok") {
						console.log(thismsg);
					}
				}
			}
			wsmsg += msg;
		} else {
			msg += e.data;
			const tval = msg.split(":");
			if (tval.length >= 2) {
				if (tval[0] === "CURRENT_ID") {
					console.log(`connection id = ${pageID(tval[1])}`);
				}
				if (enable_ping()) {
					if (tval[0] === "PING") {
						pageID(tval[1]);
						// console.log("ping from id = " + pageID());
						common.last_ping = Date.now();
						if (common.interval_ping === -1) {
							common.interval_ping = setInterval(() => { check_ping(); }, 10 * 1000);
						}
					}
				}
				if (tval[0] === "ACTIVE_ID") {
					if (pageID() !== tval[1]) {
						Disable_interface();
					}
				}
				if (tval[0] === "DHT") {
					Handle_DHT(tval[1]);
				}
				if (tval[0] === "ERROR") {
					common.esp_error_message = tval[2];
					common.esp_error_code = tval[1];
					console.error(`ERROR: ${tval[2]} code:${tval[1]}`);
					CancelCurrentUpload();
				}
				if (tval[0] === "MSG") {
					console.info(`MSG: ${tval[2]} code:${tval[1]}`);
				}
			}
		}
		//console.log(msg);
	};
};

export {
	CancelCurrentUpload,
	handlePing,
	EventListenerSetup,
	pageID,
	process_socket_response,
	startSocket,
};
