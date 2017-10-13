// add scrolling by mouse to an element with overflow: auto
// when the left mouse button is down scrolling can be done
// by simply moving the mouse.
// Apply by calling addMouseMoveScroll(Element)
// FIXME is this actually used anywhere? 
define([], function() {
  "use strict";

  var lastClientPos = {x: undefined, y: undefined};

  // determining if the mouse button is down
  var isLeftMouseButtonDown = function(event) {
    var result = false;
    var buttonsDown = event.buttons || event.which;
    if(buttonsDown === 1) {
      result = true;
    }
    return result;
  };

  // scroll the content of the given Element
  var scrollByMouseMove = function(scrollElement, deltaX, deltaY) {
    scrollElement.scrollLeft = scrollElement.scrollLeft + deltaX;
    scrollElement.scrollTop = scrollElement.scrollTop + deltaY;
  };

  // function that actually binds the event handlers / scrolling
  // functionality to a given element
  return function(scrollElement) {
    // variable to track if mouse button is down
    var leftMouseButtonDown = false;

    // handle mouse down
    var mouseDownHandler = function(event) {
      // store current mouse position when left mouse button is pressed
      lastClientPos.x = event.clientX;
      lastClientPos.y = event.clientY;
      leftMouseButtonDown = isLeftMouseButtonDown(event);
    };

    // handle mouse up
    var mouseUpHandler = function(event) {
      // store undefined in lastPosition variables when left button is released
      lastClientPos.x = lastClientPos.y = undefined;
      leftMouseButtonDown = false;
    };

    // handle mouse movement
    var mouseMoveHandler = function(event) {
      var deltaX;
      var deltaY;

      // calculate mouse movement
      deltaX = lastClientPos.x - event.clientX;
      deltaY = lastClientPos.y - event.clientY;

      // store new mouse position
      lastClientPos.x = event.clientX;
      lastClientPos.y = event.clientY;

      if(leftMouseButtonDown === true) {
        scrollByMouseMove(scrollElement, deltaX, deltaY);
      }
    };

    // actually add event handlers for mousemove and mousedown events to element
    scrollElement.addEventListener("mousemove", mouseMoveHandler);
    scrollElement.addEventListener("mousedown", mouseDownHandler);
    // the mouse can be released when not above given element anymore, thus bind to window
    window.addEventListener("mouseup", mouseUpHandler);
  };
});
