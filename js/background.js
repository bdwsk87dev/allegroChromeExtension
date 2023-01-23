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
    if (request.action === "start") {

        lastPage = 0;
        productList = [];
        currentParsingPage = 1;

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

function nextPage(){
    pauseme(13000);

    /** Increase current product list page **/
    currentParsingPage++;


    /** Change parsing product list page **/
    let newUrlTo = (currentParsingPage>1)?
        currentUrl.split('?p=')[0]:
        currentUrl;

    console.log(currentParsingPage);
    console.log(currentUrl);
    console.log(newUrlTo + '?p=' + currentParsingPage);

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

function eachProduct(){

}

/** Messages **/
function onMessage(request, sender, callback) {
    switch (request.action) {
        case "lastPage":
            lastPage = request.result.lastPage;
            nextPage();
            break;
        case "productsList":
            /** Делаем проверку, на то что страница загрузилась правильно **/
            if(request.result.products.length === 0 && currentParsingPage <= lastPage){
                pauseme(5000);
            }

            /** Обновили глобальный массив товаров **/
            productList = productList.concat(request.result.products);
            console.log(request.result.products);
            console.log(productList);

            logging('Спарсено товаров : ' + productList.length);

            if(currentParsingPage<3){
                nextPage();
            }
            else{
                /** Exit **/
                console.log(productList);
            }
            break;
    }
}

/** Ждём некоторое время, делаем так называемую паузу **/
async function pauseme(time){
    await sleepNow(time);
    nextPage();
}

const sleepNow = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

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

// On tab updated in browser
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    currentUrl = tab.url;
    currentTab = tab.id;
});

//const array3 = [...array1, ...array2];