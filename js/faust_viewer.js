var createDocumentViewer = (function(){
  "use strict";

  // Global variables to all viewer instances
  var viewModes = ["facsimile", "facsimile_document", "document", "document_text", "text", "structure"];
  var contentHtml = {
    missingImageMetadata: "{\"hasImages\": false}",
    loadErrorImageMetadata: "{\"hasImages\": false, \"noImageLoadable\": true}",
    missingFacsimileOverlay: "<div>Kein dokumentarisches Transkript vorhanden - Facsimile-Overlay kann nicht existieren</div>",
    loadErrorFacsimielOverlay: "<div>Facsimile Overlay konnte nicht geladen werden</div>",
    missingDocTranscript: "<div>Kein dokumentarisches Transkript vorhanden</div>",
    loadErrorDocTranscript: "<div>Dokumentarisches Transkript konnte nicht geladen werden</div>",
    missingTextTranscript: "<div>Textuelles Transkript fehlt</div>"
  };

  return function(faustDocumentsMetadata, parentDomNode){
    return (function(){
      // viewer instance variables
      var state = {
        page: 1,
        view: "structure",
        scale: undefined,
        imageBackgroundZoomLevel: 3,
        showOverlay: true
      };

      // allow other objects to listen to events
      var events = Faust.event.createEventQueue();

      var doc = {
        faustUri: null,
        metadata: null,
        pageCount: null,
        pages: [],
        textTranscript: null,
        structure: undefined
      };

      // container holding references to each available view / div
      var domContainer = {};

      // initialisation of viewer component.
      var init = (function(){

        // creates divs for each view available. references are stored in domContainer
        // object and the elements are then appended to the parent element that was
        // given as a parameter when calling createDocumentViewer(faustDocumentsMetadata, parentDomNode)
        var createDomNodes = (function() {
          return function(parentNode) {
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

            // create structure element
            domContainer.structure = document.createElement("div");
            domContainer.structure.id = "structureContainer";
            domContainer.structure.className = "structure-container view-content";

            // append all views to dom on given parent node
            parentNode.appendChild(domContainer.facsimile);
            parentNode.appendChild(domContainer.facsimile_document);
            parentNode.appendChild(domContainer.docTranscript);
            parentNode.appendChild(domContainer.document_text);
            parentNode.appendChild(domContainer.textTranscript);
            parentNode.appendChild(domContainer.structure);
          };
        })();

        return function() {
          var relativeFaustUri; 

          var getParameters = Faust.url.getParameters();
          doc.faustUri = getParameters.faustUri;

          // get relative faust uri that can be matched with entries within faust documents metadata
          relativeFaustUri = doc.faustUri.replace(faustDocumentsMetadata.basePrefix + "document/", "");

          // now find metadata for the document to view and convert it in a useable form
          faustDocumentsMetadata.metadata.forEach(function(currentMetadata){
            if(currentMetadata.document === relativeFaustUri) {
              doc.metadata = Faust.doc.createDocumentFromMetadata(currentMetadata);
              doc.pageCount = doc.metadata.pageCount;
            }
          });
          
          // try to find sigil for current document and set document title to sigil
          geneticBarGraphData.forEach(function(currentDocument){
            if(currentDocument.source === ("faust://xml/document/" + relativeFaustUri)) {
              document.title = document.title + " - " + currentDocument.sigil;
            }
          });

          // create elements that will contain the available views
          createDomNodes(parentDomNode);

          // load the file (metadata) describing the selected witness (structure, pages, etc.)
          // the 'structure'-view will be created from this file
          loadDocumentXmlMetadata();

          // load the textual representation of the whole witness (pre-generated dom structure als text file)
          loadTextTranscript();

          // if a valid page was given as parameter use ist. otherwise state.page is preset to the
          // first (1) page of the witness
          if(getParameters.page && !isNaN( parseInt(getParameters.page) ) ) {
            state.page = parseInt(getParameters.page);
          }

          // if a view was given in the get parameters and the view is available then set active view to that 
          if(getParameters.view && viewModes.reduce(function(result, view) {if(view === getParameters.view) {result = true;} return result;}, false)) {
            state.view = getParameters.view;
          }

          // facsimile and documentary transcript can exist for every page of a witness. set view to
          // current page and try to load related files (if not already done)
          setPage(state.page);

          // if a view parameter was set in get request, use it. otherwise use the preset
          // default-value from state.view (currently 'facsimile'-view)
          if(getParameters.view) {
            setView(getParameters.view);
          } else {
            // otherwise use default value
            setView(state.view);
          }

        };
      })();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      /* loading of xml metadata. after metadata is loaded the structure view will be created from it */
      var loadDocumentXmlMetadata = (function(){
        return function() {
          Faust.xhr.getResponseXml("xml/document/" + doc.metadata.documentUri, documentXmlMetadataLoaded );
        };
      })();

      var documentXmlMetadataLoaded = (function(){
        return function(documentXmlMetadata) {
          var lockedPages;

          // create elements for previews
          var previewDiv = document.createElement("div");
          previewDiv.id = "previewDiv";
          previewDiv.className = "preview-div";

          var leftPagePreview = document.createElement("div");
          leftPagePreview.id = "leftPreviewDiv";
          leftPagePreview.className = "left-page-preview facsimile-preview";
          previewDiv.appendChild(leftPagePreview);


          var rightPagePreview = document.createElement("div");
          rightPagePreview.id = "rightPreviewDiv";
          rightPagePreview.className = "right-page-preview facsimile-preview";
          previewDiv.appendChild(rightPagePreview);


          // create dom elements for structure display
          var structureDiv = document.createElement("div");
          structureDiv.id = "structureDiv";
          structureDiv.className = "structure-div";

          // create svg image of document structure
          var structureSvgDiv = document.createElement("div");
          structureSvgDiv.id = "structureSvgDiv";
          structureSvgDiv.className = "structure-svg-div";

          var structureSvg = documentStructure.createFromXml(documentXmlMetadata);
          doc.structure = structureSvg;

          structureSvgDiv.appendChild(structureSvg);

          // create dom elements for metadata display
          var metadataTextContent = metadataText.transformXml(documentXmlMetadata);
          var metadataDiv = Faust.dom.createElement({name: "div", id: "metadataDiv", class: "metadata-div", children: [metadataTextContent]});

          // function used to get preview images. this function is used so that images once loaded
          // will be buffered so that images are downloaded once and only once (chrome would buffer
          // images by itself but firefox would reload images every single time - not suitable when
          // listening to mousemove ;)
          // When there is no preview image for a requested image a div with a message will be returned
          var getPreviewElement = (function() {
            var loadedPages = {};
            
            // create div when no image is available. a div is created every time because if there is
            // only one div with a message it can only be added to one dom element - which is a
            // problem when both pages are without an image (only one message would be shown)
            // creating two divs would impose additional management to get the right div and this would
            // be uselessly more complex since creating a simple div is extremly fast in browsers.
            //
            // If there is no facsimile (display of first and last page) don't add text
            var createMissingPreviewDiv = function(facsimileMissing) {
              var missingPreviewDiv = document.createElement("div");
              if(facsimileMissing === true) {
                missingPreviewDiv.appendChild(document.createTextNode("Kein Faksimile verfügbar"));
              }
              return missingPreviewDiv;
            };

            // actual function assigned to getPreviewElement. if no uri is given a div with a message
            // is created.
            // else it is tried to load a previously generated img element for that uri. if that doesn't exist
            // create a new one and add to list of created img's
            return function(uri) {
              var result;
              var img;

              // create message div if no image was given
              if(uri === undefined) {
                result = createMissingPreviewDiv(false);
              } else if (uri === "noFacsimile") {
                result = createMissingPreviewDiv(true);
              } else {
                // try to load buffered image
                if(loadedPages.hasOwnProperty(uri) === true) {
                  result = loadedPages[uri];
                } else {
                  // else create new image
                  img = document.createElement("img");
                  img.setAttribute("alt", "Faksimile wird geladen");
                  img.setAttribute("src", uri);
                  loadedPages[uri] = img;
                  result = img;
                }
              }
              return result;
            };
          })();

          // set a preview of a facsimile. the preview will be appended to the given parent (preview
          // container) according to the given page number. the page number is used to get the image
          // uri from the document's metadata
          var setPreviewElement = function(parent, pageNum) {
            var pageUri;

            // remove contaier content / parent element's children
            Faust.dom.removeAllChildren(parent);

            // try to get a uri from document's metadata and load the preview image. else create a message
            // to inform about a missing preview
            if( pageNum !== undefined ) {
              if( (doc.metadata.pages[pageNum - 1].hasDocTranscripts) && (doc.metadata.pages[pageNum - 1].docTranscripts[0].hasImages) ) {
                // load existing preview image
                pageUri = doc.metadata.pages[pageNum - 1].docTranscripts[0].images[0].jpgUrlBase + "_preview.jpg";
                parent.appendChild(getPreviewElement(pageUri));
              } else {
                // no facsimile exists - display info
                parent.appendChild(getPreviewElement("noFacsimile"));
              }
            } else {
              // empty page with no pageNum (before first page or after last page). Don't display anything
              parent.appendChild(getPreviewElement(undefined));
            }

            // set pageNum of displayed facsimile to parent container
            parent.pageNum = pageNum;

            // set the visibility og the appended image to visible. if image was buffered and shown before
            // it might have visibility set to hidden
            parent.firstElementChild.style.visibility = "visible";
          };

          // set up event handlers
          var structurePagePreviewHandler = function(pages) {
            setPreviewElement(leftPagePreview, pages.left);
            setPreviewElement(rightPagePreview, pages.right);
          };

          // on mousemove or mouseenter load the preview images of the pages beneath the cursor
          structureSvg.addStructureEventListener("mouseenter", structurePagePreviewHandler);
          structureSvg.addStructureEventListener("mousemove", structurePagePreviewHandler);

          // when leaving the rect symbolising two pages hide the previously shown images
          structureSvg.addStructureEventListener("mouseleave", function(){
            leftPagePreview.firstElementChild.style.visibility = "hidden";
            rightPagePreview.firstElementChild.style.visibility = "hidden";
          });

          // if a user clicks on a rect the selected pages should be locked. that is when
          // the mouse leaved the image symbolising the whole document structure the
          // selected pages must be shown
          structureSvg.addStructureEventListener("structureLockedGroupChange", function(pages){
            lockedPages = pages;
            structurePagePreviewHandler(pages);
          });

          // if the mouse leaved the document's structure view (not only a rect visualising
          // two pages) than the mouse is above no page and thus the preview images should
          // be hidden.
          // If a user previously clicked on a pagesRect than these two pages must be shown
          // as preview images
          structureSvg.addStructureEventListener("rectGroupLeave", function(){
            leftPagePreview.firstElementChild.style.visibility = "hidden";
            rightPagePreview.firstElementChild.style.visibility = "hidden";

            if(lockedPages !== undefined) {
              setPreviewElement(leftPagePreview, lockedPages.left);
              setPreviewElement(rightPagePreview, lockedPages.right);
            }
          });

          structureSvg.addStructureEventListener("click", function(pages){
            if(pages.left !== undefined) {
              structureSvg.setLockedGroup(pages.left);
              setPage(pages.left);
            } else if (pages.right !== undefined) {
              structureSvg.setLockedGroup(pages.right);
              setPage(pages.right);
            }
          });

          // if a user clicks on a facsimile page, these pages 
          leftPagePreview.addEventListener("click", function( ){if(leftPagePreview.pageNum !== undefined) {setPage(leftPagePreview.pageNum);setView("facsimile");}});
          rightPagePreview.addEventListener("click", function( ){if(rightPagePreview.pageNum !== undefined) {setPage(rightPagePreview.pageNum);setView("facsimile");}});


          structureDiv.appendChild(structureSvgDiv);

          domContainer.structure.appendChild(previewDiv);
          domContainer.structure.appendChild(structureDiv);
          domContainer.structure.appendChild(metadataDiv);

          // set current active page on structure view
          structureSvg.setLockedGroup(state.page);

          metadataDiv.firstElementChild.style.height = parentDomNode.offsetHeight + "px";
          structureDiv.firstElementChild.style.height = parentDomNode.offsetHeight + "px";
          window.addEventListener("resize", function() {
            metadataDiv.firstElementChild.style.height = parentDomNode.offsetHeight + "px";
            structureDiv.firstElementChild.style.height = parentDomNode.offsetHeight + "px";
          });

        };
      })();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

      /* loading of textual transcript. if it exists it will be appended to the appropriate view when loaded */
      var loadTextTranscript = (function(){
        return function() {
          if(doc.metadata.hasTextTranscript) {
            createPrintDiv("print/", "pages.json", doc.faustUri, textTranscriptLoadedHandler);
          } else {
            textTranscriptLoadedHandler(null);
          }
        };
      })();

      var textTranscriptLoadedHandler = (function(){
        return function(textTranscriptDiv) {
          if(textTranscriptDiv) {
            doc.textTranscript = textTranscriptDiv;
            addPrintInteraction("", textTranscriptDiv);
          } else {
            doc.textTranscript.innerHTML = contentHtml.missingTextTranscript;
          }
          domContainer.textTranscript.appendChild(doc.textTranscript);
          events.triggerEvent("textTranscriptLoaded");
        };
      })();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

      /* function to load page-specific files and generate the appropriate views. if a page was loaded before only use cached
         data to prevent multiple loading of same resources
       */
      var loadPage = (function(){
        return function(pageNum) {
          var currentMetadata;

          // replace window location with current parameters
          history.replaceState(history.state, null, window.location.pathname + "?faustUri=" + doc.faustUri + "&page=" + pageNum + "&view=" + state.view);

          // create object for page if not already done yet
          if(!doc.pages[pageNum - 1]) {
            doc.pages[pageNum - 1] = {
              facsimile: null,
              facsimile_document: null,
              docTranscript: null,
              document_text: null
            };
          }

          // create variable for easier access to the current page
          var currentPage = doc.pages[pageNum - 1];

          // find out if documentary transcript was loaded before
          if(currentPage.docTranscript === null) {
            // try to load docTranscript if it wasn't loaded before
            loadDocTranscript(pageNum);
          } else {
            // if the documentary transcript already exists append it to its view
            Faust.dom.removeAllChildren(domContainer.docTranscript);
            domContainer.docTranscript.appendChild(currentPage.docTranscript);
          }

          if(currentPage.facsimile === null) {
            currentMetadata = doc.metadata.pages[pageNum - 1];

            var facsimile = null;
            // only load facsimile if images do exist. images are encoded in docTranscripts, so check if
            // docTranscript exists and if it has images attached
            if(currentMetadata.hasDocTranscripts === true && currentMetadata.docTranscripts[0].hasImages) {
              facsimile = imageOverlay.createImageOverlay(
              {
                "hasFacsimile": currentMetadata.docTranscripts[0].hasImageTextLink,
                "imageMetadataUrl": currentMetadata.docTranscripts[0].images[0].metadataUrl,
                "jpgBaseUrl": currentMetadata.docTranscripts[0].images[0].jpgUrlBase,
                "tileBaseUrl": currentMetadata.docTranscripts[0].images[0].tileUrlBase,
                "overlayUrl": currentMetadata.docTranscripts[0].facsimileOverlayUrl,
                "backgroundZoomLevel":  state.imageBackgroundZoomLevel
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

          if(currentPage.facsimile_document === null) {
            var facsimileDocTranscriptContainer = Faust.dom.createElement({name: "div"});
            var facsimileContainer = Faust.dom.createElement({name: "div", parent: facsimileDocTranscriptContainer});
            var docTranscriptContainer = Faust.dom.createElement({name: "div", parent: facsimileDocTranscriptContainer});

            facsimileDocTranscriptContainer.style.height = "100%";
            facsimileDocTranscriptContainer.style.padding = "0px";
            facsimileDocTranscriptContainer.style.overflow = "hidden";

            facsimileContainer.style.display = "inline-block";
            facsimileContainer.style.width = "50%";
            facsimileContainer.style.height = "100%";
            facsimileContainer.style.border = "1px solid black";
            facsimileContainer.style.overflow = "auto";

            docTranscriptContainer.style.display = "inline-block";
            docTranscriptContainer.style.width = "50%";
            docTranscriptContainer.style.height = "100%";
            docTranscriptContainer.style.border = "1px solid black";
            docTranscriptContainer.style.overflow = "auto";
            docTranscriptContainer.style.textAlign = "center";

            currentPage.facsimile_document = facsimileDocTranscriptContainer;
            currentMetadata = doc.metadata.pages[pageNum - 1];

            var facsimileParallel = null;
            // only load facsimile if images do exist. images are encoded in docTranscripts, so check if
            // docTranscript exists and if it has images attached
            if(currentMetadata.hasDocTranscripts === true && currentMetadata.docTranscripts[0].hasImages) {
              facsimileParallel = imageOverlay.createImageOverlay(
              {
                "hasFacsimile": currentMetadata.docTranscripts[0].hasImageTextLink,
                "imageMetadataUrl": currentMetadata.docTranscripts[0].images[0].metadataUrl,
                "jpgBaseUrl": currentMetadata.docTranscripts[0].images[0].jpgUrlBase,
                "tileBaseUrl": currentMetadata.docTranscripts[0].images[0].tileUrlBase,
                "overlayUrl": currentMetadata.docTranscripts[0].facsimileOverlayUrl,
                "backgroundZoomLevel":  state.imageBackgroundZoomLevel
              });
            } else {
              facsimileParallel = imageOverlay.createImageOverlay({"hasFacsimile": false});
            }

            facsimileContainer.appendChild(facsimileParallel);
            Faust.dom.removeAllChildren(domContainer.facsimile_document);
            domContainer.facsimile_document.appendChild(facsimileDocTranscriptContainer);

            facsimileParallel.showOverlay(false);
            facsimileParallel.addFacsimileEventListener("metadataLoaded", function(){facsimileParallel.fitScale();});
            facsimileParallel.addFacsimileEventListener("overlayLoaded", function(){facsimileParallel.showOverlay(state.showOverlay); transcriptTooltips(facsimileParallel);});

            events.addEventListener("docTranscriptPage" + pageNum + "Loaded", function() {
              docTranscriptContainer.appendChild(currentPage.docTranscript.cloneNode(true));
              transcriptTooltips(docTranscriptContainer);
            });
            
          } else {
            Faust.dom.removeAllChildren(domContainer.facsimile_document);
            domContainer.facsimile_document.appendChild(currentPage.facsimile_document);
          }

          if(currentPage.document_text === null) {


            var documentTextContainer = Faust.dom.createElement({name: "div"});
            var documentContainer = Faust.dom.createElement({name: "div", parent: documentTextContainer});
            var textContainer = Faust.dom.createElement({name: "div", parent: documentTextContainer});

            documentTextContainer.style.height = "100%";
            documentTextContainer.style.padding = "0px";
            documentTextContainer.style.overflow = "hidden";

            documentTextContainer.textContainer = textContainer;

            documentContainer.style.display = "inline-block";
            documentContainer.style.width = "50%";
            documentContainer.style.height = "100%";
            documentContainer.style.border = "1px solid black";
            documentContainer.style.overflow = "auto";
            documentContainer.style.textAlign = "center";

            textContainer.style.display = "inline-block";
            textContainer.style.width = "50%";
            textContainer.style.height = "100%";
            textContainer.style.border = "1px solid black";
            textContainer.style.overflow = "auto";
            textContainer.style.textAlign = "center";

            currentPage.document_text = documentTextContainer;
            currentMetadata = doc.metadata.pages[pageNum - 1];

            Faust.dom.removeAllChildren(domContainer.document_text);
            domContainer.document_text.appendChild(documentTextContainer);

            events.addEventListener("docTranscriptPage" + pageNum + "Loaded", function() {
              documentContainer.appendChild(currentPage.docTranscript.cloneNode(true));
              transcriptTooltips(documentContainer);
            });
            
            if(doc.printDiv === undefined) {
              createPrintDiv("print/", "pages.json", doc.faustUri, function(printDiv) {
                // print view / div can be very resource consuming, so cache and reuse it
                // once loaded
                doc.printDiv = printDiv;
                addPrintInteraction("", doc.printDiv);
                textContainer.appendChild(doc.printDiv);
              });
            } else {
              doc.printDiv.parentNode.removeChild(doc.printDiv);
              textContainer.appendChild(doc.printDiv);
            }

          } else {
            Faust.dom.removeAllChildren(domContainer.document_text);
            doc.printDiv.parentNode.removeChild(doc.printDiv);
            currentPage.document_text.textContainer.appendChild(doc.printDiv);
            domContainer.document_text.appendChild(currentPage.document_text);
          }

          // finally set correct page on structure view
          if(doc.structure !== undefined) {
            doc.structure.setLockedGroup(pageNum);
          }
          
          events.triggerEvent("pageLoaded", pageNum);
        };
      })();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

      /* load textual transcript for a specific page. */
      var loadDocTranscript = (function(){
        return function(pageNum) {
          if(!doc.metadata.pages[pageNum - 1].hasDocTranscripts) {
            docTranscriptLoadedHandler(contentHtml.missingDocTranscript, pageNum);
          } else {
            Faust.xhr.getResponseText(doc.metadata.pages[pageNum - 1].docTranscripts[0].docTranscriptUrl, function(responseText) { docTranscriptLoadedHandler(responseText, pageNum); } );
          }
        };
      })();

      var docTranscriptLoadedHandler = (function(){
        return function(docTranscriptHtml, pageNum) {
          var docTranscriptDiv = document.createElement("div");
          docTranscriptDiv.style.margin = "auto";
          if(docTranscriptHtml) {
            docTranscriptDiv.innerHTML = docTranscriptHtml;
          } else {
            docTranscriptDiv.innerHTML = contentHtml.missingDocTranscript;
          }

          doc.pages[pageNum - 1].docTranscript = docTranscriptDiv;
          Faust.dom.removeAllChildren(domContainer.docTranscript);
          domContainer.docTranscript.appendChild(docTranscriptDiv);
          transcriptTooltips(domContainer.docTranscript);
          events.triggerEvent("docTranscriptPage" + pageNum + "Loaded");
        };
      })();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

        var appendClassSpecificElements = (function(){
          return function(classNames, classType, node, linebreak) {
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
        })();

        return (function(){
          var textWrapperElements;
          var child;
          var childClasses;
          var childTooltipContent;
          var childTooltipBottom;

          var classTypesWriter = ["hand", "material", "script"];
          var classTypesLine = ["text-decoration", "inline-decoration", "property"];

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

                  classTypesLine.forEach(function(classType) {
                    appendClassSpecificElements(childClasses, classType, childTooltipBottom, true);
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
      var setPage = (function(){
        return function(newPage) {
          if(newPage < 1) {
            newPage = 1;
          } else if(newPage > doc.pageCount) {
            newPage = doc.pageCount;
          }
          state.page = newPage;
          loadPage(newPage);

          return state.page;
        };
      })();

      var getPageCount = (function(){
        return function() {
          return doc.pageCount;
        };
      })();

      // switch to next page
      var nextPage = (function(){
        return function() {
          return setPage(state.page + 1);
        };
      })();

      // switch to previous page
      var previousPage = (function(){
        return function() {
          return setPage(state.page - 1);
        };
      })();

      // return the number of the page currently in view
      var getCurrentPage = (function(){
        return function() {
          return state.page;
        };
      })();

      // return the view that is currently shown
      var getCurrentView = (function(){
        return function() {
          return state.view;
        };
      })();

// view manipulation
      // set the view of the current selected page. if the new page value is not a valid mode
      // or the view is the same as the one currently shown, nothing happens
      var setView = (function(){
        return function(newView){
          var oldView = state.view;

          // Test if the given view mode is available. if not then don't change view
          viewModes.forEach(function(viewMode) {
            if(newView === viewMode && newView !== state.view) {
              state.view = newView;
            }
          });

          // set all views to display none
          ["facsimile", "facsimile_document", "docTranscript", "document_text", "textTranscript", "structure"].forEach(function(view) {
            domContainer[view].style.display = "none";
          });

          // set selected view to block
          if(state.view === "facsimile") {
            domContainer.facsimile.style.display = "block";
            // if the page was first opened in a view that is not facsimile view, then no
            // scale has been set and the image would load in full size without tiles.
            // so on first switch to facsimile view set the facsimile to fit the page
            if(state.scale === undefined && oldView !== "facsimile") {
              doc.pages[state.page - 1].facsimile.fitScale();
            }
          } else if (state.view === "facsimile_document") {
            domContainer.facsimile_document.style.display = "block";
          } else if (state.view === "document") {
            domContainer.docTranscript.style.display = "block";
          } else if (state.view === "document_text") {
            domContainer.document_text.style.display = "block";
          } else if (state.view === "text") {
            domContainer.textTranscript.style.display = "block";
          } else if (state.view === "structure") {
            domContainer.structure.style.display = "table";
          }

          // set active button
          Array.prototype.slice.call(document.querySelectorAll(".navigation-bar-content .navigation-button")).forEach(function(button) {
            Faust.dom.removeClassFromElement(button, "navigation-button-active");
            if(button.id === "show-" + state.view + "-button") {
              Faust.dom.addClassToElement(button, "navigation-button-active");
            }
          });

          history.replaceState(history.state, undefined, window.location.pathname + "?faustUri=" + doc.faustUri + "&page=" + state.page + "&view=" + state.view);

          events.triggerEvent("viewChanged", state.view);

          return state.view;
        };
      })();

      // facsimile zooming functions
      var zoomIn = (function(){
        return function() {
          doc.pages[state.page - 1].facsimile.zoom("in");
        };
      })();

      var zoomOut = (function(){
        return function() {
          doc.pages[state.page - 1].facsimile.zoom("out");
        };
      })();

      // facsimile rotation functions
      var rotateLeft = (function(){
        return function() {
          doc.pages[state.page - 1].facsimile.rotate("left");
        };
      })();

      var rotateRight = (function(){
        return function() {
          doc.pages[state.page - 1].facsimile.rotate("right");
        };
      })();

// toggle view of overlay
      var toggleOverlay = (function(){
        return function() {
          if(state.showOverlay === true) {
            state.showOverlay = false;
          } else {
            state.showOverlay = true;
          }
          if(doc.pages[state.page - 1]) {
            doc.pages[state.page - 1].facsimile.showOverlay(state.showOverlay);
          }
        };
      })();


// initialisation
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
    })();
  };
})();
