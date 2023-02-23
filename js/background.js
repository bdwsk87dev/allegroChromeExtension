let currentTab = null;
let currentUrl = '';
let totalPages = 0;
let productList = [];

let currentParsingPage = 0;
let currentParsingProduct = 0;
let minPrice = 0;
let prodPerFile = 0;
/** Waiting timers values **/
let nexPageMS = 50000;
let nextProductMS = 50000;
let reload403MS = 50000;
let productUsed = [];

function logging(message) {
    chrome.runtime.sendMessage({
        action: 'logging',
        message: message
    }, null);
    console.log(message);
}

function getCurrentUrl(){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var tab = tabs[0];
        currentUrl = tab.url
        logging('Робоча адреса : ' + currentUrl);
    });
}

/** Request **/
function onRequest(request, sender, callback) {
    if (request.action === "start") {

        getCurrentUrl();

        totalPages = 0;
        productList = [];

        currentParsingPage = 0;
        currentParsingProduct = 0;

        /** Get timer interval parameters **/
        nexPageMS = request.nexPageMS;
        nextProductMS = request.nextProductMS;
        reload403MS = request.reload403MS;

        /** log **/
        logging('Запуск парсера...');

        /** Get min price set by user **/
        minPrice = request.minPrice;

        /** Get prod per file */
        prodPerFile = request.prodPerFile;

        /** log **/
        logging('Обрана мінімальна ціна : '+ minPrice);

        /** Get last product page **/
        chrome.tabs.executeScript(currentTab, {file: 'js/first_preparations.js'});
    }
}

async function nextPage() {
    logging('nextPage #####################');
    logging('pause : ' + nexPageMS);
    await pauseme(nexPageMS);

    /** Reset all variables */
    productUsed=[];

    /** Increase current product list page **/
    currentParsingPage++;
    logging('currentParsingPage : ' + currentParsingPage);

    /** Change parsing product list page **/
    let newUrlTo = (currentParsingPage > 1) ?
        currentUrl.split('?p=')[0] :
        currentUrl;

    /** Update tab */
    chrome.tabs.update({url: newUrlTo + '?p=' + currentParsingPage});
    logging('update url : ' + newUrlTo + '?p=' + currentParsingPage);

    /** Get product list by single page **/
    chrome.storage.local.set({
        minPrice: minPrice
    }, function () {

        /** Script */
        chrome.tabs.executeScript(currentTab, {file: 'js/pageParser.js'});
    });
}


async function nextProduct() {
    logging('nextProduct #####################');
    logging('pause : ' + nextProductMS);
    await pauseme(nextProductMS);

    /** Получаем url текущего оофера */
    let productUrl = productList[currentParsingProduct].url;
    logging('productUrl' + productUrl);

    /** Increase current product list page **/
    currentParsingProduct++;

    logging('currentParsingProduct' + currentParsingProduct);

    /** Update tab */
    chrome.tabs.update({url: productUrl});
    chrome.tabs.onUpdated.addListener( function (tabid, changeInfo, tab) {

        if (changeInfo.status === 'complete') {
            /** Запускаем скрипт на странице оффера */
            if(productUsed[currentParsingProduct] === undefined) {
                productUsed[currentParsingProduct] = true;

                /** Script */
                chrome.tabs.executeScript(currentTab, {file: 'js/productParser.js'});
            }
        }
    })
}

/** Messages **/
async function onMessage(request, sender, callback) {
    switch (request.action) {

        case "totalPages":
            totalPages = request.result.totalPages;
            await nextPage();
            break;

        case "productsList":

            currentParsingProduct = 0;

            logging('recieve product list on page');

            /** Делаем проверку, на то что страница загрузилась правильно **/
            if (request.result.products.length === 0 && currentParsingPage <= totalPages) {
                logging('403');
                await pauseme(reload403MS);
                currentParsingPage--;
                await nextPage();
            }

            productList = request.result.products;

            logging('Знайдено товарiв на сторінці: ' + productList.length);

            /** Если прошли все страницы списков товаров */
            logging('currentParsingPage : ' + currentParsingPage);
            if (currentParsingPage < 1 + 1) {
                /** Exit from here and start parsing products **/
                logging('Exit from here and start parsing products');
                await nextProduct();
            } else {
                logging('export to excel');
                exportToExcel();
            }
            break;

        case "productsReady":
            logging('recieve product data');
            let productData = request.result.productdata;
            logging('currentParsingProduct : ' + currentParsingProduct);

            if (currentParsingProduct <  productList.length ) {
            // if (currentParsingProduct < 7) {
                sendProductData(productData);
                logging('call nextProduct');
                await nextProduct();
            }
            else{
                sendProductData(productData);
                logging('call nextPage');
                await nextPage();
            }
            break;
    }
}

/** Final method. Return parsed products to popup.js for export to excel **/
function exportToExcel(){
    chrome.runtime.sendMessage({
        action: 'exportToExcel'
    }, null);
}

function sendProductData(productData){
    chrome.runtime.sendMessage({
        action: 'productData',
        data: productData
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
});

// On tab updated in browser
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    currentTab = tab.id;
});