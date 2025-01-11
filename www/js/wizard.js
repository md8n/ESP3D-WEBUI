import { Common, classes, displayBlock, displayNone } from "./common.js";

const openstep = (evt, stepname) => {
	const common = new Common();
	if (evt.currentTarget.classList.includes("wizard_done") && !common.can_revert_wizard) {
		return;
	}

	// biome-ignore lint/complexity/noForEach: <explanation>
	classes("stepcontent").forEach((stepcont) => displayNone(stepcont));
	// biome-ignore lint/complexity/noForEach: <explanation>
	classes("steplinks").forEach((steplink) => steplink.remove("active"));

	displayBlock(stepname);
	evt.currentTarget.classList.add("active");
};

export { openstep };
