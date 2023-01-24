var productParser = {
    init:function (){
        let productName = document.getElementsByTagName('h4')[0].innerHTML;
        let description = document.querySelector('div[data-box-name="Description card"]');
    }
}

$(function () {
    productParser.init();
});
