var popupDownloader = {
    init : function(){
        $("#start").click(function () {
            let minPrice = $('#min_price').val();
			chrome.extension.sendRequest({action: "start", minPrice: minPrice}, function () {});
			//window.close();
		})
        $("#generateCSV").click(()=>{
            popupDownloader.generateCSV();
        });
    },
    onMessage: function (request, sender, callback){
        if (request.action === "logging"){
            $('#logger').html($('#logger').html() + "<br>" + request.message);
        }
    },

    generateCSV: function (){
        $('#logger').html('!!!');
        fetch('https://allegro.pl/oferta/5-zl-2022-r-klasztor-na-swietym-krzyzu-12845605677').then(data=>{
            data.text().then(data => console.log(data));
        })
    }
}
$(function () {
	popupDownloader.init();
    chrome.runtime.onMessage.addListener(popupDownloader.onMessage);
});
