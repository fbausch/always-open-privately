# Always Open Privately
Firefox add-on to always open specific websites in private windows.

This Firefox add-on provides the functionality to configure a whitelist of domain names. If while browsing a domain name matches a domain on the whitelist, this add-on will try to prevent Firefox from loading the website in a non-private window, open a new private window and load the website there.

Because of how webextension add-ons work, it is not always possible to prevent Firefox from loading a website. However, this add-on will always open a new private window and load the website there.

## Usage

Always Open Privately needs the permission to run in private windows. This setting may be set manually in the add-on manager in Firefox.

In the settings panel, add one domain per line.

## Permissions

The add-on requires several permissions. It just asks for the absolutely required permissions.

* `webNavigation`: to get notified about new URLs (new site visits)
* `tabs`: to get the URL to be opened
* `activeTab`: to stop loading a website
* `http://*/*`, `https://*/*`: to be able to intercept requests to every possible domain
* `storage`: to save add-on settings
