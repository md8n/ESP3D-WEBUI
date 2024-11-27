import { SendGetHttp } from "./http";
import { process_socket_response } from "./socket";
import { decode_entitie, translate_text_item } from "./translate";
import { conErr, stdErrMsg, getChecked, id } from "./util";

var CustomCommand_history = [];
var CustomCommand_history_index = -1;
var Monitor_output = [];

/** Set up the event handlers for the commands panel */
const init_command_panel = () => {
    id("clear_monitor_btn").addEventListener("click", (event) => Monitor_output_Clear());
    id("custom_cmd_txt").addEventListener("keyup", (event) => CustomCommand_OnKeyUp(event));
    id("commandspanel_send").addEventListener("click", (event) => SendCustomCommand());
    id("monitor_enable_autoscroll").addEventListener("click", (event) => Monitor_check_autoscroll());
    id("monitor_enable_verbose_mode").addEventListener("click", (event) => Monitor_check_verbose_mode());
}

function Monitor_output_autoscrollcmd() {
    id('cmd_content').scrollTop = id('cmd_content').scrollHeight;
}

function Monitor_check_autoscroll() {
    if (getChecked('monitor_enable_autoscroll') !== "false") Monitor_output_autoscrollcmd();
}

function Monitor_check_verbose_mode() {
    Monitor_output_Update();
}

function Monitor_output_Clear() {
    Monitor_output = [];
    Monitor_output_Update();
}

export const Monitor_output_Update = (message) => {
    if (message) {
        if (typeof message === 'string' || message instanceof String) {
            Monitor_output = Monitor_output.concat(message);
        } else {
            try {
                var msg = JSON.stringify(message, null, " ");
                Monitor_output = Monitor_output.concat(msg + "\n");
            } catch (err) {
                Monitor_output = Monitor_output.concat(message.toString() + "\n");
            }
        }
        Monitor_output = Monitor_output.slice(-300);
    }

    var output = "";
    var isverbosefilter = getChecked("monitor_enable_verbose_mode") !== "false";
    for (var out of Monitor_output) {
        var outlc = out.trim();

        // Filter the output to remove boring chatter
        if (outlc === "") {
            continue;
        }
        if (!isverbosefilter) {
            if (outlc == "wait" ||
                outlc.startsWith("ok") ||
                outlc.startsWith("[#]") ||
                outlc.startsWith("x:") ||
                outlc.startsWith("fr:") ||
                outlc.startsWith("echo:") ||
                outlc.startsWith("Config:") ||
                outlc.startsWith("echo:Unknown command: \"echo\"") ||
                outlc.startsWith("[MSG:INFO: Heartbeat]") ||
                outlc.startsWith("echo:enqueueing \"*\"")
            ) {
                continue;
            }
            //no status
            if (outlc.startsWith("<") || outlc.startsWith("[echo:")) continue;
        }
        if (out.startsWith("[#]")) {
            out = out.replace("[#]", "");
        }
        out = out.replace("&", "&amp;");
        out = out.replace("<", "&lt;");
        out = out.replace(">", "&gt;");
        if (out.startsWith("ALARM:") || out.startsWith("Hold:") || out.startsWith("Door:")) {
            out = "<font color='orange'><b>" + out + translate_text_item(out.trim()) + "</b></font>\n";
        }
        if (out.startsWith("error:")) {
            out = "<font color='red'><b>" + out.toUpperCase() + translate_text_item(out.trim()) + "</b></font>\n";
        }
        output += out;
    }
    const cmdContElem = id("cmd_content");
    if (cmdContElem) {
        const old_output = cmdContElem.innerHTML;
        cmdContElem.innerHTML = output;
        // Do not autoscroll if the contents have not changed.
        // This prevents scrolling on filtered-out status reports.
        if (output != old_output) {
            Monitor_check_autoscroll();
        }
    }
}

function SendCustomCommand() {
    var cmd = id("custom_cmd_txt").value;
    var url = "/command?commandText=";
    cmd = cmd.trim();
    if (cmd.trim().length == 0) return;
    CustomCommand_history.push(cmd);
    CustomCommand_history.slice(-40);
    CustomCommand_history_index = CustomCommand_history.length;
    id("custom_cmd_txt").value = "";
    Monitor_output_Update(cmd + "\n");
    cmd = encodeURI(cmd);
    //because # is not encoded
    cmd = cmd.replace("#", "%23");
    SendGetHttp(url + cmd, SendCustomCommandSuccess, SendCustomCommandFailed);
}

function CustomCommand_OnKeyUp(event) {
    if (event.keyCode == 13) {
        SendCustomCommand();
    }
    if (event.keyCode == 38 || event.keyCode == 40) {
        if (event.keyCode == 38 && CustomCommand_history.length > 0 && CustomCommand_history_index > 0) {
            // Up arrow
            CustomCommand_history_index--;
        } else if (event.keyCode == 40 && CustomCommand_history_index < CustomCommand_history.length - 1) {
            // Down arrow
            CustomCommand_history_index++;
        }

        if (CustomCommand_history_index >= 0 && CustomCommand_history_index < CustomCommand_history.length) {
            id("custom_cmd_txt").value = CustomCommand_history[CustomCommand_history_index];
        }
        return false;
    }
    return true;
}

function SendCustomCommandSuccess(response) {
    Monitor_output_Update(response[response.length - 1] == '\n' ? response : response + "\n");
    for (var res of response.split("\n")) {
        process_socket_response(res);
    }
}

function SendCustomCommandFailed(error_code, response) {
    const errMsg = (error_code == 0)
        ? translate_text_item("Connection error")
        : stdErrMsg(error_code, decode_entitie(response), translate_text_item("Error"));
    Monitor_output_Update(errMsg + "\n");

    conErr(error_code, decode_entitie(response), "cmd Error");
}

export { init_command_panel };
