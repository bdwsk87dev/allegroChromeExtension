var contentscripFindtCategories = {
	items : [],
	init : function(){
		let items = document.querySelectorAll('li.mpof_ki.mh36_8.mj7a_8.m7er_k4.mjyo_6x._111b6_ToJsk a');
		items.forEach((item) => {
			contentscripFindtCategories.items.push({'url': item.getAttribute('href'), 'title' : item.innerText});
			item.remove();
		});
		chrome.runtime.sendMessage({action: 'subcategories', items : contentscripFindtCategories.items}, null);
	},
	getSubCategories : function(){
		let items = document.querySelectorAll('li.mpof_ki.mh36_8.mj7a_8.m7er_k4.mjyo_6x._111b6_ToJsk a');
		items.forEach((item) => {
			contentscripFindtCategories.items.push({'url': item.getAttribute('href'), 'title' : item.innerText});
			item.remove();
		});
		chrome.runtime.sendMessage({action: 'subcategories', items : contentscripFindtCategories.items}, null);
	}
}
$(function () {
	contentscripFindtCategories.init();
});

chrome.runtime.onMessage.addListener(msg => {
	// First, validate the message's structure.
	if ((msg.action === 'getSubcategories')) {
		contentscripFindtCategories.getSubCategories();
	}
	contentscripFindtCategories.getSubCategories();
});