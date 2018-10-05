/**
 * Apparatus highlighting
 * ======================
 *
 * This script installs a highlighting helper for the inline apparatus and
 * similar encodings.
 *
 * 1. when any element $e is hovered, the closest / innermost .appnote element $a containing $e is identified.
 *    $a receives the additional 'current' class.
 * 2. When $a has an attribute data-also-highlight, that attribute is interpreted as a whitespace-separated list of
 *    ids. All elements identified by one of those ids also receives the 'current' class.
 *
 * When something else is hovered, this is undone.
 */
define([], function() {
  "use strict";

  var initFunction = function() {
  
    var currentHighlight = [];
    
    // return the closest element to domElement that has the class className.
    function closest(domElement, classRE) {
    	if (domElement == null) return null;
    	if (!(domElement instanceof Element)) return closest(domElement.parentNode, classRE);
    	if (domElement.hasAttribute('class') && classRE.test(domElement.getAttribute('class'))) return domElement;
    	return closest(domElement.parentNode, classRE);
    }
    
    function removeCurrentClass(elem) {
    	var oldClasses = elem.getAttribute('class'),
    	    newClasses = oldClasses.replace(/\s*\bcurrent\b/, '');
    	elem.setAttribute('class', newClasses);
    	return elem;    	
    }
    
    function addCurrentClass(elem) {
    	var newElemClasses = elem.getAttribute('class');
    	if (!(/\s*\bcurrent\b/.test(newElemClasses))) {
    		elem.setAttribute('class', newElemClasses + ' current');
    	}
    	return elem;
    }
    
    function onMouseOver(event) {
    	var hovered = closest(event.target, /\bappnote\b/);
    	var newHighlight = hovered? [ hovered ] : [];
    	if (hovered) {
			if (currentHighlight.length && currentHighlight[0] === hovered) return; // no change
			// add elements from the data-also-highlight attribute to the highlight list
			var other = hovered.getAttribute("data-also-highlight");
			if (other) {
				var container = closest(hovered, /\bprint\b/);
				if (!container)
					container = this;
				var others = other.split(/\s+/).forEach(function(id) {
					var otherEls = container.querySelectorAll('#'+id.replace(/\./g, '\\.'));
					for (var i = 0; i < otherEls.length; i++) {
					  newHighlight.push(otherEls[i]);
					}
				});				
			}			
			currentHighlight.forEach(removeCurrentClass);
			newHighlight.forEach(addCurrentClass);
			currentHighlight = newHighlight;
    	} else {
    		currentHighlight.forEach(removeCurrentClass);
    		currentHighlight = [];
    	}
     }
     
     window.document.getElementsByTagName('body')[0].addEventListener("mouseover", onMouseOver);   
  }
    
  // the event listeners can only be added when the content is loaded. so postpone until dom is loaded
  window.addEventListener("DOMContentLoaded", initFunction);
  initFunction();
});
