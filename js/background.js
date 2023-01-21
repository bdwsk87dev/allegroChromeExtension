let currentTab = 0;
let lastPage = 0;
let productList = [];

function logging(message) {
    chrome.runtime.sendMessage({
        action: 'logging',
        message: message
    }, null);
}

/** Request **/
function onRequest(request, sender, callback) {
    if (request.action == "start") {
        logging('script started');

        /** Get min price set by user **/
        let minPrice = request.minPrice;

        /** Get last product page **/
        chrome.tabs.executeScript(currentTab, {file: 'js/getLastPage.js'});
    }
}


function parseSinglePage() {
    /** Get product list by single page **/
    chrome.storage.local.set({
        minPrice: minPrice
    }, function () {
        chrome.tabs.executeScript(currentTab, {file: 'js/pageParser.js'});
    });
}

/** Messages **/
function onMessage(request, sender, callback) {
    switch (request.action) {
        case "productsList":
            productList.concat(request.result.products)
            console.log(productList);
            break;
        case "lastPage":
            lastPage = request.result.lastPage;
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

/*

		//chrome.tabs.sendMessage(0,{action: 'getSubcategories'}, null);
		//chrome.tabs.sendMessage(0,{action: 'getProductsOnPage'}, null);

 */

