var popupDownloader = {
    init : function(){
        $("#start").click(function () {
            let minPrice = $('#min_price').val();
			chrome.extension.sendRequest({action: "start", minPrice: minPrice}, function () {});
			//window.close();
		})
    }
}
$(function () {
	popupDownloader.init();
});

