function saveOptions(e) {
    e.preventDefault();
    var plist = document.querySelector("#privatelist").value
    console.log(plist);
    browser.storage.sync.set({
        privatelist: plist
    });
}

function restoreOptions() {

    function setCurrentChoice(result) {
        document.querySelector("#privatelist").value = result.privatelist || "";
    }

    function onError(error) {
        console.log(`Error: ${error}`);
    }

    var getting = browser.storage.sync.get("privatelist");
    getting.then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
