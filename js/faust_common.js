var Faust = (function(){
  "use strict";
  // creating return object
  var Faust = {};



//###########################################################################
// Faust.sort
//###########################################################################

  // define sorting functions
  Faust.sort = (function(){

    //------------------------------------------------
    // define object containing all sorting algorithms
    //------------------------------------------------
    var sortAlgorithms = (function(){
      var sortAlgorithms = {};

      // case sensitive ascending
      var asc = function(val1, val2) {
        // Then sort values First sort empty strings to bottom
        if(val1 > val2) {
          return 1;
        } else if(val1 < val2) {
          return -1;
        } else {
          return 0;
        }
      };

      // Function to push empty values to end
      var emptyValuesToEnd = function(val1, val2) {
        if(!val1) {
          return 1;
        } else if (!val2) {
          return -1;
        } else {
          return 0;
        }
      };

      // case sensitive descending
      var desc = function(val1, val2) {
        return asc(val2, val1);
      };

      // ascended sorting with empty values on end
      var ascEnd = function(val1, val2) {
        if(emptyValuesToEnd(val1, val2) !== 0) {
          return emptyValuesToEnd(val1, val2);
        } else {
          return asc(val1, val2);
        }
      };

      // descended sorting with empty values on end
      var descEnd = function(val1, val2) {
        if(emptyValuesToEnd(val1, val2) !== 0) {
          return emptyValuesToEnd(val1, val2);
        } else {
          return desc(val1, val2);
        }
      };

      // ascended case insensitive sorting with empty values on end
      var ascCiEnd = function(val1, val2) {
        val1 = val1.toLowerCase();
        val2 = val2.toLowerCase();
        return ascEnd(val1, val2);
      };

      // descended case insensitive sorting with empty values on end
      var descCiEnd = function(val1, val2) {
        val1 = val1.toLowerCase();
        val2 = val2.toLowerCase();
        return descEnd(val1, val2);
      };

      // Sort according to the faustedition sigil.
      // A sigil like 2 III H.159:1 currently consists of three parts, basically:
      // 1 - the part before the index number, here "2 III H.", sorted alphabetically
      // 2 - the index number, here "159", sorted numerically
      // 3 - the part after the index number, here ":1", sorted alphabetically.
      var SIGIL = /^([12]?\s*[IV]{0,3}\s*[^0-9]+)(\d*)(.*)$/;
      var splitSigil = function splitSigil(sigil) {
          var split = SIGIL.exec(sigil);
          if (split === null) {
            console.warn("Failed to split sigil:", sigil);
            return [sigil, sigil, 99999, ""];
          }
          if (split[1] == "H P") // Paraliponemon
            split[1] = "3 H P";
          if (split[2] == "")    // 2 H
            split[2] = -1;
          else
            split[2] = parseInt(split[2], 10);

          return split;
      };

      var sigil = function(val1, val2) {

        var left = splitSigil(val1),
            right = splitSigil(val2);

        for (var i = 1; i <= 3; i++) {
          if (left[i] < right[i])
            return -1;
          else if (left[i] > right[i])
            return +1;
        }
        return 0;
      }

      var descSigil = function(val1, val2) {
        return -sigil(val1, val2);
      }

      // Map defined algorithms to sortAlgorithms object
      sortAlgorithms.asc = asc;
      sortAlgorithms.desc = desc;
      sortAlgorithms.ascEnd = ascEnd;
      sortAlgorithms.descEnd = descEnd;
      sortAlgorithms.ascCiEnd = ascCiEnd;
      sortAlgorithms.descCiEnd = descCiEnd;
      sortAlgorithms.sigil = sigil;
      sortAlgorithms.descSigil = descSigil;

      return sortAlgorithms;
    })();

    //------------------------------------------------
    // define sort function factory. 
    // input:
    //   array to be sorted
    //   sortAlgorithm to apply
    //   (optional) property to use for sorting
    // output:
    //   compare function based on input
    //------------------------------------------------
    var sort = function(array, sortAlgorithm, property) {
      var sortFunction = function(val1, val2) {
        var properties = property.split(".");
        while(properties.length > 0) {
          var currentProperty = properties.shift();
          val1 = val1[currentProperty];
          val2 = val2[currentProperty];
        }
        return sortAlgorithms[sortAlgorithm](val1, val2);
      };
      return array.sort(sortFunction);
    };

    return sort;
  })();

//###########################################################################
// Faust.url
//###########################################################################

  Faust.url = (function(){
  
    var url = {};


    // function for extracting get parameters from an url
    url.getParameters = (function() {
      return function() {
        var result = {};
        var parameters;
        var name, value;
        var searchString;
        var searchSubstring;

        searchString = window.location.search;

        if(searchString) {
          searchSubstring = searchString.substr(1);
          parameters = searchSubstring.split("&");
          parameters.forEach(function(parameter) {
            name = parameter.split("=")[0];
            value = parameter.split("=")[1];
            result[name] = value;
          });
        }
        if (window.location.hash) {
          result['#'] = window.location.hash.substr(1);
        }
        return result;
      };
    })();


    // change browser location / url without reloading or changing browser history
    url.setUrl = (function() {
      return function(newUrl) {
        history.replaceState(history.state, "", newUrl);
      };
    })();

    return url;
  })();

//###########################################################################
// Faust.doc.createDocumentFromMetadata
//###########################################################################

  Faust.doc = (function(){
    var doc = {};


    // function to create an object with easy acces to data contained in metadata
    // informationen. Uris are converted so that they point at the location
    // where information can be accessed
    doc.createDocumentFromMetadata = (function(){
      // convert metadata information of a document into useable object
      return function(metadata){
        var documentObject = {};

        // determine if document has uri pointing to xml
        if(metadata.document) {
          documentObject.hasDocumentUri = true;
          documentObject.documentUri = metadata.document;
        } else {
          documentObject.hasDocumentUri = false;
        }

        // determine if a base uri for transcrips exists
        if(metadata.base) {
          documentObject.hasBaseUri = true;
          documentObject.baseUri = metadata.base;
        } else {
          documentObject.hasBaseUri = false;
        }

        // determine if document has an actual textual representation
        if(metadata.text) {
          documentObject.hasTextTranscript = true;
          documentObject.textTranscriptUrl = "transcript/text/" + metadata.document + "/transcript.html";
        } else {
          documentObject.hasTextTranscript = false;
        }

        // get the number of pages for the document (if exists)
        if(metadata.page.length !== 0) {
          documentObject.hasPages = true;
        } else {
          documentObject.hasPages = false;
        }

        documentObject.pageCount = metadata.page.length;

        // append all pages to document object
        documentObject.pages = metadata.page.map(function(currentPage, currentPageIndex) {
          var resultPage = {};

          // find out if current page has a documentary transcript
          if(currentPage.doc.length !== 0 && currentPage.doc[0].uri !== undefined) {
            resultPage.hasDocTranscripts = true;
          } else {
            resultPage.hasDocTranscripts = false;
          }

          resultPage.docTranscriptCount = currentPage.doc.length;

          // if page has documentary transcripts appen them
          resultPage.docTranscripts = currentPage.doc.map(function(currentDocTranscript) {
            var resultDocTranscript = {};

            // create url pointing to generated textual transcript and facsimile overlay
            if(currentDocTranscript.uri) {
              resultDocTranscript.hasUri = true;
              resultDocTranscript.docTranscriptUrl = "transcript/diplomatic/" + documentObject.documentUri + "/page_" + (currentPageIndex + 1) + ".svg";
              resultDocTranscript.facsimileOverlayUrl = "transcript/overlay/" + documentObject.documentUri + "/page_" + (currentPageIndex + 1) + ".svg";
            } else {
              resultDocTranscript.hasUri = true;
            }

            // determine if documentary transcript has images attached
            if(currentDocTranscript.img) {
              resultDocTranscript.hasImages = true;
              resultDocTranscript.imageCount = currentDocTranscript.img.length;
              resultDocTranscript.images = currentDocTranscript.img.map(function(currentImage) {
                var resultImage = {};

                // create url and url-prefix pointing to (scaled) full images, tile images and image metadata (with information about image height, width, tile size and available zoom levels
                resultImage.metadataUrl = "transcript/facsimile/metadata/" + currentImage + ".json";
                resultImage.jpgUrlBase = "transcript/facsimile/jpg/" + currentImage;
                resultImage.tileUrlBase = "transcript/facsimile/jpg_tiles/" + currentImage;

                return resultImage;

              });
            } else {
              resultDocTranscript.hasImages = false;
            }

            // find out if current transcript was linked to a facsimile via image-text-linking
            if(currentDocTranscript.imgLink !== undefined) {
              resultDocTranscript.hasImageTextLink = true;
            } else {
              resultDocTranscript.hasImageTextLink = false;
            }

            return resultDocTranscript;
          });

          return resultPage;
        });

        return documentObject;
      };
    })();

    return doc;
  })();

//###########################################################################
// Faust.xhr
//###########################################################################

  // xhr functions
  Faust.xhr = (function(){
  
    var xhr = {};

    // returns xhr to callback if request was successfull (state = 4, status code = 200), else null
    xhr.getXhr = (function() {
      return function(uri, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", uri, true);
        if(callback) {
          xhr.onreadystatechange = function () {
            if(this.readyState === 4) {
              callback(xhr);
            }
          };
        }
        xhr.send(null);
        return xhr;
      };
    })();

    // returns only responseText from an successfull xhr
    xhr.getResponseText = (function() {
      return function(uri, callback) {
        // call xhr function
        return Faust.xhr.getXhr(uri, function(xhr) {
          if(callback) {
            if(xhr.status !== 200) {
              // return null if request was unsuccessfull
              callback(null);
            } else {
              //else return responseText;
              callback(xhr.responseText);
            }
          }
        });
      };
    })();

    // returns only xml from an successfull xhr
    xhr.getResponseXml = (function() {
      return function(uri, callback) {
        // call xhr function
        return Faust.xhr.getXhr(uri, function(xhr) {
          if(callback) {
            if(xhr.status !== 200) {
              // return null if request was unsuccessfull
              callback(null);
            } else {
              //else return responseText;
              callback(xhr.responseXML);
            }
          }
        });
      };
    })();

    return xhr;
  })();

//###########################################################################
// Faust.util
//###########################################################################

  // Helper functions
  Faust.util = (function(){

    var util = {};

    // Convert string into integer. returns null if conversion fails
    util.strToInt = (function(){
      return function(numberString) {
        var result = null;

        try {
          result = Number.parseInt(numberString);
        } catch (Exception) {}

        return result;
      };
    })();

    return util;
  })();

//###########################################################################
// Faust.dom
//###########################################################################

  // Helper functions
  Faust.dom = (function(){
    var dom = {};

    // function to create a configured dom element
    dom.createElement = (function(){
      return function(conf) {
        var element;

        // an element can only be created, if a tag name is given
        if( (conf !== undefined) && (conf.name !== undefined) ) {
          // create element
          element = document.createElement(conf.name);
          // configure
          dom.configureElement(element, conf);
        }

        return element;
      };
    })();

    // function to create a configured element in svg namespace
    dom.createSvgElement = (function(){
      return function(conf) {
        var element;

        // an element can only be created, if a tag name is given
        if( (conf !== undefined) && (conf.name !== undefined) ) {
          // create element
          element = document.createElementNS("http://www.w3.org/2000/svg", conf.name);

          // if a class name is given, it can't be applied like with html elements (setting element.className).
          // so if a class name is given copy it to the attributes array with an attribute name of "class"
          if(conf.class !== undefined) {
            // find out if an attributes array already exists. if not create one
            if(conf.attributes === undefined) {
              conf.attributes = [];
            }
            // append class name to attributes array
            conf.attributes.push(["class", conf.class]);
            // remove class from config object
            delete conf.class;
          }
          // configure svg element
          dom.configureElement(element, conf);
        }

        return element;
      };
    })();

    // configure a dom element
    dom.configureElement = (function(){
      return function(element, conf) {

        // element can only be configured if a configuration is given
        if (conf !== undefined) {

          // configure id and class(es)
          if(conf.id !== undefined) {
            element.id = conf.id;
          }

          if(conf.class !== undefined) {
            element.className = conf.class;
          }

          // configure ancestors and successors
          if(conf.parent !== undefined) {
            conf.parent.appendChild(element);
          }

          if( (conf.children !== undefined) && (conf.children instanceof Array) ) {
            conf.children.forEach(function(child) {
              element.appendChild(child);
            });
          }

          // configure attributes
          if( (conf.attributes !== undefined ) && (conf.attributes instanceof Array) ) {
            conf.attributes.forEach(function(attribute) {
              element.setAttribute(attribute[0], attribute[1]);
            });
          }

          // configure event listeners
          if( (conf.listeners !== undefined) && (conf.listeners instanceof Array) ) {
            conf.listeners.forEach(function(listener) {
              element.addEventListener(listener[0], listener[1]);
            });
          }

          // configure element object properties
          if( (conf.properties !== undefined) && (conf.properties instanceof Array) ) {
            conf.properties.forEach(function(property) {
              element[property[0]] = property[1];
            });
          }
        }

        // return configured element
        return element;
      };
    })();

    // remove all children from a given node
    dom.removeAllChildren = (function(){
      return function(node) {

        while(node.firstChild) {
          node.removeChild(node.firstChild);
        }
      };
    })();

    // add a css class to a given element. the function distinguished between svg-elements
    // and non-svg-elements (html / dom). The element is queried for css classes and the new
    // element is only appended if it wasn't part of the element's class before
    dom.addClassToElement = (function() {
      return function(element, newClassName) {
        // marker to signal if the new class name already is part of the element's className
        var alreadyClass = false;
        var classNames;

        // remove spaces around new class if exist
        newClassName = newClassName.trim();

        // check if element is an svg element or not and get the classes attached to that element
        if(element instanceof SVGElement) {
          classNames = element.getAttribute("class").split(" ");
        } else {
          classNames = element.className.split(" ");
        }

        // test each class of the element if it equals the new class name
        classNames.forEach(function(className) {
          if(className === newClassName) {
            // if so, then set marker to skip adding new class to element
            alreadyClass = true;
          }
        });

        // only add class if it isn't already part of the element's class set
        if(alreadyClass === false) {
          // if the element already has a class / multiple classes assigned, the new
          // class must be inserted with a leading space
          if(classNames.length > 0) {
            newClassName = " " + newClassName;
          }

          // now actually add the new class name to the element
          if(element instanceof SVGElement) {
            element.setAttribute("class", element.getAttribute("class") + newClassName);
          } else {
            element.className = element.className + newClassName;
          }
        }
      };
    })();

    // remove a css class from a given element. the function distinguished between svg-elements
    // and non-svg-elements (html / dom).
    dom.removeClassFromElement = (function() {
      return function(element, classToRemove) {
        var classNames;

        // check if element is an svg element or not and get the classes attached to that element
        if(element instanceof SVGElement) {
          classNames = element.getAttribute("class").split(" ");
        } else {
          classNames = element.className.split(" ");
        }

        // go through every class of the element. every class that doesn't match the class to remove
        // will be added to a new class string
        var newClassName = classNames.reduce(function(previousString, currentClassName) {
          newClassName = previousString;
          if(currentClassName !== classToRemove.trim()) {
            // multiple classes must be separated by a space character. if we already added a class
            // to the result string it is longer than 0 chars and we must add a space
            if(newClassName.length > 0) {
              newClassName = newClassName + " ";
            }
            newClassName = newClassName + currentClassName;
          }
          return newClassName;
        }, "");

        // assign the generated class 
        if(element instanceof SVGElement) {
          element.setAttribute("class", newClassName);
        } else {
          element.className = newClassName;
        }
      };
    })();

    return dom;
  })();


//###########################################################################
// Faust.event
//###########################################################################

  Faust.event = (function(){
    var event = {};

    // event handling object. events can be triggered by calling events.triggerEvent(eventName, [returnObj]).
    // event handlers are added by calling events.addEventListener(eventName, callback).
    event.createEventQueue = function(){
      // create object with functions to add event handlers and to trigger events
      var events = {};
      var i;

      // create object that will hold all appended listeners
      events.listeners = {};

      // function to call if an event occurred. all listeners attached
      // listening to the same name that was triggered will be called.
      events.triggerEvent = (function(){
        return function(eventName, obj){
          if(events.listeners[eventName] !== undefined) {
            // iterate through every listener
            for(i = 0; i < events.listeners[eventName].length; i++) {
              // if a result exists
              if(obj) {
                // ...pass it through to callback
                events.listeners[eventName][i](obj);
              } else {
                // ...else call callback without parameters
                events.listeners[eventName][i]();
              }
            }
            return true;
          } else {
            return false;
          }
        };
      })();

      // function to add listeners for an event. an event name
      // as well as a callback must be provided
      events.addEventListener = (function(){
        return function(eventName, callback){
          // select appropriate event listener queue
          if(events.listeners[eventName] === undefined) {
            events.listeners[eventName] = [];
          }
          // ... and add listener to queue
          events.listeners[eventName].push(callback);
          return true;
        };
      })();

      return events;
    };

    return event;
  })();

//###########################################################################
// Faust.tooltip
//###########################################################################

  // add tooltips to elements. there is a function to add a tooltip to a specific element and
  // another function to add tooltips to all dom elements having a "show-tooltip" class and a
  // "tooltiptext" attribute
  Faust.tooltip = (function(){
    var tooltip = {};

    // create listener to append to the given element's mouseenter event. when the event is triggered
    // the element specific tooltip will be added to the dom and thus shown. The tooltip div will be put
    // in the mousepointers proximity
    var createMouseenterListener = function(element) {
      return function(event) {
        document.body.appendChild(element.tooltipDiv);
        element.tooltipDiv.style.left = (event.clientX + 15) + "px";
        element.tooltipDiv.style.top = (event.clientY + 8) + "px";
      };
    };

    // create listener to append to the given element's mousemove events. when the event is triggered
    // the tooltip will be moved according to the new mouse pointer position
    var createMousemoveListener = function(element) {
      return function(event) {
        element.tooltipDiv.style.left = (event.clientX + 15) + "px";
        element.tooltipDiv.style.top = (event.clientY + 8) + "px";
      };
    };

    // create listener to append to the given element's mouseleave event. when the event is triggered
    // the tooltip will be removed from the dom and thus hidden
    var createMouseleaveListener = function(element) {
      return function() {
        if(element.tooltipDiv.parentElement !== null) {
          document.body.removeChild(element.tooltipDiv);
        }
      };
    };

    // remove all listeners from the element. this function can be used if no more tooltips shall be shown on 
    // an element that had tooltips added before
    var createListenerRemoveFunction = function(element, mouseenterListener, mousemoveListener, mouseleaveListener) {
      return function() {
        // remove mouse event listeners
        element.removeEventListener("mouseenter", mouseenterListener);
        element.removeEventListener("mousemove", mousemoveListener);
        element.removeEventListener("mouseleave", mouseleaveListener);
        // remove the generated div for tooltips
        delete element.tooltipDiv;
        // remove this function (the one currently called)
        delete element.removeTooltip;
      };
    };

    // add a tooltip to the given element. a div is created and the content is added. content must be a displayable dom element
    // like a textNode, span or div
    tooltip.add = function(element, content) {
      var mouseenterListener, mousemoveListener, mouseleaveListener;

      // first find out if a tooltip already was attached to the element. if so delete it.
      if(element.hasOwnProperty(tooltipDiv)) {
        element.removeTooltip();
      }

      // create the div containing the tooltip
      var tooltipDiv = document.createElement("div");
      tooltipDiv.id = "tooltip";
      tooltipDiv.className = "tooltip";
      
      // append the given content to the tooltip container
      tooltipDiv.appendChild(content);

      // store container as a property of the element
      element.tooltipDiv = tooltipDiv;

      // create mouse event listeners
      mouseenterListener = createMouseenterListener(element);
      mousemoveListener = createMousemoveListener(element);
      mouseleaveListener = createMouseleaveListener(element);

      // add mouse event listeners to element
      element.addEventListener("mouseenter", mouseenterListener);
      element.addEventListener("mousemove", mousemoveListener);
      element.addEventListener("mouseleave", mouseleaveListener);

      // create and add function to remove tooltip and event listeners
      element.removeTooltip = createListenerRemoveFunction(element, mouseenterListener, mousemoveListener, mouseleaveListener);
    };

    // get all elements in dom that have a tooltip class. these elements must have a class with the name "show-tooltip"
    // and an attribute called "tooltiptext". a textNode is created from the text of that attribute and then a
    // tooltip is attached to the element with that specific text
    tooltip.addToTooltipElements = function() {
      var i;
      var tooltipElement, tooltipElements;
      var tooltipTextNode;

      // get all tooltip elements
      tooltipElements = document.getElementsByClassName("show-tooltip");

      
      // iterate through found tooltip elements
      for(i = 0; i < tooltipElements.length; i++) {
        tooltipElement = tooltipElements.item(i);

        // create content for actual tooltip
        tooltipTextNode = document.createTextNode(tooltipElement.getAttribute("tooltiptext"));

        // append tooltip to element
        tooltip.add(tooltipElement, tooltipTextNode);
      }
    };

    return tooltip;
  })();

//###########################################################################
// Faust.createBreadcrumbs
//###########################################################################

  // create and return breadcrumbs as a span element. data is accepted as an array where
  // each element contains a caption and a link. if no link is provided for an element
  // there will only be a text node with the caption instead of a link in the returned
  // span element
  Faust.createBreadcrumbs = function(data) {
    // create return element
    var breadcrumbs = document.createElement("span");

    // iterate through all breadcrumbs
    data.forEach(function(crumb, index) {
      // add a spacer if there is more than one breadcrub
      if(index > 0) {
        breadcrumbs.appendChild(document.createTextNode(" > "));
      }

      // create span for current breadcrumb
      var crumbSpan = Faust.dom.createElement({name: "span", parent: breadcrumbs});

      // add a link for current element if a link was provided, otherwise only append the caption
      if(crumb.link !== undefined) {
        var crumbA = Faust.dom.createElement({name: "a", parent: crumbSpan, attributes: [["href", crumb.link]]});
        crumbA.appendChild(document.createTextNode(crumb.caption));
      } else {
        crumbSpan.appendChild(document.createTextNode(crumb.caption));
      }
    });

    // return breadcrumbs
    return breadcrumbs;
  };

//###########################################################################
//###########################################################################
  return Faust;
})();


