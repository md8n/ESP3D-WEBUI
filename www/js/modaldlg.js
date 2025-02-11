// Create the modal
var listmodal = [];


function setactiveModal(html_template, closefunc) {
    const htmlTemplate = id(html_template);
    if (!htmlTemplate) {
        console.error(`Error: no ${html_template}`);
        return null;
    }
    const modal = new Object;
    modal.element = htmlTemplate;
    modal.id = listmodal.length;
    modal.name = html_template;
    modal.closefn = (typeof closefunc === "function") ? closefunc : myfnclose;
    listmodal.push(modal)
    //console.log("Creation of modal  " +  modal.name + " with ID " +modal.id);
    return listmodal[listmodal.length - 1];;
}

function getactiveModal() {
    if (listmodal.length > 0) {
        return listmodal[listmodal.length - 1];
    } else return null;
}

// open the modal 
function showModal() {
    var currentmodal = getactiveModal();
    currentmodal.element.style.display = "block";
    //console.log("Show modal " +  currentmodal.name + " with ID " + currentmodal.id  );
}

// When the user clicks on <span> (x), close the modal
function closeModal(response) {
    var currentmodal = getactiveModal();
    if (currentmodal !== null) {
        currentmodal.element.style.display = "none";
        var closefn = currentmodal.closefn;
        //console.log("Deletetion of modal " +  currentmodal.name + " with ID "  + currentmodal.id);
        listmodal.pop();
        delete currentmodal;
        currentmodal = getactiveModal();
        //if (currentmodal != null)console.log("New active modal is  " +  currentmodal.name + " with ID "  + currentmodal.id);
        //else console.log("No active modal");
        closefn(response);
    }
}
//default close function
function myfnclose(value) {
    //console.log("modal closed: " + value);
}