var popupDownloader = {
    init: function () {

        /** Min value for the settigns **/
        popupDownloader.inputValueFixes();

        /** Click start parsing button **/
        $("#start").click(function () {

            /** clear the intermediate table, which is used for export to excel **/
            $('#basic_table tbody').remove();
            $('#basic_table').append('<tbody></tbody>')

            /** send start request for parsing to background.js **/
            chrome.extension.sendRequest({
                action: "start",
                minPrice: $('#minPrice').val(),
                nexPageMS: $('#nexPageMS').val(),
                nextProductMS: $('#nextProductMS').val(),
                reload403MS: $('#reload403MS').val()
            });
        })

        /** Testing button !! **/
        $("#export").click(() => {
            popupDownloader.exportExcel();
        });
    },
    onMessage: function (request, sender, callback) {
        if (request.action === "logging") {
            $('#logger').html($('#logger').html() + "<br>" + request.message);
        }
        if (request.action === "excelData") {
            popupDownloader.exportExcel(request.message);
        }
    },

    exportExcel: function (products) {

        products.forEach(product => {
            $('#basic_table tbody').append('<tr><td>' + product.url + '</td></tr>')
        });

        let excel = new ExcelGen({
            "src_id": "basic_table",
            "show_header": true,
            "type": "table"
        });
        excel.generate();
    },

    /** Min value for the settigns **/
    inputValueFixes: function () {

        $('#minPrice').change(function () {
            if ($(this).val() < 0) $(this).val(0);
        })
        $('#nexPageMS').change(function () {
            if ($(this).val() < 1000) $(this).val(1000);
        })
        $('#nextProductMS').change(function () {
            if ($(this).val() < 1000) $(this).val(1000);
        })
        $('#reload403MS').change(function () {
            if ($(this).val() < 1000) $(this).val(1000);
        })

    }
}

$(function () {
    popupDownloader.init();
    chrome.runtime.onMessage.addListener(popupDownloader.onMessage);
});

/** HOW to close window**/
//window.close();