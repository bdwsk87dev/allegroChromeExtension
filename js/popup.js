var popupDownloader = {

    productsResult: [],
    groupResult: [],
    groupExist: [],

    /** Main method */
    init: function () {
        /** Min value for the settigns **/
        popupDownloader.inputValueFixes();

        /** Click start parsing button **/
        $("#start").click(function () {

            popupDownloader.productsResult = [];
            popupDownloader.groupResult = [];
            popupDownloader.groupExist = [];

            popupDownloader.productsResult = [];

            /** send start request for parsing to background.js **/
            chrome.runtime.sendMessage({
                to: 'background_script',
                action: "start",
                minPrice: $('#minPrice').val(),
                nexPageMS: $('#nexPageMS').val(),
                nextProductMS: $('#nextProductMS').val(),
                reload403MS: $('#reload403MS').val(),
                prodPerFile: $('#prodPerFile').val()
            }, null);
        })

        /** Testing button !! **/
        $("#export").click(() => {
            popupDownloader.newExcelExport();
        });
    },

    /** Listener for actions */
    onMessage: function (request, sender, callback) {
        switch (request.action) {
            case "logging":
                popupDownloader.logging(request.message);
                break;
            case "exportToExcel":
                popupDownloader.newExcelExport();
                break;
            case "productData":
                popupDownloader.addExcelProductData(request.data);
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
        popupDownloader.productsResult.push({
            id: product.productId,
            name_pl: product.productName,
            description_pl: product.desc.replaceAll('<img ', '<img style="float:left;width:100%;"').replaceAll('style="padding-top:calc', 'style_old="padding-top:calc') + '</td>',
            type_pl: product.productType,
            price: product.price,
            currency: product.currency,
            unit: 'шт.',
            images: popupDownloader.prepareImages(product.mainImages),
            availability: '+',
            uid: product.sku,
            group_id: product.categories[product.categories.length - 1].id,
        });

        /** Groups */
        let brc = product.categories;
        for (let i = brc.length; i >= 0; i--) {
            if (brc[i] === undefined) continue;
            let parendId = (brc[i - 1] === undefined) ? '' : brc[i - 1].id;
            if (!popupDownloader.groupExist.includes(brc[i].id)) {
                popupDownloader.groupExist.push(brc[i].id);
                popupDownloader.groupResult.push({
                    group_name_pl: brc[i].text,
                    group_id: brc[i].id,
                    parent_id: parendId
                })
            }
        }
    },

    prepareImages(images) {
        let result = '';
        images.forEach(img => {
            result += img + ',';
        })
        return result.slice(0, -1);
    },

    /** New method of export to excel */
    newExcelExport: function () {
        const ExcelJS = require('exceljs');
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Alex';
        workbook.calcProperties.fullCalcOnLoad = true;

        /** Add worksheet */
        const worksheet = workbook.addWorksheet('Export Products Sheet _ Template', {
            headerFooter: {firstHeader: "Hello header", firstFooter: "Hello footer"}
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
            {header: 'Описание_pl', key: 'description_pl', width: 14},
            {header: 'Описание', key: 'description', width: 14},
            {header: 'Описание_укр', key: 'description_uk', width: 14},
            {header: 'Тип_товара_pl', key: 'type_pl', width: 12},
            {header: 'Тип_товара', key: 'type', width: 12},
            {header: 'Цена', key: 'price', width: 10},
            {header: 'Валюта', key: 'currency', width: 10},
            {header: 'Единица_измерения', key: 'unit', width: 3},
            //N
            {header: 'Минимальный_объем_заказа', key: 'unsigned4', width: 3},
            {header: 'Оптовая_цена', key: 'unsigned5', width: 3},
            {header: 'Минимальный_заказ_опт', key: 'unsigned6', width: 3},
            //Y
            {header: 'Ссылка_изображения', key: 'images', width: 4},
            {header: 'Наличие', key: 'availability', width: 32},
            //N
            {header: 'Количество', key: 'unsigned36', width: 4},
            {header: 'Номер_группы', key: 'unsigned36', width: 4},
            {header: 'Название_группы', key: 'unsigned36', width: 4},
            {header: 'Адрес_подраздела', key: 'unsigned36', width: 4},
            {header: 'Возможность_поставки', key: 'unsigned36', width: 4},
            {header: 'Срок_поставки', key: 'unsigned36', width: 4},
            {header: 'Способ_упаковки', key: 'unsigned36', width: 4},
            {header: 'Способ_упаковки_укр', key: 'unsigned36', width: 4},
            //Y
            {header: 'Уникальный_идентификатор', key: 'uid', width: 32},
            //N
            {header: 'Идентификатор_товара', key: 'unsigned36', width: 32},
            {header: 'Идентификатор_подраздела', key: 'unsigned37', width: 32},
            //Y
            {header: 'Идентификатор_группы', key: 'group_id', width: 32},
            //N
            {header: 'Производитель', key: 'unsigned7', width: 32},
            {header: 'Страна_производитель', key: 'unsigned8', width: 32},
            {header: 'Скидка', key: 'unsigned9', width: 32},
            {header: 'ID_группы_разновидностей', key: 'unsigned10', width: 32},
            {header: 'Личные_заметки', key: 'unsigned11', width: 32},
            {header: 'Продукт_на_сайте', key: 'unsigned12', width: 32},
            {header: 'Cрок действия скидки от', key: 'unsigned14', width: 32},
            {header: 'Cрок действия скидки до', key: 'unsigned15', width: 32},
            {header: 'Цена от', key: 'unsigned16', width: 32},
            {header: 'Ярлык', key: 'unsigned17', width: 32},
            {header: 'HTML_заголовок', key: 'unsigned18', width: 32},
            {header: 'HTML_заголовок_укр', key: 'unsigned19', width: 32},
            {header: 'HTML_описание', key: 'unsigned20', width: 32},
            {header: 'HTML_описание_укр', key: 'unsigned21', width: 32},
            {header: 'HTML_ключевые_слова', key: 'unsigned22', width: 32},
            {header: 'HTML_ключевые_слова_укр', key: 'unsigned23', width: 32},
            {header: 'Вес,кг', key: 'unsigned24', width: 32},
            {header: 'Ширина,см', key: 'unsigned25', width: 32},
            {header: 'Высота,см', key: 'unsigned26', width: 32},
            {header: 'Длина,см', key: 'unsigned27', width: 32},
            {header: 'Где_находится_товар', key: 'unsigned28', width: 32},
            {header: 'Код_маркировки_(GTIN)', key: 'unsigned29', width: 32},
            {header: 'Номер_устройства_(MPN)', key: 'unsigned30', width: 32},
            {header: 'Название_Характеристики', key: 'unsigned31', width: 32},
            {header: 'Измерение_Характеристики', key: 'unsigned32', width: 32},
            {header: 'Значение_Характеристики', key: 'unsigned33', width: 32},
            {header: 'Измерение_Характеристики', key: 'unsigned34', width: 32},
            {header: 'Значение_Характеристики', key: 'unsigned35', width: 32}
        ];
        popupDownloader.productsResult.forEach(data => {
            worksheet.addRow(data);
        });

        let lastProductCell = (popupDownloader.productsResult.length === 0) ? 2 : popupDownloader.productsResult.length + 1;

        /** Название позиции */
        worksheet.fillFormula('C2:C' + lastProductCell, 'GOOGLETRANSLATE(B2;"pl";"ru")', (row, col) => row);
        worksheet.fillFormula('D2:D' + lastProductCell, 'GOOGLETRANSLATE(B2;"pl";"uk")', (row, col) => row);

        /** Описание */
        worksheet.fillFormula('H2:H' + lastProductCell, 'GOOGLETRANSLATE(G2;"pl";"ru")', (row, col) => row);
        worksheet.fillFormula('I2:I' + lastProductCell, 'GOOGLETRANSLATE(G2;"pl";"uk")', (row, col) => row);

        /** Тип_товара */
        worksheet.fillFormula('K2:K' + lastProductCell, 'GOOGLETRANSLATE(J2;"pl";"ru")', (row, col) => row);

        /**
         * SECOND PAGE
         */

        const worksheetGroups = workbook.addWorksheet('Export Groups Sheet _ Template', {
            headerFooter: {firstHeader: "Hello header", firstFooter: "Hello footer"}
        });

        /** Set up excel collumns */
        worksheetGroups.columns = [
            {header: 'Номер_группы', key: 'group_num', width: 10},
            {header: 'Название_группы_pl', key: 'group_name_pl', width: 15},
            {header: 'Название_группы', key: 'group_name_ru', width: 15},
            {header: 'Название_группы_укр', key: 'group_name_uk', width: 15},
            {header: 'Идентификатор_группы', key: 'group_id', width: 20},
            {header: 'Номер_родителя', key: 'parent_num', width: 20},
            {header: 'Идентификатор_родителя', key: 'parent_id', width: 20},
            {header: 'HTML_заголовок_группы', key: 'unsigned40', width: 20},
            {header: 'HTML_заголовок_группы_укр', key: 'unsigned41', width: 20},
            {header: 'HTML_описание_группы', key: 'unsigned42', width: 20},
            {header: 'HTML_описание_группы_укр', key: 'unsigned43', width: 20},
            {header: 'HTML_ключевые_слова_группы', key: 'unsigned44', width: 20},
            {header: 'HTML_ключевые_слова_группы_укр', key: 'unsigned45', width: 20},
        ];

        popupDownloader.groupResult.forEach(group => {
            worksheetGroups.addRow(group);
        });

        let lastGroupCell = (popupDownloader.groupExist.length === 0) ? 2 : popupDownloader.groupExist.length + 1;
        worksheetGroups.fillFormula('C2:C' + lastGroupCell, 'GOOGLETRANSLATE(B2;"pl";"ru")', (row, col) => row);
        worksheetGroups.fillFormula('D2:D' + lastGroupCell, 'GOOGLETRANSLATE(B2;"pl";"uk")', (row, col) => row);

        /** Add bgColor for columns which need to be deleted */
        popupDownloader.fillHeaders(worksheet, ['B', 'G', 'J']);
        popupDownloader.fillHeaders(worksheetGroups, ['B']);

        /** Add worksheets */
        workbook.addWorksheet('Export Products Sheet');
        workbook.addWorksheet('Export Groups Sheet');

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

    fillHeaders: function (worksheet, columns) {
        columns.forEach(col => {
            worksheet.getCell(col + '1').fill = {
                type: 'pattern',
                pattern: 'lightDown',
            };
        });
    }
}

$(function () {
    popupDownloader.init();
    chrome.runtime.onMessage.addListener(popupDownloader.onMessage);
});



