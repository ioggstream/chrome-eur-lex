(function (){
    console.log("Run this script until click.");
    var originalStyle;
    var lastElement=null;
    var identifier;

    function empty(e) {
        switch (e) {
            case "":
            case 0:
            case "0":
            case null:
            case false:
            case typeof this == "undefined":
            return true;
            default:
            return false;
        }
    }
    function addFragmentToCeLex(location, fragment){
        var urlParams = new URLSearchParams(location.search);
        
        // Manage CELEX uris.
        if (urlParams.get('uri').startsWith("CELEX")) {
            urlParams.set('uri', appendFragment(urlParams.get('uri'), fragment));
            // Remove unsupported elements from urlParams.
            urlParams.delete("qid");
            urlParams.delete("from");
            
            return location.origin + location.pathname + '?' + decodeURIComponent(urlParams.toString());
        } 
        
        return appendFragment(location.toString(), fragment);
    }
    function appendFragment(url, fragment){
            var idx = url.indexOf("#");
            if(idx > 0){
                url = url.slice(0, idx);
            }
            url += "#" + fragment;
            return url;
    }
    function restoreLastElement(){
        if(lastElement){
            lastElement.style.borderColor = originalStyle.borderColor;
            lastElement.style.textDecoration = originalStyle.textDecoration;
            lastElement.style.border = originalStyle.border;
        }
    }
    function cleanup(){
        restoreLastElement();
        stop();
    }
    function goToURL(e){
        console.log('srcElement: ', e);
        console.log('identifier:' + identifier);        
        if (! empty(identifier)){
            url = addFragmentToCeLex(document.location, identifier);
            console.log("Referenced URL:" + url);
            // Move to the new location
            document.location.href = url;
        }
    }
    function highlightElement(target){
        restoreLastElement();
        lastElement = target;
        originalStyle = { 
            'borderColor':  target.style.borderColor,
            'textDecoration': target.style.textDecoration,
            'border': target.style.border
        };
        
        // highlight element with ID.
        target.style.borderColor = "blue";
        target.style.border= "solid 1px";
        target.style.textDecoration = "underline";
        
        target.style.cursor = "pointer";
    }
    function findElementId(o){
        if(o.id != "" && document.getElementById(o.id) == o)
            return o.id;
        if(o.tagName == "A" && o.name != "" && document.getElementById(o.name) == null){
            for(var i = 0; i < document.anchors.length; i++){
                if(document.anchors[i].name == o.name)
                    return o.name;
            }
        }
        return null;
    }
    function handler(e){
        var o = e.target;

        // element didn't change.
        if(lastElement == o)
            return; 

        // element changed, find identifier
        // traversing thru parentElement.
        identifier = findElementId(o);
        while(identifier == null){
            // stop when you find the body.
            if(o == document.body || o.parentElement == document.body)
                return;
            o = o.parentElement;
            identifier = findElementId(o);
        }
        highlightElement(o);
    }
    function escapeHandler(e){
        if(e.keyCode == 27){
            chrome.runtime.sendMessage("bail");
            cleanup();
            e.stopPropagation();
        }
    }
    function start(){
        if(!document.body){
            chrome.runtime.sendMessage("bail");
            return;
        }
        document.body.addEventListener("mousemove", handler);
        window.addEventListener("keydown", escapeHandler);
        window.addEventListener("click", goToURL, true);
    }
    function stop(){
        document.body.removeEventListener("mousemove", handler);
        window.removeEventListener("keydown", escapeHandler);
        window.removeEventListener("click", goToURL, true);
    }
    start();
    chrome.runtime.onMessage.addListener(cleanup);
}
)();
