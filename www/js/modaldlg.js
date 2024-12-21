// Create the modal
const listmodal = [];

function setactiveModal(html_template, closefunc) {
    if (typeof id(html_template) === 'undefined') {
        console.error(`Error: no ${html_template}`);
        return null;
    }
    const modal = new Object;
    modal.element = id(html_template);
    modal.id = listmodal.length;
    modal.name = html_template;
    modal.closefn = (typeof closefunc !== 'undefined') ? closefunc : myfnclose;
    listmodal.push(modal)
    //console.log("Creation of modal  " +  modal.name + " with ID " +modal.id);
    return listmodal[listmodal.length - 1];
}

const getactiveModal = () => (listmodal.length > 0) ? listmodal[listmodal.length - 1] : null;

// open the modal 
function showModal() {
    const currentmodal = getactiveModal();
    currentmodal.element.style.display = "block";
    //console.log("Show modal " +  currentmodal.name + " with ID " + currentmodal.id  );
}

// When the user clicks on <span> (x), close the modal
function closeModal(response) {
    let currentmodal = getactiveModal();
    if (currentmodal != null) {
        currentmodal.element.style.display = "none";
        const closefn = currentmodal.closefn;
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