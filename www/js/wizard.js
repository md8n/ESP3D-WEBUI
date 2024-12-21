function openstep(evt, stepname) {
    const common = new Common();

    if (evt.currentTarget.className.indexOf("wizard_done") > -1 && !common.can_revert_wizard) {
        return;
    }

    let i;
    const stepcontent = classes("stepcontent");
    for (i = 0; i < stepcontent.length; i++) {
        stepcontent[i].style.display = "none";
    }

    const steplinks = classes("steplinks");
    for (i = 0; i < steplinks.length; i++) {
        steplinks[i].className = steplinks[i].className.replace(" active", "");
    }
    displayBlock(stepname);
    evt.currentTarget.className += " active";
}
