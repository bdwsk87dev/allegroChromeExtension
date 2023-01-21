var lastPageParser = {

    /** Find last page number for parsing **/
    findLastPageNumber: function () {
        lastPageParser.lastPage = document.querySelector('div[role="navigation"] span:last-child').innerText;
    },

    /** Return data to background script **/
    sendData: function () {
        chrome.runtime.sendMessage({
            action: 'lastPage',
            result: {
                lastPage: lastPageParser.lastPage
            }
        }, null);
    }
}

/** Init coreParser **/
$(function () {
    lastPageParser.findLastPageNumber();
    lastPageParser.sendData();
});