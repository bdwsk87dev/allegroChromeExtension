currentTab = 0;

function onRequest(request, sender, callback) {
	if (request.action == "start") {
		console.log('start button is pressed');
		chrome.tabs.executeScript(currentTab, {file: 'js/contentscripFindtCategories.js'});
		chrome.runtime.sendMessage({action: 'getSubcategories'}, null);
	}
}

chrome.extension.onRequest.addListener(onRequest);

// On tab activated in browser
chrome.tabs.onActivated.addListener(function (activeInfo) {
	currentTab = activeInfo.tabId;
	chrome.tabs.get(currentTab, function (tab) {
		currentUrl = tab.url.split('/')[2];g
		currentFullUrl = tab.url;
	});
});

// On tab updated in browser
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	currentUrl = tab.url.split('/')[2];
	currentFullUrl = tab.url;
	currentTab = tab.id;
	chrome.browserAction.setBadgeText({text: localStorage['imageCounter']});
});

chrome.runtime.onMessage.addListener((msg, sender) => {
	console.log('onMessage action');
	console.log(msg);


	if (msg.action === 'subcategories') {
		let newURL = "http://stackoverflow.com/";
		chrome.tabs.create({ url: newURL });
		console.log(msg.items);
		chrome.tabs.create({ url: 'https://allegro.pl' + msg.items[0].url });
		chrome.tabs.create({ url: 'https://allegro.pl' + msg.items[1].url });
	}
});

