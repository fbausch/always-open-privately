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
            browser.tabs.executeScript(tab.tabId, { runAt: "document_start", code: 'window.stop(); '});

            url = url.replace(/(utm_(source|medium|campaign|term|content)|fbclid|gclid|icid|mc_[ce]id|mkt_tok)=[^&#]*/gi, "");
            browser.windows.getAll({windowTypes: ['normal']}).then((wins) => {
                incognitos = wins.filter(win => win.incognito == true);
                if (incognitos.length > 0) {
                    selWin = incognitos[0];
                    browser.tabs.create({active: true, url: url, windowId: selWin.id}).then(browser.windows.update(selWin.id, {focused: true}));
                } else {
                    browser.windows.create({ url, incognito: true });
                }
	    });
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
    browser.storage.sync.get(["privatelist", "invert", "aopSettings"]).then(getSettings.bind(null, evtx), onStorageError);
}

function onStorageError(error) {
    console.log(`StorageError: ${error}`);
}

function getSettings(evtx, item) {
    if (item.aopSettings === undefined) {
        getSettingsVersion1(evtx, item);
        return;
    } else if (item.aopSettings.storageLayoutVersion == 2) {
        getSettingsVersion2(evtx, item);
    }
}

function getSettingsVersion1(evtx, item) {
    settings = {"plst": {}, "invt": false, "storageLayoutVersion": 2};
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

    browser.storage.sync.remove(["privatelist"], ["invert"]);
    browser.storage.sync.set({aopSettings: message.aopSettings}).then(settings = null);

    openURLInPrivateWindow(evtx, settings);
}

function getSettingsVersion2(evtx, item) {
    settings = item.aopSettings;
    openURLInPrivateWindow(evtx, settings);
}

settings = null;
browser.webNavigation.onBeforeNavigate.addListener(
    aopListener
);

browser.runtime.onMessage.addListener((message, sender, action) => {
    if (message.type === 'aopSaveSettings') {
        browser.storage.sync.set({aopSettings: message.aopSettings}).then(settings = null);
    }
    if (message.type === 'aopGetSettings') {
	action(settings);
    }
});

