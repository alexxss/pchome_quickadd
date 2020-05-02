var toggle = false;
var listenTabId;
var path_to_script = "js/pchome_quickadd.js";

/*********listens to message sent from content script************/
chrome.runtime.onMessage.addListener(function(message,sender){
	console.log("received msg "+message.data+" from "+sender.tab.title);
	if (message.data == "reload"){ 
		/*  page reloaded  */
		if (toggle){
			poll_until_tab_complete(sender.tab.id);
		}			
	} else if (message.data == "checkout") {
		/*  add to cart success, now proceeding to checkout  */
		toggle=false;
		// sets the tab as current selected tab
		chrome.tabs.highlight({"tabs":sender.tab.index});
	}
});

/*********keeps checking until the tab has done loading************/
function poll_until_tab_complete(tabId){
	chrome.tabs.get(tabId, function(tab){
		if (tab.status=="complete") {
			// page is done! inject content script
			console.log(tab.title+"completed, injecting script");
			chrome.tabs.executeScript(tabId,{file:path_to_script});
		} else {
			// not done yet, check again later
			console.log(tab.title+" status: "+tab.status);
			setTimeout(()=>poll_until_tab_complete(tab.id),1000);
		}
	});
};

/*********start/stop when user clicks on pageaction************/
chrome.pageAction.onClicked.addListener( function(tab){
	console.log(tab.title + " toggled, now "+!toggle);
	toggle=!toggle;
	
	if (toggle) {
		console.log("start quick add");
		poll_until_tab_complete(tab.id);
	}
});

/*********initialize, use declarativeContent and rules to show pageAction on pchome tabs************/
chrome.runtime.onInstalled.addListener(function(){
	console.log("Extension startup");
	toggle=false;
	/*    show page action    */
	chrome.declarativeContent.onPageChanged.removeRules(undefined, function(){
		chrome.declarativeContent.onPageChanged.addRules([{
			conditions: [new chrome.declarativeContent.PageStateMatcher({
				pageUrl: { hostEquals: 'ecssl.pchome.com.tw', schemes: ['https'], pathSuffix: 'BIGCAR/ItemList'}
			})],
			actions: [new chrome.declarativeContent.ShowPageAction()]
		}])
	});
});