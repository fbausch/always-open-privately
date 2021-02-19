function saveOptions(e) {
    e.preventDefault();
    var plst = document.querySelector("#privatelist").value;
    var invrt = document.querySelector("#invert").checked;
    browser.storage.sync.set({
        privatelist: plst,
        invert: invrt
    }).then(browser.runtime.sendMessage({type: 'clearCachedSettings'}));
}

function restoreOptions() {

    function setCurrentChoice(result) {
        document.querySelector("#privatelist").value = result.privatelist || "";
        document.querySelector("#invert").checked = result.invert || false;
    }

    function onError(error) {
        console.log(`Error: ${error}`);
    }

    var getting = browser.storage.sync.get(["privatelist", "invert"]);
    getting.then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
