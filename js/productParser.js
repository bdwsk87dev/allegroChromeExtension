var productParser = {
    init: function () {
        /** Get product Id */
        let getIds = productParser.getProductId();
        let productId = (getIds) ? getIds.itemId : 'noId';

        /** Get product categories */
        let categories = productParser.categories();

        /** Get product name */
        /** let productName = document.getElementsByTagName('h4')[0].innerHTML; **/
        let productName = document.querySelector('meta[itemProp="name"]').getAttribute('content');

        /** Get description */
        let description = productParser.getDescription();

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
            'mainImages': mainImages,
            'categories': categories,
            'product_url': location.href
        });
    },

    /** Return data to background script **/
    sendData: function (data) {
        chrome.runtime.sendMessage({
            to: 'background_script',
            action: 'productsReady',
            result: {
                productdata: data
            }
        }, null);
    },

    /** Get product id */
    getProductId: function () {
        /** Find script tag*/
        if (document.querySelector("#cta-buttons-box script") !== null) {
            let script = document.querySelector("#cta-buttons-box script").innerHTML;

            /** Cut string*/
            let from = script.search('{\"itemId');
            let to = script.search(']}\'');
            let result = script.substring(from, to);

            /** Return result*/
            return (JSON.parse(result));
        } else {
            return false;
        }
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
    },

    /** Work with categories */
    categories: function () {
        let crumbs = []
        document.querySelectorAll('div[data-box-name="Breadcrumb Container"] ol li a').forEach(el => {
            crumbs.push({'text': el.innerText, 'id': el.dataset.analyticsClickCustomId})
        });
        crumbs = crumbs.slice(1, crumbs.length - 1);
        return crumbs;
    },

    /** Get offer description */
    getDescription: function () {
        let elements = document.querySelectorAll('div[data-box-name="Description card"] div, div[data-box-name="Description card"] img');
        elements.forEach(el => {
            if (el.textContent.trim() === "") {
                el.remove();
            }
            el.removeAttribute('style');
            el.removeAttribute('class');
            el.removeAttribute('data-src');
            el.removeAttribute('data-box-name');
            el.removeAttribute('data-box-id');
            el.removeAttribute('data-prototype-id');
            el.removeAttribute('data-prototype-version');
            el.removeAttribute('data-civ');
            el.removeAttribute('data-analytics-enabled');
            el.removeAttribute('data-analytics-category');
            el.removeAttribute('analytics-groups');
            el.removeAttribute('data-srcset');
            el.removeAttribute('sizes');
            el.removeAttribute('width');
            el.removeAttribute('alt');
            el.removeAttribute('name');
            el.removeAttribute('data-analytics-groups');
        });
        let result = document.querySelector('div[data-box-name="Description card"]').innerHTML.replace(/<(?!p)(?!\/p)(?!b)(?!div)(?!\/div)(?!br)(?!ul)(?!\/ul)(?!li)(?!\/li)\/?[a-z][^>]*(>|$)/gi, "");
        return result;
    }
}

$(function () {
    productParser.init();
});
