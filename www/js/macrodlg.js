import { alertdlg } from "./alertdlg";
import { confirmdlg } from "./confirmdlg";
import { control_macrolist } from "./controls";
import { clear_drop_menu } from "./dropmenu";
import { http_communication_locked, SendFileHttp } from "./http";
import { get_icon_svg } from "./icons";
import { closeModal, setactiveModal, showModal } from "./modaldlg";
import { translate_text_item } from "./translate";
import { displayBlock, displayNone, id, setHTML } from "./util";

//Macro dialog
var macrodlg_macrolist = [];

function showmacrodlg(closefn) {
    var modal = setactiveModal('macrodlg.html', closefn);
    if (modal == null) {
        return;
    }

    id("macrodlg.html").addEventListener("click", (event) => clear_drop_menu(event));
    id("MacroDialogClose").addEventListener("click", (event) => closeMacroDialog());
    id("MacroDialogCancel").addEventListener("click", (event) => closeMacroDialog());
    id("MacroDialogSave").addEventListener("click", (event) => SaveNewMacroList());

    build_dlg_macrolist_ui();
    displayNone('macrodlg_upload_msg');
    showModal();
}

function build_color_selection(index) {
    var content = "";
    var entry = macrodlg_macrolist[index];
    var menu_pos = "down";
    if (index > 3) menu_pos = "up";
    content += "<div class='dropdownselect'  id='macro_color_line" + index + "'>";
    content += "<button class='btn " + entry.class + "' onclick='showhide_drop_menu(event)'>&nbsp;";
    content += "<svg width='0.8em' height='0.8em' viewBox='0 0 1300 1200' style='pointer-events:none'>";
    content += "<g transform='translate(50,1200) scale(1, -1)'>";
    content += "<path  fill='currentColor' d='M100 900h1000q41 0 49.5 -21t-20.5 -50l-494 -494q-14 -14 -35 -14t-35 14l-494 494q-29 29 -20.5 50t49.5 21z'></path>";
    content += "</g>";
    content += "</svg>";
    content += "</button>";
    content += "<div class='dropmenu-content dropmenu-content-" + menu_pos + "' style='min-width:auto; padding-left: 4px;padding-right: 4px;'>";
    content += "<button class='btn btn-default' onclick='macro_select_color(event, \"default\" ," + index + ")'>&nbsp;</button>";
    content += "<button class='btn btn-primary' onclick='macro_select_color(event, \"primary\" ," + index + ")'>&nbsp;</button>";
    content += "<button class='btn btn-info' onclick='macro_select_color(event, \"info\" ," + index + ")'>&nbsp;</button>";
    content += "<button class='btn btn-warning' onclick='macro_select_color(event, \"warning\" ," + index + ")'>&nbsp;</button>";
    content += "<button class='btn btn-danger'  onclick='macro_select_color(event, \"danger\" ," + index + ")'>&nbsp;</button>";
    content += "</div>";
    content += "</div>";
    return content;
}

function build_target_selection(index) {
    var content = "";
    var entry = macrodlg_macrolist[index];
    var menu_pos = "down";
    if (index > 3) menu_pos = "up";
    content += "<div class='dropdownselect'  id='macro_target_line" + index + "'>";
    content += "<button class='btn btn-default' style='min-width:5em;' onclick='showhide_drop_menu(event)'><span>" + entry.target + "</span>";
    content += "<svg width='0.8em' height='0.8em' viewBox='0 0 1300 1200' style='pointer-events:none'>";
    content += "<g transform='translate(50,1200) scale(1, -1)'>";
    content += "<path  fill='currentColor' d='M100 900h1000q41 0 49.5 -21t-20.5 -50l-494 -494q-14 -14 -35 -14t-35 14l-494 494q-29 29 -20.5 50t49.5 21z'></path>";
    content += "</g>";
    content += "</svg>";
    content += "</button>";
    content += "<div class='dropmenu-content dropmenu-content-" + menu_pos + "' style='min-width:auto'>";
    content += "<a href=# onclick='macro_select_target(event, \"ESP\" ," + index + ")'>ESP</a>";
    content += "<a href=# onclick='macro_select_target(event, \"SD\" ," + index + ")'>SD</a>";
    content += "<a href=# onclick='macro_select_target(event, \"URI\" ," + index + ")'>URI</a>"
    content += "</div>";
    content += "</div>";
    return content;
}

function build_glyph_selection(index) {
    var content = "";
    var entry = macrodlg_macrolist[index];
    var menu_pos = "down";
    if (index > 3) menu_pos = "up";
    content += "<div class='dropdownselect'  id='macro_glyph_line" + index + "'>";
    content += "<button class='btn " + entry.class + "' onclick='showhide_drop_menu(event)'><span>" + get_icon_svg(entry.glyph) + "</span>&nbsp;";
    content += "<svg width='0.8em' height='0.8em' viewBox='0 0 1300 1200' style='pointer-events:none'>";
    content += "<g transform='translate(50,1200) scale(1, -1)'>";
    content += "<path  fill='currentColor' d='M100 900h1000q41 0 49.5 -21t-20.5 -50l-494 -494q-14 -14 -35 -14t-35 14l-494 494q-29 29 -20.5 50t49.5 21z'></path>";
    content += "</g>";
    content += "</svg>";
    content += "</button>";
    content += "<div class='dropmenu-content  dropmenu-content-" + menu_pos + "' style='min-width:30em'>";
    for (var key in list_icon) {
        if (key != "plus") {
            content += "<button class='btn btn-default btn-xs' onclick='macro_select_glyph(event, \"" + key + "\" ," + index + ")'><span>" + get_icon_svg(key) + "</span>";
            content += "</button>";
        }
    }
    content += "</div>";
    content += "</div>";
    return content;
}

function build_filename_selection(index, actions) {
    var entry = macrodlg_macrolist[index];
    const noFilename = (entry.filename.length == 0);
    const mflId = `macro_filename_line_${index}`;

    let content = `<span id='macro_filename_input_line_${index}' class='form-group ${noFilename ? "has-error has-feedback" : ""}'>`
    content += `<input type='text' id='${mflId}' style='width:9em' class='form-control' value='${entry.filename}'  aria-describedby='inputStatus_line${index}'>`;
    content += `<span id='icon_macro_status_line_${index}' style='color:#a94442; position:absolute;bottom:4px;left:7.5em;${noFilename ? "display:none" : ""}'>${get_icon_svg("remove")}</span>`;
    content += "</input></span>";

    actions.push({id: mflId, type: "keyup", method: macro_filename_OnKeyUp(index)});
    actions.push({id: mflId, type: "change", method: (event, index) => on_macro_filename(event, index)});

    return content;
}

function build_dlg_macrolist_line(index) {
    var content = "";
    const actions = [];
    var entry = macrodlg_macrolist[index];

    const buildTdVertMiddle = (content) => `<td style='vertical-align:middle'>${content}</td>`;

    const noEC = entry.class === '';
    const btnClass = `btn btn-xs ${noEC ? "btn-default" : "btn-danger"}`;
    const btnStyle = `padding-top: 3px;padding-left: ${noEC ? "4" : "2"}px;padding-right: ${noEC ? "2" : "3"}px;padding-bottom: 0px;`;
    const btnId = `macro_reset_btn_${index}`;
    content += buildTdVertMiddle(`<button id='${btnId}' class='${btnClass}' style='${btnStyle}>${get_icon_svg(noEC ? "plus" : "trash")}</button>`);
    actions.push({id: btnId, type: "click", method: macro_reset_button(index)});
    if (noEC) {
        content += "<td colspan='5'></td>";
    } else {
        const inpId = `macro_name_line_${index}`;
        const entryName = entry.name && entry.name !== "&nbsp;" ? entry.name : "";
        content += buildTdVertMiddle(`<input type='text' id='${inpId}' style='width:4em' class='form-control' value='${entryName}'/>`);
        actions.push({id: inpId, type: "change", method: (event, index) => on_macro_name(event, index)});
        content += buildTdVertMiddle(build_glyph_selection(index));
        content += buildTdVertMiddle(build_color_selection(index));
        content += buildTdVertMiddle(build_target_selection(index));
        content += buildTdVertMiddle(build_filename_selection(index, actions));
    }

    setHTML(`macro_line_${index}`, content);
    actions.forEach((action) => {
        id(action.id).addEventListener(action.type, (event) => action.method);
    });
}

function macro_filename_OnKeyUp(index) {
    var item = id("macro_filename_line_" + index);
    var group = id("macro_filename_input_line_" + index);
    var value = item.value.trim();
    if (value.length > 0) {
        if (group.classList.contains('has-feedback')) group.classList.remove('has-feedback');
        if (group.classList.contains('has-error')) group.classList.remove('has-error');
        displayNone("icon_macro_status_line_" + index);
    } else {
        displayBlock("icon_macro_status_line_" + index);
        if (!group.classList.contains('has-error')) group.classList.add('has-error');
        if (!group.classList.contains('has-feedback')) group.classList.add('has-feedback');
    }
    return true;
}

function on_macro_filename(event, index) {
    var entry = macrodlg_macrolist[index];
    var filename = event.value.trim();
    entry.filename = event.value;
    if (filename.length == 0) {
        alertdlg(translate_text_item("Out of range"), translate_text_item("File name cannot be empty!"));
    }
    build_dlg_macrolist_line(index);
}

function on_macro_name(event, index) {
    var entry = macrodlg_macrolist[index];
    var macroname = event.value.trim();
    if (macroname.length > 0) {
        entry.name = event.value;
    } else {
        entry.name = "&nbsp;";
    }
}

function build_dlg_macrolist_ui() {
    var content = "";
    macrodlg_macrolist = [];
    for (var i = 0; i < 9; i++) {
        macrodlg_macrolist.push(control_macrolist()[i]);
        content += "<tr style='vertical-align:middle' id='macro_line_" + i + "'>";
        content += "</tr>";
    }

    setHTML('dlg_macro_list', content);
    for (var i = 0; i < 9; i++) {
        build_dlg_macrolist_line(i);
    }
}

function macro_reset_button(index) {
    var entry = macrodlg_macrolist[index];
    if (entry.class == "") {
        entry.name = "M" + (1 + entry.index);
        entry.glyph = "star";
        entry.filename = "/macro" + (1 + entry.index) + ".g";
        entry.target = "ESP";
        entry.class = "btn-default";
    } else {
        entry.name = "";
        entry.glyph = "";
        entry.filename = "";
        entry.target = "";
        entry.class = "";
    }
    build_dlg_macrolist_line(index);
}

function macro_select_color(event, color, index) {
    var entry = macrodlg_macrolist[index];
    hide_drop_menu(event);
    entry.class = "btn btn-" + color;
    build_dlg_macrolist_line(index);
}

function macro_select_target(event, target, index) {
    var entry = macrodlg_macrolist[index];
    hide_drop_menu(event);
    entry.target = target;
    build_dlg_macrolist_line(index)
}

function macro_select_glyph(event, glyph, index) {
    var entry = macrodlg_macrolist[index];
    hide_drop_menu(event);
    entry.glyph = glyph;
    build_dlg_macrolist_line(index)
}

const closeMacroDialog = () => {
    let modified = false;
    const fieldsTest = ["filename", "name", "glyph", "class", "target"];
    for (let i = 0; i < 9; i++) {
        let macEntry = macrodlg_macrolist[i];
        let conEntry = control_macrolist()[i];
        if (fieldsTest.some((fieldName) => macEntry[fieldName] !== conEntry[fieldName])) {
            modified =true;
            break;
        }
    }
    if (modified) {
        confirmdlg(translate_text_item("Data modified"), translate_text_item("Do you want to save?"), process_macroCloseDialog);
    } else {
        closeModal('cancel');
    }
}

function process_macroCloseDialog(answer) {
    if (answer == 'no') {
        //console.log("Answer is no so exit");
        closeModal('cancel');
    } else {
        // console.log("Answer is yes so let's save");
        SaveNewMacroList();
    }
}

function SaveNewMacroList() {
    if (http_communication_locked()) {
        alertdlg(translate_text_item("Busy..."), translate_text_item("Communications are currently locked, please wait and retry."));
        return;
    }
    for (var i = 0; i < 9; i++) {
        if (macrodlg_macrolist[i].filename.length == 0 && macrodlg_macrolist[i].class != "") {
            alertdlg(translate_text_item("Out of range"), translate_text_item("File name cannot be empty!"));
            return;
        }
    }

    var blob = new Blob([JSON.stringify(macrodlg_macrolist, null, " ")], {
        type: 'application/json'
    });
    var file;
    if (browser_is("IE") || browser_is("Edge")) {
        file = blob;
        file.name = '/macrocfg.json';
        file.lastModifiedDate = new Date();
    } else file = new File([blob], '/macrocfg.json');
    var formData = new FormData();
    var url = "/files";
    formData.append('path', '/');
    formData.append('myfile[]', file, '/macrocfg.json');
    SendFileHttp(url, formData, macrodlgUploadProgressDisplay, macroUploadsuccess, macroUploadfailed)
}

function macrodlgUploadProgressDisplay(oEvent) {
    if (oEvent.lengthComputable) {
        var percentComplete = (oEvent.loaded / oEvent.total) * 100;
        id('macrodlg_prg').value = percentComplete;
        setHTML('macrodlg_upload_percent', percentComplete.toFixed(0));
        displayBlock('macrodlg_upload_msg');
    } else {
        // Impossible because size is unknown
    }
}

function macroUploadsuccess(response) {
    control_macrolist([]);
    for (var i = 0; i < 9; i++) {
        var entry;
        if ((macrodlg_macrolist.length != 0)) {
            entry = {
                name: macrodlg_macrolist[i].name,
                glyph: macrodlg_macrolist[i].glyph,
                filename: macrodlg_macrolist[i].filename,
                target: macrodlg_macrolist[i].target,
                class: macrodlg_macrolist[i].class,
                index: macrodlg_macrolist[i].index
            };
        } else {
            entry = {
                name: '',
                glyph: '',
                filename: '',
                target: '',
                class: '',
                index: i
            };
        }
        control_macrolist(entry);
    }
    displayNone('macrodlg_upload_msg');
    closeModal('ok');
}

function macroUploadfailed(error_code, response) {
    alertdlg(translate_text_item("Error"), translate_text_item("Save macro list failed!"));
    displayNone('macrodlg_upload_msg');
}
