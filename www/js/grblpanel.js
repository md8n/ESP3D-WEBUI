import {
	Common,
	id,
	opentab,
	SendPrinterCommand,
	grbl_reset,
	reportNone,
	tryAutoReport,
	reportPolled,
	onAutoReportIntervalChange,
	onstatusIntervalChange,
	onprobemaxtravelChange,
	onprobefeedrateChange,
	onproberetractChange,
	onprobetouchplatethicknessChange,
	SendRealtimeCmd,
	StartProbeProcess,
	setSpindleSpeed,
	translate_text_item,
	setHTML,
	get_icon_svg,
} from "./common.js";

/** Set up the event handlers for the grblpanel */
const grblpanel = () => {
	const common = new Common();

    // GRBL reporting
    id("report_none").addEventListener("change", (event) => onReportType(event));
	id("report_auto").addEventListener("change", (event) => onReportType(event));
	id("grblpanel_autoreport_interval").addEventListener("change", (event) => onAutoReportIntervalChange());
	id("report_poll").addEventListener("change", (event) => onReportType(event));
	id("grblpanel_interval_status").addEventListener("change", (event) => onstatusIntervalChange());

    id("clear_status_btn").addEventListener("click", (event) => SendPrinterCommand("$X", true, null, null, 114, 1));
    id("sd_pause_btn").addEventListener("click", (event) => SendRealtimeCmd(0x21));
    id("sd_resume_btn").addEventListener("click", (event) => SendRealtimeCmd(0x7e));
    id("sd_reset_btn").addEventListener("click", (event) => grbl_reset());

    id("grblpanel_F10_minus").addEventListener("click", (event) => SendRealtimeCmd(0x92));
    id("grblpanel_F1_minus").addEventListener("click", (event) => SendRealtimeCmd(0x94));
    id("grblpanel_F0").addEventListener("click", (event) => SendRealtimeCmd(0x90));
    id("grblpanel_F1_plus").addEventListener("click", (event) => SendRealtimeCmd(0x93));
    id("grblpanel_F10_plus").addEventListener("click", (event) => SendRealtimeCmd(0x91));

    id("grblpanel_S10_minus").addEventListener("click", (event) => SendRealtimeCmd(0x9b));
    id("grblpanel_S1_minus").addEventListener("click", (event) => SendRealtimeCmd(0x9d));
    id("grblpanel_S0").addEventListener("click", (event) => SendRealtimeCmd(0x99));
    id("grblpanel_S1_plus").addEventListener("click", (event) => SendRealtimeCmd(0x9c));
    id("grblpanel_S10_plus").addEventListener("click", (event) => SendRealtimeCmd(0x9a));

    id("grblpanel_spindle").addEventListener("click", (event) => SendRealtimeCmd(0x9e));
    id("grblpanel_flood").addEventListener("click", (event) => SendRealtimeCmd(0xa0));
    id("grblpanel_mist").addEventListener("click", (event) => SendRealtimeCmd(0xa1));

    id("grblspindle_fwd").addEventListener("click", (event) => SendPrinterCommand(`M3 S${common.spindleTabSpindleSpeed}`, false, null, null, 1, 1,));
    id("grblspindle_rew").addEventListener("click", (event) => SendPrinterCommand(`M4 S${common.spindleTabSpindleSpeed}`, false, null, null, 1, 1,));
    id("grblspindle_off").addEventListener("click", (event) => SendPrinterCommand("M5 S0", false, null, null, 1, 1));
    id("grblspindle_rpm").addEventListener("change", (event) => setSpindleSpeed(event.value));
    id("grblspindle_rpm").addEventListener("keyup", (event) => setSpindleSpeed(event.value));

    id("grblpanel_probemaxtravel").addEventListener("change", (event) => onprobemaxtravelChange());
    id("grblpanel_probefeedrate").addEventListener("change", (event) => onprobefeedrateChange());
    id("grblpanel_proberetract").addEventListener("change", (event) => onproberetractChange());
    id("grblpanel_probetouchplatethickness").addEventListener("change", (event) => onprobetouchplatethicknessChange());

	id("probingbtn").addEventListener("click", (event) => StartProbeProcess());

    id("grblcontroltablink").addEventListener("click", (event) => opentab(event, "grblcontroltab", "grbluitabscontent", "grbluitablinks"));
    id("grblspindletablink").addEventListener("click", (event) => opentab(event, "grblspindletab", "grbluitabscontent", "grbluitablinks"));
    id("grblpanel_probetablink").addEventListener("click", (event) => opentab(event, "grblprobetab", "grbluitabscontent", "grbluitablinks"));

	id("global_reset_btn").addEventListener("click", (event) => grbl_reset());

	const clearAlarmTitle = `<span class="tooltip-text">${translate_text_item("Clear Alarm")}</span>`
	const bellIcon = get_icon_svg("bell", {h: "1.8em", w: "2em", t: "translate(50,1200) scale(1,-1)", v:"-200 -200 1700 1600", color: "black"});
	const alarmIcon = bellIcon.replace("</path>", '</path><circle cx="600" cy="600" r="700" stroke="red" stroke-width="100" fill="none"></circle><line x1="106" y1="106" x2="1094" y2="1094" stroke="red" stroke-width="100"></line>');
	setHTML("clear_status_btn", `${clearAlarmTitle}${alarmIcon}`);

	setHTML("sd_pause_btn", get_icon_svg("pause", {h: "1.4em", w: "2em", t: "translate(50,1200) scale(1,-1)", color: "blue"}));
	setHTML("sd_resume_btn", get_icon_svg("play", {h: "1.4em", w: "2em", t: "translate(50,1200) scale(1,-1)", color: "green"}));

	setHTML("grblspindle_rew", `On Rew${get_icon_svg("triangle-left")}`);
	setHTML("grblspindle_fwd", `On Fwd${get_icon_svg("triangle-right")}`);
	setHTML("grblspindle_off", `Off${get_icon_svg("stop")}`);

	const iconPlayOptions = {h: "1.4em", w: "1.3em", t: "translate(50,1200) scale(1,-1)", color: "black"};
	setHTML("FFastBack", get_icon_svg("fast-backward", iconPlayOptions));
	setHTML("FBack", get_icon_svg("step-backward", iconPlayOptions));
	setHTML("grblpanel_F0", get_icon_svg("play", iconPlayOptions));
	setHTML("FFwd", get_icon_svg("step-forward", iconPlayOptions));
	setHTML("FFastFwd", get_icon_svg("fast-forward", iconPlayOptions));

	setHTML("SFastBack", get_icon_svg("fast-backward", iconPlayOptions));
	setHTML("SBack", get_icon_svg("step-backward", iconPlayOptions));
	setHTML("grblpanel_S0", get_icon_svg("play", iconPlayOptions));
	setHTML("SFwd", get_icon_svg("step-forward", iconPlayOptions));
	setHTML("SFastFwd", get_icon_svg("fast-forward", iconPlayOptions));

	setHTML("grblSpindle", get_icon_svg("record", iconPlayOptions));
	setHTML("grblFlood", get_icon_svg("tint", iconPlayOptions));
	setHTML("grblMist", get_icon_svg("cloud-download", iconPlayOptions).replace("</path>", '</path><circle cx="600" cy="450" r="300" stroke="black" fill="black"></circle>'));

	const iconResetOptions = {h: "1.4em", w: "2em", t: "translate(1200,1200) scale(-1, -1)", v: "0 0 1200 1200", color: "white"};
	setHTML("sd_reset_btn", get_icon_svg("play", iconResetOptions));
	setHTML("global_reset_btn", get_icon_svg("play", iconResetOptions));

};

const onReportType = (e) => {
	switch (e.value) {
		case "none":
			reportNone();
			break;
		case "auto":
			tryAutoReport();
			break;
		case "poll":
			reportPolled();
			break;
	}
};

export { grblpanel };
