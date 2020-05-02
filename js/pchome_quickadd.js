// expand list
document.querySelectorAll("span.collapsible").forEach(function(e){if (e.accessKey=="K") e.click()});
// display object if it was hidden
document.querySelectorAll("dl.record_form")[0].style.display = "inherit"; document.querySelectorAll("dd.s_trace")[0].style.display = "inherit";
// poll for list detail appearance
function poll() { 
	var x = document.querySelectorAll("td.cart"); 
	var cnt=0; 
	if (x.length==0) { 
	console.log("poll for td.cart");
		setTimeout(poll,300); 
	}
	else { 
		// check each list item
		x.forEach(function(X) { 
			// click if has child (no child if item unavailable)
			if(X.firstElementChild!=null) {  
				X.firstElementChild.click(); 
			} else cnt++;
		} ); 
		// if all items unavailable, reload page
		if (cnt==x.length) {
			console.log("no item available, reload page!"); 
			chrome.runtime.sendMessage({data:"reload"});
			location.reload();
		} else { // otherwise click checkout
			document.querySelector("li.ATM").firstElementChild.click();	
			poll_2();
		}
	} 
}
poll();

// poll for confirm button appearance
function poll_2(){
	console.log("poll for confirm button");
	var x = document.getElementById("warning_btn_confirm"); 
	if (x!=null) {
		chrome.runtime.sendMessage({data:"checkout"});
		x.click(); 
	} else setTimeout(poll_2,300);
}