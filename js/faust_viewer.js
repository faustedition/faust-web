// noinspection JSAnnotator
define(['faust_common', 'fv_structure', 'fv_doctranscript', 'faust_image_overlay', 'faust_print_interaction', 'faust_app',
        'data/scene_line_mapping', 'data/genetic_bar_graph', 'data/copyright_notes', 'data/archives', 'data/document_metadata',
        'json!/print/pages.json'
    ],
  function(Faust, structureView, createDocTranscriptView, imageOverlay, addPrintInteraction, app,
         sceneLineMapping, geneticBarGraphData, copyright_notes, archives, faustDocumentsMetadata,
           pagesMapping) {
  "use strict";


  // FIXME we expose these as global functions as long as the functionality hasn't been completely migrated
  var transcriptTooltips = createDocTranscriptView.transcriptTooltips;
  var addPatchHandlers = createDocTranscriptView.addPatchHandlers;


  // Global variables to all viewer instances
  var viewModes = ["facsimile", "facsimile_document", "document", "document_text", "text", "print", "structure"];
  var contentHtml = {
    missingImageMetadata: "{\"hasImages\": false}",
    loadErrorImageMetadata: "{\"hasImages\": false, \"noImageLoadable\": true}",
    missingFacsimileOverlay: "<div>Kein dokumentarisches Transkript vorhanden - Facsimile-Overlay kann nicht existieren</div>",
    loadErrorFacsimielOverlay: "<div>Facsimile Overlay konnte nicht geladen werden</div>",
    missingDocTranscript: "<div>Kein dokumentarisches Transkript vorhanden</div>",
    loadErrorDocTranscript: "<div>Dokumentarisches Transkript konnte nicht geladen werden</div>",
    missingTextTranscript: "<div>Kein Textuelles Transkript vorhanden</div>",
    missingTextAppTranscript: "<div>Kein Textuelles Transkript vorhanden</div>"
  };

  return function createDocumentViewer(parentDomNode){
      // viewer instance variables
      var state = {
        page: 1,
        view: "structure",
        scale: undefined,
        imageBackgroundZoomLevel: 3,
        showOverlay: true,
        section: undefined,         // opt. file name for textual / apparatus view
        fragment: undefined,

          // updates the address in the browser bar to a value calculated from state and state.doc
        toLocation: function toLocation(replaceHistory) {
              var fixedPath = window.location.pathname.replace(/^\/+/, '/');
              var url = fixedPath + '?faustUri=' + state.doc.faustUri + '&page=' + this.page + '&view=' + this.view;
              if (this.section) {
                  url += '&section=' + this.section;
              }
              if (this.fragment) {
                  url += '#' + this.fragment;
              }
              if (replaceHistory)
                  history.replaceState(history.state, null, url);
              else
                  history.pushState(history.state, null, url);

              return this;
          },

          // initializes the state from the location bar.
          fromLocation: function fromLocation() {
              var getParameters = Faust.url.getParameters();
              this.doc.faustUri = getParameters.faustUri;

              // if a valid page was given as parameter use ist. otherwise this.page is preset to the
              // first (1) page of the witness
              if (getParameters.page && !isNaN(parseInt(getParameters.page))) {
                  this.page = parseInt(getParameters.page);
              }

              if (getParameters.section) {
                  this.section = getParameters.section;
              }

              // if a view was given in the get parameters and the view is available then set active view to that
              if (getParameters.view && viewModes.reduce(function (result, view) {
                      if (view === getParameters.view) {
                          result = true;
                      }
                      return result;
                  }, false)) {
                  this.view = getParameters.view;
              }

              if (getParameters['#']) {
                  this.fragment = getParameters['#'];
              }

              return this;
          },

          /**
           * initialize doc from the global metadata table by finding the current document
           */
          initMetadata: function initMetadata() {
              // get relative faust uri that can be matched with entries within faust documents metadata
              var relativeFaustUri = state.doc.faustUri.replace(faustDocumentsMetadata.basePrefix + "document/", "");

              // now find metadata for the document to view and convert it in a useable form
              faustDocumentsMetadata.metadata.forEach(function(currentMetadata){
                  if(currentMetadata.document === relativeFaustUri) {
                      state.doc.metadata = Faust.doc.createDocumentFromMetadata(currentMetadata);
                      state.doc.faustMetadata = currentMetadata;
                      state.doc.pageCount = state.doc.metadata.pageCount;
                      state.doc.sigil = currentMetadata.sigils.idno_faustedition;
                  }
              });
              state.doc.printLinks = pagesMapping[state.doc.faustUri];
          },

          // structure representing the current document
          doc: {
              faustUri: null,
              metadata: null,
              pageCount: null,
              pages: [],
              textTranscript: null,
              structure: undefined,
              sections: {},
              findSection: function findSection(pageNum) {
                  var printLinks = this.printLinks,
                      filename = printLinks[pageNum],
                      prevPage = pageNum;

                  // no reference for pageNum? Look for smaller page numbers ...
                  while (!filename && prevPage >= 0) {
                      prevPage = prevPage - 1;
                      filename = printLinks[prevPage];
                  }
                  if (!filename) { // FIXME obsolete when default === 0
                      filename = printLinks['default'];
                  }

                  // now, a section parameter may override our choice.
                  if (state.section) {
                      if (state.section === filename) {
                          state.section = undefined; // it's the default
                      } else {
                          filename = state.section;
                      }
                  }
                  return filename;
              },
      getFacsCopyright: function getFacsCopyright() {
          if (this.faustUri in copyright_notes)
              return copyright_notes[this.faustUri];
          else {
              var repository = this.faustMetadata.sigils.repository;
              if (repository in copyright_notes)
                  return copyright_notes[repository];
              else
                  return null;
          }
      },

          }
      };

      // allow other objects to listen to events
      var events = Faust.event.createEventQueue();


      // FIXME temporary wrapper for controller refactoring
      var controller = {
              setPage : function (pageNum) { setPage(pageNum); },
              setView : function (view) { setView(view); },
              events  : events
      };


      // container holding references to each available view / div
      var domContainer = {};


      // initialisation of viewer component.
      // 1. create a div for each view with matching id and class names, record it in domContainer, and insert it into
      //    the page (parentDomNode element)
      // 2. parse the URL and find out the current document (by URI). Initialize state.doc with data from documentMetadat
      //    and bar graph (sigil is only there?). FIXME why not prepare JSON in the right form in the first place?
      // 3. trigger loading XML → structure view
      // 4. parse rest of URL to view, page, section, fragment → state variable
      // 5. setPage, setView → might trigger loading stuff
      // 6. initialize toolbar tooltips. Toolbar itself is hard-coded in documentViewer.php
      var init = (function(){

        // creates divs for each view available. references are stored in domContainer
        // object and the elements are then appended to the parent element that was
        // given as a parameter when calling createDocumentViewer(parentDomNode)
        var createDomNodes = (function() {
          return function(parentNode) {

              // XXX this does essentially the same for everything, but with slightly handcrafted names:
              // facsimile_document vs. docTranscript etc. So refactor names and unify this, or better
              // redesign

            // Create element for facsimile representation.
            domContainer.facsimile = document.createElement("div");
            domContainer.facsimile.id = "facsimile-content";
            domContainer.facsimile.className = "facsimile-content view-content";

            // Create element for facsimile/docTranscript representation.
            domContainer.facsimile_document = document.createElement("div");
            domContainer.facsimile_document.id = "facsimile-document-content";
            domContainer.facsimile_document.className = "facsimile-document-content view-content";

            // create docTranscript element
            domContainer.docTranscript = document.createElement("div");
            domContainer.docTranscript.id = "doc-transcript-content";
            domContainer.docTranscript.className = "doc-transcript-content view-content";

            // create docTranscript/text element
            domContainer.document_text = document.createElement("div");
            domContainer.document_text.id = "doc-transcript-text-content";
            domContainer.document_text.className = "doc-transcript-text-content view-content";

            // create textTranscript element
            domContainer.textTranscript = document.createElement("div");
            domContainer.textTranscript.id = "text-transcript-content";
            domContainer.textTranscript.className = "text-transcript-content view-content";

            // create print view element
            domContainer.print = document.createElement("div");
            domContainer.print.id = "print-content";
            domContainer.print.className = "print-content view-content";

            // create structure element // FIXME adjust to new viewer
            // domContainer.structure = document.createElement("div");
            // domContainer.structure.id = "structureContainer";
            // domContainer.structure.className = "structure-container view-content";

            // append all views to dom on given parent node
            parentNode.appendChild(domContainer.facsimile);
            parentNode.appendChild(domContainer.facsimile_document);
            parentNode.appendChild(domContainer.docTranscript);
            parentNode.appendChild(domContainer.document_text);
            parentNode.appendChild(domContainer.textTranscript);
            parentNode.appendChild(domContainer.print);
            // parentNode.appendChild(domContainer.structure);


          };
        })();




        /**
         * Some initialisation tasks.
         *
         * - find metadata for current state.doc
         * - initialize HTML -> createDomNodes
         * - load XML metadata -> structure view
         * - update state.page
         * - go to initial page
         * - go to initial view
         */
        return function init() {

            state.fromLocation();
            state.initMetadata(); // FIXME refactor

          document.title = document.title + " – " + state.doc.sigil;

          // create elements that will contain the available views
          createDomNodes(parentDomNode);

          // FIXME temporary way of initializing this:
          structureView.init(parentDomNode, state, controller);
          domContainer.structure = structureView.container;

          // facsimile and documentary transcript can exist for every page of a witness. set view to
          // current page and try to load related files (if not already done)
          setPage(state.page);

          // if a view parameter was set in get request, use it. otherwise use the preset
          // default-value from state.view (currently 'facsimile'-view)
          setView(state.view);

          // init tooltips for the navigation bar
          Faust.tooltip.addToTooltipElementsBySelector(".navigation-bar-container [title]", "title");

        };
      })();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Load print and app view for the current document and the given page number.
       * pageNum – current page number
       * callback – function({print: divWithPrintHTML, app: divWithAppHTML})
       */
      var loadTextTranscript = function loadTextTranscript(pageNum, callback) {
          var loadedDocs = {};

          try {

              // load actual transcript html files and trigger callback
              var loadDocs = function(filename) {
                  // if no html files are associated, return undefined
                  if(filename === undefined) {
                      callback(undefined);
                  } else {
                      // return files if already loaded
                      if(loadedDocs[filename] !== undefined) {
                          callback(loadedDocs[filename]);
                      } else {
                          // otherwise load files
                          Faust.xhr.getResponseText("print/" + filename, function(printFile) {
                              loadedDocs[filename] = {};
                              loadedDocs[filename].print = createPrintDiv(printFile);
                              Faust.xhr.getResponseText("app/" + filename, function(appFile) {
                                  loadedDocs[filename].app = createPrintDiv(appFile);
                                  callback(loadedDocs[filename]);
                              });
                          });
                      }
                  }
              };

              loadDocs(state.doc.findSection(pageNum));


              // FIXME we can probably just remove this if we generate the embedded view right away in the XSLTs
              // returns a <div> containing the given print state.doc to be inserted into the document.
              // printString = unparsed HTML of app / print view
              var createPrintDiv = function(printString) {
                  // create container element for the text and add print class to it
                  var printParentNode = document.createElement("div");
                  printParentNode.className = "print pure-g-r center";
                  printParentNode.style.textAlign = "initial";
                  printParentNode.style.paddingTop = "1em";

                  // create temporary div to parse received html
                  var tempDiv = document.createElement("div");
                  tempDiv.innerHTML = printString;

                  // add contents of parsed html to container element and hide rightmost column
                  Array.prototype.slice.call(tempDiv.getElementsByClassName("print")[0].childNodes).forEach(function(child) {
                      printParentNode.appendChild(child);
                  });

                  return printParentNode;
              };
          } catch (e) {
              Faust.error("Fehler beim Laden des Textuellen Transkripts.", e);
          }
      };

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      /* function to get the scene title and the range of verse lines that the
       * scene spans. used to determine breadcrumbs content.
       *
       * information from genetic_bar_graph.js and scene_line_mapping.js are used
       * to determine the result.
       *
       * args: faustUri and page
       * returns: verse number or undefined
       *
       * FIXME similar code is in Faust.genesisBreadcrumbData
       */
      var getSceneData = function(faustUri, pageNum) {
        var result = undefined;

        var barData;
        var pageIntervals;
        var minInterval = -1;

        // get a specific witness from geneticBarGraphData
        barData = geneticBarGraphData.reduce(function(prev, curr) {
          if(curr.source === faustUri) {
            prev.push(curr);
          }
          
          return prev;
        }, []);

        // if the witness in question was found...
        if(barData.length === 1) {
          // ..extract the intervals that correspond to the given page number
          pageIntervals = barData[0].intervals.filter(function(interval) {
            return interval.page === pageNum;
          });

          // find the lowest intervals range start
          pageIntervals.forEach(function(interval) {
            if(interval.start !== undefined && (minInterval === -1 || interval.start < minInterval)) {
              minInterval = interval.start;
            }
          });

          // try to get scene name and range if an interval was found
          if(minInterval !== -1) {
            result = minInterval
          }
        }
        
        // return undefined or matched mapping object
        return result;
      };

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Marks the current position in the given textual fragment.
       *
       * Current position comes from the given page and possibly from
       * the current state's .fragment part, and the target is revealed
       * and highlighted.
       *
       * @param doc HTML fragment (from textual transcript)
       * @param pageNum current page number
       */
     var revealState = function revealState(doc, pageNum) {
        if(doc.querySelector("#dt" + pageNum) !== null) {
          doc.querySelector("#dt" + pageNum).scrollIntoView();
        }
        if (state.fragment) {
          var currentTarget = doc.querySelector("#" + state.fragment.replace(/\./g, '\\.'));
          if (currentTarget) {
            currentTarget.scrollIntoView();
            currentTarget.classList.add("target");
          }
        }
     };

      /* function to load page-specific files and generate the appropriate views. if a page was loaded before only use cached
         data to prevent multiple loading of same resources
       */
      var loadPage = function loadPage(pageNum) {
          var currentMetadata;
          var verseNo;

          // replace window location with current parameters
          state.toLocation();

          // update the PDF button (DEBUG)
          try {
              var pdfButton = document.getElementById('diplomatic-pdf-button'),
                  debugButton = document.getElementById('diplomatic-debug-button');
              pdfButton.removeAttribute('disabled');
              pdfButton.href = state.doc.faustUri.replace(/^faust:\/\/xml\/document/, 'transcript/diplomatic') + '/page_' + state.page + '.pdf';
              debugButton.removeAttribute('disabled');
              debugButton.href = "debug.html" + window.location.search;
          } catch (e) {
              // no PDF button -> NOP
              console.log(e);
          }

          // set breadcrumbs

          // get breadcrumbs element
          var breadcrumbs = document.getElementById("breadcrumbs");

          // remove all breadcrumbs (if exist)
          Faust.dom.removeAllChildren(breadcrumbs);
          var repository = state.doc.faustMetadata.sigils.repository;
          breadcrumbs.appendChild(Faust.createBreadcrumbs([
              {caption: "Archiv", link: "archive"},
              {caption: archives[repository].name, link: "archive_locations_detail?id=" + repository},
              {caption: state.doc.sigil}]));

          // get information about scene that contains current page
          verseNo = getSceneData(state.doc.faustUri, pageNum);

          // set second breadcrumb to barGraph if a matching scene was found
          if(verseNo !== undefined) {
              breadcrumbs.appendChild(document.createElement("br"));
              var breadcrumbData = Faust.genesisBreadcrumbData(verseNo, verseNo, false);
              breadcrumbData.push({caption: state.doc.sigil});
              breadcrumbs.appendChild(Faust.createBreadcrumbs(breadcrumbData));
          }


          // create object for page if not already done yet
          if(!state.doc.pages[pageNum - 1]) {
              state.doc.pages[pageNum - 1] = {
                  facsimile: null,
                  facsimile_document: null,
                  docTranscript: null,
                  document_text: null,
                  textTranscript: null,
                  print: null
              };
          }

          // create variable for easier access to the current page
          var currentPage = state.doc.pages[pageNum - 1];

          var docTranscriptViewer = createDocTranscriptView(domContainer.docTranscript, state, controller);

          // ############## Facsimile View
          imageOverlay(domContainer.facsimile, state, controller);

          // ######### Facsimile | Documentary Transcript parallel view
          if(currentPage.facsimile_document === null) {
              // combined viewer framework:
              var facsimileDocTranscriptContainer = Faust.dom.createElement({name: "div", class: "viewer viewer-container"});
              var facsimileContainer = Faust.dom.createElement({name: "div", parent: facsimileDocTranscriptContainer, class: "viewer half-viewer"});
              var docTranscriptContainer = Faust.dom.createElement({name: "div", parent: facsimileDocTranscriptContainer, class: "viewer half-viewer"});

              Faust.dom.removeAllChildren(domContainer.facsimile_document);
              domContainer.facsimile_document.appendChild(facsimileDocTranscriptContainer);
              currentPage.facsimile_document = facsimileDocTranscriptContainer;

              imageOverlay(facsimileContainer, state, controller);
              createDocTranscriptView(docTranscriptContainer, state, controller);

          } else {  // cached view already exists
              Faust.dom.removeAllChildren(domContainer.facsimile_document);
              domContainer.facsimile_document.appendChild(currentPage.facsimile_document);
          }

          // ############ Document Transcript | Textual Transcript (Apparatus) parallel view
          if(currentPage.document_text === null) {


              var documentTextContainer = Faust.dom.createElement({name: "div", class: "viewer viewer-container dbg-documentTextContainer"});
              var documentContainer = Faust.dom.createElement({name: "div", parent: documentTextContainer, class: 'viewer half-viewer dbg-documentContainer'});
              var textContainer = Faust.dom.createElement({name: "div", parent: documentTextContainer, class: 'viewer half-viewer dbg-textContainer'});

              documentTextContainer.textContainer = textContainer;

              currentPage.document_text = documentTextContainer;
              currentMetadata = state.doc.metadata.pages[pageNum - 1];

              Faust.dom.removeAllChildren(domContainer.document_text);
              domContainer.document_text.appendChild(documentTextContainer);

              createDocTranscriptView(documentContainer, state, controller);

              // load app into textual view of the state.doc|text parallel view
              loadTextTranscript(pageNum, function(text) {
                  if(text !== undefined) {  // textual transcript has been found
                      var appText = text.app; // .cloneNode(true);
                      currentPage.document_text.textContainer.appendChild(appText);
                      addPrintInteraction("", appText, state.doc.faustUri);
                      revealState(domContainer.document_text, pageNum);
                  } else {
                      currentPage.document_text.textContainer.innerHTML = contentHtml.missingTextTranscript;
                  }
              });

          } else {  // currentPage.documentText !== null, i.e. parallel view already initialized
              Faust.dom.removeAllChildren(domContainer.document_text);
              domContainer.document_text.appendChild(currentPage.document_text);

              revealState(domContainer.document_text, pageNum);

              // FIXME this doesn't handle when we switch pages across document boundaries, does it?
              // if(domContainer.document_text.querySelector("#dt" + pageNum) !== null) {
              //  domContainer.document_text.querySelector("#dt" + pageNum).scrollIntoView();
              // }
          }


          // ############## Textual Transcript (app) single view
          if(currentPage.textTranscript === null) {
              // should we rather reuse the whole container document for the
              // page? Ideally, we wouldn't redraw the page on a switch to a new
              // page that is already displayed.
              var textTranscriptContainer = Faust.dom.createElement({name: "div", class: "viewer full-viewer"});

              currentPage.textTranscript = textTranscriptContainer;
              Faust.dom.removeAllChildren(domContainer.textTranscript);
              domContainer.textTranscript.appendChild(textTranscriptContainer);

              loadTextTranscript(pageNum, function(text) {
                  if(text !== undefined) {
                      var appText = text.app; //.cloneNode(true);
                      currentPage.textTranscript.appendChild(appText);
                      addPrintInteraction("", appText, state.doc.faustUri);
                      revealState(domContainer.textTranscript, pageNum);
                  } else {
                      currentPage.textTranscript.innerHTML = contentHtml.missingTextAppTranscript;
                  }
              });
          } else { // currentPage.textTranscript !== null
              // TODO check whether we're already on the right section
              Faust.dom.removeAllChildren(domContainer.textTranscript);
              domContainer.textTranscript.appendChild(currentPage.textTranscript);
              revealState(domContainer.textTranscript, pageNum);
          }

          // ############# Print (variant apparatus) single view
          if(currentPage.print === null) {
              var printContainer = Faust.dom.createElement({name: "div", class: "viewer full-viewer"});

              currentPage.print = printContainer;
              Faust.dom.removeAllChildren(domContainer.print);
              domContainer.print.appendChild(printContainer);

              loadTextTranscript(pageNum, function(text) {
                  if(text !== undefined) {
                      var printText = text.print; // .cloneNode(true);
                      currentPage.print.appendChild(printText);
                      addPrintInteraction("", printText, state.doc.faustUri);
                      revealState(domContainer.print, pageNum);
                  } else { // no textual transcript found
                      currentPage.print.innerHTML = contentHtml.missingTextTranscript;
                  }
              });
          } else { // currentPage.print !== null
              Faust.dom.removeAllChildren(domContainer.print);
              domContainer.print.appendChild(currentPage.print);
              revealState(domContainer.print, pageNum);
          }

          // finally set correct page on structure view
          if(state.doc.structure !== undefined) {
              state.doc.structure.setLockedGroup(pageNum);
          }

          events.triggerEvent("pageLoaded", pageNum);
      };

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Page manipulation
      // set new page to view. if new page number is out ouf range (<1 or >pages in document), the closest
      // number to a allowed page is used
      var setPage = function setPage(newPage) {
          if(newPage < 1) {
            newPage = 1;
          } else if(newPage > state.doc.pageCount) {
            newPage = state.doc.pageCount;
          }
          state.page = newPage;
          loadPage(newPage);

          return state.page;
      };

      var getPageCount = function getPageCount() {
          return state.doc.pageCount;
      };

      /** try to switch to page current+by */
      var browsePage = function browsePage(by) {
        for (var page = state.page + by; 0 < page && page <= state.doc.pageCount; page += by) {
          var pageMd = state.doc.metadata.pages[page-1];
          if (pageMd !== undefined 
              && pageMd.docTranscriptCount > 0
              && pageMd.docTranscripts[0].hasImages)
            return setPage(page);
        }
        return setPage(state.page);
      };

      // switch to next page
      var nextPage = function nextPage() {
          return browsePage(+1);
      };

      // switch to previous page
      var previousPage = function previousPage() {
          return browsePage(-1);
      };

      // return the number of the page currently in view
      var getCurrentPage = (function(){
        return function() {
          return state.page;
        };
      })();

      // return the view that is currently shown
      var getCurrentView = function getCurrentView() {
          return state.view;
      };

// view manipulation
      // set the view of the current selected page. if the new page value is not a valid mode
      // or the view is the same as the one currently shown, nothing happens
      var setView = function setView(newView){
          var oldView = state.view;

          // Test if the given view mode is available. if not then don't change view
          viewModes.forEach(function(viewMode) {
            if(newView === viewMode && newView !== state.view) {
              state.view = newView;
            }
          });

          // set all views to display none FIXME that array is somewhere above
          ["facsimile", "facsimile_document", "docTranscript", "document_text", "textTranscript", "print", "structure"].forEach(function(view) {
            domContainer[view].style.display = "none";
          });

          // set selected view to block
          if(state.view === "facsimile") {
            domContainer.facsimile.style.display = "block";
            // if the page was first opened in a view that is not facsimile view, then no
            // scale has been set and the image would load in full size without tiles.
            // so on first switch to facsimile view set the facsimile to fit the page
            if(state.scale === undefined && oldView !== "facsimile") {
              state.doc.pages[state.page - 1].facsimile.fitScale();
            }
          } else if (state.view === "facsimile_document") {
            domContainer.facsimile_document.style.display = "block";
            if(state.doc.pages[state.page -1].facsimile_document.metadataLoaded === true && state.doc.pages[state.page -1].facsimile_document.pageFitted !== true) {
              state.doc.pages[state.page - 1].facsimile_document.facsimileParallel.fitScale();
            }
          } else if (state.view === "document") {
            domContainer.docTranscript.style.display = "block";
          } else if (state.view === "document_text") {
            domContainer.document_text.style.display = "block";
            revealState(domContainer.document_text, state.page);
            //if(domContainer.document_text.querySelector("#dt" + state.page) !== null) {
              //domContainer.document_text.querySelector("#dt" + state.page).scrollIntoView();
            //}
          } else if (state.view === "text") {
            domContainer.textTranscript.style.display = "block";
            revealState(domContainer.textTranscript, state.page);
            //if(domContainer.textTranscript.querySelector("#dt" + state.page) !== null) {
              //domContainer.textTranscript.querySelector("#dt" + state.page).scrollIntoView();
            //}
          } else if (state.view === "print") {
            domContainer.print.style.display = "block";
            revealState(domContainer.print, state.page);
            //if(domContainer.print.querySelector("#dt" + state.page) !== null) {
              //domContainer.print.querySelector("#dt" + state.page).scrollIntoView();
            //}
          } else if (state.view === "structure") {
            domContainer.structure.style.display = "table";
          }

          // set active button
          Array.prototype.slice.call(document.querySelectorAll(".navigation-bar-content .pure-button")).forEach(function(button) {
            if(button.id !== "toggle-overlay-button") {
              Faust.dom.removeClassFromElement(button, "pure-button-primary");
              if(button.id === "show-" + state.view + "-button") {
                Faust.dom.addClassToElement(button, "pure-button-primary");
              }
            }
          });

          state.toLocation();

          events.triggerEvent("viewChanged", state.view);

          return state.view;
      };

      // facsimile zooming functions
      var zoomIn = function zoomIn() {
          if(state.view === "facsimile") {
            state.doc.pages[state.page - 1].facsimile.zoom("in");
          } else if (state.view === "facsimile_document") {
            state.doc.pages[state.page - 1].facsimile_document.facsimileParallel.zoom("in");
          }
      };

      var zoomOut = function zoomOut() {
          if(state.view === "facsimile") {
            state.doc.pages[state.page - 1].facsimile.zoom("out");
          } else if (state.view === "facsimile_document") {
            state.doc.pages[state.page - 1].facsimile_document.facsimileParallel.zoom("out");
          }
      };

      // facsimile rotation functions
      var rotateLeft = function rotateLeft() {
          state.doc.pages[state.page - 1].facsimile.rotate("left");
          state.doc.pages[state.page - 1].facsimile_document.facsimileParallel.rotate("left");
      };

      var rotateRight = function rotateRight() {
          state.doc.pages[state.page - 1].facsimile.rotate("right");
          state.doc.pages[state.page - 1].facsimile_document.facsimileParallel.rotate("right");
      };

// toggle view of overlay
      var toggleOverlay = function toggleOverlay() {
          if(state.showOverlay === true) {
            state.showOverlay = false;
            Faust.dom.removeClassFromElement(document.getElementById("toggle-overlay-button"), "pure-button-primary");
          } else {
            state.showOverlay = true;
            Faust.dom.addClassToElement(document.getElementById("toggle-overlay-button"), "pure-button-primary");
          }
          if(state.doc.pages[state.page - 1]) {
            state.doc.pages[state.page - 1].facsimile.showOverlay(state.showOverlay);
            state.doc.pages[state.page - 1].facsimile_document.facsimileParallel.showOverlay(state.showOverlay);
          }
      };


// initialisation -> this is the actual createDocumentViewer() function
      return (function(){
      
        init();

        // Create export functions to use on viewer instance from outside
        var viewer = {
          setPage: setPage,
          nextPage: nextPage,
          previousPage: previousPage,
          getCurrentPage: getCurrentPage,
          getPageCount: getPageCount,
          getCurrentView: getCurrentView,

          setView: setView,
          toggleOverlay: toggleOverlay,
          zoomIn: zoomIn,
          zoomOut: zoomOut,
          rotateLeft: rotateLeft,
          rotateRight: rotateRight,
          addViewerEventListener: events.addEventListener
        };

      return viewer;
    })();
  };
});
