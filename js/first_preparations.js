var lastPageParser = {
    /** Find last page number for parsing **/
    findLastPageNumber: function () {
        const navigation = document.querySelector('div[role="navigation"] span:last-child');
        if (navigation === null) {
            lastPageParser.sendError('Не вдається знайти пагінацію allegro.pl');
        } else {
            lastPageParser.totalPages = navigation.innerText;
            lastPageParser.sendData();
        }
    },

    /** Return data to background script **/
    sendData: function () {
        chrome.runtime.sendMessage({
            to: 'background_script',
            action: 'totalPages',
            data: {
                totalPages: lastPageParser.totalPages
            }
        }, null);
    },

    /** Return error */
    sendError: function (message) {
        chrome.runtime.sendMessage({
            to: 'background_script',
            action: 'error',
            data: {
                message: message
            }
        }, null);
    }
}

/** Init coreParser **/
$(function () {
    lastPageParser.findLastPageNumber();
});