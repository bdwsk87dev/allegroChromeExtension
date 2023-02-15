var popupDownloader = {

    /** Main method */
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
                reload403MS: $('#reload403MS').val(),
                prodPerFile: $('#prodPerFile').val()
            });
        })

        /** Testing button !! **/
        $("#export").click(() => {
            popupDownloader.exportExcel();
        });
    },

    /** Listener for actions */
    onMessage: function (request, sender, callback) {
        if (request.action === "logging") {
            $('#logger').html($('#logger').html() + "<br>" + request.message);
        }
        if (request.action === "excelData") {
            popupDownloader.exportExcel(request.message);
        }
    },

    /** Export to excel function */
    exportExcel: function (products) {
        /** Create excel data */
        products.forEach(product => {

            /** Prepare images */
            let imagesText = '';

            product.allImages.forEach(image => {
                imagesText += image + ",";
            })
            imagesText = imagesText.slice(0, -1);

            /** Exporting buffer table */
            $('#basic_table tbody').append('<tr>' +
                '<td>' + product.productId + '</td>' + 
                '<td>' + product.productName + '</td>' +
                '<td>' + product.category + '</td>' +
                '<td>' + product.desc + '</td>' +
                '<td>' + product.price + '</td>' +
                '<td>' + imagesText + '</td>' +
                '</tr>')
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