var coreParser = {
    minPrice: 30,
    products: [],
    lastPage: 0,
    /** Find all products link on the page **/
    getProductsOnPage: function () {
       //        coreParser.minPrice =  chrome.storage.local.get("minPrice");
        chrome.storage.local.get("minPrice", function(fetchedData) {
            alert(fetchedData.minPrice);
            coreParser.minPrice = fetchedData.minPrice;
        });

        let items = document.querySelectorAll('div.opbox-listing article div div div:first-child a:first-child');
        items.forEach(item => {
            coreParser.products.push({'href': item.getAttribute('href') +  coreParser.minPrice});
        });
    },
    /** Find last page number for parsing **/
    findLastPageNumber: function () {
        coreParser.lastPage = document.querySelector('div[role="navigation"] span:last-child').innerText;
    }
}

/** Init coreParser **/
$(function () {
    coreParser.getProductsOnPage();
    coreParser.findLastPageNumber();
    chrome.runtime.sendMessage({
        action: 'coreParser',
        result: {
            products: coreParser.products,
            lastPage: coreParser.lastPage
        }
    }, null);
});

