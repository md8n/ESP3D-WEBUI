import {
	Common,
	get_icon_svg,
	displayBlock,
	displayInline,
	displayNone,
	id,
	stdErrMsg,
	setHTML,
	alertdlg,
	confirmdlg,
	inputdlg,
	SendPrinterCommand,
	tryAutoReport,
	SendFileHttp,
	SendGetHttp,
	showGCode,
	translate_text_item,
} from "./common.js";

let files_currentPath = "/";
let files_filter_sd_list = false;
let files_file_list = [];
let files_status_list = [];
let files_current_file_index = -1;
let files_error_status = "";
let tfiles_filters;
const tft_sd = "SD:";
const tft_usb = "U:";
const printer_sd = "SDCARD:";
let current_source = "/";
let last_source = "/";

function build_file_filter_list(filters_list) {
	build_accept(filters_list);
	update_files_list();
}

function update_files_list() {
	//console.log("Updating list");
	if (files_file_list.length === 0) {
		return;
	}
	for (let i = 0; i < files_file_list.length; i++) {
		const isdirectory = files_file_list[i].isdir;
		const file_name = files_file_list[i].name;
		files_file_list[i].isprintable = files_isgcode(file_name, isdirectory);
	}
	files_build_display_filelist();
}

function build_accept(file_filters_list) {
	let accept_txt = "";
	if (typeof file_filters_list !== "undefined") {
		tfiles_filters = file_filters_list.trim().split(";");
		for (let i = 0; i < tfiles_filters.length; i++) {
			const v = tfiles_filters[i].trim();
			if (v.length > 0) {
				if (accept_txt.length > 0) accept_txt += ", ";
				accept_txt += `.${v}`;
			}
		}
	}
	if (accept_txt.length === 0) {
		accept_txt = "*, *.*";
		tfiles_filters = "";
	}
	const fif = id("files_input_file");
	if (fif) {
		fif.accept = accept_txt;
	}
	console.log(accept_txt);
}

/** Set up the event handlers for the files panel */
function init_files_panel(dorefresh = true) {
	displayInline("files_refresh_btn");
	displayNone(["files_refresh_primary_sd_btn", "files_refresh_secondary_sd_btn"]);

	id("files_createdir_btn").addEventListener("click", (event) => files_Createdir());
	id("files_filter_btn").addEventListener("click", (event) => files_filter_button());

	id("files_refresh_btn").addEventListener("click", (event) => files_refreshFiles(files_currentPath));
	id("files_refresh_primary_sd_btn").addEventListener("click", (event) => files_refreshFiles(primary_sd));
	id("files_refresh_secondary_sd_btn").addEventListener("click", (event) => files_refreshFiles(secondary_sd));

	id("files_refresh_printer_sd_btn").addEventListener("click", (event) => {
		current_source = printer_sd;
		files_refreshFiles(files_currentPath);
	});
	id("files_refresh_tft_sd_btn").addEventListener("click", (event) => {
		current_source = tft_sd;
		files_refreshFiles(files_currentPath);
	});
	id("files_refresh_tft_usb_btn").addEventListener("click", (event) => {
		current_source = tft_usb;
		files_refreshFiles(files_currentPath);
	});

	// TODO: Find out what happened to the `files_progress` method
	// id('progress_btn').addEventListener('click', (event) => files_progress());
	id("abort_btn").addEventListener("click", (event) => files_abort());
	id("print_upload_btn").addEventListener("click", (event) => files_select_upload());

	id("files_input_file").addEventListener("change", (event) => files_check_if_upload());

	files_set_button_as_filter(files_filter_sd_list);
	if (direct_sd && dorefresh) {
		files_refreshFiles(files_currentPath);
	}
}

const files_set_button_as_filter = (isfilter) => setHTML("files_filter_glyph", get_icon_svg(!isfilter ? "filter" : "list-alt", "1em", "1em"));

function files_filter_button() {
	files_filter_sd_list = !files_filter_sd_list;
	files_set_button_as_filter(files_filter_sd_list);
	files_build_display_filelist();
}

function formatFileSize(size) {
	const nSize = Number(size);
	if (Number.isNaN(nSize)) {
		return size;
	}
	// This is using true binary sizes, powers of 2, and not decimalised sizes
	for (const fSize in [{ size: "TB", pow: 40 }, { size: "GB", pow: 30 }, { size: "MB", pow: 20 }, { size: "KB", pow: 10 }, { size: "B", pow: 0 }]) {
		const dSize = (2 ** fSize.pow);
		if (nSize > dSize) {
			return `${(nSize / dSize).toFixed(2)} ${fSize.size}`;
		}
	}
	// We should only end up here if the file size is 0
	return `${nSize} B`;
}

function files_build_file_line(index, actions) {
	let content = "";
	const entry = files_file_list[index];
	const is_clickable = files_is_clickable(index);
	if ((files_filter_sd_list && entry.isprintable) || !files_filter_sd_list) {
		const fliId = `filelist_${index}`;
		const clickStyle = is_clickable ? " style='cursor:pointer;'" : "";
		content += `<li id='${fliId}' class='list-group-item list-group-hover'${clickStyle}>`;
		content += "<div class='row'>";
		content += "<div class='col-md-5 col-sm-5 no_overflow'>";
		content += "<table><tr>";
		content += `<td><span style='color:DeepSkyBlue;'>${get_icon_svg(entry.isdir ? "folder-open" : "file")}</span></td>`;
		content += `<td>${entry.name}</td>`;
		content += "</tr></table>";
		content += "</div>";
		if (is_clickable) {
			actions.push({ id: fliId, method: files_click_file, index: index });
		}
		let sizecol = "col-md-2 col-sm-2 filesize";
		let timecol = "col-md-2 col-sm-2";
		let iconcol = "col-md-3 col-sm-3";
		if (!entry.isdir && entry.datetime === "") {
			sizecol = "col-md-3 col-sm-3 filesize";
			timecol = "hide_it";
			iconcol = "col-md-4 col-sm-4";
		}
		const entrySize = entry.isdir ? "" : formatFileSize(entry.size);
		content += `<div class='${sizecol}'>${entrySize}</div>`;

		const btnPad = "style='padding-top: 4px;'";
		const btnCls = "class='btn btn-xs btn-default'";
		content += `<div class='${timecol}'>${entry.datetime}</div>`;
		content += `<div class='${iconcol}'>`;
		content += "<div class='pull-right'>";
		if (entry.isprintable) {
			content += `<button id='${fliId}_print_btn' ${btnCls} ${btnPad}>${get_icon_svg("play", "1em", "1em")}</button>`;
			actions.push({ id: `${fliId}_print_btn`, method: files_print, index: index });
		}
		content += "&nbsp;";
		if (!entry.isdir) {
			content += `<button id='${fliId}_download_btn' ${btnCls} ${btnPad}>${get_icon_svg("download", "1em", "1em")}</button>`;
			actions.push({ id: `${fliId}_download_btn`, method: files_download, index: index });
		}
		if (files_showdeletebutton(index)) {
			content += `<button id='${fliId}_delete_btn' class='btn btn-xs btn-danger' ${btnPad}>${get_icon_svg("trash", "1em", "1em")}</button>`;
			actions.push({ id: `${fliId}_delete_btn`, method: files_delete, index: index });
		}
		content += `<button id='${fliId}_rename_btn' ${btnCls} ${btnPad}>${get_icon_svg("wrench", "1em", "1em")}</button>`;
		actions.push({ id: `${fliId}_rename_btn`, method: files_rename, index: index });
		content += "</div>";
		content += "</div>";
		content += "</div>";
		content += "</li>";
	}
	return content;
}

function tabletSelectGCodeFile(filename) {
	const selector = id("filelist");
	const options = Array.from(selector.options);
	const option = options.find((item) => item.text === filename);
	option.selected = true;
}

function files_print(index) {
	const file = files_file_list[index];
	const path = files_currentPath + file.name;
	tabletSelectGCodeFile(file.name);
	tabletLoadGCodeFile(path, file.size);
	files_print_filename(path);
}

function files_print_filename(path) {
	get_status();
	if (reportType === "none") {
		tryAutoReport(); // will fall back to polled if autoreport fails
	}
	SendPrinterCommand(`$SD/Run=${path}`);
}

const files_Createdir = () => inputdlg(translate_text_item("Please enter directory name"), translate_text_item("Name:"), process_files_Createdir);

function process_files_Createdir(answer) {
	if (answer.length > 0) {
		files_create_dir(answer.trim());
	}
}

function files_create_dir(name) {
	if (direct_sd) {
		const cmdpath = files_currentPath;
		const url = `/upload?path=${encodeURIComponent(cmdpath)}&action=createdir&filename=${encodeURIComponent(name)}`;
		displayBlock("files_nav_loader");
		SendGetHttp(url, files_list_success, files_list_failed);
	}
}

function files_delete(index) {
	files_current_file_index = index;
	let msg = translate_text_item("Confirm deletion of directory: ");
	if (!files_file_list[index].isdir) {
		msg = translate_text_item("Confirm deletion of file: ");
	}
	confirmdlg(translate_text_item("Please Confirm"), msg + files_file_list[index].name, process_files_Delete);
}

function process_files_Delete(answer) {
	if (answer === "yes" && files_current_file_index !== -1) {
		files_delete_file(files_current_file_index);
	}
	files_current_file_index = -1;
}

function files_delete_file(index) {
	files_error_status = `Delete ${files_file_list[index].name}`;
	if (!direct_sd) {
		return;
	}
	const cmdpath = `path=${encodeURIComponent(files_currentPath)}`;
	const action = `action=${files_file_list[index].isdir ? "deletedir" : "delete"}`;
	const filename = `filename=${encodeURIComponent(files_file_list[index].sdname)}`;
	const url = `/upload?${cmdpath}&${action}&${filename}`;
	displayBlock("files_nav_loader");
	SendGetHttp(url, files_list_success, files_list_failed);
}

const files_is_clickable = (index) => files_file_list[index].isdir ? true : direct_sd;

const files_enter_dir = (name) => files_refreshFiles(`${files_currentPath + name}/`, true);

let old_file_name;
function files_rename(index) {
	const entry = files_file_list[index];
	old_file_name = entry.sdname;
	inputdlg(translate_text_item("New file name"), translate_text_item("Name:"), process_files_rename, old_file_name);
}

function process_files_rename(new_file_name) {
	if (!new_file_name) {
		return;
	}
	files_error_status = `Rename ${old_file_name}`;

	const cmdpath = `path=${encodeURIComponent(files_currentPath)}`;
	const action = "action=rename";
	const filename = `filename=${encodeURIComponent(old_file_name)}`;
	const newname = `newname=${encodeURIComponent(new_file_name)}`;
	const url = `/upload?${cmdpath}&${action}&${filename}&${newname}`;
	displayBlock("files_nav_loader");
	SendGetHttp(url, files_list_success, files_list_failed);
}
function files_download(index) {
	const entry = files_file_list[index];
	//console.log("file on direct SD");
	const url = `SD/${files_currentPath}${entry.sdname}`;
	window.location.href = encodeURIComponent(url.replace("//", "/"));
}
function files_click_file(index) {
	const entry = files_file_list[index];
	if (entry.isdir) {
		files_enter_dir(entry.name);
		return;
	}
	if (false && direct_sd) {
		// Don't download on click; use the button
		//console.log("file on direct SD");
		const url = `SD/${files_currentPath}${entry.sdname}`;
		window.location.href = encodeURIComponent(url.replace("//", "/"));
		return;
	}
}

function files_isgcode(filename, isdir) {
	if (isdir) {
		return false;
	}
	// This can happen if files_showprintbutton is called before the
	// files panel has been created
	if (typeof tfiles_filters === "undefined") {
		return false;
	}
	if (tfiles_filters.length === 0) {
		return true;
	}
	for (let i = 0; i < tfiles_filters.length; i++) {
		const v = `.${tfiles_filters[i].trim()}`;
		if (filename.endsWith(v)) {
			return true;
		}
	}
	return false;
}

function files_showdeletebutton(index) {
	//can always deleted dile or dir ?
	//if /ext/ is serial it should failed as fw does not support it
	//var entry = files_file_list[index];
	//if (direct_sd) return true;
	//if (!entry.isdir) return true;
	return true;
}

function files_refreshFiles(path, usecache) {
	//console.log("refresh requested " + path);
	const cmdpath = path;
	files_currentPath = path;
	if (current_source !== last_source) {
		files_currentPath = "/";
		path = "/";
		last_source = current_source;
	}
	if (current_source === tft_sd || current_source === tft_usb) {
		displayNone("print_upload_btn");
	} else {
		displayBlock("print_upload_btn");
	}
	if (typeof usecache === "undefined") {
		usecache = false;
	}
	setHTML("files_currentPath", files_currentPath);
	files_file_list = [];
	files_status_list = [];
	files_build_display_filelist(false);
	displayBlock(["files_list_loader", "files_nav_loader"]);
	//this is pure direct SD
	if (direct_sd) {
		const url = `/upload?path=${encodeURI(cmdpath)}`;
		SendGetHttp(url, files_list_success, files_list_failed);
	}
}

function addOption(selector, name, value, isDisabled, isSelected) {
	const opt = document.createElement("option");
	opt.appendChild(document.createTextNode(name));
	opt.disabled = isDisabled;
	opt.selected = isSelected;
	opt.value = value;
	selector.appendChild(opt);
}

const populateTabletFileSelector = (files, path) => {
	const common = new Common();
	const selector = id("filelist");
	if (!selector) {
		return;
	}

	selector.length = 0;
	selector.selectedIndex = 0;
	const selectedFile = common.gCodeFilename.split("/").slice(-1)[0];

	if (!files.length) {
		addOption(selector, "No files found", -3, true, selectedFile === "");
		return;
	}
	const inRoot = path === "/";
	const legend = `Load GCode File from /SD${path}`;
	addOption(selector, legend, -2, true, true); // A different one might be selected later

	if (!inRoot) {
		addOption(selector, "..", -1, false, false);
	}
	let gCodeFileFound = false;
	files.forEach((file, index) => {
		if (file.isprintable) {
			const found = file.name === selectedFile;
			if (found) {
				gCodeFileFound = true;
			}
			addOption(selector, file.name, index, false, found);
		}
	});
	if (!gCodeFileFound) {
		common.gCodeFilename = "";
		common.gCodeDisplayable = false;
		showGCode("");
	}

	files.forEach((file, index) => {
		if (file.isdir) {
			addOption(selector, `${file.name}/`, index, false, false);
		}
	});
};

const files_list_success = (response_text) => {
	displayBlock("files_navigation_buttons");
	let error = false;
	let response;
	try {
		response = JSON.parse(response_text);
	} catch (e) {
		console.error(`Parsing error: ${e}\n${response_text}`);
		error = true;
	}
	if (error || typeof response.status === "undefined") {
		files_list_failed(406, translate_text_item("Wrong data", true));
		return;
	}
	populateTabletFileSelector(response);
	files_file_list = [];
	if (Array.isArray(response.files)) {
		for (let i = 0; i < response.files.length; i++) {
			const file = response.files[i];
			const file_name = file.name;
			const isdirectory = file.size === "-1";
			files_file_list.push({
				name: file_name,
				sdname: file_name,
				size: !isdirectory ? file.size : "",
				isdir: isdirectory,
				datetime: file.datetime,
				isprintable: files_isgcode(file_name, isdirectory),
			});
		}
	}
	files_file_list.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
	let vtotal = "-1";
	let vused = "-1";
	let voccupation = "-1";
	if (typeof response.total !== "undefined") {
		vtotal = response.total;
	}
	if (typeof response.used !== "undefined") {
		vused = response.used;
	}
	if (typeof response.occupation !== "undefined") {
		voccupation = response.occupation;
	}
	files_status_list = [];
	files_status_list.push({
		status: translate_text_item(response.status),
		path: response.path,
		used: vused,
		total: vtotal,
		occupation: voccupation,
	});
	files_build_display_filelist();
};

/** Shows an alert dialog for the ESP error, and then clears the ESP error_code */
const alertEspError = () => {
	const common = new Common();
	alertdlg(translate_text_item("Error"), stdErrMsg(`(${common.esp_error_code})`, common.esp_error_message));
	common.esp_error_code = 0;
};

function files_list_failed(error_code, response) {
	displayBlock("files_navigation_buttons");
	const common = new Common();
	if (common.esp_error_code !== 0) {
		alertEspError();
	} else {
		alertdlg(translate_text_item("Error"), translate_text_item("No connection"));
	}
	files_build_display_filelist(false);
}

function files_directSD_upload_failed(error_code, response) {
	const common = new Common();
	if (common.esp_error_code !== 0) {
		alertEspError();
	} else {
		alertdlg(translate_text_item("Error"), translate_text_item("Upload failed"));
	}
	displayNone("files_uploading_msg");
	displayBlock("files_navigation_buttons");
}

const need_up_level = () => files_currentPath !== "/";

function files_go_levelup() {
	const tlist = files_currentPath.split("/");
	let path = "/";
	let nb = 1;
	while (nb < tlist.length - 2) {
		path += `${tlist[nb]}/`;
		nb++;
	}
	files_refreshFiles(path, true);
}

function files_build_display_filelist(displaylist = true) {
	populateTabletFileSelector(files_file_list, files_currentPath);

	displayNone(["files_uploading_msg", "files_list_loader", "files_nav_loader"]);

	const fileListElem = id("files_fileList");

	if (!displaylist) {
		displayNone(["files_status_sd_status", "files_space_sd_status"]);
		if (fileListElem) {
			fileListElem.innerHTML = "";
			displayNone("files_fileList");
		}
		return;
	}

	if (fileListElem) {
		const actions = [];
		let content = "";
		if (need_up_level()) {
			const liId = "filelist_go_up";
			content += `<li id='${liId}' class='list-group-item list-group-hover' style='cursor:pointer'>`;
			content += `<span>${get_icon_svg("level-up")}</span>&nbsp;&nbsp;<span translate>Up...</span>`;
			content += "</li>";
			actions.push({ id: liId, type: "click", method: files_go_levelup, index: undefined });
		}
		for (let index = 0; index < files_file_list.length; index++) {
			if (!files_file_list[index].isdir)
				content += files_build_file_line(index, actions);
		}
		for (let index = 0; index < files_file_list.length; index++) {
			if (files_file_list[index].isdir)
				content += files_build_file_line(index, actions);
		}

		fileListElem.innerHTML = content;
		// biome-ignore lint/complexity/noForEach: <explanation>
		actions.forEach((action) => {
			const elem = id(action.id);
			if (elem) {
				elem.addEventListener("click", (event) => action.method(action.index));
			}
		});
		displayBlock("files_fileList");
	}

	if (files_status_list.length === 0 && files_error_status !== "") {
		files_status_list.push({
			status: files_error_status,
			path: files_currentPath,
			used: "-1",
			total: "-1",
			occupation: "-1",
		});
	}
	if (files_status_list.length > 0) {
		if (files_status_list[0].total !== "-1") {
			setHTML("files_sd_status_total", files_status_list[0].total);
			setHTML("files_sd_status_used", files_status_list[0].used);
			id("files_sd_status_occupation").value = files_status_list[0].occupation;
			setHTML("files_sd_status_percent", files_status_list[0].occupation);
			displayTable("files_space_sd_status");
		} else {
			displayNone("files_space_sd_status");
		}
		if (
			files_error_status !== "" &&
			(files_status_list[0].status.toLowerCase() === "ok" ||
				files_status_list[0].status.length === 0)
		) {
			files_status_list[0].status = files_error_status;
		}
		files_error_status = "";
		if (files_status_list[0].status.toLowerCase() !== "ok") {
			setHTML("files_sd_status_msg", translate_text_item(files_status_list[0].status, true));
			displayTable("files_status_sd_status");
		} else {
			displayNone("files_status_sd_status");
		}
	} else displayNone("files_space_sd_status");
}

const files_abort = () => SendPrinterCommand("abort");

/** Clicks the `files_input_file` element for you */
const files_select_upload = () => id("files_input_file").click();

function files_check_if_upload() {
	const canupload = true;
	const files = id("files_input_file").files;
	if (direct_sd) {
		SendPrinterCommand("[ESP200]", false, process_check_sd_presence);
	} else {
		//no reliable way to know SD is present or not so let's upload
		files_start_upload();
	}
}

function process_check_sd_presence(answer) {
	//console.log(answer);
	//for direct SD there is a SD check
	if (direct_sd) {
		if (answer.indexOf("o SD card") > -1) {
			alertdlg(translate_text_item("Upload failed"), translate_text_item("No SD card detected"));
			files_error_status = "No SD card";
			files_build_display_filelist(false);
			setHTML("files_sd_status_msg", translate_text_item(files_error_status, true));
			displayTable("files_status_sd_status");
		} else files_start_upload();
	} else {
		//for smoothiware ls say no directory
		files_start_upload();
	}
}

function files_start_upload() {
	const common = new Common();
	if (common.http_communication_locked) {
		alertdlg(translate_text_item("Busy..."), translate_text_item("Communications are currently locked, please wait and retry."));
		console.log("communication locked");
		return;
	}
	const url = "/upload";
	const path = files_currentPath;
	//console.log("upload from " + path );
	const files = id("files_input_file").files;

	if (files.value === "" || typeof files[0].name === "undefined") {
		console.log("nothing to upload");
		return;
	}
	const formData = new FormData();

	formData.append("path", path);
	for (let i = 0; i < files.length; i++) {
		const file = files[i];
		const arg = `${path + file.name}S`;
		//append file size first to check updload is complete
		formData.append(arg, file.size);
		formData.append("myfile[]", file, path + file.name);
		//console.log( path +file.name);

		files_error_status = `Upload ${file.name}`;
		setHTML("files_currentUpload_msg", file.name);
	}

	displayBlock("files_uploading_msg");
	displayNone("files_navigation_buttons");
	if (direct_sd) {
		SendFileHttp(url, formData, FilesUploadProgressDisplay, files_list_success, files_directSD_upload_failed,);
		//console.log("send file");
	}
	id("files_input_file").value = "";
}

function FilesUploadProgressDisplay(oEvent) {
	if (oEvent.lengthComputable) {
		const percentComplete = (oEvent.loaded / oEvent.total) * 100;
		id("files_prg").value = percentComplete;
		setHTML("files_percent_upload", percentComplete.toFixed(0));
	} else {
		// Impossible because size is unknown
	}
}

export {
	build_file_filter_list,
	files_list_success,
	files_select_upload,
	init_files_panel,
};
