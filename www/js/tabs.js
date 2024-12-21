function opentab(evt, tabname, tabcontentid, tablinkid) {
    let i;
    const tabcontent = classes("tabcontent");
    const activateEvent = new Event("activate");
    const deactivateEvent = new Event("deactivate");

    for (i = 0; i < tabcontent.length; i++) {
        if (tabcontent[i].parentNode.id === tabcontentid) {
            tabcontent[i].dispatchEvent(deactivateEvent);
            tabcontent[i].style.display = "none";
        }
    }
    const tablinks = classes("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        if (tablinks[i].parentNode.id === tablinkid) {
            tablinks[i].className = tablinks[i].className.replace("active", "");
        }
    }
    id(tabname).dispatchEvent(activateEvent);
    displayBlock(tabname);
    evt.currentTarget.className += " active";
}
