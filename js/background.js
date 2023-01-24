let currentTab = 0;
let currentUrl = '';
let lastPage = 0;
let productList = [];
let currentParsingPage = 0;
let currentParsingProduct = 0;
let minPrice = 0;
/** Waiting timers values **/
let nexPageMS = 1000;
let nextProductMS = 1000;
let reload403MS = 5000;

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
        currentParsingPage = 0;
        currentParsingProduct = 0;

        /** Get timer interval parameters **/
        nexPageMS = request.nexPageMS;
        nextProductMS = request.nextProductMS;
        reload403MS = request.reload403MS;

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

async function nextPage() {
    await pauseme(nexPageMS);

    /** Increase current product list page **/
    currentParsingPage++;

    /** Change parsing product list page **/
    let newUrlTo = (currentParsingPage > 1) ?
        currentUrl.split('?p=')[0] :
        currentUrl;

    console.log('currentParsingPage : ' + currentParsingPage);
    console.log('currentUrl : ' + currentUrl);
    console.log(newUrlTo + '?p=' + currentParsingPage);

    chrome.tabs.update({url: newUrlTo + '?p=' + currentParsingPage});

    /** first page **/
    getProductsLinksOnPage();
}

/** Get product list by single page **/
function getProductsLinksOnPage() {
    chrome.storage.local.set({
        minPrice: minPrice
    }, function () {
        chrome.tabs.executeScript(currentTab, {file: 'js/pageParser.js'});
    });
}

/** Messages **/
async function onMessage(request, sender, callback) {
    switch (request.action) {
        case "lastPage":
            lastPage = request.result.lastPage;
            nextPage();
            break;
        case "productsList":
            /** Делаем проверку, на то что страница загрузилась правильно **/
            if (request.result.products.length === 0 && currentParsingPage <= lastPage) {
                await pauseme(reload403MS);
                currentParsingPage--;
                nextPage();
            }

            /** Обновили глобальный массив товаров **/
            productList = productList.concat(request.result.products);
            console.log(request.result.products);
            console.log(productList);

            logging('Знайдено товарiв : ' + productList.length);

            if (currentParsingPage < 1) {
                nextPage();
            } else {
                /** Exit **/
                console.log(productList);
                nextProcut();
                returnAndexportToExcel();
            }
            break;
    }
}

async function nextProcut() {
    await pauseme(nextProductMS);

    /** Increase current product list page **/
    currentParsingProduct++;

    let productUrl = productList[currentParsingProduct].url;

    logging('Next product url : ' + productUrl);
    console.log('currentParsingProduct : ' + currentParsingProduct);
    console.log('currentUrl :' + currentUrl);

    chrome.tabs.update({url: productUrl});

    getProductInfo();
}

function getProductInfo(){
    chrome.tabs.executeScript(currentTab, {file: 'js/productParser.js'});
}

/** Final method. Return parsed products to popup.js for export to excel **/
function returnAndexportToExcel(){
    chrome.runtime.sendMessage({
        action: 'excelData',
        message: productList
    }, null);
}

/** Ждём некоторое время, делаем так называемую паузу **/
async function pauseme(time){
    await sleepNow(time);
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

/** How **/

//const array3 = [...array1, ...array2];
// Last version dktp
// https://allegro.pl/uzytkownik/Grand_Trade