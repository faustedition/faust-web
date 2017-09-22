define(['faust_common', 'faust_structure', 'faust_image_overlay', 'faust_print_interaction', 'faust_app',
        'data/scene_line_mapping', 'data/genetic_bar_graph', 'data/copyright_notes', 'data/archives', 'data/document_metadata'],
  function(Faust, documentStructure, imageOverlay, addPrintInteraction, app,
         sceneLineMapping, geneticBarGraphData, copyright_notes, archives, faustDocumentsMetadata) {
  "use strict";


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
              }
          }
      };

      // allow other objects to listen to events
      var events = Faust.event.createEventQueue();


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


          var structureView = {

              /**
               * Builds the following structure:
               *
               * @param parentNode
               * @returns {structureView}
               * @private
               */
              _initHtmlFrame: function _initHtmlFrame(parentNode) {
                  this.parentNode = parentNode;

                  // create structure element // FIXME adjust to new viewer
                  var structure = document.createElement("div");
                  structure.id = "structureContainer";
                  structure.className = "structure-container view-content";

                  this.container = structure;
                  this.parentNode.appendChild(this.container);

                  // create elements for previews
                  var previewDiv = document.createElement("div");
                  previewDiv.id = "previewDiv";
                  previewDiv.className = "preview-div";

                  var leftPagePreview = document.createElement("div");
                  leftPagePreview.id = "leftPreviewDiv";
                  leftPagePreview.className = "left-page-preview facsimile-preview";
                  previewDiv.appendChild(leftPagePreview);
                  this.leftPreview = leftPagePreview;

                  var rightPagePreview = document.createElement("div");
                  rightPagePreview.id = "rightPreviewDiv";
                  rightPagePreview.className = "right-page-preview facsimile-preview";
                  previewDiv.appendChild(rightPagePreview);
                  this.rightPreview = rightPagePreview;
                  this.previewDiv = previewDiv;

                  // create dom elements for structure display
                  var structureDiv = document.createElement("div");
                  structureDiv.id = "structureDiv";
                  structureDiv.className = "structure-div";
                  this.structureDiv = structureDiv;

                  // create svg image of document structure
                  var structureSvgDiv = document.createElement("div");
                  structureSvgDiv.id = "structureSvgDiv";
                  structureSvgDiv.className = "structure-svg-div";
                  this.structureSvgDiv = structureSvgDiv;
                  this.structureDiv.appendChild(structureSvgDiv);

                  this.metadataDiv = Faust.dom.createElement({name: "div", id: "metadataDiv", class: "metadata-div"});

                  return this;
              },

              _insertFinishedHtml: function () {

                  // TODO check timing: do we need the view containers before all views have been loaded?
                  this.container.appendChild(this.previewDiv);
                  this.container.appendChild(this.structureDiv);
                  this.container.appendChild(this.metadataDiv);


                  // set current active page on structure view
                  this.structureSvg.setLockedGroup(state.page);

                  // XXX Was soll DAS HIER???
                  // Es bewirkt offenbar die Scrollbarkeit, aber wieso?
                  // metadataDiv.firstElementChild.style.height = parentDomNode.offsetHeight + "px";
                  this.structureDiv.firstElementChild.style.height = this.parentNode.offsetHeight + "px";
                  this.metadataDiv.firstElementChild.style.height = this.parentNode.offsetHeight + "px";
                  this.structureDiv.firstElementChild.style.height = this.parentNode.offsetHeight + "px";
                  window.addEventListener("resize", function() {
                      this.metadataDiv.firstElementChild.style.height = this.parentNode.offsetHeight + "px";
                      this.structureDiv.firstElementChild.style.height = this.parentNode.offsetHeight + "px";
                  });


                  return this;
              },

              init: function init(parent) {
                  var that = this;
                  var baseName = state.doc.metadata.documentUri.replace(/^.*\/(\S+)\.xml/, '$1');

                  this._initHtmlFrame(parent);

                  return Promise.all([
                      // structure
                      Faust.xhr.get("xml/document/" + state.doc.metadata.documentUri, "xml")
                          .then(function (documentXmlMetadata) {
                              var structureSvg = documentStructure.createFromXml(documentXmlMetadata);
                              state.doc.structure = structureSvg; // FIXME refactor cache?
                              that.structureSvgDiv.appendChild(structureSvg);
                              that.structureSvg = structureSvg;
                          })
                          .catch(function (err) {
                              Faust.error("Error loading structure", err, that.container)
                          }),

                      // metadata html
                      Faust.xhr.get("meta/" + baseName + '.html', 'text')
                          .then(function (documentHtml) {
                              that.metadataDiv.innerHTML = documentHtml;
                              // that.metadataDiv.firstElementChild.style.height = parentDomNode.offsetHeight + "px"; FIXME when we know that offset?
                          })
                          .catch(function (err) {
                              Faust.error("Error loading metadata", err, that.metadataDiv)
                          })
                  ])
                      .then(function() { that.setupInteraction(); })
                      .then(function() { that._insertFinishedHtml(); })
                      .catch(function(err) {
                          Faust.error("Error loading structure view", err, that.container)
                      })
              },


              // create div when no image is available. a div is created every time because if there is
              // only one div with a message it can only be added to one dom element - which is a
              // problem when both pages are without an image (only one message would be shown)
              // creating two divs would impose additional management to get the right div and this would
              // be uselessly more complex since creating a simple div is extremly fast in browsers.
              //
              // If there is no facsimile (display of first and last page) don't add text
              createMissingPreviewDiv : function createMissingPreviewDiv(facsimileMissing) {
                  var missingPreviewDiv = document.createElement("div");
                  if(facsimileMissing === true) {
                      missingPreviewDiv.appendChild(document.createTextNode("Kein Faksimile verfügbar"));
                  }
                  return missingPreviewDiv;
              },


              // function used to get preview images. this function is used so that images once loaded
              // will be buffered so that images are downloaded once and only once (chrome would buffer
              // images by itself but firefox would reload images every single time - not suitable when
              // listening to mousemove ;)
              // When there is no preview image for a requested image a div with a message will be returned

              // actual function assigned to getPreviewElement. if no uri is given a div with a message
              // is created.
              // else it is tried to load a previously generated img element for that uri. if that doesn't exist
              // create a new one and add to list of created img's
              previewCache: {},
              getPreviewElement: function getPreviewElement(uri) {
                  var img;

                  // create message div if no image was given
                  if(uri === undefined) {
                      return this.createMissingPreviewDiv(false);
                  } else if (uri === "noFacsimile") {
                      return this.createMissingPreviewDiv(true);
                  } else if (this.previewCache.hasOwnProperty(uri) === true) {
                      return this.previewCache[uri];
                  } else {
                      // else create new image
                      img = document.createElement("img");
                      img.setAttribute("alt", "Faksimile wird geladen");
                      img.setAttribute("src", uri);
                      this.previewCache[uri] = img;
                      return img;
                  }
              },

              // set a preview of a facsimile. the preview will be appended to the given parent (preview
              // container) according to the given page number. the page number is used to get the image
              // uri from the document's metadata
              setPreviewElement: function(parent, pageNum) {
                  var pageUri;

                  // remove contaier content / parent element's children
                  Faust.dom.removeAllChildren(parent);

                  // try to get a uri from document's metadata and load the preview image. else create a message
                  // to inform about a missing preview
                  if( pageNum !== undefined ) {
                      if( (state.doc.metadata.pages[pageNum - 1].hasDocTranscripts) && (state.doc.metadata.pages[pageNum - 1].docTranscripts[0].hasImages) ) {
                          // load existing preview image
                          pageUri = state.doc.metadata.pages[pageNum - 1].docTranscripts[0].images[0].jpgUrlBase + "_preview.jpg";
                          parent.appendChild(this.getPreviewElement(pageUri));
                      } else {
                          // no facsimile exists - display info
                          parent.appendChild(this.getPreviewElement("noFacsimile"));
                      }
                  } else {
                      // empty page with no pageNum (before first page or after last page). Don't display anything
                      parent.appendChild(this.getPreviewElement(undefined));
                  }

                  // set pageNum of displayed facsimile to parent container
                  parent.pageNum = pageNum;

                  // set the visibility og the appended image to visible. if image was buffered and shown before
                  // it might have visibility set to hidden
                  parent.firstElementChild.style.visibility = "visible";
              },

              setupInteraction: function () {
                  var that = this;

                  var structurePagePreviewHandler = function(pages) {
                      that.setPreviewElement(that.leftPreview, pages.left);
                      that.setPreviewElement(that.rightPreview, pages.right);
                  };

                  // on mousemove or mouseenter load the preview images of the pages beneath the cursor
                  this.structureSvg.addStructureEventListener("mouseenter", structurePagePreviewHandler);
                  this.structureSvg.addStructureEventListener("mousemove", structurePagePreviewHandler);

                  // when leaving the rect symbolising two pages hide the previously shown images
                  this.structureSvg.addStructureEventListener("mouseleave", function(){
                      that.leftPreview.firstElementChild.style.visibility = "hidden";
                      that.rightPreview.firstElementChild.style.visibility = "hidden";
                  });

                  // if a user clicks on a rect the selected pages should be locked. that is when
                  // the mouse leaved the image symbolising the whole document structure the
                  // selected pages must be shown
                  this.structureSvg.addStructureEventListener("structureLockedGroupChange", function(pages){
                      that.lockedPages = pages;
                      structurePagePreviewHandler(pages);
                  });

                  // if the mouse leaved the document's structure view (not only a rect visualising
                  // two pages) than the mouse is above no page and thus the preview images should
                  // be hidden.
                  // If a user previously clicked on a pagesRect than these two pages must be shown
                  // as preview images
                  this.structureSvg.addStructureEventListener("rectGroupLeave", function(){
                      that.leftPreview.firstElementChild.style.visibility = "hidden";
                      that.rightPreview.firstElementChild.style.visibility = "hidden";

                      if(that.lockedPages !== undefined) {
                          that.setPreviewElement(that.leftPreview, that.lockedPages.left);
                          that.setPreviewElement(that.rightPreview, that.lockedPages.right);
                      }
                  });

                  this.structureSvg.addStructureEventListener("click", function(pages){
                      if(pages.left !== undefined) {
                          that.structureSvg.setLockedGroup(pages.left);
                          setPage(pages.left);
                      } else if (pages.right !== undefined) {
                          that.setLockedGroup(pages.right);
                          setPage(pages.right);
                      }
                  });

                  // if a user clicks on a facsimile page, go to the relevant pages in the facsimile view
                  var previewClickHandler = function () {
                    if (this.pageNum !== undefined) {
                        setPage(this.pageNum);
                        setView("facsimile");
                    }
                  }

                  this.leftPreview.addEventListener("click", previewClickHandler);
                  this.rightPreview.addEventListener("click", previewClickHandler);

                  return this;
              }


          };


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
          structureView.init(parentDomNode);
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





/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Load print and app view for the current document and the given page number.
       * pageNum – current page number
       * callback – function({print: divWithPrintHTML, app: divWithAppHTML})
       */
      var loadTextTranscript = function loadTextTranscript(pageNum, callback) {
          var loadedDocs = {};

          try {

              // finds the section filename for the given pageNum. Requires state.doc.printLinks
              // TODO write this info directly into the document metadata.
              var findSection = function findSection(pageNum) {
                  var printLinks = state.doc.printLinks,
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
              };

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

              // load pages.json and call loadDocs if required
              if(state.doc.printLinks !== undefined) {
                  // try to load documents if pageNum / filename mappings were already loaded
                  loadDocs(findSection(pageNum));
              } else {
                  // otherwise get json file with page / filename mappings
                  Faust.xhr.getResponseText("print/pages.json", function(pagesJson) {
                      var pages;
                      // parse json file ...
                      try {
                          pages = JSON.parse(pagesJson);
                          // ... and extract information for current witness
                          state.doc.printLinks = pages[state.doc.faustUri];
                          //
                          // try to load document for current page
                          loadDocs(findSection(pageNum));
                      } catch (e) {
                          Faust.error("Fehler beim Laden des Dokuments", e);
                      }
                  });
              }

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

      /**
       * Make patches transparent on mouse hover.
       */
     var addPatchHandlers = function addPatchHandlers(targetElement) {
          var patches = targetElement.getElementsByClassName("element-patch");
          for (var i = 0; i < patches.length; i++) {
            patches[i].addEventListener("mouseenter", function() {
              for (var i = 0; i < patches.length; i++) {
                Faust.dom.addClassToElement(patches[i], 'patch-transparent');
              }
            });
            patches[i].addEventListener("mouseleave", function() {
              for (var i = 0; i < patches.length; i++) {
                Faust.dom.removeClassFromElement(patches[i], 'patch-transparent');
              }
            });
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

          // find out if documentary transcript was loaded before
          if(currentPage.docTranscript === null) {
              // try to load docTranscript if it wasn't loaded before
              loadDocTranscript(pageNum);
          } else {
              // if the documentary transcript already exists append it to its view
              Faust.dom.removeAllChildren(domContainer.docTranscript);
              domContainer.docTranscript.appendChild(currentPage.docTranscript);
          }

          // ############## Facsimile View
          if(currentPage.facsimile === null) {
              currentMetadata = state.doc.metadata.pages[pageNum - 1];

              var facsimile = null;
              // only load facsimile if images do exist. images are encoded in docTranscripts, so check if
              // docTranscript exists and if it has images attached
              if(currentMetadata.hasDocTranscripts === true && currentMetadata.docTranscripts[0].hasImages) {
                  facsimile = imageOverlay.createImageOverlay(
                      {
                          "hasFacsimile": currentMetadata.docTranscripts[0].hasImages,
                          "hasImageTextLink": currentMetadata.docTranscripts[0].hasImageTextLink,
                          "imageMetadataUrl": currentMetadata.docTranscripts[0].images[0].metadataUrl,
                          "jpgBaseUrl": currentMetadata.docTranscripts[0].images[0].jpgUrlBase,
                          "tileBaseUrl": currentMetadata.docTranscripts[0].images[0].tileUrlBase,
                          "overlayUrl": currentMetadata.docTranscripts[0].facsimileOverlayUrl,
                          "backgroundZoomLevel":  state.imageBackgroundZoomLevel,
                          "copyright": state.doc.getFacsCopyright()
                      });
              } else {
                  facsimile = imageOverlay.createImageOverlay({"hasFacsimile": false});
              }
              currentPage.facsimile = facsimile;
              Faust.dom.removeAllChildren(domContainer.facsimile);
              domContainer.facsimile.appendChild(facsimile);
              facsimile.addFacsimileEventListener("scaleChanged", function(newScale){state.scale = newScale;});

              if(state.scale === undefined) {
                  facsimile.addFacsimileEventListener("metadataLoaded", function(){state.scale = currentPage.facsimile.fitScale();});
                  facsimile.addFacsimileEventListener("overlayLoaded", function(){currentPage.facsimile.showOverlay(state.showOverlay); transcriptTooltips(currentPage.facsimile);});
              } else {
                  facsimile.addFacsimileEventListener("metadataLoaded", function(){currentPage.facsimile.setScale(state.scale);});
                  facsimile.addFacsimileEventListener("overlayLoaded", function(){currentPage.facsimile.showOverlay(state.showOverlay); transcriptTooltips(currentPage.facsimile);});
              }
          } else {
              Faust.dom.removeAllChildren(domContainer.facsimile);
              currentPage.facsimile.showOverlay(state.showOverlay);
              domContainer.facsimile.appendChild(currentPage.facsimile);
              currentPage.facsimile.setScale(state.scale);
          }

          // ######### Facsimile | Documentary Transcript parallel view
          if(currentPage.facsimile_document === null) {
              // combined viewer framework:
              var facsimileDocTranscriptContainer = Faust.dom.createElement({name: "div", class: "viewer viewer-container"});
              var facsimileContainer = Faust.dom.createElement({name: "div", parent: facsimileDocTranscriptContainer, class: "viewer half-viewer"});
              var docTranscriptContainer = Faust.dom.createElement({name: "div", parent: facsimileDocTranscriptContainer, class: "viewer half-viewer"});

              Faust.dom.removeAllChildren(domContainer.facsimile_document);
              domContainer.facsimile_document.appendChild(facsimileDocTranscriptContainer);

              currentPage.facsimile_document = facsimileDocTranscriptContainer;
              currentMetadata = state.doc.metadata.pages[pageNum - 1];

              // copypaste from facsimile view above:
              var facsimileParallel = null;
              // only load facsimile if images do exist. images are encoded in docTranscripts, so check if
              // docTranscript exists and if it has images attached
              if(currentMetadata.hasDocTranscripts === true && currentMetadata.docTranscripts[0].hasImages) {
                  facsimileParallel = imageOverlay.createImageOverlay(
                      {
                          "hasFacsimile": currentMetadata.docTranscripts[0].hasImages,
                          "hasImageTextLink": currentMetadata.docTranscripts[0].hasImageTextLink,
                          "imageMetadataUrl": currentMetadata.docTranscripts[0].images[0].metadataUrl,
                          "jpgBaseUrl": currentMetadata.docTranscripts[0].images[0].jpgUrlBase,
                          "tileBaseUrl": currentMetadata.docTranscripts[0].images[0].tileUrlBase,
                          "overlayUrl": currentMetadata.docTranscripts[0].facsimileOverlayUrl,
                          "backgroundZoomLevel":  state.imageBackgroundZoomLevel,
                          "copyright": state.doc.getFacsCopyright()
                      });
              } else {
                  facsimileParallel = imageOverlay.createImageOverlay({"hasFacsimile": false});
              }

              currentPage.facsimile_document.facsimileParallel = facsimileParallel;
              facsimileContainer.appendChild(facsimileParallel);

              // scale the facsimile so that it fits the available space. Would be maximum scale otherwise.
              facsimileParallel.addFacsimileEventListener("metadataLoaded", function(){
                  currentPage.facsimile_document.metadataLoaded = true;
                  if(domContainer.facsimile_document.style.display === "block") {
                      currentPage.facsimile_document.facsimileParallel.fitScale();
                      currentPage.facsimile_document.pageFitted = true;
                  }
              });
              facsimileParallel.addFacsimileEventListener("overlayLoaded", function(){facsimileParallel.showOverlay(state.showOverlay); transcriptTooltips(facsimileParallel);});

              // for doctranscript, clone the ex. view when it's loaded
              events.addEventListener("docTranscriptPage" + pageNum + "Loaded", function() {
                  docTranscriptContainer.appendChild(currentPage.docTranscript.cloneNode(true));
                  addPatchHandlers(docTranscriptContainer);
                  transcriptTooltips(docTranscriptContainer);
              });

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

              events.addEventListener("docTranscriptPage" + pageNum + "Loaded", function() {
                  documentContainer.appendChild(currentPage.docTranscript.cloneNode(true));
                  addPatchHandlers(documentContainer);
                  transcriptTooltips(documentContainer);
              });

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

      /* load textual transcript for a specific page. */
      var loadDocTranscript = function loadDocTranscript(pageNum) {
          if(!state.doc.metadata.pages[pageNum - 1].hasDocTranscripts) {
            docTranscriptLoadedHandler(contentHtml.missingDocTranscript, pageNum);
          } else {
            Faust.xhr.getResponseText(state.doc.metadata.pages[pageNum - 1].docTranscripts[0].docTranscriptUrl, function(responseText) { docTranscriptLoadedHandler(responseText, pageNum); } );
          }
      };

      var docTranscriptLoadedHandler = function(docTranscriptHtml, pageNum) {
          var docTranscriptDiv = document.createElement("div");
          docTranscriptDiv.style.margin = "auto";
          docTranscriptDiv.style.paddingTop = "1em";
          if(docTranscriptHtml) {
            docTranscriptDiv.innerHTML = docTranscriptHtml;
          } else {
            docTranscriptDiv.innerHTML = contentHtml.missingDocTranscript;
          }

          state.doc.pages[pageNum - 1].docTranscript = docTranscriptDiv;
          Faust.dom.removeAllChildren(domContainer.docTranscript);
          domContainer.docTranscript.appendChild(docTranscriptDiv);
          addPatchHandlers(domContainer.docTranscript);
          transcriptTooltips(domContainer.docTranscript);


          events.triggerEvent("docTranscriptPage" + pageNum + "Loaded");
      };

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

      // setup for the transcript tooltips.
      // XXX does this need to have its stuff inside a closure?
      var transcriptTooltips = (function() {

        // text replacements for classNames on elements
        var tooltipText = {
          "hand": {
            "hand-g": "Goethe",
            "hand-aj": "Anna Jameson",
            "hand-ec": "Eckermann",
            "hand-f": "Färber",
            "hand-gt": "Geist",
            "hand-gh": "Goechhausen",
            "hand-go": "Goettling",
            "hand-hd": "Herder",
            "hand-jo": "John",
            "hand-kr": "Kräuter",
            "hand-m": "Müller",
            "hand-ovg": "Ottilie von Goethe",
            "hand-re": "Reichel",
            "hand-ri": "Riemer",
            "hand-st": "Schuchardt",
            "hand-sd": "Seidler",
            "hand-so": "Soret",
            "hand-sp": "Spiegel",
            "hand-sta": "Stadelmann",
            "hand-sti": "Stieler",
            "hand-ve": "Varnhagen von Ense",
            "hand-v": "Helene Vulpius",
            "hand-we": "Weller",
            "hand-wi": "Maria Anna Katharina Theresia Willemer, genannt Marianne",
            "hand-wo": "Pius Alexander Wolff",
            "hand-avg": "August von Goethe",
            "hand-w-owvg": "Walther oder Wolfgang von Goethe",
            "hand-wvg": "Wolfgang von Goethe",
            "hand-sc": "Schreiberhand",
            "hand-zs": "zeitgenössische Schrift",
            "hand-xx": "fremde Hand #1",
            "hand-xy": "fremde Hand #2",
            "hand-xz": "fremde Hand #3"
          },
          "property": {
            "under": "überschrieben",
            "over": "daraufgeschrieben",
            "patch": "Aufklebung",
            "interline": "eingefügte Zeile",
            "inbetween": "Dazwischenschreibung",
            "gap": "nicht lesbar",
            "supplied": "editorische Ergänzung",
            "unclear-cert-high": "Unsichere Lesung (wahrscheinlich)",
            "unclear-cert-low": "Unsichere Lesung (vielleicht)",
            "used": "als erledigt markiert"
          },
          "text-decoration": {
            "text-decoration-type-underline": "Unterstreichung",
            "text-decoration-type-overline": "Überstreichung",
            "text-decoration-type-strikethrough": "Durchstreichung",
            "text-decoration-type-underdots": "Unterpungierung",
            "text-decoration-type-rewrite": "Fixierung",
            "text-decoration-type-erase": "Rasur"
          },
          "material": {
            "material-t": "Tinte",
            "material-tr": "rote/braune Tinte",
            "material-bl": "Bleistift",
            "material-ro": "Rötel",
            "material-ko": "Kohlestift",
            "material-blau": "blauer Bleistift"
          },
          "script": {
            "script-lat": "lateinische Schrift",
            "script-gr": "griechische Schrift"
          },
          "inline-decoration": {
            "inline-decoration-type-rect": "Einkästelung",
            "inline-decoration-type-circle": "Einkreisung"
          }
        };

        var appendClassSpecificElements = function appendClassSpecificElements(classNames, classType, node, linebreak) {
            var spanElement;
            classNames.forEach(function(className) {
              if(tooltipText[classType][className] !== undefined) {
                if(linebreak && node.childNodes.length !== 0) {
                  node.appendChild(document.createElement("br"));
                }
                spanElement = document.createElement("span");
                spanElement.className = "transcript-tooltip-" + classType + " transcript-tooltip-span";
                spanElement.appendChild(document.createTextNode(tooltipText[classType][className]));
                node.appendChild(spanElement);
              }
            });
        };

        return (function(){
          var textWrapperElements;
          var child;
          var childClasses;
          var childTooltipContent;
          var childTooltipBottom;

          var classTypesWriter = ["hand", "material", "script", "text-decoration", "inline-decoration", "property"];

          return function(elementNode) {
            // the information for tooltips is contained in elements with the assigned class text-wrapper.
            // the information can be derived by reading all children of text-wrapper 'elements' and replace them
            // with appropriate strings
            textWrapperElements = elementNode.getElementsByClassName("text-wrapper");
            // process every group with a text-wrapper class
            Array.prototype.slice.call(textWrapperElements).forEach(function(textWrapperElement) {
              // create the tooltip div and assign tooltip class
              childTooltipContent = document.createDocumentFragment();
              childTooltipBottom = document.createDocumentFragment();

              // each text-wrapper has a background rect with the same classes as the text element,
              // so it is skipped in the following steps. for every other element extract class names
              // and match them with the names that shall be used in the tooltip

              // go through every child of a g-element with the text-wrapper class
              Array.prototype.slice.call(textWrapperElement.childNodes).forEach(function(child) {

                // each text-wrapper has a 'rect'-element as first child. this is also the area
                // that shall react to the mouse-events. if another element is child of our group
                // it might catch mouse events result in not desired behaviour (e.g. only showing
                // tooltip when over a part of the group like a line under text). To mute all children
                // except the rect set their pointer-events to none
                if(child.tagName !== "rect") {
                  child.style.pointerEvents = "none";

                  // now extract all classes from the selected child and try to find a textual representation that
                  // shall be used in a tooltip
                  childClasses = child.className.baseVal.split(" ");
                  classTypesWriter.forEach(function(classType) {
                    if(classType === "hand") {
                      appendClassSpecificElements(childClasses, classType, childTooltipContent, true);
                    } else {
                      appendClassSpecificElements(childClasses, classType, childTooltipContent, false);
                    }
                  });

                }
              });

              if(childTooltipContent.childNodes.length > 0 && childTooltipBottom.childNodes.length > 0) {
                childTooltipContent.appendChild(document.createElement("br"));
              }
              childTooltipContent.appendChild(childTooltipBottom);
              if(childTooltipContent.childNodes.length > 0) {
                child = textWrapperElement.firstChild;
                Faust.tooltip.add(child, childTooltipContent);
              }
            });
          };
        })();

      })();

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
