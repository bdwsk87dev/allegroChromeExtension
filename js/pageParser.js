var coreParser = {
    products: [],

    /** Get localStorageData minPrice **/
    init: function () {
        chrome.storage.local.get("minPrice", function (fetchedData) {
            coreParser.minPrice = fetchedData.minPrice;
            coreParser.parseData();
        });
    },

    /** Find all products link on the page **/
    parseData: function () {
       // let items = document.querySelectorAll('div.opbox-listing article div div div:first-child a:first-child');
        let items = document.querySelectorAll('div.opbox-listing h2:nth-child(2) a');
        items.forEach(item => {
            coreParser.products.push({'url': item.getAttribute('href')});
        });
        coreParser.sendData();
    },

    /** Return data to background script **/
    sendData: function () {
        chrome.runtime.sendMessage({
            action: 'productsList',
            result: {
                products: coreParser.products
            }
        }, null);
    }
}

/** Init coreParser **/
$(function () {
    coreParser.init();
});

document.addEventListener('DOMContentLoaded', function() {

});