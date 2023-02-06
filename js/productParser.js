var productParser = {
    init: function () {

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
    }
}

$(function () {
    productParser.init();
});

/* for testing
let imagesResult = [];
let allImages = document.querySelectorAll('div[data-box-name="Description card"] img');
        allImages.forEach(image => {
            imagesResult.push(image.src);
        })
console.log(imagesResult);
 */