import { id } from "./util";

// Create the modal
var listmodal = [];


export const setactiveModal = (html_template, closefunc) => {
    const mdlTemplate = id(html_template);
    if (!mdlTemplate) {
        console.error(`Error: no template named '${html_template}'`);
        return null;
    }
    var modal = new Object;
    modal.element = mdlTemplate;
    modal.id = listmodal.length;
    modal.name = html_template;
    modal.closefn = (typeof closefunc !== 'undefined') ? closefunc : myfnclose;
    listmodal.push(modal);
    //console.log("Creation of modal  " +  modal.name + " with ID " +modal.id);
    return listmodal[listmodal.length - 1];
}

function getactiveModal() {
    if (listmodal.length > 0) {
        return listmodal[listmodal.length - 1];
    } else return null;
}

// open the modal 
export const showModal = () => {
    let currentmodal = getactiveModal();
    currentmodal.element.style.display = "block";
    //console.log("Show modal " +  currentmodal.name + " with ID " + currentmodal.id  );
}

// When the user clicks on <span> (x), close the modal
function closeModal(response) {
    var currentmodal = getactiveModal();
    if (currentmodal != null) {
        currentmodal.element.style.display = "none";
        var closefn = currentmodal.closefn;
        //console.log("Deletetion of modal " +  currentmodal.name + " with ID "  + currentmodal.id);
        listmodal.pop();
        currentmodal = getactiveModal();
        //if (currentmodal != null)console.log("New active modal is  " +  currentmodal.name + " with ID "  + currentmodal.id);
        //else console.log("No active modal");
        closefn(response);
    }
}
//default close function
function myfnclose(value) {
    //console.log("modale closed: " + value);
}