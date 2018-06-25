define(["sortable", "domReady"], function(Sortable, domReady) {  // TODO factor sorting stuff into a tables.js
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
          if (split[1] === "H P") // Paraliponemon
            split[1] = "3 H P";
          if (split[2] === "")    // 2 H
            split[2] = -1;
          else
            split[2] = parseInt(split[2], 10);

          return split;
      };

      var sigil = function(val1, val2) {

        var space = emptyValuesToEnd(val1, val2);
        if (space !== 0)
          return space;

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
        var space = emptyValuesToEnd(val1, val2);
        if (space !== 0)
          return space;
        return -sigil(val1, val2);
      }


    var NUMBERPLUS = /^(-?[\d,.]+)\s?(\w*)$/;
    var DATE_DE    = /(?:(?:(\d\d)\.)?(\d\d)\.)?(\d\d\d\d)/;
    var BIB        = /^(\D*)(\d*)(\D*)(\d*)(\D*)(\d*)(\D*)(\d*)(\D*)(\d*)(\D*)/;
    var matchSpace = function matchSpace(a) { return a.match(/^\s*$/); }
    if (typeof(Sortable) !== "undefined") {
      Sortable.setupTypes([
        { name: 'numericplus',  // number + optional suffix, e.g., 123a
          defaultSortDirection: 'ascending',
          match: function(a) { return NUMBERPLUS.test(a); },
          compare: function(a, b) {
            var empty = emptyValuesToEnd(a, b);
            if (empty) return empty;
            var _a = NUMBERPLUS.exec(a) || ['', 0, ''],
                _b = NUMBERPLUS.exec(b) || ['', 0, ''],
                na = parseFloat(_a[1], 10) || 0,
                nb = parseFloat(_b[1], 10) || 0;
            return na - nb || _a[2].localeCompare(_b[2]);
          },
          bottom: matchSpace
        },
        {
          name: 'date-de',    // e.g., 12.03.1810 or 1793
          defaultSortDirection: 'ascending',
          match: function(a) { return DATE_DE.test(a); },
          comparator: function(a) {
            var split = DATE_DE.exec(a);
            var result;
            if (split)
              result = split[3] + "-" + (split[2]? split[2] : "00") + "-" + (split[1]? split[1] : "00");
            else
              result = "9999-99-99";
            return result;
          },
          compare: function(a, b) {
            return a.localeCompare(b);
          },
          bottom: matchSpace
        },
        {
          name: 'bibliography',   
          defaultSortDirection: 'ascending',
          match: function() { return false; },
          compare: function(a, b) {
            var empty = emptyValuesToEnd(a, b);
            if (empty) return empty;
            var _a = BIB.exec(a),
                _b = BIB.exec(b);
            if (_a == null) {
              if (_b == null) {
                return 0;
              } else {
                return 1;
              }
            }
            if (_b == null)
              return -1;

            return _a[1].localeCompare(_b[1]) || 
                   _a[2] - _b[2] || 
                   _a[3].localeCompare(_b[3]) || 
                   _a[4] - _b[4] ||
                   _a[5].localeCompare(_b[5]) || 
                   _a[6] - _b[6] ||
                   _a[7].localeCompare(_b[7]) || 
                   _a[8] - _b[8] ||
                   _a[9].localeCompare(_b[9]) || 
                   _a[10] - _b[10] ||
                   _a[11].localeCompare(_b[11]); 
          },
          bottom: matchSpace
        },
        {
          name: 'sigil',   // Faustedition sigil
          defaultSortDirection: 'ascending',
          match: function(a) { return false; },
          compare: sigil,
          bottom: matchSpace
        },
        {
          name: 'alpha',
          defaultSortDirection: 'ascending',
          match: function() { return false; },
          compare: function(a, b) {
            if (!a)
              return +1;
            else if (!b)
              return -1;
            else
              return a.localeCompare(b);
          },
          bottom: matchSpace
        }

      ]);

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
    doc.createDocumentFromMetadata = function(metadata){
        var documentObject = Object.create(metadata);

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
          var resultPage = Object.create(currentPage);

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
              resultDocTranscript.docTranscriptUrl = "transcript/diplomatic/" + documentObject.sigil + "/page_" + (currentPageIndex + 1) + ".svg";
              resultDocTranscript.facsimileOverlayUrl = "transcript/overlay/" + documentObject.sigil + "/page_" + (currentPageIndex + 1) + ".svg";
            } else {
              resultDocTranscript.hasUri = true;
            }

            // determine if documentary transcript has images attached
            if(currentDocTranscript.img && currentDocTranscript.img.length > 0) {
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

      /**
       * Returns a promise for the response of a xhr object.
       * @param url
       * @param responseType resolve to "text" -> responseText, "xml" -> responseXML, leave out -> whole response
       * @returns {Promise}
       *
       */
    xhr.get = function get(url, responseType) {
      return new Promise(function(resolve, reject) {
        var request = new XMLHttpRequest();
        request.open('GET', url);
        request.onload = function() {
          if (request.status >= 200 && request.status < 300) {
            if (responseType === 'text') {
              resolve(request.responseText);
            } else if (responseType === 'xml') {
              resolve(request.responseXML)
            } else {
                resolve(request.response);
            }
          } else {
            reject(Error('Failed to load ' + url + ', error: ' + request.statusText));
          }
        }
        request.onerror = function() {
          reject(Error('Network error accessing ' + url));
        }
        request.send();
      });
    }

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

  Faust.event = {
      // event handling object. events can be triggered by calling events.triggerEvent(eventName, [returnObj]).
      // event handlers are added by calling events.addEventListener(eventName, callback).
      createEventQueue: function () {
          // create object with functions to add event handlers and to trigger events
          var eventQueue = {};

          // create object that will hold all appended listeners
          eventQueue.listeners = {};

          // function to call if an event occurred. all listeners attached
          // listening to the same name that was triggered will be called.
          eventQueue.triggerEvent = function (eventName, obj) {
                  var i;
                  if (eventQueue.listeners[eventName] !== undefined) {
                      // iterate through every listener
                      for (i = 0; i < eventQueue.listeners[eventName].length; i++) {
                          // if a result exists
                          if (obj) {
                              // ...pass it through to callback
                              eventQueue.listeners[eventName][i](obj);
                          } else {
                              // ...else call callback without parameters
                              eventQueue.listeners[eventName][i]();
                          }
                      }
                      return true;
                  } else {
                      return false;
                  }
          };

          // function to add listeners for an event. an event name
          // as well as a callback must be provided
          eventQueue.addEventListener = function (eventName, callback) {
              // select appropriate event listener queue
              if (eventQueue.listeners[eventName] === undefined) {
                  eventQueue.listeners[eventName] = [];
              }
              // ... and add listener to queue
              eventQueue.listeners[eventName].push(callback);
              return true;
          };

          return eventQueue;
      }
  };

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
        document.body.insertBefore(element.tooltipDiv, document.body.firstChild);
        element.tooltipDiv.style.left = event.clientX + "px";
        element.tooltipDiv.style.top = (event.clientY + 10) + "px";
      };
    };

    // create listener to append to the given element's mousemove events. when the event is triggered
    // the tooltip will be moved according to the new mouse pointer position
    var createMousemoveListener = function(element) {
      return function(event) {
        element.tooltipDiv.style.left = event.clientX + "px";
        element.tooltipDiv.style.top = (event.clientY + 10) + "px";
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
      tooltipDiv.className = "tooltip pure-tooltip";
      
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

    // hook to add tooltip to multiple elements
    tooltip.addToTooltipElements = function() {
      tooltip.addToTooltipElementsBySelector(".show-tooltip", "tooltiptext"); // all elements with a class '.show-tooltip', get text from attribute 'tooltiptext'
      tooltip.addToTooltipElementsBySelector("main [title]", "title"); // all elements with a title attribute, get text from attribute 'title'
    };


    tooltip.addToTooltipElementsBySelector = function(selector, attributeName) {
      var i;
      var tooltipElement, tooltipElements, tooltipText;

      // get all tooltip elements
      tooltipElements = document.querySelectorAll(selector);

      // iterate through found tooltip elements
      for(i = 0; i < tooltipElements.length; i++) {
        tooltipElement = tooltipElements.item(i);
        tooltipText =  tooltipElement.getAttribute(attributeName);

        if ( tooltipText != '' ) {
          // append tooltip to element
          tooltip.add(tooltipElement, document.createTextNode(tooltipText));

          // empty default title attribute
          tooltipElement.setAttribute(attributeName, "");
        }
      }
    }

    domReady(tooltip.addToTooltipElements);

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
    var quotation = [];

    // create return element
    var breadcrumbs = document.createElement("span");

    // count breadcrumbs
    var num = data.length;

    // iterate through all breadcrumbs
    data.forEach(function(crumb, index) {
      // add quotation title
      quotation.push(crumb.caption);

      // insert last breadcrumb item into seperate breadcrumb element
      if (index == num-1) {
        var current = '<span>'+crumb.caption+'</span>';
        document.getElementById("current").innerHTML = current;
        return; // do not proceed adding caption to standard breadcrumb line
      }

      // add a spacer if there is more than one breadcrub
      if(index > 0) {
        var spacer = Faust.dom.createElement({name: "i", parent: breadcrumbs, class: 'fa fa-angle-right'});
      }

      // create a for breadcrumb
      var crumbA = Faust.dom.createElement({name: "a", parent: breadcrumbs});

      // add a link for current element if a link was provided, otherwise only append the caption
      if(crumb.link !== undefined) {
        crumbA.href = crumb.link;
      }
      crumbA.appendChild(document.createTextNode(crumb.caption));
    });


    // replace breadcrumb and url inside quotation template
    if (document.getElementById("quotation") != null) {
      var clone = document.querySelector('#quotation').cloneNode(true);
      clone.innerHTML = clone.innerHTML.replace(/<span>Startseite<\/span>/g, quotation.join(", "));
      clone.innerHTML = clone.innerHTML.replace(/<span>URL: .*<\/span>/g, 'URL: '+window.location.href);
      document.getElementById("quotation").innerHTML = clone.innerHTML;
    }

    // wait a while that (hopefully) dom is loaded and adjust breadcrumb width for long titles
    setTimeout(Faust.adjustBreadcrumbWidth, 100);

    // return breadcrumbs
    return breadcrumbs;
  };

//###########################################################################
// Faust.adjustBreadcrumbWidth
//###########################################################################

  // adjust breadcrumb with for long titles on the last element. This set as maximum width
  // property and leads to ellipsis for the title
  Faust.adjustBreadcrumbWidth = function() {
    var header = document.getElementsByTagName('header')[0];

    var children = header.children;
    var headerWidth = header.offsetWidth;
    var bodyWidth = document.getElementsByTagName('body')[0].offsetWidth;
    var totalWidth = 0;

    var headerPadding = parseInt(getComputedStyle(header, null).getPropertyValue('padding-left')) + parseInt(getComputedStyle(header, null).getPropertyValue('padding-right'));

    // run if the header is wider than the body due to long title
    if (headerWidth > bodyWidth) {
      for (var i = 0; i < children.length; i++) {
        // calculate width of other elements
        if ( children[i].id != 'current' ) {
          totalWidth += children[i].offsetWidth;
        }
      }
      // adjust maximum with of current element to available space
      document.getElementById("current").style = 'max-width:'+(bodyWidth-totalWidth-headerPadding)+'px;';
    }
  };

  Faust.findScene = function findScene(firstLine, lastLine) {
    var result = [];
    sceneLineMapping.forEach(function(mappingData) {
      if(firstLine >= mappingData.rangeStart && lastLine <= mappingData.rangeEnd) {
          result.push(mappingData);
      }
    });
    result.reverse();
    return result;
  };

  Faust.genesisBreadcrumbData = function genesisBreadcrumbData(firstLine, lastLine, detailed) {
    var sceneData = Faust.findScene(firstLine, lastLine);
    var breadcrumbs = [{caption: "Genese", link: "genesis"}];
    if (sceneData.length > 0) {
      if (sceneData[0].id[0] === "1") {
        breadcrumbs.push({caption: "Faust I", link: "genesis_faust_i"});
      } else {
        breadcrumbs.push({caption: "Faust II", link: "genesis_faust_ii"});
      } 
      sceneData.forEach(function(scene) {
        breadcrumbs.push({caption: scene.title, link: "genesis_bargraph?rangeStart=" + scene.rangeStart + "&rangeEnd=" + scene.rangeEnd});
      });
    }

    if (detailed) {
      breadcrumbs.push({caption: firstLine + " – " + lastLine});
      if (sceneData.length > 0) {
        var scene = sceneData[sceneData.length - 1];
        if (scene.rangeStart === firstLine && scene.rangeEnd === lastLine) {
          breadcrumbs.pop();
        }
      }
    }

    return breadcrumbs;
  };

  var formatExceptionDetail = function formatExceptionDetail(e) {
    var result = e;
    try {
      result = "<p>Bitte beachten Sie, dass die Seite nur die aktuellen Versionen der Browser " +
        "<a href='https://www.mozilla.org/de/firefox/new/'>Firefox</a> und " +
        "<a href='https://www.google.de/chrome/index.html'>Chrome</a> unterstützt.</p>" +
        "<dl><dt>Fehlertyp</dt><dd>" + e.name + "</dd>" +
        "<dt>Meldung</dt><dd>" + e.message + "</dd>" +
        "<dt>Stack Trace</dt><dd><pre>" + (typeof e.stack !== 'undefined' ? e.stack : '') + "</pre></dd>" +
        "<dt>Browser</dt><dd>" + window.navigator.userAgent + "</dd></dl>";
    } catch (formattingError) {
      console.warn(formattingError);
    }
    return result;
  }

  Faust.error = function error(title, msg, parent) {
    console.error(title, msg);
    if (msg instanceof Error)
      msg = formatExceptionDetail(msg);
    if (parent === undefined) {
      parent = document.getElementById("main-content");
    }
    var container = Faust.dom.createElement({name: "div", class: "error-container center pure-g-r", parent: parent});
    container.innerHTML = '<div class="pure-u-1"><p class="pure-alert pure-alert-danger"><i class="fa fa-cancel pure-pull-right closebtn"></i><strong class="error-title"></strong><span>&nbsp;</span><span class="error-msg"></span></p></div>';
    var wrapper = container.firstChild.firstChild,
        titleElem = wrapper.children[1],
        msgElem = wrapper.children[3],
        closebtn = wrapper.children[0];
    titleElem.innerHTML = title;
    msgElem.innerHTML = msg;
    parent.insertBefore(container, parent.firstChild);
    closebtn.onclick = function () {
      parent.removeChild(container);
    }
  };

  Faust.bindBySelector = function bindBySelector(selector, func, event) {
        if (!(event)) event = "click";
        var elements = document.querySelectorAll(selector);
        elements.forEach(function(el) {
            el.addEventListener(event, func);
        });
    };

  Faust.toggleButtonState = function toggleButtonState(selector, newState) {
      var result;
      document.querySelectorAll(selector).forEach(function(element) {
        if (typeof(newState) == "undefined" && element.classList.contains('pure-button-primary')
            || (newState === false)) {
          element.classList.remove('pure-button-primary');
          result = false;
        } else {
          element.classList.add('pure-button-primary');
          result = true;
        }
      });
      return result;
    };

    Faust.PageCache = function PageCache() {
        this.cache = {};
        this.hasPage = function(pageNo) { return this.cache.hasOwnProperty(pageNo); };
        this.addPage = function(pageNo, node) {
            if (this.hasPage(pageNo))
                console.warn('PageCache is overwriting page no ', pageNo);
            this.cache[pageNo] = node;
        };
        this.getPage = function(pageNo, doNotClone) {
            if (!thisPage.hasPage(pageNo)) {
                console.warn('PageCache does not have page no ', pageNo);
                return undefined;
            } else {
                var node = this.cache[pageNo];
                if (document.contains(node)) {
                    return node.cloneNode(true)
                } else {
                    return node;
                }
            }
        };
    };

    Faust.finishedLoading = function finishedLoading() {
      var loadingSpinner = document.getElementById('loading-spinner');
      if (loadingSpinner)
        loadingSpinner.remove();
    };

    Faust.addToTopButton = function addToTopButton(parent) {
      var aTop = document.createElement('a'),
          aLink = document.createElement('a'),
          visible = false;

      if (!parent)
        parent = document.getElementsByTagName('body').item(0);

      aTop.nameProp = 'top';
      parent.insertBefore(aTop, parent.firstChild);

      aLink.id = 'link-to-top';
      aLink.innerHTML = '<i class="fa fa-3x fa-up-circled"></i>'
      aLink.href = '#top';
      parent.appendChild(aLink);

      document.addEventListener('scroll', function (scrollEvent) {
        if (visible && (window.pageYOffset === 0)) {
          aLink.style.display = 'none';
          visible = false;
        } else if (!visible && (window.pageYOffset > 0)) {
          aLink.style.display = 'inline';
          visible = true;
        }
      });
    };


//###########################################################################
//###########################################################################
  return Faust;
});
