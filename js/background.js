currentTab = 0;

/** Request **/
function onRequest(request, sender, callback) {
	if (request.action == "start") {
		console.log('start button is pressed');
		chrome.tabs.executeScript(currentTab, {file: 'js/contentscripFindtCategories.js'});
		//chrome.tabs.sendMessage(0,{action: 'getSubcategories'}, null);
		//chrome.tabs.sendMessage(0,{action: 'getProductsOnPage'}, null);
	}
}

/** Messages **/
function onMessage(request, sender, callback) {
	if (request.action == 'coreParser') {

		console.log(request.result);

		//chrome.tabs.create({ url: 'https://allegro.pl' + request.items[0].url });
		//chrome.tabs.create({ url: 'https://allegro.pl' + request.items[1].url });
	}
}

/** Register actions **/
chrome.extension.onRequest.addListener(onRequest);
chrome.runtime.onMessage.addListener(onMessage);

/** Browser actions **/
/** On tab activated in browser **/
chrome.tabs.onActivated.addListener(function (activeInfo) {
	// get current tab id
	currentTab = activeInfo.tabId;
	chrome.tabs.get(currentTab, function (tab) {
		currentUrl = tab.url.split('/')[2];
		currentFullUrl = tab.url;
	});
});

/** On tab updated in browser **/
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	currentUrl = tab.url.split('/')[2];
	currentFullUrl = tab.url;
	currentTab = tab.id;
	chrome.browserAction.setBadgeText({text: localStorage['imageCounter']});
});



