var popupDownloader = {

    /** Main method */
    init: function () {
        /** Min value for the settigns **/
        popupDownloader.inputValueFixes();

        /** Click start parsing button **/
        $("#start").click(function () {
            /** send start request for parsing to background.js **/
            chrome.runtime.sendMessage({
                to: 'background_script',
                action: "start",
                minPrice: $('#minPrice').val(),
                maxPrice: $('#maxPrice').val(),
                pageNum: $('#pageNum').val(),
                nexPageMS: $('#nexPageMS').val(),
                nextProductMS: $('#nextProductMS').val(),
                reload403MS: $('#reload403MS').val(),
                prodPerFile: $('#prodPerFile').val()
            }, null);
        })

        /** Manual export to excel **/
        $("#export").click(() => {
            chrome.runtime.sendMessage({
                to: 'background_script',
                action: "exportToExcel",
            }, null);
        });
    },

    /** Listener for actions */
    onMessage: function (request, sender, callback) {
        switch (request.action) {
            case "logging":
                popupDownloader.logging(request.message);
                break;
            case "error":
                popupDownloader.errorLog(request.data.message);
                break;
        }
    },

    logging: function (message) {
        $('#logger').html($('#logger').html() + "<br>" + message);
        popupDownloader.scrollLogger();
    },

    errorLog: function (message) {
        $('#logger').html($('#logger').html() + "<br><span class='error_string'>" + message + "</span>");
        popupDownloader.scrollLogger();
    },

    scrollLogger: function () {
        const theDiv = document.querySelector('#logger');
        theDiv.scrollTop = Math.pow(10, 10);
    },

    /** Min value for the settigns **/
    inputValueFixes: function () {
        $('#minPrice').change(function () {
            if ($(this).val() < 0) $(this).val(0);
        })
        $('#maxPrice').change(function () {
            if ($(this).val() < 0) $(this).val(0);
        })
        $('#nexPageMS').change(function () {
            if ($(this).val() < 12000) $(this).val(1200);
        })
        $('#nextProductMS').change(function () {
            if ($(this).val() < 12000) $(this).val(12000);
        })
        $('#reload403MS').change(function () {
            if ($(this).val() < 12000) $(this).val(12000);
        })
    },
}

$(function () {
    popupDownloader.init();
    chrome.runtime.onMessage.addListener(popupDownloader.onMessage);
});



