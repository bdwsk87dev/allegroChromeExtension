var popupDownloader = {
    init : function(){
        $("#start").click(function () {
            let minPrice = $('#min_price').val();
			chrome.extension.sendRequest({action: "start", minPrice: minPrice}, function () {});
			//window.close();
		})

        /** Testing button !! **/
        $("#export").click(()=>{
            popupDownloader.exportExcel();
        });
    },
    onMessage: function (request, sender, callback){
        if (request.action === "logging"){
            $('#logger').html($('#logger').html() + "<br>" + request.message);
        }
        if (request.action === "excelData"){
            popupDownloader.exportExcel(request.message);
        } 
    },

    exportExcel: function (products){

        products.forEach(product=>{
            $('#basic_table tbody').append('<tr><td>'+product.url+'</td></tr>')
        });

        let excel = new ExcelGen({
            "src_id": "basic_table",
            "show_header": true,
            "type": "table"
        });
        excel.generate();
    }
}

$(function () {
	popupDownloader.init();
    chrome.runtime.onMessage.addListener(popupDownloader.onMessage);
});
