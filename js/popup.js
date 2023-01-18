var popupDownloader = {
    init : function(){
        $("#start").click(function () {
			chrome.extension.sendRequest({action: "start"}, function () {});
			//window.close();
		})
    }
}
$(function () {
	popupDownloader.init();
});

