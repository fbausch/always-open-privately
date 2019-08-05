function openURLInPrivateWindow(evtx, privatelist, invert) {
    privatelist = privatelist.split(/\r?\n/);
    var url = evtx.url;
    if (url.startsWith("about:") || url.startsWith("chrome:")) {
        return;
    }
    url = url.replace(/utm_campaign=[^&]*/gi, "");
    var gettingCurrent = browser.windows.getCurrent();
    gettingCurrent.then(loadPrivately.bind(null, privatelist, invert, url), onError);
}

function onError(error) {
  console.log(`Error: ${error}`);
}

function loadPrivately(privatelist, invert, url, tab) {
    if (!tab.incognito) {
        for (i = 0; i < privatelist.length; i++) {
            var domain = privatelist[i].replace(/^\s+|\s+$/g, '');
            if (domain.startsWith('#')) {
                continue;
            } else if (domain.startsWith('!')) {
                domain = domain.substring(1);
                var regex = '((http(s)?)|(ftp)):\\/\\/'+domain+'\\/';
            } else if (domain.startsWith('.')) {
                domain = domain.substring(1);
                var regex = '((http(s)?)|(ftp)):\\/\\/([\\da-z-]+\\.)+'+domain+'\\/';
            } else {
                var regex = '((http(s)?)|(ftp)):\\/\\/([\\da-z-]+\\.)*'+domain+'\\/';
            }
            regex = new RegExp(regex, "i");
            var pos = url.search(regex);
            if (pos == 0 && !invert) {
                browser.tabs.executeScript(tab.tabId, { runAt: "document_start", code: 'window.stop(); '});
                browser.windows.create({ url, incognito: true });
                return;
            } else if (pos == 0) {
                return;
            }
        }
        if (invert) {
            browser.tabs.executeScript(tab.tabId, { runAt: "document_start", code: 'window.stop(); '});
            browser.windows.create({ url, incognito: true });
        }
    }
}

browser.webNavigation.onBeforeNavigate.addListener(
    readSettings
);

function readSettings(evtx) {
    var getting = browser.storage.sync.get(["privatelist", "invert"]);
    getting.then(onStorageGot.bind(null, evtx), onStorageError);
}

function onStorageError(error) {
    console.log(`StorageError: ${error}`);
}

function onStorageGot(evtx, item) {
    var privatelist = "";
    var invert = false;
    if (item.privatelist) {
        privatelist = item.privatelist;
    }
    if (item.invert) {
        invert = item.invert;
    }
    openURLInPrivateWindow(evtx, privatelist, invert);
}

