import {
	Common,
	get_icon_svg,
	conErr,
	stdErrMsg,
	displayBlock,
	displayNone,
	id,
	setValue,
	setHTML,
	closeModal,
	setactiveModal,
	showModal,
	alertdlg,
	confirmdlg,
	inputdlg,
	httpCmd,
	buildHttpFilesCmd,
	SendFileHttp,
	SendGetHttp,
	trans_text_item,
	CheckForHttpCommLock,
} from "./common.js";

//SPIFFS dialog

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

	const iconOptions = { t: "translate(50,1200) scale(1,-1)" };
	setHTML("SPIFFS_uploadbtn", get_icon_svg("upload", iconOptions));
	setHTML("refreshSPIFFSbtn", get_icon_svg("refresh", iconOptions));

	if (typeof root !== "undefined") {
		const common = new Common();
		common.SPIFFS_currentpath = root;
	}
	setValue("SPIFFS-select", "");
	setHTML("SPIFFS_file_name", trans_text_item("No file chosen"));
	displayNone(["SPIFFS_uploadbtn", "SPIFFS_prg", "uploadSPIFFSmsg", "SPIFFS_select_files"]);
	showModal();
	refreshSPIFFS();
};

function closeSPIFFSDialog(msg) {
	if (SPIFFS_upload_ongoing) {
		alertdlg(trans_text_item("Busy..."), trans_text_item("Upload is ongoing, please wait and retry."));
		return;
	}
	closeModal(msg);
}

const buildTable = (content) => `<table>${content}</table>`;
const buildTr = (content) => `<tr>${content}</tr>`;

function SPIFFSselect_dir(directoryname) {
	const needTraillingSlash = directoryname.endsWith("/") ? "" : "/";
	const common = new Common();
	common.SPIFFS_currentpath = directoryname + needTraillingSlash;
	SPIFFSSendCommand("list", "all");
}

/** Builds the SPIFFS nav bar, adds it to the parent element, and sets up the event handlers */
const SPIFFSnavbar = () => {
	const common = new Common();
	const tlist = common.SPIFFS_currentpath.split("/");
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
	// biome-ignore lint/complexity/noForEach: <explanation>
	actions.forEach((action) => {
		const elem = id(action.id);
		if (elem) {
			elem.addEventListener("click", (event) => action.method(action.path));
		}
	});
};

const SPIFFS_Createdir = () => inputdlg(trans_text_item("Please enter directory name"), trans_text_item("Name:"), processSPIFFS_Createdir);

function processSPIFFS_Createdir(answer) {
	if (answer.length > 0) {
		SPIFFSSendCommand("createdir", answer.trim());
	}
}

function SPIFFSDownload(url) {
	console.info(`Preparing to download ${url}`);
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
	confirmdlg(trans_text_item("Please Confirm"), trans_text_item("Confirm deletion of file: ") + filename, processSPIFFSDelete);
}

function SPIFFSDeleteDir(filename) {
	SPIFFS_currentfile = filename;
	confirmdlg(trans_text_item("Please Confirm"), trans_text_item("Confirm deletion of directory: ") + filename, processSPIFFSDeleteDir);
}

function processSPIFFSDeleteDir(answer) {
	if (answer === "yes") {
		SPIFFSSendCommand("deletedir", SPIFFS_currentfile);
	}
	SPIFFS_currentfile = "";
}

let old_file_name = "";

function SPIFFSRename(filename) {
	old_file_name = filename;
	inputdlg(trans_text_item("New file name"), trans_text_item("Name:"), processSPIFFSRename, old_file_name);
}

function processSPIFFSRename(new_file_name) {
	if (!new_file_name) {
		return;
	}
	const common = new Common();

	const cmd = buildHttpFilesCmd({ action: "rename", path: common.SPIFFS_currentpath, filename: old_file_name, newname: new_file_name });
	SendGetHttp(cmd, SPIFFSsuccess, SPIFFSfailed);
}

function SPIFFSSendCommand(action, filename) {
	const common = new Common();

	id("SPIFFS_loader").style.visibility = "visible";
	const cmd = buildHttpFilesCmd({ action: action, path: common.SPIFFS_currentpath, filename: filename });
	console.log(cmd);
	SendGetHttp(cmd, SPIFFSsuccess, SPIFFSfailed);
}

function SPIFFSsuccess(response) {
	//console.log(response);
	id("SPIFFS_loader").style.visibility = "hidden";
	displayBlock(["refreshSPIFFSbtn", "SPIFFS_select_files"]);
	if (response) {
		try {
			const jsonresponse = JSON.parse(response);
			SPIFFSdispatchfilestatus(jsonresponse);
		} catch (error) {
			console.error(`Could not parse '${response}' as JSON. ${error}`);
		}
	}
}

function SPIFFSfailed(error_code, response) {
	id("SPIFFS_loader").style.visibility = "hidden";
	displayBlock(["refreshSPIFFSbtn", "refreshSPIFFSbtn"]);
	alertdlg(trans_text_item("Error"), stdErrMsg(error_code, response));
	conErr(error_code, response);
}

function SPIFFSbutton(btnId, btnClass, icon) {
	const btnContent = `<button id="${btnId}" class="btn ${btnClass} btn-xs" style='padding: 5px 5px 0px 5px;'>${get_icon_svg(icon)}</button>`;
	return `<td width='0%' style='vertical-align:middle'>${btnContent}</td>`;
}

const buildSPIFFSTotalBar = (jsonresponse) => {
	let content = `${trans_text_item("Total:")} ${jsonresponse.total}`;
	content += `&nbsp;&nbsp;|&nbsp;&nbsp;${trans_text_item("Used:")} ${jsonresponse.used}&nbsp;`;
	content += `<meter min='0' max='100' high='90' value='${jsonresponse.occupation}'></meter>&nbsp;${jsonresponse.occupation}%`;
	if (jsonresponse.status !== "Ok") {
		content += `<br/>${trans_text_item(jsonresponse.status)}`;
	}

	return content;
};

const upDirAndRelist = (previouspath) => {
	SPIFFS_currentpath = previouspath;
	SPIFFSSendCommand("list", "all");
};

function SPIFFSdispatchfilestatus(jsonresponse) {
	setHTML("SPIFFS_status", buildSPIFFSTotalBar(jsonresponse));

	let content = "";
	const actions = [];
	const common = new Common();
	if (common.SPIFFS_currentpath !== "/") {
		const pos = common.SPIFFS_currentpath.lastIndexOf("/", common.SPIFFS_currentpath.length - 2);
		const previouspath = common.SPIFFS_currentpath.slice(0, pos + 1);
		const rowId = "SPIFFS_row_up_dir";
		content += `<tr id="${rowId}" style="cursor:pointer;"><td>${get_icon_svg("level-up")}</td><td colspan='4'> Up..</td></tr>`;
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
		let filecontent = `<td style='vertical-align:middle; color:#5BC0DE'>${get_icon_svg("file")}</td>`;
		// filecontent += "<td width='100%' style='vertical-align:middle'><a href=\"" + pathname + filename + "\" target=_blank download><button  class=\"btn btn-link no_overflow\">" + filename + "</button></a></td>"
		filecontent += `<td width='100%' style='vertical-align:middle'>${filename}</td>`;
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
		actions.push({ id: `${bIdD}select_${i}`, method: SPIFFSselect_dir, filename: `${common.SPIFFS_currentpath}${dirname}` });
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
	// biome-ignore lint/complexity/noForEach: <explanation>
	actions.forEach((action) => {
		const elem = id(action.id);
		if (elem) {
			elem.addEventListener("click", (event) => action.method(action.filename));
		}
	});

	SPIFFSnavbar();
}

function refreshSPIFFS() {
	setValue("SPIFFS_select", "");
	setHTML("uploadSPIFFSmsg", "");
	setHTML("SPIFFS_file_name", trans_text_item("No file chosen"));
	displayNone(["SPIFFS_uploadbtn", "refreshSPIFFSbtn", "SPIFFS_select_files"]);
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
			const tmp = trans_text_item("$n files");
			setHTML("SPIFFS_file_name", tmp.replace("$n", files.length));
		}
		id("SPIFFS_uploadbtn").click();
	} else {
		setHTML("SPIFFS_file_name", trans_text_item("No file chosen"));
	}
}

function SPIFFS_UploadFile() {
	const common = new Common();
	if (CheckForHttpCommLock()) {
		return;
	}

	const fileList = [];
	const files = id("SPIFFS_select").files;
	const formData = new FormData();
	formData.append("path", common.SPIFFS_currentpath);
	for (let i = 0; i < files.length; i++) {
		const file = files[i];
		fileList.push(file.name);
		const fullFilename = `${SPIFFS_currentpath}${file.name}`;
		//append file size first to check upload is complete
		formData.append(`${fullFilename}S`, file.size);
		formData.append("myfile[]", file, fullFilename);
		console.info(`Preparing ${fullFilename} for upload`);
	}
	displayNone(["SPIFFS-select_form", "SPIFFS_uploadbtn"]);
	SPIFFS_upload_ongoing = true;
	displayBlock(["uploadSPIFFSmsg", "SPIFFS_prg"]);
	setHTML("uploadSPIFFSmsg", `${translate_text_item("Uploading")} ${fileList.join(" ")}`);
	SendFileHttp(httpCmd.files, formData, SPIFFSUploadsuccess, SPIFFSUploadfailed);
}

function SPIFFSUploadsuccess(response) {
	setValue("SPIFFS-select", "");
	setHTML("SPIFFS_file_name", trans_text_item("No file chosen"));
	displayBlock(["SPIFFS-select_form", "refreshSPIFFSbtn"]);
	displayNone(["SPIFFS_prg", "SPIFFS_uploadbtn"]);
	setHTML("uploadSPIFFSmsg", "");
	SPIFFS_upload_ongoing = false;
	if (response) {
		try {
			const jsonresponse = JSON.parse(response.replace('"status":"Ok"', '"status":"Upload done"'));
			SPIFFSdispatchfilestatus(jsonresponse);
		} catch (error) {
			console.error(`Could not parse '${response}' as JSON. ${error}`);
		}
	}
}

function SPIFFSUploadfailed(error_code, response) {
	displayBlock(["SPIFFS-select_form", "SPIFFS_uploadbtn", "refreshSPIFFSbtn"]);
	displayNone(["SPIFFS_prg", "uploadSPIFFSmsg"]);
	setHTML("uploadSPIFFSmsg", "");
	conErr(stdErrMsg(error_code, response));
	const common = new Common();
	if (common.esp_error_code !== 0) {
		alertdlg(trans_text_item("Error"), stdErrMsg(`(${common.esp_error_code})`, common.esp_error_message));
		setHTML("SPIFFS_status", trans_text_item("Error : ") + common.esp_error_message);
		common.esp_error_code = 0;
	} else {
		alertdlg(trans_text_item("Error"), stdErrMsg(error_code, response));
		setHTML("SPIFFS_status", stdErrMsg(error_code, response, trans_text_item("Upload failed")));
	}
	SPIFFS_upload_ongoing = false;
	refreshSPIFFS();
}

export { SPIFFSdlg };
