import {
    grbl_reset,
    reportNone, tryAutoReport, reportPolled,
    onAutoReportIntervalChange, onstatusIntervalChange,
    onprobemaxtravelChange, onprobefeedrateChange, onproberetractChange, onprobetouchplatethicknessChange,
    SendRealtimeCmd,
    spindleTabSpindleSpeed,
    StartProbeProcess
} from "./grbl";
import { SendPrinterCommand } from "./printercmd";
import { opentab } from "./tabs";
import { id } from "./util";

/** Set up the event handlers for the grblpanel */
export const grblpanel = () => {
    // GRBL reporting
    id("report_none").addEventListener("change", (event) => onReportType(event));
    id("report_auto").addEventListener("change", (event) => onReportType(event));
    id("grblpanel_autoreport_interval").addEventListener("change", (event) => onAutoReportIntervalChange());
    id("report_poll").addEventListener("change", (event) => onReportType(event));
    id("grblpanel_interval_status").addEventListener("change", (event) => onstatusIntervalChange());

    id("clear_status_btn").addEventListener("click", (event) => SendPrinterCommand('$X', true, null,null, 114, 1));
    id("sd_pause_btn").addEventListener("click", (event) => SendRealtimeCmd(0x21));
    id("sd_resume_btn").addEventListener("click", (event) => SendRealtimeCmd(0x7e));
    id("sd_reset_btn").addEventListener("click", (event) => grbl_reset());

    id("grblpanel_F10_minus").addEventListener("click", (event) => SendRealtimeCmd(0x92));
    id("grblpanel_F1_minus").addEventListener("click", (event) => SendRealtimeCmd(0x94));
    id("grblpanel_F0").addEventListener("click", (event) => SendRealtimeCmd(0x90));
    id("grblpanel_F1_plus").addEventListener("click", (event) => SendRealtimeCmd(0x93));
    id("grblpanel_F10_plus").addEventListener("click", (event) => SendRealtimeCmd(0x91));

    id("grblpanel_S10_minus").addEventListener("click", (event) => SendRealtimeCmd(0x9B));
    id("grblpanel_S1_minus").addEventListener("click", (event) => SendRealtimeCmd(0x9D));
    id("grblpanel_S0").addEventListener("click", (event) => SendRealtimeCmd(0x99));
    id("grblpanel_S1_plus").addEventListener("click", (event) => SendRealtimeCmd(0x9C));
    id("grblpanel_S10_plus").addEventListener("click", (event) => SendRealtimeCmd(0x9A));

    id("grblpanel_spindle").addEventListener("click", (event) => SendRealtimeCmd(0x9E));
    id("grblpanel_flood").addEventListener("click", (event) => SendRealtimeCmd(0xA0));
    id("grblpanel_mist").addEventListener("click", (event) => SendRealtimeCmd(0xA1));

    id("grblspindle_fwd").addEventListener("click", (event) => SendPrinterCommand(`M3 S${spindleTabSpindleSpeed()}`, false, null, null, 1, 1));
    id("grblspindle_rew").addEventListener("click", (event) => SendPrinterCommand(`M4 S${spindleTabSpindleSpeed()}`, false, null, null, 1, 1));
    id("grblspindle_off").addEventListener("click", (event) => SendPrinterCommand('M5 S0', false, null, null, 1, 1));
    id("grblspindle_rpm").addEventListener("change", (event) => setSpindleSpeed(event.value));
    id("grblspindle_rpm").addEventListener("keyup", (event) => setSpindleSpeed(event.value));

    id("grblpanel_probemaxtravel").addEventListener("change", (event) => onprobemaxtravelChange());
    id("grblpanel_probefeedrate").addEventListener("change", (event) => onprobefeedrateChange());
    id("grblpanel_proberetract").addEventListener("change", (event) => onproberetractChange());
    id("grblpanel_probetouchplatethickness").addEventListener("change", (event) => onprobetouchplatethicknessChange());
                                            
    id("probingbtn").addEventListener("click", (event) => StartProbeProcess());
                                        
    id("grblcontroltablink").addEventListener("click", (event) => opentab(event, 'grblcontroltab', 'grbluitabscontent', 'grbluitablinks'));
    id("grblspindletablink").addEventListener("click", (event) => opentab(event, 'grblspindletab', 'grbluitabscontent', 'grbluitablinks'));
    id("grblpanel_probetablink").addEventListener("click", (event) => opentab(event, 'grblprobetab', 'grbluitabscontent', 'grbluitablinks'));

    id("global_reset_btn").addEventListener("click", (event) => grbl_reset());
}

const onReportType = (e) => {
    switch (e.value) {
        case 'none': reportNone(); break;
        case 'auto': tryAutoReport(); break;
        case 'poll': reportPolled(); break;
    }
}
