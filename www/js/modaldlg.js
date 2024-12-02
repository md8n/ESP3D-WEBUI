import { id } from "./util.js";

/** A list of currently opened modals */
const listmodal = [];

const setactiveModal = (html_template_name, closefunc) => {
    const mdlTemplate = id(html_template_name);
    if (!mdlTemplate) {
        console.error(`Error: no template named '${html_template_name}'`);
        return null;
    }
    const modal = new Object;
    modal.element = mdlTemplate;
    modal.id = listmodal.length;
    modal.name = html_template_name;
    modal.closefn = (closefunc instanceof Function) ? closefunc : (response) => {/* Do Nothing*/};

    listmodal.push(modal);
    //console.log("Creation of modal  " +  modal.name + " with ID " +modal.id);
    return listmodal[listmodal.length - 1];
}

const getactiveModal = () => (listmodal.length > 0) ? listmodal[listmodal.length - 1] : null;

/** Show the modal dialog */
const showModal = () => {
    const currentmodal = getactiveModal();
    if (!currentmodal) {
        return;
    }
    currentmodal.element.style.display = "block";
    //console.log("Show modal " +  currentmodal.name + " with ID " + currentmodal.id  );
}

/** Close the modal dialog - normally triggered when the user clicks on <X> */
const closeModal = (response) => {
    let currentmodal = listmodal.pop();
    if (!currentmodal) {
        // the list of modals is empty
        return;
    }

    currentmodal.element.style.display = "none";
    currentmodal.closefn(response);
}

export { listmodal, closeModal, getactiveModal, setactiveModal, showModal };
