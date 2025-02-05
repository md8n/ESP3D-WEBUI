//import - get_icon_svg, conErr, stdErrMsg, displayBlock, displayNone, id, setValue, setHTML, closeModal, setactiveModal, showModal, alertdlg, confirmdlg, inputdlg, SendFileHttp, SendGetHttp, translate_text_item

let SPIFFS_currentpath = "/";
let SPIFFS_currentfile = "";
let SPIFFS_upload_ongoing = false;

const SPIFSSDialogClose = () => closeSPIFFSDialog("cancel");
const SPIFFSSelectClick = () => document.getElementById("SPIFFS_select").click();
const SPIFFSSelectFilesClick = () => document.getElementById("SPIFFS_select_files").click();

/** SPIFFS dialog */
const SPIFFSdlg = (root) => {
	const modal = setactiveModal("SPIFFSdlg.html");
	if (modal == null) {
		return;
	}

	id("SPIFFS_span_close").addEventListener("click", SPIFSSDialogClose);
	id("SPIFFS_select").addEventListener("change", checkSPIFFSfiles);
	id("SPIFFS_select_files").addEventListener("click", SPIFFSSelectClick);
	id("SPIFFS_file_name").addEventListener("mouseup", SPIFFSSelectFilesClick);
	id("SPIFFS_uploadbtn").addEventListener("click", SPIFFS_UploadFile);
	id("SPIFFS_create_dir_btn").addEventListener("click", SPIFFS_Createdir);
	id("SPIFFS_btn_close").addEventListener("click", SPIFSSDialogClose);
	id("refreshSPIFFSbtn").addEventListener("click", refreshSPIFFS);

	if (typeof root !== "undefined") {
		SPIFFS_currentpath = root;
	}
	setValue("SPIFFS_select", "");
	setHTML("SPIFFS_file_name", translate_text_item("No file chosen"));
	displayNone("SPIFFS_uploadbtn");
	displayNone("SPIFFS_prg");
	displayNone("uploadSPIFFSmsg");
	displayNone("SPIFFS_select_files");
	showModal();
	refreshSPIFFS();
};

function closeSPIFFSDialog(msg) {
	if (SPIFFS_upload_ongoing) {
		alertdlg(translate_text_item("Busy..."), translate_text_item("Upload is ongoing, please wait and retry."));
		return;
	}
	closeModal(msg);
}

const buildTable = (content) => `<table>${content}</table>`;
const buildTr = (content) => `<tr>${content}</tr>`;

function SPIFFSselect_dir(directoryname) {
	SPIFFS_currentpath = directoryname + directoryname.endsWith("/") ? "" : "/";
	SPIFFSSendCommand("list", "all");
}

/** Builds the SPIFFS nav bar, adds it to the parent element, and sets up the event handlers */
const SPIFFSnavbar = () => {
	const tlist = SPIFFS_currentpath.split("/");
	let path = "/";
	let nb = 1;

	const actions = [];

	const bIdD = "SPIFFS_btn_dir_";

	const spanRoot = "<span class='tooltip-text'>Go to root directory</span>";
	let content = `<td class='tooltip'>${spanRoot}<button id="${bIdD}_root" class="btn btn-primary">/</button></td>`;
	actions.push({ id: `${bIdD}_root`, method: SPIFFSselect_dir, path: "/" });
	while (nb < tlist.length - 1) {
		path += `${tlist[nb]}/`;
		const bId = `${bIdD}${nb}`;
		content += `<td><button id=${bId} class="btn btn-link">${tlist[nb]}</button></td><td>/</td>`;
		actions.push({ id: bId, method: SPIFFSselect_dir, path: path });
		nb++;
	}

	setHTML("SPIFFS_path", buildTable(buildTr(content)));
	actions.forEach((action) => {
		const elem = id(action.id);
		if (elem) {
			elem.addEventListener("click", (event) => action.method(action.path));
		}
	});
};

function SPIFFS_Createdir() {
	inputdlg(translate_text_item("Please enter directory name"), translate_text_item("Name:"), processSPIFFS_Createdir);
}

function processSPIFFS_Createdir(answer) {
	if (answer.length > 0) {
		SPIFFSSendCommand("createdir", answer.trim());
	}
}

function SPIFFSDownload(url) {
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = url;
	document.body.appendChild(anchor);
	anchor.click();
	document.body.removeChild(anchor);
}

function processSPIFFSDelete(answer) {
	if (answer === "yes") {
		SPIFFSSendCommand("delete", SPIFFS_currentfile);
	}
	SPIFFS_currentfile = "";
}

function SPIFFSDelete(filename) {
	SPIFFS_currentfile = filename;
	confirmdlg(translate_text_item("Please Confirm"), translate_text_item("Confirm deletion of file: ") + filename, processSPIFFSDelete);
}

function SPIFFSDeleteDir(filename) {
	SPIFFS_currentfile = filename;
	confirmdlg(translate_text_item("Please Confirm"), translate_text_item("Confirm deletion of directory: ") + filename, processSPIFFSDeleteDir);
}

function processSPIFFSDeleteDir(answer) {
	if (answer === "yes") {
		SPIFFSSendCommand("deletedir", SPIFFS_currentfile);
	}
	SPIFFS_currentfile = "";
}

function SPIFFSRename(filename) {
	old_file_name = filename;
	inputdlg(translate_text_item("New file name"), translate_text_item("Name:"), processSPIFFSRename, old_file_name);
}

function processSPIFFSRename(new_file_name) {
	if (!new_file_name) {
		return;
	}
	let url = `/files?action=rename&path=${encodeURIComponent(SPIFFS_currentpath)}`;
	url += `&filename=${encodeURIComponent(old_file_name)}`;
	url += `&newname=${encodeURIComponent(new_file_name)}`;
	SendGetHttp(url, SPIFFSsuccess, SPIFFSfailed);
}

const testResponse = [
	'{"files":[',
	'{"name":"config.html.gz","size":"4.76 KB"},',
	'{"name":"index.html.gz","size":"21.44 KB"},',
	'{"name":"favicon.ico","size":"1.12 KB"},',
	'{"name":"config.htm","size":"19.65 KB"},',
	'{"name":"config2.htm","size":"19.98 KB"},',
	'{"name":"Testname","size":"-1"},',
	'{"name":"index2.html.gz","size":"28.89 KB"}',
	'],"path":"/","status":"Ok","total":"2.81 MB","used":"118.88 KB","occupation":"4"}',
];

function SPIFFSSendCommand(action, filename) {
	//removeIf(production)
	SPIFFSsuccess(testResponse.join(""));
	return;
	//endRemoveIf(production)
	let url = `/files?action=${action}&filename=${encodeURI(filename)}&path=${encodeURI(SPIFFS_currentpath)}`;
	id("SPIFFS_loader").style.visibility = "visible";
	console.log(url);
	SendGetHttp(url, SPIFFSsuccess, SPIFFSfailed);
}

function SPIFFSsuccess(response) {
	//console.log(response);
	const jsonresponse = JSON.parse(response);
	id("SPIFFS_loader").style.visibility = "hidden";
	displayBlock("refreshSPIFFSbtn");
	displayBlock("SPIFFS_select_files");
	SPIFFSdispatchfilestatus(jsonresponse);
}

function SPIFFSfailed(error_code, response) {
	id("SPIFFS_loader").style.visibility = "hidden";
	displayBlock("refreshSPIFFSbtn");
	displayBlock("refreshSPIFFSbtn");
	alertdlg(translate_text_item("Error"), stdErrMsg(error_code, response));
	conErr(error_code, response);
}

function SPIFFSbutton(btnId, btnClass, icon) {
	const btnContent = `<button id="${btnId}" class="btn ${btnClass} btn-xs" style='padding: 5px 5px 0px 5px;'>${get_icon_svg(icon)}</button>`;
	return `<td width='0%' style='vertical-align:middle'>${btnContent}</td>`;
}

const buildSPIFFSTotalBar = (jsonresponse) => {
	let content = `${translate_text_item("Total:")} ${jsonresponse.total}`;
	content += `&nbsp;&nbsp;|&nbsp;&nbsp;${translate_text_item("Used:")} ${jsonresponse.used}&nbsp;`;
	content += `<meter min='0' max='100' high='90' value='${jsonresponse.occupation}'></meter>&nbsp;${jsonresponse.occupation}%`;
	if (jsonresponse.status !== "Ok") {
		content += `<br/>${translate_text_item(jsonresponse.status)}`;
	}

	return content;
};

const upDirAndRelist = (previouspath) => {
	SPIFFS_currentpath(previouspath);
	SPIFFSSendCommand("list", "all");
};

function SPIFFSdispatchfilestatus(jsonresponse) {
	setHTML("SPIFFS_status", buildSPIFFSTotalBar(jsonresponse));

	let content = "";
	const actions = [];
	if (SPIFFS_currentpath !== "/") {
		const pos = SPIFFS_currentpath.lastIndexOf("/", SPIFFS_currentpath.length - 2);
		const previouspath = SPIFFS_currentpath.slice(0, pos + 1);
		const rowId = "SPIFFS_row_up_dir";
		content += `<tr id="${rowId}" style="cursor:pointer;"><td >${get_icon_svg("level-up")}</td><td colspan='4'> Up..</td></tr>`;
		actions.push({ id: rowId, method: upDirAndRelist, filename: previouspath });
	}
	jsonresponse.files.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

	const bIdF = "SPIFFS_btn_file_";
	for (let i = 0; i < jsonresponse.files.length; i++) {
		if (String(jsonresponse.files[i].size) === "-1") {
			continue;
		}
		//first display files
		const filesize = jsonresponse.files[i].size;
		const pathname = jsonresponse.path;
		const filename = jsonresponse.files[i].name;
		let filecontent = `<td  style='vertical-align:middle; color:#5BC0DE'>${get_icon_svg("file")}</td>`;
		// filecontent += "<td  width='100%'  style='vertical-align:middle'><a href=\"" + pathname + filename + "\" target=_blank download><button  class=\"btn btn-link no_overflow\">" + filename + "</button></a></td>"
		filecontent += `<td  width='100%'  style='vertical-align:middle'>${filename}</td>`;
		filecontent += `<td nowrap  style='vertical-align:middle; text-align:right'>${filesize}</td>`;
		filecontent += SPIFFSbutton(`${bIdF}download_${i}`, "btn-default", "download");
		filecontent += SPIFFSbutton(`${bIdF}delete_${i}`, "btn-danger", "trash");
		filecontent += SPIFFSbutton(`${bIdF}rename_${i}`, "btn-default", "wrench");
		content += buildTr(filecontent);

		actions.push({ id: `${bIdF}download_${i}`, method: SPIFFSDownload, filename: pathname + filename });
		actions.push({ id: `${bIdF}delete_${i}`, method: SPIFFSDelete, filename: filename });
		actions.push({ id: `${bIdF}rename_${i}`, method: SPIFFSRename, filename: filename });
	}

	//then display directories
	const bIdD = "SPIFFS_btn_dir_";
	for (let i = 0; i < jsonresponse.files.length; i++) {
		if (String(jsonresponse.files[i].size) !== "-1") {
			continue;
		}
		const dirname = jsonresponse.files[i].name;
		const selectDirBtn = `<button id="${bIdD}select_${i}" class="btn btn-link">${dirname}</button>`;
		actions.push({ id: `${bIdD}select_${i}`, method: SPIFFSselect_dir, filename: `${SPIFFS_currentpath}${dirname}` });
		let dircontent = `<td style='vertical-align:middle ; color:#5BC0DE'>${get_icon_svg("folder-close")}</td>`;
		dircontent += `<td width='100%' style='vertical-align:middle'>${selectDirBtn}</td>`;
		dircontent += "<td nowrap style='vertical-align:middle'></td>"; // No size field
		dircontent += "<td></td>"; // Spacer for nonexistent download button
		dircontent += SPIFFSbutton(`${bIdD}delete_${i}`, "btn-danger", "trash");
		dircontent += SPIFFSbutton(`${bIdD}rename_${i}`, "btn-default", "wrench");
		content += buildTr(dircontent);

		actions.push({ id: `${bIdD}delete_${i}`, method: SPIFFSDeleteDir, filename: dirname });
		actions.push({ id: `${bIdD}rename_${i}`, method: SPIFFSRename, filename: dirname });
	}

	setHTML("SPIFFS_file_list", content);
	actions.forEach((action) => {
		id(action.id).addEventListener("click", (event) => action.method(action.filename));
	});

	SPIFFSnavbar();
}

function refreshSPIFFS() {
	setValue("SPIFFS_select", "");
	setHTML("uploadSPIFFSmsg", "");
	setHTML("SPIFFS_file_name", translate_text_item("No file chosen"));
	displayNone("SPIFFS_uploadbtn");
	displayNone("refreshSPIFFSbtn");
	displayNone("SPIFFS_select_files");
	//removeIf(production)
	SPIFFSsuccess(testResponse.join(""));
	return;
	//endRemoveIf(production)
	SPIFFSSendCommand("list", "all");
}

function checkSPIFFSfiles() {
	const files = id("SPIFFS_select").files;
	displayNone("uploadSPIFFSmsg");
	// No need to display the upload button because we will click it automatically
	// displayFiles('SPIFFS_uploadbtn');
	if (files.length > 0) {
		if (files.length === 1) {
			setHTML("SPIFFS_file_name", files[0].name);
		} else {
			const tmp = translate_text_item("$n files");
			setHTML("SPIFFS_file_name", tmp.replace("$n", files.length));
		}
		id("SPIFFS_uploadbtn").click();
	} else {
		setHTML("SPIFFS_file_name", translate_text_item("No file chosen"));
	}
}

function SPIFFSUploadProgressDisplay(oEvent) {
	if (oEvent.lengthComputable) {
		const percentComplete = (oEvent.loaded / oEvent.total) * 100;
		setValue("SPIFFS_prg", percentComplete);
		setHTML("uploadSPIFFSmsg", `${translate_text_item("Uploading")} ${SPIFFS_currentfile} ${percentComplete.toFixed(0)}%`);
	} else {
		// Impossible because size is unknown
	}
}

function SPIFFS_UploadFile() {
	if (http_communication_locked) {
		alertdlg(translate_text_item("Busy..."), translate_text_item("Communications are currently locked, please wait and retry."),);
		return;
	}
	const files = id("SPIFFS_select").files;
	const formData = new FormData();
	const url = "/files";
	formData.append("path", SPIFFS_currentpath);
	for (let i = 0; i < files.length; i++) {
		const file = files[i];
		const arg = `${SPIFFS_currentpath}${file.name}S`;
		//append file size first to check upload is complete
		formData.append(arg, file.size);
		formData.append("myfile[]", file, `${SPIFFS_currentpath}${file.name}`);
	}
	displayNone("SPIFFS_select_form");
	displayNone("SPIFFS_uploadbtn");
	SPIFFS_upload_ongoing = true;
	displayBlock("uploadSPIFFSmsg");
	displayBlock("SPIFFS_prg");
	SPIFFS_currentfile = (files.length === 1) ? files[0].name : "";
	setHTML("uploadSPIFFSmsg", `${translate_text_item("Uploading")} ${SPIFFS_currentfile}`);
	SendFileHttp(url, formData, SPIFFSUploadProgressDisplay, SPIFFSUploadsuccess, SPIFFSUploadfailed);
}

function SPIFFSUploadsuccess(response) {
	setValue("SPIFFS_select", "");
	setHTML("SPIFFS_file_name", translate_text_item("No file chosen"));
	displayBlock("SPIFFS_select_form");
	displayNone("SPIFFS_prg");
	displayNone("SPIFFS_uploadbtn");
	setHTML("uploadSPIFFSmsg", "");
	displayBlock("refreshSPIFFSbtn");
	SPIFFS_upload_ongoing = false;
	const jsonresponse = JSON.parse(response.replace('"status":"Ok"', '"status":"Upload done"'));
	SPIFFSdispatchfilestatus(jsonresponse);
}

function SPIFFSUploadfailed(error_code, response) {
	displayBlock("SPIFFS_select_form");
	displayNone("SPIFFS_prg");
	displayBlock("SPIFFS_uploadbtn");
	setHTML("uploadSPIFFSmsg", "");
	displayNone("uploadSPIFFSmsg");
	displayBlock("refreshSPIFFSbtn");
	conErr(stdErrMsg(error_code, response));
	if (esp_error_code !== 0) {
		alertdlg(translate_text_item("Error"), stdErrMsg(`(${esp_error_code})`, esp_error_message));
		setHTML("SPIFFS_status", translate_text_item("Error : ") + esp_error_message);
		esp_error_code = 0;
	} else {
		alertdlg(translate_text_item("Error"), stdErrMsg(error_code, response));
		setHTML("SPIFFS_status", stdErrMsg(error_code, response, translate_text_item("Upload failed")));
	}
	SPIFFS_upload_ongoing = false;
	refreshSPIFFS();
}
