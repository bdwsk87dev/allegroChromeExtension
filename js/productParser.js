var productParser = {
    init: function () {
        /** Get product Id */
        let getIds = productParser.getProductId();
        let productId = getIds.itemId;
        let categoryId = getIds.navCategoryId;

        /** Get product categories */
        let categories = productParser.categories();

        /** Get product name */
        /** let productName = document.getElementsByTagName('h4')[0].innerHTML; **/
        let productName = document.querySelector('meta[itemProp="name"]').getAttribute('content');

        /** Get description */
        let description = document.querySelector('div[data-box-name="Description card"]').innerHTML;
        description = description.replace(/<!--[\s\S]*?--!?>/g, "").replace(/<(?!img)(?!b)(?!ul)(?!\/ul)(?!br)(?!ol)(?!\/ol)(?!li)(?!\/li)\/?[a-z][^>]*(>|$)/gi, "");

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
            'categories': categories
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
    },

    /** Work with categories */
    categories: function () {
        let crumbs = []
        document.querySelectorAll('div[data-box-name="Breadcrumb Container"] ol li a').forEach(el => {
            crumbs.push({'text':el.innerText, 'id' : el.dataset.analyticsClickCustomId})
        });
        crumbs = crumbs.slice(1, crumbs.length-1);
        /* Result crumbs
            0: {text: 'Elektronika', id: '42540aec-367a-4e5e-b411-17c09b08e41f'}
            1: {text: 'Telefony i Akcesoria', id: '4'}
            2: {text: 'Radiokomunikacja', id: '446'}
            3: {text: 'Krótkofalówki i Walkie-talkie', id: '28282'}
            4: {text: 'Urządzenia', id: '55834'}
         */
        return crumbs;
    },


    smoothScroll: function (elem, offset = 0) {
        let height = document.body.scrollHeight;
        window.scrollTo(0, height);
        const rect = elem.getBoundingClientRect();
        let targetPosition = Math.floor(rect.top + self.pageYOffset + offset);
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
        return new Promise((resolve, reject) => {
            const failed = setTimeout(() => {
                reject();
            }, 2000);
            const scrollHandler = () => {
                if (self.pageYOffset === targetPosition) {
                    window.removeEventListener("scroll", scrollHandler);
                    clearTimeout(failed);
                    resolve();
                }
            };
            if (self.pageYOffset === targetPosition) {
                clearTimeout(failed);
                resolve();
            } else {
                window.addEventListener("scroll", scrollHandler);
                elem.getBoundingClientRect();
            }
        });
    },
}

$(function () {
    productParser.smoothScroll(document.querySelector('div:last-child')).then(() => {
        productParser.init();
    });
});
