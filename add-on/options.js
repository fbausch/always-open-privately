function saveOptions(e) {
    e.preventDefault();
    var plist = document.querySelector("#privatelist").value;
    var invrt = document.querySelector("#invert").checked;
    browser.storage.sync.set({
        privatelist: plist,
        invert: invrt
    });
}

function restoreOptions() {

    function setCurrentChoice(result) {
        console.log(result);
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
