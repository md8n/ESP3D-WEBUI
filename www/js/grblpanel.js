import { opentab } from "./tabs";
import { id } from "./util";

/** Set up the event handlers for the grblpanel */
export const grblpanel = () => {
    id("grblcontroltablink").addEventListener("click", (event) => opentab(event, 'grblcontroltab', 'grbluitabscontent', 'grbluitablinks'));
    id("grblspindletablink").addEventListener("click", (event) => opentab(event, 'grblspindletab', 'grbluitabscontent', 'grbluitablinks'));
    id("grblpanel_probetablink").addEventListener("click", (event) => opentab(event, 'grblprobetab', 'grbluitabscontent', 'grbluitablinks'));
}
