let coreParser = {
    response: {},
    /** Find all products link on the page **/
    getProductsOnPage: function () {
        coreParser.response.items = [];
        let items = document.querySelectorAll('div.opbox-listing a:first-child');
        items.forEach(item => {
            coreParser.response.items.push({'href': item.getAttribute('href')});
        });
    },
    /** Find last page number for parsing **/
    findLastPageNumber: function (){
        coreParser.response.lastPage = document.querySelector('div[role="navigation"] span:last-child').innerText;
    }
}

/** Init coreParser **/
$(function () {
    coreParser.getProductsOnPage();
    coreParser.findLastPageNumber();
    chrome.runtime.sendMessage({action: 'coreParser', result: coreParser.response}, null);
});

