var popupDownloader = {
    init : function(){
        $("#start").click(function () {
            let minPrice = $('#min_price').val();
			chrome.extension.sendRequest({action: "start", minPrice: minPrice}, function () {});
			//window.close();
		})
    },
    onMessage: function (request, sender, callback){
        if (request.action == "logging"){
            $('#logger').html($('#logger').html() + request.message);
        }
    }
}
$(function () {
	popupDownloader.init();
    chrome.runtime.onMessage.addListener(popupDownloader.onMessage);
});

