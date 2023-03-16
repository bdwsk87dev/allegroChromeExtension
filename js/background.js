let currentTab = null;
let currentUrl = '';
let totalPages = 0;
let productList = [];
let currentParsingPage = 0;
let currentParsingProduct = 0;
let minPrice = 0;
let maxPrice = 0;
let prodPerFile = 0;
let nexPageMS = 50000;
let nextProductMS = 50000;
let reload403MS = 50000;
let productUsed = [];
let mode = '';
let pageNum = 0;

/** Export to excel data */
let productsResult = [];
let groupResult = [];
let groupExist = [];

function getCurrentUrl() {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        var tab = tabs[0];
        currentUrl = tab.url
        logging('Поточна адреса : ' + currentUrl);


        /** Get last product page **/
        /** Update tab */
        mode = 'get_last_page';
        chrome.tabs.update({url: currentUrl + '?p=' + pageNum + '&price_from=' + minPrice + '&price_to=' + maxPrice});
        chrome.tabs.onUpdated.addListener(function (tabId, info) {
            if (info.status === 'complete' && currentTab === tabId && mode === 'get_last_page') {
                /** Get product list by single page **/
                chrome.storage.local.set({
                    minPrice: minPrice, maxPrice: maxPrice,
                }, function () {
                    /** Script */
                    chrome.tabs.executeScript(currentTab, {file: 'js/first_preparations.js'});
                });
            }
        });

    });
}

async function nextPage() {
    /** Reset all variables */
    productUsed = [];
    logging('Наступна сторінка * * * * * * * * *');

    /** При першому проході забираємо паузу */
    if (currentParsingPage > 0) {
        logging('Очікуємо : ' + nexPageMS + ' мс.');
        await pauseme(nexPageMS);
    }

    /** Increase current product list page **/
    currentParsingPage++;

    logging('Поточна сторінка : ' + currentParsingPage);

    /** Change parsing product list page **/
    let newUrlTo = (currentParsingPage > 1) ? currentUrl.split('?p=')[0] : currentUrl;

    if (currentParsingPage === 1) {
        currentParsingPage = pageNum;
    }

    sendProgress();

    /** Add max and min price filter */
    newUrlTo += '?p=' + currentParsingPage + '&price_from=' + minPrice + '&price_to=' + maxPrice;

    /** Update tab */
    mode = 'offer_list';
    chrome.tabs.update({url: newUrlTo});
    logging('Переходимо на url : ' + newUrlTo);


    chrome.tabs.onUpdated.addListener(function (tabId, info) {
        if (info.status === 'complete' && currentTab === tabId && mode === 'offer_list') {
            /** Get product list by single page **/
            chrome.storage.local.set({
                minPrice: minPrice, maxPrice: maxPrice,
            }, function () {
                /** Script */
                chrome.tabs.executeScript(currentTab, {file: 'js/pageParser.js'});
            });
        }
    });
}

async function nextProduct() {
    if (productList.length === 15 || productList.length === 30 || productList.length === 45 || productList.length === 58) {
        await pauseme(nextProductMS);
    }

    logging('Наступний оффер * * * * * * * *');
    logging('Ждемо... Pause : ' + nextProductMS + ' мс');
    await pauseme(nextProductMS);

    /** Получаем url текущего оофера */
    let productUrl = productList[currentParsingProduct].url;
    logging('Offer url : ');
    logging(productUrl);

    /** Increase current product list page **/
    currentParsingProduct++;
    sendProgress();
    logging('currentParsingProduct' + currentParsingProduct);

    /** Update tab */
    mode = 'offer';
    chrome.tabs.update({url: productUrl});
    chrome.tabs.onUpdated.addListener(function (tabid, changeInfo, tab) {

        if (changeInfo.status === 'complete' && mode === 'offer') {
            /** Запускаем скрипт на странице оффера */
            if (productUsed[currentParsingProduct] === undefined) {
                productUsed[currentParsingProduct] = true;

                /** Script */
                chrome.tabs.executeScript(currentTab, {file: 'js/productParser.js'});
            }
        }
    })
}


function newExcelExport() {

    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Alex';
    workbook.calcProperties.fullCalcOnLoad = true;

    /** Add worksheet */
    const worksheet = workbook.addWorksheet('Export Products Sheet _ Template', {
        headerFooter: {firstHeader: "Hello header", firstFooter: "Hello footer"}
    });

    /** Set up excel collumns */
    worksheet.columns = [{header: 'Код_товара', key: 'id', width: 10}, {
        header: 'Url',
        key: 'product_url',
        width: 10
    }, {header: 'Название_позиции_pl', key: 'name_pl', width: 15}, {
        header: 'Название_позиции',
        key: 'name_ru',
        width: 20
    }, {header: 'Название_позиции_укр', key: 'name_uk', width: 20}, {
        header: 'Поисковые_запросы',
        key: 'unsigned1',
        width: 3
    }, {header: 'Поисковые_запросы_укр', key: 'unsigned2', width: 3}, {
        header: 'Описание_pl',
        key: 'description_pl',
        width: 14
    }, {header: 'Описание', key: 'description', width: 14}, {
        header: 'Описание_укр',
        key: 'description_uk',
        width: 14
    }, {header: 'Тип_товара', key: 'type', width: 12}, {header: 'Цена', key: 'price', width: 10}, {
        header: 'Валюта',
        key: 'currency',
        width: 10
    }, {header: 'Единица_измерения', key: 'unit', width: 3}, {
        header: 'Минимальный_объем_заказа',
        key: 'unsigned4',
        width: 3
    }, {header: 'Оптовая_цена', key: 'unsigned5', width: 3}, {
        header: 'Минимальный_заказ_опт',
        key: 'unsigned6',
        width: 3
    }, {header: 'Ссылка_изображения', key: 'images', width: 4}, {
        header: 'Наличие',
        key: 'availability',
        width: 32
    }, {header: 'Количество', key: 'unsigned36', width: 4}, {
        header: 'Номер_группы',
        key: 'unsigned36',
        width: 4
    }, {header: 'Название_группы', key: 'unsigned36', width: 4}, {
        header: 'Адрес_подраздела',
        key: 'unsigned36',
        width: 4
    }, {header: 'Возможность_поставки', key: 'unsigned36', width: 4}, {
        header: 'Срок_поставки',
        key: 'unsigned36',
        width: 4
    }, {header: 'Способ_упаковки', key: 'unsigned36', width: 4}, {
        header: 'Способ_упаковки_укр',
        key: 'unsigned36',
        width: 4
    }, {header: 'Уникальный_идентификатор', key: 'uid', width: 32}, {
        header: 'Идентификатор_товара',
        key: 'unsigned36',
        width: 32
    }, {header: 'Идентификатор_подраздела', key: 'unsigned37', width: 32}, {
        header: 'Идентификатор_группы',
        key: 'group_id',
        width: 32
    }, {header: 'Производитель', key: 'unsigned7', width: 32}, {
        header: 'Страна_производитель',
        key: 'unsigned8',
        width: 32
    }, {header: 'Скидка', key: 'unsigned9', width: 32}, {
        header: 'ID_группы_разновидностей',
        key: 'unsigned10',
        width: 32
    }, {header: 'Личные_заметки', key: 'unsigned11', width: 32}, {
        header: 'Продукт_на_сайте',
        key: 'unsigned12',
        width: 32
    }, {header: 'Cрок действия скидки от', key: 'unsigned14', width: 32}, {
        header: 'Cрок действия скидки до',
        key: 'unsigned15',
        width: 32
    }, {header: 'Цена от', key: 'unsigned16', width: 32}, {
        header: 'Ярлык',
        key: 'unsigned17',
        width: 32
    }, {header: 'HTML_заголовок', key: 'unsigned18', width: 32}, {
        header: 'HTML_заголовок_укр',
        key: 'unsigned19',
        width: 32
    }, {header: 'HTML_описание', key: 'unsigned20', width: 32}, {
        header: 'HTML_описание_укр',
        key: 'unsigned21',
        width: 32
    }, {header: 'HTML_ключевые_слова', key: 'unsigned22', width: 32}, {
        header: 'HTML_ключевые_слова_укр',
        key: 'unsigned23',
        width: 32
    }, {header: 'Вес,кг', key: 'unsigned24', width: 32}, {
        header: 'Ширина,см',
        key: 'unsigned25',
        width: 32
    }, {header: 'Высота,см', key: 'unsigned26', width: 32}, {
        header: 'Длина,см',
        key: 'unsigned27',
        width: 32
    }, {header: 'Где_находится_товар', key: 'unsigned28', width: 32}, {
        header: 'Код_маркировки_(GTIN)',
        key: 'unsigned29',
        width: 32
    }, {header: 'Номер_устройства_(MPN)', key: 'unsigned30', width: 32}, {
        header: 'Название_Характеристики',
        key: 'unsigned31',
        width: 32
    }, {header: 'Измерение_Характеристики', key: 'unsigned32', width: 32}, {
        header: 'Значение_Характеристики',
        key: 'unsigned33',
        width: 32
    }, {header: 'Название_Характеристики', key: 'unsigned34', width: 32}, {
        header: 'Измерение_Характеристики',
        key: 'unsigned35',
        width: 32
    }, {header: 'Значение_Характеристики', key: 'unsigned36', width: 32}, {
        header: 'Название_Характеристики',
        key: 'unsigned37',
        width: 32
    }, {header: 'Измерение_Характеристики', key: 'unsigned38', width: 32}, {
        header: 'Значение_Характеристики',
        key: 'unsigned39',
        width: 32
    },];


    productsResult.forEach(data => {
        worksheet.addRow(data);
    });

    let lastProductCell = (productsResult.length === 0) ? 2 : productsResult.length + 1;

    /** Название позиции */
    //worksheet.fillFormula('C2:C' + lastProductCell, 'GOOGLETRANSLATE(B2;"pl";"ru")', (row, col) => row);
    //worksheet.fillFormula('D2:D' + lastProductCell, 'GOOGLETRANSLATE(B2;"pl";"uk")', (row, col) => row);

    /** Описание */
    worksheet.fillFormula('I2:I' + lastProductCell, 'GOOGLETRANSLATE(H2;"pl";"ru")', (row, col) => row);
    worksheet.fillFormula('J2:J' + lastProductCell, 'GOOGLETRANSLATE(H2;"pl";"uk")', (row, col) => row);

    /**
     * SECOND PAGE
     */

    const worksheetGroups = workbook.addWorksheet('Export Groups Sheet _ Template', {
        headerFooter: {firstHeader: "Hello header", firstFooter: "Hello footer"}
    });

    /** Set up excel collumns */
    worksheetGroups.columns = [{header: 'Номер_группы', key: 'group_num', width: 10}, {
        header: 'Название_группы_pl',
        key: 'group_name_pl',
        width: 15
    }, {header: 'Название_группы', key: 'group_name_ru', width: 15}, {
        header: 'Название_группы_укр',
        key: 'group_name_uk',
        width: 15
    }, {header: 'Идентификатор_группы', key: 'group_id', width: 20}, {
        header: 'Номер_родителя',
        key: 'parent_num',
        width: 20
    }, {header: 'Идентификатор_родителя', key: 'parent_id', width: 20}, {
        header: 'HTML_заголовок_группы',
        key: 'unsigned40',
        width: 20
    }, {header: 'HTML_заголовок_группы_укр', key: 'unsigned41', width: 20}, {
        header: 'HTML_описание_группы',
        key: 'unsigned42',
        width: 20
    }, {header: 'HTML_описание_группы_укр', key: 'unsigned43', width: 20}, {
        header: 'HTML_ключевые_слова_группы',
        key: 'unsigned44',
        width: 20
    }, {header: 'HTML_ключевые_слова_группы_укр', key: 'unsigned45', width: 20},];

    groupResult.forEach(group => {
        worksheetGroups.addRow(group);
    });

    let lastGroupCell = (groupExist.length === 0) ? 2 : groupExist.length + 1;
    worksheetGroups.fillFormula('C2:C' + lastGroupCell, 'GOOGLETRANSLATE(B2;"pl";"ru")', (row, col) => row);
    worksheetGroups.fillFormula('D2:D' + lastGroupCell, 'GOOGLETRANSLATE(B2;"pl";"uk")', (row, col) => row);

    /** Add bgColor for columns which need to be deleted */
    fillHeaders(worksheet, ['B', 'G', 'J']);
    fillHeaders(worksheetGroups, ['B']);

    /** Add worksheets */
    workbook.addWorksheet('Export Products Sheet');
    workbook.addWorksheet('Export Groups Sheet');

    /** Call the download excel method */
    downloadExcel(workbook);
}

/** Download excel method */
function downloadExcel(workbook) {
    workbook.xlsx.writeBuffer().then(function (data) {
        const blob = new Blob([data], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'download.xls';
        anchor.click();
        window.URL.revokeObjectURL(url);
    });
}

function fillHeaders(worksheet, columns) {
    columns.forEach(col => {
        worksheet.getCell(col + '1').fill = {
            type: 'pattern', pattern: 'lightDown',
        };
    });
}

function addExcelProductData(product) {
    productsResult.push({
        id: product.productId,
        name_pl: product.productName,
        description_pl: product.desc.replaceAll('<img ', '<img style="float:left;width:100%;"').replaceAll('style="padding-top:calc', 'style_old="padding-top:calc') + '</td>',
        price: product.price,
        currency: product.currency,
        unit: 'шт.',
        images: prepareImages(product.mainImages),
        availability: '+',
        uid: product.sku,
        group_id: product.categories[product.categories.length - 1].id,
        product_url: product.product_url
    });

    /** Groups */
    let brc = product.categories;
    for (let i = brc.length; i >= 0; i--) {
        if (brc[i] === undefined) continue;
        let parendId = (brc[i - 1] === undefined) ? '' : brc[i - 1].id;
        if (!groupExist.includes(brc[i].id)) {
            groupExist.push(brc[i].id);
            groupResult.push({
                group_name_pl: brc[i].text, group_id: brc[i].id, parent_id: parendId
            })
        }
    }
}

function prepareImages(images) {
    let result = '';
    images.forEach(img => {
        result += img + ',';
    })
    return result.slice(0, -1);
}


/** Messages **/
async function onMessage(request, sender, callback) {
    if (request.to !== "background_script") return;
    switch (request.action) {

        case "exportToExcel":
            newExcelExport();
            break;

        case "start":
            /** Get current tab url */
            getCurrentUrl();

            /** clear export excel data variables */
            productsResult = [];
            groupResult = [];
            groupExist = [];

            /** clear data variables */
            totalPages = 0;
            productList = [];
            currentParsingPage = 0;
            currentParsingProduct = 0;

            /** Get timer interval parameters */
            nexPageMS = request.nexPageMS;
            nextProductMS = request.nextProductMS;
            reload403MS = request.reload403MS;

            /** L */
            logging('Запуск парсера...');

            /** Get min and max prices set by user */
            minPrice = request.minPrice;
            maxPrice = request.maxPrice;
            pageNum = request.pageNum;

            /** Get prod per file */
            prodPerFile = request.prodPerFile;

            /** L */
            logging('Обрана мінімальна ціна : ' + minPrice);
            logging('Обрана максимальна ціна : ' + maxPrice);
            break;

        case "totalPages":
            totalPages = request.data.totalPages;
            logging('Всього сторінок : ' + totalPages);
            await nextPage();
            break;

        case "productsList":

            currentParsingProduct = 0;

            logging('recieve product list on page');

            /** Делаем проверку, на то что страница загрузилась правильно **/

            if (request.result.products.length === 0 && parseInt(currentParsingPage) <= parseInt(totalPages)) {
                logging('403');
                await pauseme(reload403MS);
                currentParsingPage--;
                await nextPage();
            }

            productList = request.result.products;

            logging('Знайдено товарiв на сторінці: ' + productList.length);

            /** Если прошли все страницы списков товаров */
            logging('Параметр : currentParsingPage : ' + currentParsingPage);
            logging('Параметр : totalPages : ' + totalPages);

            if (parseInt(currentParsingPage) <= parseInt(totalPages)) {
                /** Exit from here and start parsing products **/
                logging('Exit from here and start parsing products');
                await nextProduct();
            } else {
                logging('export to excel');
                exportToExcel();
            }
            break;

        case "productsReady":
            logging('recieve product data');
            let productData = request.result.productdata;

            logging('Параметр : productList.length : ' + productList.length);
            logging('Параметр : currentParsingProduct : ' + currentParsingProduct);

            if (parseInt(currentParsingProduct) < parseInt(productList.length)) {
                // if (currentParsingProduct < 7) {
                addExcelProductData(productData);
                logging('call nextProduct');
                await nextProduct();
            } else {
                addExcelProductData(productData);
                logging('call nextPage');
                await nextPage();
            }
            break;
        case "error":
            sendToPopup('error', null, request.data.message);
            break;
    }
}

/** Final method. Return parsed products to popup.js for export to excel **/
function exportToExcel() {
    sendToPopup('exportToExcel');
}

function sendProductData(productData) {
    sendToPopup('productData', productData);
}

function logging(message) {
    sendToPopup('logging', null, message);
}

function sendToPopup(action, data = null, message = null) {
    chrome.runtime.sendMessage({
        action: action, data: data, message: message
    }, null);
}

function sendProgress() {
    sendToPopup('progress', {page: currentParsingPage, product: currentParsingProduct});
}

/** Ждём некоторое время, делаем так называемую паузу **/
async function pauseme(time) {
    await sleepNow(time);
}

const sleepNow = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

/** Register actions **/
chrome.runtime.onMessage.addListener(onMessage);

/** Browser actions **/
/** On tab activated in browser **/
chrome.tabs.onActivated.addListener(function (activeInfo) {
    currentTab = activeInfo.tabId;
});

// On tab updated in browser
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    currentTab = tab.id;
});