// we would like to highlight the innermost appnote element ...
(function(){
  "use strict";

  var initFunction = function() {
  
    var currentHighlight = null;
    
    // return the closest element to domElement that has the class className.
    function closest(domElement, classRE) {
    	if (domElement == null) return null;
    	if (!(domElement instanceof Element)) return closest(domElement.parentNode, classRE);
    	if (domElement.hasAttribute('class') && classRE.test(domElement.getAttribute('class'))) return domElement;
    	return closest(domElement.parentNode, classRE);
    }        
    
    function onMouseOver(event) {
    	var newHighlight = closest(event.target, /\bappnote\b/);    	
    	if (newHighlight === currentHighlight) return;
    	if (currentHighlight) {
    		var oldClasses = currentHighlight.getAttribute('class'),
    		    newClasses = oldClasses.replace(/\s*\bcurrent\b/, '');
    		currentHighlight.setAttribute('class', newClasses);
    		currentHighlight = null;
    	};
    	if (newHighlight) {    
    		var newElemClasses = newHighlight.getAttribute('class');
    		if (!(/\s*\bcurrent\b/.test(newElemClasses))) {
    			newHighlight.setAttribute('class', newElemClasses + ' current');
    		}
    		currentHighlight = newHighlight;    		
    	}
     }
     
     window.document.getElementsByTagName('body')[0].addEventListener("mouseover", onMouseOver);   
  }
    
  // the event listeners can only be added when the content is loaded. so postpone until dom is loaded
  window.addEventListener("DOMContentLoaded", initFunction);
})();
