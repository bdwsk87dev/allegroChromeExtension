var productParser = {
    init: function () {

        /** Get product Id */
        let getIds = productParser.getProductCode();
        let productId = getIds.itemId;
        let categoryId = getIds.navCategoryId;

        /** Get product category */
        let category = document.querySelector('div[data-box-name="Breadcrumb Container"] ol').innerText;

        /** Get product name */
        let productName = document.getElementsByTagName('h4')[0].innerHTML;

        /** Ged description */
        let description = document.querySelector('div[data-box-name="Description card"]').innerText;

        /** Get offer price */
        let price = document.querySelector('div._7030e_qVLm- div span').innerText + document.querySelector('div._7030e_qVLm- div span:nth-child(2)').innerText;

        /** Get all images */
        let imagesResult = [];
        let allImages = document.querySelectorAll('div[data-box-name="Description card"] img');
        allImages.forEach(image => {
            imagesResult.push(image.src);
        })

        productParser.sendData({
            'productId' : productId,
            'productName': productName,
            'category': category,
            'desc': description,
            'price': price,
            'allImages': imagesResult
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

    getProductCode: function (){
        let script = document.querySelector("#cta-buttons-box script").innerHTML;
        let from = script.search('{\"itemId');
        let to = script.search(']}\'');
        let result = script.substring(from, to);
        return(JSON.parse(result));
    }
}

$(function () {
    productParser.smoothScroll(document.querySelector('div:last-child')).then(() => {
        productParser.init();
    });
});

/* for testing
let imagesResult = [];
let allImages = document.querySelectorAll('div[data-box-name="Description card"] img');
        allImages.forEach(image => {
            imagesResult.push(image.src);
        })
console.log(imagesResult);
 */

