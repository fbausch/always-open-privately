var types = [
    browser.i18n.getMessage("disabled"),
    browser.i18n.getMessage("domainOnly"),
    browser.i18n.getMessage("subdomainsOnly"),
    browser.i18n.getMessage("domainAndSubdomains"),
    browser.i18n.getMessage("somewhereInURL")
];

function saveOptions(e) {
    e.preventDefault();
    var entries = document.getElementById("entrylist").children;
    var invert = document.querySelector("#invert").checked;
    var plst = {};
    for (i = 0; i < entries.length; i++) {
        var domain = entries[i].children[1].value.replace(/^\s+|\s+$/g, '').toLowerCase();
        if (domain.length == 0) {
            continue;
        }
	var mode = entries[i].children[0].value;
        plst[domain] = mode;
    }
    browser.runtime.sendMessage({type: 'aopSaveSettings', aopSettings: {plst: plst, storageLayoutVersion: 2, invt: invert}});
    document.getElementById("savebtn").click();
}

function appendEntryRow(domain, selectedType) {
    var ele = document.createElement('div');
    var typ = document.createElement('select');
    var inp = document.createElement('input');
    var del = document.createElement('button');
    typ.setAttribute('class', 'entryTyp');
    for (i = 0; i < types.length; i++) {
        var opt = document.createElement('option');
        opt.value = i;
        opt.textContent = types[i];
	if (i == selectedType) {
            opt.selected = "selected";
        }
        typ.appendChild(opt);
    }
    inp.setAttribute('class', 'entry');
    inp.type = 'text';
    inp.value = domain;
    del.setAttribute('class', 'deleteEntry');
    del.type = "button";
    del.textContent = browser.i18n.getMessage("deleteRule");
    del.addEventListener('click', delElementClick);
    ele.appendChild(typ);
    ele.appendChild(inp);
    ele.appendChild(del);
    document.getElementById('entrylist').appendChild(ele);
}

function addElementClick(e) {
    appendEntryRow("", 3);
}

function delElementClick(e) {
    e.target.parentElement.remove();
}

function showSettings() {
    browser.runtime.sendMessage({type: 'aopGetSettings'}).then((settings) => {
        if (settings === undefined || settings === null) {
            return;
        }
        var keys = Object.keys(settings.plst);
        for (i in keys) {
            appendEntryRow(keys[i], settings.plst[keys[i]]);
        }
        document.querySelector("#invert").checked = settings.invt;
    });
}

browser.extension.isAllowedIncognitoAccess().then((value) => {
    if (value === true) {
        document.getElementById("warning").style.display = 'none';
    }
}, (error) => { console.log(error); });

document.querySelectorAll("[data-locale]").forEach(elem => {
    elem.textContent = browser.i18n.getMessage(elem.dataset.locale);
})

document.addEventListener("DOMContentLoaded", showSettings);
document.getElementById("prefs").addEventListener("submit", saveOptions);
addbuttons = document.getElementsByClassName("addentry");
for (i = 0; i < addbuttons.length; i++) {
    addbuttons[i].addEventListener("click", addElementClick);
}
