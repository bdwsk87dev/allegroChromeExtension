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
            name_pl: product.productName,
            name_ru: '=GOOGLETRANSLATE("' + product.productName + '";"pl";"uk")',
            description_pl: product.desc.replaceAll('<img ', '<img style="float:left;width:100%;"').replaceAll('style="padding-top:calc', 'style_old="padding-top:calc') + '</td>',
            type_pl: product.productType,
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
        const worksheet = workbook.addWorksheet('Export Products Sheet', {
            headerFooter: {firstHeader: "Hello Exceljs", firstFooter: "Hello World"}
        });

        /** Set up excel collumns */
        worksheet.columns = [
            {header: 'Код_товара', key: 'id', width: 10},
            {header: 'Название_позиции_pl', key: 'name_pl', width: 15},
            {header: 'Название_позиции', key: 'name_ru', width: 20},
            {header: 'Название_позиции_укр', key: 'name_uk', width: 20},
            //N
            {header: 'Поисковые_запросы', key: 'unsigned1', width: 3},
            {header: 'Поисковые_запросы_укр', key: 'unsigned2', width: 3},
            //Y
            {header: 'Описание_pl', key: 'description_pl', width: 10, outlineLevel: 1},
            {header: 'Описание', key: 'description', width: 10, outlineLevel: 1},
            {header: 'Описание_укр', key: 'description_uk', width: 10, outlineLevel: 1},
            {header: 'Тип_товара_pl', key: 'type_pl', width: 10},
            {header: 'Тип_товара', key: 'type', width: 10},
            {header: 'Цена', key: 'price', width: 10},
            {header: 'Валюта', key: 'currency', width: 10},
            //N
            {header: 'Единица_измерения', key: 'unsigned3', width: 3},
            {header: 'Минимальный_объем_заказа', key: 'unsigned4', width: 3},
            {header: 'Оптовая_цена', key: 'unsigned5', width: 3},
            {header: 'Минимальный_заказ_опт', key: 'unsigned6', width: 3},
            {header: 'Ссылка_изображения', key: 'image', width: 3},


            {header: 'Наличие', key: 'availability', width: 32},
            {header: 'Уникальный_идентификатор', key: 'uid', width: 32}
        ];
        popupDownloader.productsResult.forEach(data => {
            worksheet.addRow(data);
        });

        /** Название позиции */
        worksheet.fillFormula('C2:C' + popupDownloader.productsResult.length, 'GOOGLETRANSLATE(B1;"pl";"ru")', (row, col) => row);
        orksheet.fillFormula('D2:D' + popupDownloader.productsResult.length, 'GOOGLETRANSLATE(B1;"pl";"uk")', (row, col) => row);

        /** Описание */
        worksheet.fillFormula('H2:H' + popupDownloader.productsResult.length, 'GOOGLETRANSLATE(G1;"pl";"ru")', (row, col) => row);
        orksheet.fillFormula('I2:I' + popupDownloader.productsResult.length, 'GOOGLETRANSLATE(G1;"pl";"uk")', (row, col) => row);

        /** Тип_товара */
        worksheet.fillFormula('K2:K' + popupDownloader.productsResult.length, 'GOOGLETRANSLATE(J1;"pl";"ru")', (row, col) => row);


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
    },
}

$(function () {
    popupDownloader.init();
    chrome.runtime.onMessage.addListener(popupDownloader.onMessage);
});



