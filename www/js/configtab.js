// import - Apply_config_override, Delete_config_override, refreshconfig, id

/** Set up the event handlers for the config tab */
const configtab = () => {
	id("config_refresh_btn").addEventListener("click", refreshconfig);
	id("config_apply_override").addEventListener("click", Apply_config_override);
	id("config_delete_override").addEventListener("click", Delete_config_override);
};
