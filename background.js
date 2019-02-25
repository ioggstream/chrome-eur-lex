var active_tabs = new Array();

function engage(tab_id){
    active_tabs.push(tab_id);
    chrome.tabs.executeScript(tab_id, {file: "fragments.js"});
    chrome.browserAction.setIcon({tabId: tab_id, path: "icon_active.png"});
}

function disengage(idx){
    var id = active_tabs[idx];
    active_tabs.splice(idx, 1)
    chrome.tabs.sendMessage(id, "bail");
    chrome.browserAction.setIcon({tabId: id, path: "icon_inactive.png"});
}

chrome.browserAction.onClicked.addListener(function(tab) {
    if(!tab.url.startsWith("http"))return;
    var idx = active_tabs.indexOf(tab.id);
    if(idx > -1) disengage(idx);
    else engage(tab.id);
});
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    var idx = active_tabs.indexOf(sender.tab.id);
    if(idx > -1) disengage(idx);
});




// Create 
function createSearchUrl(text) {

  let url =
    'https://eur-lex.europa.eu/search.html?scope=EURLEX&type=quick&text='
    + text;
  return url;
}


// Allow searching from chrome bar.
chrome.omnibox.onInputEntered.addListener(function(text) {
  chrome.tabs.create({url: createSearchUrl(text)});
});
