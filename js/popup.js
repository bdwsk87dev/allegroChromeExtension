var popupDownloader = {

    productsResult: [],

    /** Main method */
    init: function () {
        /** Min value for the settigns **/
        popupDownloader.inputValueFixes();

        /** Click start parsing button **/
        $("#start").click(function () {
            popupDownloader.productsResult = [];
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
            popupDownloader.newExcelExport();
        });
    },

    /** Listener for actions */
    onMessage: function (request, sender, callback) {
        if (request.action === "logging") {
            $('#logger').html($('#logger').html() + "<br>" + request.message);
        }
        if (request.action === "exportToExcel") {
            popupDownloader.newExcelExport();
        }
        if (request.action === "productData") {
            popupDownloader.addExcelProductData(request.data);
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
                '<td>' + product.desc.replaceAll('<img ', '<img style="float:left;width:100%;"').replaceAll('style="padding-top:calc', 'style_old="padding-top:calc') + '</td>' +
                '<td>' + product.productType + '</td>' +
                '<td>' + product.price + '</td>' +
                '<td>' + product.currency + '</td>' +
                '<td>+</td>' +
                '<td>' + product.sku + '</td>' +
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
    },

    addExcelProductData(product) {
        console.log(product);
        popupDownloader.productsResult.push({
            id: product.productId,
            name: product.productName,
            description: product.desc.replaceAll('<img ', '<img style="float:left;width:100%;"').replaceAll('style="padding-top:calc', 'style_old="padding-top:calc') + '</td>',
            type: product.productType,
            price: product.price,
            currency: product.currency,
            availability: '+',
            uid: product.sku
        });
    },

    /** New method of export to excel */
    newExcelExport: function () {
        const ExcelJS = require('exceljs');
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Alex';
        workbook.calcProperties.fullCalcOnLoad = true;

        /** Add worksheet */
        const worksheet = workbook.addWorksheet('My Sheet', {
            headerFooter: {firstHeader: "Hello Exceljs", firstFooter: "Hello World"}
        });

        /** Set up excel collumns */
        worksheet.columns = [
            {header: 'Код_товара', key: 'id', width: 10},
            {header: 'Название_позиции', key: 'name', width: 32},
            {header: 'Описание.', key: 'description', width: 10, outlineLevel: 1},
            {header: 'Тип_товара', key: 'type', width: 32},
            {header: 'Price', key: 'price', width: 32},
            {header: 'Currency', key: 'currency', width: 32},
            {header: 'Наличие', key: 'availability', width: 32},
            {header: 'Уникальный_идентификатор', key: 'uid', width: 32}
        ];
        popupDownloader.productsResult.forEach(data => {
            worksheet.addRow(data);
        });

        /** Call the download excel method */
        popupDownloader.downloadExcel(workbook);

    },

    /** Download excel method */
    downloadExcel: function (workbook) {
        workbook.xlsx.writeBuffer().then(function (data) {
            const blob = new Blob([data],
                {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
            const url = window.URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = 'download.xls';
            anchor.click();
            window.URL.revokeObjectURL(url);
        });
    }
}

$(function () {
    popupDownloader.init();
    chrome.runtime.onMessage.addListener(popupDownloader.onMessage);
});