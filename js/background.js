var toggle = false;
var listenTabId;
//var pchome_cart_url = "https://ecssl.pchome.com.tw/*";
var path_to_script = "js/pchome_quickadd.js";

chrome.runtime.onMessage.addListener(function(message,sender){
	console.log("received msg "+message.data+" from "+sender.tab.title);
	if (message.data == "reload"){
		if (toggle){
			//chrome.tabs.reload(sender.tab.id);
			poll_until_tab_complete(sender.tab.id);
		}			
	} else if (message.data == "checkout") {
		toggle=false;
		chrome.tabs.highlight({"tabs":sender.tab.index});
	}
});

function poll_until_tab_complete(tabId){
	chrome.tabs.get(tabId, function(tab){
		if (tab.status=="complete") {
			//console.log(tab.title+" completed, calling pchome_quickadd");
			//pchome_quickadd(tab.id);
			console.log(tab.title+"completed, injecting script");
			chrome.tabs.executeScript(tabId,{file:path_to_script});
		} else {
			console.log(tab.title+" status: "+tab.status);
			setTimeout(()=>poll_until_tab_complete(tab.id),1000);
		}
	});
};

/*
function pchome_quickadd(tabId){
	chrome.tabs.executeScript(tabId,{file:"pchome_quickadd.js"});
	if (toggle) {
		console.log("Calling next poll_until_tab_complete");
		poll_until_tab_complete(tabId);
	}
};*/

chrome.pageAction.onClicked.addListener( function(tab){
	//console.log("page action clicked");
	console.log(tab.title + " toggled, now "+!toggle);
	toggle=!toggle;
	
	if (toggle) {
		console.log("start quick add");
		poll_until_tab_complete(tab.id);
	}
});

/*          start up initialization            */
/*function showPageAction(tabs){
	tabs.forEach(function(tab){
		console.log("Show pageAction on "+tab.title);
		chrome.pageAction.show(tab.id, callback);
	});
}*/

chrome.runtime.onInstalled.addListener(function(){
	console.log("Extension startup");
	toggle=false;
	/*    show page action, use declarativeContent instead    */
	/*chrome.tabs.query({url:pchome_cart_url},(tabs)=>{
		console.log("showing page action on "+tabs.length+" tabs");
		tabs.forEach(function(tab){
			console.log("Show pageAction on "+tab.title);
			chrome.pageAction.show(tab.id);
		});		
	}); */
	chrome.declarativeContent.onPageChanged.removeRules(undefined, function(){
		chrome.declarativeContent.onPageChanged.addRules([{
			conditions: [new chrome.declarativeContent.PageStateMatcher({
				pageUrl: { hostEquals: 'ecssl.pchome.com.tw', schemes: ['https'], pathSuffix: 'BIGCAR/ItemList'}
			})],
			actions: [new chrome.declarativeContent.ShowPageAction()]
		}])
	});
});