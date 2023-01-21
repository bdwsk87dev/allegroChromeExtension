let currentTab = 0;
let currentUrl = '';
let lastPage = 0;
let productList = [];
let currentParsingPage = 0;
let minPrice = 0;

function logging(message) {
    chrome.runtime.sendMessage({
        action: 'logging',
        message: message
    }, null);
}

/** Request **/
function onRequest(request, sender, callback) {
    if (request.action == "start") {

        lastPage = 0;
        productList = [];
        currentParsingPage = 0;

        /** log **/
        logging('script started');

        /** Get min price set by user **/
        minPrice = request.minPrice;

        /** log **/
        logging('minPrice is '+ minPrice);

        /** Get last product page **/
        chrome.tabs.executeScript(currentTab, {file: 'js/getLastPage.js'});
    }
}

function eachPage(){

    /** Increase current product list page **/
    currentParsingPage++;

    /** Change parsing product list page **/
    let newUrlTo = currentUrl.substring(currentUrl.search('/?p=/'), currentUrl.length)
    chrome.tabs.update({ url: newUrlTo + '?p=' + currentParsingPage });

    /** first page **/
    getProductsLinksOnPage();
}


function getProductsLinksOnPage() {
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
        case "lastPage":
            lastPage = request.result.lastPage;
            eachPage();
            break;
        case "productsList":
            productList.concat(request.result.products);
            if(currentParsingPage<2){
                eachPage();
            }
            else{
                console.log(productList);
            }
            break;
    }
}

/** Register actions **/
chrome.extension.onRequest.addListener(onRequest);
chrome.runtime.onMessage.addListener(onMessage);

/** Browser actions **/
/** On tab activated in browser **/
chrome.tabs.onActivated.addListener(function (activeInfo) {
    currentTab = activeInfo.tabId;
    chrome.tabs.get(currentTab, function (tab) {
        currentUrl = tab.url;
    });
});