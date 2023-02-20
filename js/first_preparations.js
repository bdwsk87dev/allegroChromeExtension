var lastPageParser = {

    /** Find last page number for parsing **/
    findLastPageNumber: function () {
        lastPageParser.totalPages = document.querySelector('div[role="navigation"] span:last-child').innerText;
    },

    /** Return data to background script **/
    sendData: function () {
        chrome.runtime.sendMessage({
            action: 'totalPages',
            result: {
                totalPages: lastPageParser.totalPages
            }
        }, null);
    }
}

/** Init coreParser **/
$(function () {
    lastPageParser.findLastPageNumber();
    lastPageParser.sendData();
});