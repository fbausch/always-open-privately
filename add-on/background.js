function openURLInPrivateWindow(evtx, settings) {
    var url = evtx.url;
    if (url.startsWith("about:") || url.startsWith("chrome:") || url.startsWith("file:")) {
        return;
    }
    var gettingCurrent = browser.windows.getCurrent();
    gettingCurrent.then(loadPrivately.bind(null, settings, url), onError);
}

function onError(error) {
  console.log(`Error: ${error}`);
}

function loadPrivately(settings, url, tab) {
    if (!tab.incognito) {
        var aurl = document.createElement('a');
        aurl.href = url;
        var domain = aurl.hostname.split('.');
        var i = domain.length - 1;
        var cdom = domain[i];
        var matches = false;
        while (i >= 0) {
            val = settings["plst"][cdom];
            if (val !== undefined) {
                if (val == 1 && i == 0 // domain matched
                 || val == 2 && i > 0  // subdomain matched
                 || val == 3) {        // domain or subdomain matched
                    matches = true;
                    break;
                }
            }
            i--;
            cdom = domain[i] + "." + cdom;
        }
        if (matches && !settings["invt"] || !matches && settings["invt"]) {
            url = url.replace(/(utm_(source|medium|campaign|term|content)|fbclid|gclid|icid|mc_[ce]id|mkt_tok)=[^&#]*/gi, "");
            browser.windows.create({ url, incognito: true });
        }
    }
}

function aopListener(evtx) {
    if (settings == null) {
        readSettings(evtx);
    } else {
        openURLInPrivateWindow(evtx, settings);
    }
}

function readSettings(evtx) {
    browser.storage.sync.get(["privatelist", "invert"]).then(parseSettings.bind(null, evtx), onStorageError);
}

function onStorageError(error) {
    console.log(`StorageError: ${error}`);
}

function parseSettings(evtx, item) {
    settings = {"plst": {}, "invt": false};
    if (item.privatelist) {
        var privatelist = item.privatelist.split(/\r?\n/);
        for (i = 0; i < privatelist.length; i++) {
            var domain = privatelist[i].replace(/^\s+|\s+$/g, '');
            if (domain.startsWith('#') || domain.length == 0) {
                continue;
            } else if (domain.startsWith('!')) {
                domain = domain.substring(1);
                settings["plst"][domain] = 1; // matches only domain
            } else if (domain.startsWith('.')) {
                domain = domain.substring(1);  // matches only subdomains
                settings["plst"][domain] = 2;
            } else {
                settings["plst"][domain] = 3; // matches domain and subdomains
            }
        }
    }
    if (item.invert) {
        settings["invt"] = item.invert;
    }
    openURLInPrivateWindow(evtx, settings);
}

settings = null;
browser.webNavigation.onBeforeNavigate.addListener(
    aopListener
);

browser.runtime.onMessage.addListener((message) => {
    if (message.type === 'clearCachedSettings') {
        settings = null;
    }
});
