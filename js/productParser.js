var productParser = {
    init: function () {
        /** Get product Id */
        let getIds = productParser.getProductId();
        let productId = getIds.itemId;
        let categoryId = getIds.navCategoryId;

        /** Get product category */
        let category = document.querySelector('div[data-box-name="Breadcrumb Container"] ol').innerText;

        /** Get product name */
        /** let productName = document.getElementsByTagName('h4')[0].innerHTML; **/
        let productName = document.querySelector('meta[itemProp="name"]').getAttribute('content');

        /** Get description */
        let description = document.querySelector('div[data-box-name="Description card"]').innerHTML;

        /** Get offer price */
        let price = document.querySelector('meta[itemProp="price"]').getAttribute('content');

        /** Get offer currency */
        let currency = document.querySelector('meta[itemProp="priceCurrency"]').getAttribute('content');

        /** Get sku */
        let sku = document.querySelector('meta[itemProp="sku"]').getAttribute('content');

        /** Product type */
        let productType = productParser.getProductType().productType;

        /** Get all main images */
        let mainImages = productParser.getOfferImages();
        mainImages = mainImages.slice(0, 9);

        productParser.sendData({
            'productId': productId,
            'productName': productName,
            'desc': description,
            'productType': productType,
            'price': price,
            'currency': currency,
            'sku': sku,
            'mainImages': mainImages
        });
    },

    /** Return data to background script **/
    sendData: function (data) {
        chrome.runtime.sendMessage({
            action: 'productsReady',
            result: {
                productdata: data
            }
        }, null);
    },

    /** Get product id */
    getProductId: function () {
        /** Find script tag*/
        let script = document.querySelector("#cta-buttons-box script").innerHTML;

        /** Cut string*/
        let from = script.search('{\"itemId');
        let to = script.search(']}\'');
        let result = script.substring(from, to);

        /** Return result*/
        return (JSON.parse(result));
    },

    /** Get product type */
    getProductType: function () {
        let result = {};
        let table = document.querySelectorAll('div[data-role="app-container"] table tr td');
        table.forEach(function (el) {
            if (el.innerText === 'Rodzaj') {
                result.productType = el.nextSibling.innerText;
            }
        });
        return result;
    },

    /** Get product images in gallery */
    getOfferImages: function () {
        let script = document.querySelector("body").innerHTML;
        let from = script.search('"images":\\[{"original":"');
        let to = script.search(',"verticalThumbnails":false}</script>');
        let result = '{' + script.substring(from, to) + '}';
        let images = JSON.parse(result).images;
        let returnData = [];
        images.forEach(image => {
            returnData.push(image.original);
        })
        return returnData;
    }
}

$(function () {
    productParser.init();
});
