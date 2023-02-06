// const translate = require('google-translate-api');

// import { setCORS } from "google-translate-api-browser";

var productParser = {
    init: function () {

        /** Get product category */
        let category = document.querySelector('div[data-box-name="Breadcrumb Container"] ol').innerText;

        /** Get product name */
        let productName = document.getElementsByTagName('h4')[0].innerHTML;

        /** Ged description */
            // let description = document.querySelector('div[data-box-name="Description card"]');
        let description = document.querySelector('div[data-box-name="Description card"]').innerText;

        /** Get offer price */
            // let price = document.querySelector('div[data-role="app-container"] font').innerHTML;
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


        // translate(productName, {to: 'ua'}).then(res => {
        //     console.log(res.text);
        //     //=> I speak English
        //     console.log(res.from.language.iso);
        //     //=> nl
        //
        //     translate(description, {to: 'ua'}).then(res => {
        //         console.log(res.text);
        //         //=> I speak English
        //         console.log(res.from.language.iso);
        //         //=> nl
        //
        //         productParser.sendData({
        //             'productName':productName,
        //             'category':category,
        //             'description':description,
        //             'price':price,
        //             'allImages':allImages
        //         });
        //
        //     }).catch(err => {
        //         console.error(err);
        //     });
        //
        // }).catch(err => {
        //     console.error(err);
        // });


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

/*
let imagesResult = [];
let allImages = document.querySelectorAll('div[data-box-name="Description card"] img');
        allImages.forEach(image => {
            imagesResult.push(image.src);
        })
console.log(imagesResult);
 */