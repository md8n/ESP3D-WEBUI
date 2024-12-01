import { classes } from "./util";

const clear_drop_menu = (event) => {
    const item = get_parent_by_class(event.target, "dropdownselect");
    let ignore_id = item?.id || "-1";
    const list = classes("dropmenu-content");
    for (let index = 0; index < list.length; index++) {
        const item2 = get_parent_by_class(list[index], "dropdownselect");
        if (item2?.id !== ignore_id && list[index].classList.contains('show')) {
            list[index].classList.remove('show');
        }
    }
}

function get_parent_by_class(item, classname) {
    if (item === null || typeof item === 'undefined') {
        return null;
    }
    if (item.classList.contains(classname)) {
        return item;
    }
    return get_parent_by_class(item.parentElement, classname);
}

function hide_drop_menu(event) {
    var item = get_parent_by_class(event.target, "dropmenu-content");
    if (typeof item !== 'undefined' && item.classList.contains('show')) {
        item.classList.remove('show');
    }
}

const showhide_drop_menu = (event) => {
    var item = get_parent_by_class(event.target, "dropdownselect");
    if (item === null) {
        return;
    }
    var menu = item.getElementsByClassName("dropmenu-content")[0];
    if (typeof menu !== 'undefined'){
        menu.classList.toggle("show");
    }
}

export { clear_drop_menu, showhide_drop_menu };