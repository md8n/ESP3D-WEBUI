// import - Monitor_output_Update, id, HTMLDecode, setHTML, on_autocheck_position, enable_ping, grblHandleMessage, reportNone, clear_cmd_list, translate_text_item, UIdisableddlg

let convertDHT2Fahrenheit = false;
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

let interval_ping = 0;
/** Turn ping on or off based on its current value */
const handlePing = () => {
	if (enable_ping()) {
		// First clear any existing interval
		if (interval_ping) {
			clearInterval(interval_ping);
		}
		const common = new Common();
		common.last_ping = Date.now();
		interval_ping = setInterval(() => check_ping(), 10 * 1000);
		console.log("enable ping");
	} else {
		clearInterval(interval_ping);
		interval_ping = 0;
		console.log("disable ping");
	}
};

const Disable_interface = (lostconnection) => {
	let lostcon = false;
	if (typeof lostconnection !== "undefined") lostcon = lostconnection;
	//block all communication
	const common = new Common();
	common.http_communication_locked = true;
	log_off = true;
	if (interval_ping !== -1) clearInterval(interval_ping);
	//clear all waiting commands
	clear_cmd_list();
	//no camera
	id("camera_frame").src = "";
	//No auto check
	on_autocheck_position(false);
	reportNone();
	if (common.async_webcommunication) {
		event_source.removeEventListener("ActiveID", ActiveID_events, false);
		event_source.removeEventListener("InitID", Init_events, false);
		event_source.removeEventListener("DHT", DHT_events, false);
	}
	ws_source.close();
	document.title += `('${HTMLDecode(translate_text_item("Disabled"))})`;
	UIdisableddlg(lostcon);
};

const EventListenerSetup = () => {
	const common = new Common();
	if (!common.async_webcommunication) {
		return;
	}
	if (!!window.EventSource) {
		event_source = new EventSource("/events");
		event_source.addEventListener("InitID", Init_events, false);
		event_source.addEventListener("ActiveID", ActiveID_events, false);
		event_source.addEventListener("DHT", DHT_events, false);
	}
};

const Init_events = (e) => {
	page_id = e.data;
	console.log(`connection id = ${page_id}`);
};

const ActiveID_events = (e) => {
	if (page_id !== e.data) {
		Disable_interface();
		console.log("I am disabled");
		event_source.close();
	}
};

const DHT_events = (e) => {
	Handle_DHT(e.data);
};

const Handle_DHT = (data) => {
	var tdata = data.split(" ");
	if (tdata.length != 2) {
		console.log("DHT data invalid: " + data);
		return;
	}

	var temp = convertDHT2Fahrenheit
		? parseFloat(tdata[0]) * 1.8 + 32
		: parseFloat(tdata[0]);
	setHTML("DHT_humidity", parseFloat(tdata[1]).toFixed(2).toString() + "%");
	var temps = `${temp.toFixed(2).toString()}&deg;${convertDHT2Fahrenheit ? "F" : "C"}`;
	setHTML("DHT_temperature", temps);
};

const process_socket_response = (msg) => {
	msg.split("\n").forEach(grblHandleMessage);
};

const startSocket = () => {
	const common = new Common();
	try {
		if (common.async_webcommunication) {
			ws_source = new WebSocket(`ws://${document.location.host}/ws`, [
				"arduino",
			]);
		} else {
			console.log(`Socket is ${websocket_ip}:${websocket_port}`);
			ws_source = new WebSocket(`ws://${websocket_ip}:${websocket_port}`, [
				"arduino",
			]);
		}
	} catch (exception) {
		console.error(exception);
	}
	ws_source.binaryType = "arraybuffer";
	ws_source.onopen = (e) => {
		console.log("Connected");
	};
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
		var msg = "";
		//bin
		if (e.data instanceof ArrayBuffer) {
			var bytes = new Uint8Array(e.data);
			for (var i = 0; i < bytes.length; i++) {
				msg += String.fromCharCode(bytes[i]);
				if (bytes[i] == 10) {
					wsmsg += msg.replace("\r\n", "\n");
					var thismsg = wsmsg;
					wsmsg = "";
					msg = "";
					Monitor_output_Update(thismsg);
					process_socket_response(thismsg);
					if (
						!(
							thismsg.startsWith("<") ||
							thismsg.startsWith("ok T:") ||
							thismsg.startsWith("X:") ||
							thismsg.startsWith("FR:") ||
							thismsg.startsWith("echo:E0 Flow")
						)
					)
						console.log(thismsg);
				}
			}
			wsmsg += msg;
		} else {
			msg += e.data;
			const tval = msg.split(":");
			if (tval.length >= 2) {
				if (tval[0] === "CURRENT_ID") {
					page_id = tval[1];
					console.log(`connection id = ${page_id}`);
				}
				if (enable_ping()) {
					if (tval[0] === "PING") {
						page_id = tval[1];
						// console.log("ping from id = " + page_id);
						common.last_ping = Date.now();
						if (interval_ping === -1)
							interval_ping = setInterval(() => {
								check_ping();
							}, 10 * 1000);
					}
				}
				if (tval[0] === "ACTIVE_ID") {
					if (page_id !== tval[1]) {
						Disable_interface();
					}
				}
				if (tval[0] === "DHT") {
					Handle_DHT(tval[1]);
				}
				if (tval[0] === "ERROR") {
					const common = new Common();
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
