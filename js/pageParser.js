let coreParser = {
    products: [],

    init: function () {
        /** Get localStorageData minPrice and maxPrice **/
        chrome.storage.local.get(null, function (fetchedData) {
            coreParser.minPrice = fetchedData.minPrice;
            coreParser.maxPrice = fetchedData.maxPrice;
            /** Call parsing method */
            coreParser.parseData();
        });
    },

    /** Find all products link on the page **/
    parseData: function () {
        // let items = document.querySelectorAll('div.opbox-listing article div div div:first-child a:first-child');
        let items = document.querySelectorAll('div.opbox-listing h2:nth-child(2) a');
        if (items.length === 0) {
            items = document.querySelectorAll('div[data-box-name="items container"] h2 a');
        }

        items.forEach(item => {
            coreParser.products.push({'url': item.getAttribute('href')});
        });
        coreParser.sendData();
    },

    /** Return data to background script **/
    sendData: function () {
        chrome.runtime.sendMessage({
            to: 'background_script',
            action: 'productsList',
            result: {
                products: coreParser.products
            }
        }, null);
    }
}

/** Init coreParser **/
$(function () {
    coreParser.products = [];
    coreParser.init();
});