import { Apply_config_override, Delete_config_override, refreshconfig, id } from "./common.js";

/** Set up the event handlers for the config tab */
const configtab = () => {
	id("config_refresh_btn").addEventListener("click", (event) => refreshconfig());
	id("config_apply_override").addEventListener("click", (event) => Apply_config_override());
	id("config_delete_override").addEventListener("click", (event) => Delete_config_override());
};

export { configtab };
