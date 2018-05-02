// noinspection JSAnnotator
define(['faust_common', 'fv_structure', 'fv_doctranscript', 'fv_facsimile', 'fv_text', 'faust_print_interaction', 'faust_app',
        'data/scene_line_mapping', 'data/genetic_bar_graph', 'data/copyright_notes', 'data/archives', 'data/document_metadata'
    ],
  function(Faust, createStructureView, createDocTranscriptView, createFacsimileView, createTextualView, addPrintInteraction, app,
         sceneLineMapping, geneticBarGraphData, copyright_notes, archives, faustDocumentsMetadata) {
  "use strict";


  var createSplitView = function createSplitView(parent, state, controller, leftConstructor, rightConstructor) {

      var container = document.createElement('div');
      container.className = "view-content split-view-content";
      parent.append(container);

      var left = leftConstructor(container, state, controller, true);
      var right = rightConstructor(container, state, controller, true);
      left.container.classList.add('half-viewer', 'left-viewer');
      right.container.classList.add('half-viewer', 'right-viewer');

      if (!left)
          console.error(leftConstructor, ' left left undefined');
      if (!right)
          console.error(rightConstructor, ' left right undefined');

      return {
          dispatch : function(fname, arg) {
              if (fname in this.left)
                  this.left[fname].apply(this.left, [arg]);
              if (fname in this.right)
                  this.right[fname].apply(this.right, [arg]);
          },
          container: container,
          state: state,
          controller: controller,
          left: left,
          right: right,
          fix: function() { this.left.container.style.display = 'inline-block'; this.right.container.style.display = 'inline-block'; },
          setPage: function(pageNo) { this.dispatch('setPage', pageNo); },
          show: function() { this.container.style.display = 'block'; this.dispatch('show'); this.fix(); },
          hide: function() { this.container.style.display = 'none'; this.dispatch('hide'); this.fix(); }
      };
  };

  return function createDocumentViewer(parentDomNode){
      // viewer instance variables
      var state = {
        page: 1,
        layer: 0,
        view: "structure",
        scale: undefined,
        imageBackgroundZoomLevel: 3,
        showOverlay: true,
        section: undefined,         // opt. file name for textual / apparatus view
        fragment: undefined,

          // updates the address in the browser bar to a value calculated from state and state.doc
        toLocation: function toLocation(replaceHistory) {
              var fixedPath = window.location.pathname.replace(/^\/+/, '/');
              var url = fixedPath + '?sigil=' + state.doc.sigil + '&page=' + this.page + '&view=' + this.view;
              if (this.section) {
                  url += '&section=' + this.section;
              }
              if (this.layer > 0) {
                url += '&layer=' + this.layer;
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
              if (getParameters.sigil)
                  this.doc.sigil = getParameters.sigil.replace(/α/g, 'alpha').replace(/[^A-Za-z0-9.]/g, '_');


              // if a valid page was given as parameter use ist. otherwise this.page is preset to the
              // first (1) page of the witness
              if (getParameters.page && !isNaN(parseInt(getParameters.page))) {
                  this.page = parseInt(getParameters.page);
              }

              if (getParameters.layer && !isNaN(parseInt(getParameters.layer))) {
                  this.layer = parseInt(getParameters.layer);
              }

              if (getParameters.section) {
                  this.section = getParameters.section;
              }

              // if a view was given in the get parameters and the view is available then set active view to that
              if (getParameters.view) {
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
              var relativeFaustUri = state.doc.faustUri? state.doc.faustUri.replace(faustDocumentsMetadata.basePrefix + "document/", "") : undefined;
              var sigil = state.doc.sigil;

              var currentMetadata = faustDocumentsMetadata.metadata.find(function(el) {
                return sigil && (el.sigil === sigil) || relativeFaustUri && (el.document === relativeFaustUri) });
              if (currentMetadata) {
                state.doc.metadata = Faust.doc.createDocumentFromMetadata(currentMetadata);
                state.doc.faustUri = faustDocumentsMetadata.basePrefix + "document/" + currentMetadata.document;
                state.doc.faustMetadata = currentMetadata;
                state.doc.pageCount = state.doc.metadata.pageCount;
                state.doc.sigil = currentMetadata.sigil;
                if (currentMetadata['type'] === 'print') {
                  var newUrl = window.location.protocol + '//' + window.location.host + '/print/' + currentMetadata.text.replace(/\.xml$/, '');
                  window.location.href = newUrl;
                }
              } else {
                var id = sigil || state.doc.faustUri;
                Faust.error("Dokument " + id + " existiert nicht.",
                  "Sie können <a href='/search?q=" + id + "'>über die Suchfunktion</a> oder " +
                  "<a href='/archive'>manuell im Archiv</a> nach dem Dokument suchen.");
              }
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
                  var section = this.metadata.pages[pageNum].section;
                  return this.metadata.sigil + (section? "." + section : "");
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
      window.addEventListener('hashchange', function (ev) {
          state.fromLocation();
          setPage(state.page);
      });

      // allow other objects to listen to events
      var events = Faust.event.createEventQueue();


      // FIXME temporary wrapper for controller refactoring
      var controller = {
              setPage : function (pageNum) { setPage(pageNum); },
              setView : function (view) { setView(view); },
              events  : events
      };

      var views = {};

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

          document.title = document.title + " – " + state.doc.metadata.sigils.idno_faustedition;

          // create elements that will contain the available views
          // createDomNodes(parentDomNode);

          // now create the views
          views.facsimile = createFacsimileView(parentDomNode, state, controller);
          views.facsimile_document = createSplitView(parentDomNode, state, controller,
              createFacsimileView, createDocTranscriptView);
          views.document = createDocTranscriptView(parentDomNode, state, controller);
          views.document_text = createSplitView(parentDomNode, state, controller,
              createDocTranscriptView, function(p,s,c) { return createTextualView(p,s,c,'app');});
          views.facsimile_text = createSplitView(parentDomNode, state, controller,
              createFacsimileView, function (p,s,c) { return createTextualView(p,s,c,'app'); });
          views.text = createTextualView(parentDomNode, state, controller, 'app');
          views.print = createTextualView(parentDomNode, state, controller, 'print');
          views.structure = createStructureView(parentDomNode, state, controller);

          Object.keys(views).forEach(function (viewName) {
              Faust.bindBySelector('#show-'+viewName+'-button', function(){
                  setView(viewName);});
          });

            Faust.bindBySelector('#first-page-button', function() { setPage(1); });
            Faust.bindBySelector('#previous-page-button', previousPage);
            Faust.bindBySelector('#next-page-button', nextPage);
            Faust.bindBySelector('#last-page-button', function() { setPage(getPageCount()); });



          // facsimile and documentary transcript can exist for every page of a witness. set view to
          // current page and try to load related files (if not already done)
          setPage(state.page, true);

          // if a view parameter was set in get request, use it. otherwise use the preset
          // default-value from state.view (currently 'facsimile'-view)
          setView(state.view, true);

          // init tooltips for the navigation bar
          Faust.tooltip.addToTooltipElementsBySelector(".navigation-bar-container [title]", "title");

        };
      })();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


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

      /* function to load page-specific files and generate the appropriate views.
       */
      var updateControlsToPage = function updateControlsToPage(pageNum) {
          var currentMetadata;
          var verseNo;


          // the viewer was created, but no listener was added before. update page information
          document.getElementById("page-count").innerHTML = getPageCount();
          var pageInput = document.getElementById("page-input");
          pageInput.value = getCurrentPage();
          pageInput.max = getPageCount();
          pageInput.onchange = function (ev) {
            var pageNo = parseInt(this.value);
            if (pageNo && pageNo >= 1 && pageNo <= getPageCount()) {
              setPage(pageNo);
              return true;
            } else {
              this.value = getCurrentPage();
              return false;
            }
          };


          // update the PDF button (DEBUG)
          try {
              var pdfButton = document.getElementById('diplomatic-pdf-button'),
                  debugButton = document.getElementById('diplomatic-debug-button');
              pdfButton.removeAttribute('disabled');
              pdfButton.href = 'transcript/diplomatic/' + state.doc.sigil + '/page_' + state.page + '.pdf';
              debugButton.removeAttribute('disabled');
              debugButton.href = "debug.html" + window.location.search;
          } catch (e) {
              // no PDF button -> NOP
              console.log(e);
          }

          // set breadcrumbs FIXME refactor to faust_common

          // get breadcrumbs element
          var breadcrumbs = document.getElementById("breadcrumbs");

          // remove all breadcrumbs (if exist)
          Faust.dom.removeAllChildren(breadcrumbs);
          var repository = state.doc.faustMetadata.sigils.repository;
          breadcrumbs.appendChild(Faust.createBreadcrumbs([
              {caption: "Archiv", link: "archive"},
              {caption: archives[repository].name, link: "archive_locations_detail?id=" + repository},
              {caption: state.doc.metadata.sigils.idno_faustedition}]));

          // get information about scene that contains current page
          verseNo = getSceneData(state.doc.faustUri, pageNum);

          // set second breadcrumb to barGraph if a matching scene was found
          if (verseNo !== undefined) {
              breadcrumbs.appendChild(document.createElement("br"));
              var breadcrumbData = Faust.genesisBreadcrumbData(verseNo, verseNo, false);
              breadcrumbData.push({caption: state.doc.metadata.sigils.idno_faustedition});
              breadcrumbs.appendChild(Faust.createBreadcrumbs(breadcrumbData));
          }
      }

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Page manipulation
      // set new page to view. if new page number is out ouf range (<1 or >pages in document), the closest
      // number to a allowed page is used
      var setPage = function setPage(newPage, initializing) {
          if(newPage < 1) {
            newPage = 1;
          } else if(newPage > state.doc.pageCount) {
            newPage = state.doc.pageCount;
          }
          if (state.page !== newPage) {
              state.fragment = '';
          }
          state.page = newPage;

          for (var viewName in views) {
              if ('setPage' in views[viewName]) {
                  views[viewName].setPage(newPage);
              } else {
                  console.warn(viewName, 'view has no setPage method');
              }
          }
           updateControlsToPage(newPage);

          state.toLocation(!!initializing);

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
      var getCurrentPage = function() {
          return state.page;
      };

      // return the view that is currently shown
      var getCurrentView = function getCurrentView() {
          return state.view;
      };

      var _checkVisibleViews = function(expected) {
          var visible = [];
          if (typeof expected === "undefined")
              expected = 1;
          for (var viewName in views) {
              if (views[viewName].container.style.display == 'block')
                  visible.push(viewName);
          }
          if (visible.length !== expected)
              console.error(visible.length, 'views are visible insted of', expected, ':', visible)
      }

// view manipulation
      // set the view of the current selected page. if the new page value is not a valid mode
      // or the view is the same as the one currently shown, nothing happens
      var setView = function setView(newView, initializing){
          var oldView = state.view;
          if (!views.hasOwnProperty(newView)) {
            Faust.error('', 'View ' + newView + ' does not exist');
            return oldView;
          }

          state.view = newView;
          for (var viewName in views)
              views[viewName].hide();
          document.getElementById('show-' + oldView + '-button').classList.remove('pure-button-primary');

          _checkVisibleViews(0);

          // views[oldView].hide();
          views[newView].show();

          _checkVisibleViews(1);
          document.getElementById('show-' + newView + '-button').classList.add('pure-button-primary');

          state.toLocation(!!initializing);
          events.triggerEvent("viewChanged", state.view);
          return state.view;
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
          addViewerEventListener: events.addEventListener
        };

      return viewer;
    })();
  };
});
