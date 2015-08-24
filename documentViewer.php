      <?php include "includes/header.php"; ?>
        <style>
@font-face {
  font-family: 'FontAwesome';
  src: url("fonts/fontawesome-webfont.eot?v=4.3.0");
  src: url("fonts/fontawesome-webfont.eot?#iefix&v=4.3.0") format("embedded-opentype"), url("fonts/fontawesome-webfont.woff2?v=4.3.0") format("woff2"), url("fonts/fontawesome-webfont.woff?v=4.3.0") format("woff"), url("fonts/fontawesome-webfont.ttf?v=4.3.0") format("truetype"), url("fonts/fontawesome-webfont.svg?v=4.3.0#fontawesomeregular") format("svg");
  font-weight: normal;
  font-style: normal;
}

.main-content-container {
  width: 100%;
  height: 100%;
  padding: 0.5em 0.5em 2.5em 0.5em;
  overflow: hidden;
}

.main-content2 {
  border: 1px solid black;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
/*svg:not(:root) { overflow: hidden; }*/
      .view-content {
        display: none;
        width: 100%;
        height: 100%;
        overflow: auto;
      }

      .facsimile-content {
        overflow: hidden;
      }

      /*
      .facsimile-content * {
        -webkit-user-select: none;
           -moz-user-select: none;
            -ms-user-select: none;
                user-select: none;
      }

      .facsimile-document-content * {
        -webkit-user-select: none;
           -moz-user-select: none;
            -ms-user-select: none;
                user-select: none;
      }
      */

      .doc-transcript-content {
        text-align: center;
      }

       /*
      .doc-transcript-content * {
        -webkit-user-select: none;
           -moz-user-select: none;
            -ms-user-select: none;
                user-select: none;
      }
      */

      .text-transcript-content {
      }

      .image-container {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: auto;
      }

      .rotate-container {
        position: absolute;
        top: 0px;
        left:0px;
        overflow: hidden;
        transform-origin: 0px 0px;
      }

      .scale-container {
        transform-origin: 0px 0px;
      }

      .overlay-container {
        position: relative;
        background-color: black;
        overflow: hidden;
      }

      .image-layer {
        position: absolute;
        top: 0px;
        left:0px;
      }

      .tile-layer {
        position: absolute;
        top: 0px;
        left:0px;
      }

      .text-layer {
        position: absolute;
        top: 0px;
        left:0px;
      }

      .image-info {
        pointer-events: none;
        position: absolute;
        top: 0px;
        left:0px;
        width: 100%;
        height: 100%;
      }

svg.diplomatic .element-line {
  text-shadow: -0.5em 0em 0.5em rgba(255, 255, 255, 0.5), 0em -0.5em 0.5em rgba(255, 255, 255, 0.5), 0.5em 0em 0.5em rgba(255, 255, 255, 0.5), 0em 0.5em 0.5em rgba(255, 255, 255, 0.5);
}

g.element-line .bgBox {
  opacity: 0;
}

g.element-line:hover .bgBox {
  opacity: 1;
  stroke: #ffc20e;
  stroke-width: 0.1em;
}

g.element-line-hidden > * {
  opacity: 0;
}

div g.element-line-hidden:hover > * {
  opacity: 1;
}

.tooltip {
  position: fixed;
  background: white;
  border-radius: 4px;
  border: 1px solid black;
  padding: 0em 0.25em;
}

.transcript-tooltip-span {
  padding-right: 0.5em;
}

.transcript-tooltip-span:last-child {
  padding-right: 0em;
}

.transcript-tooltip-hand {
  font-weight: bold;
}

.transcript-tooltip-material {
  font-style: italic;
}

.transcript-tooltip-text-decoration {
}

.transcript-tooltip-property {
}

.transcript-tooltip-script {
}

.transcript-tooltip-inline-decoration {
}

.page-navigation {
  display: inline-block;
}

.facsimile-settings {
  display: none;
  position: absolute;
  top: 0.25em;
  left: 0.5em;
}

.view-select {
  position: absolute;
  top: 0.25em;
  right: 0.5em;
}
        </style>

        <div id="main-content2" class="main-content2">

        </div>
        <div id="navigation-bar-container" class="navigation-bar-container">
          <div id="navigation-bar-content" class="navigation-bar-content">
            <div id="facsimile-settings" class="facsimile-settings">
              <div id="zoom-in-button" class="zoom-in-button navigation-button" style="font-family: FontAwesome" onclick="viewer.zoomIn()" title="Vergrößern">&#xf067;</div>
              <div id="zoom-out-button" class="zoom-out-button navigation-button" style="font-family: FontAwesome" onclick="viewer.zoomOut()" title="Verkleinern">&#xf068;</div>
              <div id="rotate-left" class="rotate-left-button navigation-button" style="font-family: FontAwesome" onclick="viewer.rotateLeft()" title="Nach links drehen">&#xf0e2;</div>
              <div id="rotate-right" class="rotate-right-button navigation-button" style="font-family: FontAwesome" onclick="viewer.rotateRight()" title="Nach rechts drehen">&#xf01e;</div>
              <div id="toggle-overlay-button" class="toggle-overlay-button button-active navigation-button" onclick="viewer.toggleOverlay()" title="Überblendung ein-/ausschalten"><span style="font-family: FontAwesome;">&#xf1fc;</span></div>
            </div>
            <div id="page-navigation" class="page-navigation">
              <div id="first-page-button" class="first-page-button navigation-button" style="font-family: FontAwesome" onclick="viewer.setPage(1);" title="Erste Seite">&#xf053;&#xf053;</div>
              <div id="previous-page-button" class="previous-page-button navigation-button" style="font-family: FontAwesome" onclick="viewer.previousPage();" title="Vorherige Seite">&#xf053;</div>
              <div id="pageCount" style="display:inline-block;"></div>
              <div id="next-page-button" class="next-page-button navigation-button" style="font-family: FontAwesome" onclick="viewer.nextPage();" title="Nächste Seite">&#xf054;</div>
              <div id="last-page-button" class="last-page-button navigation-button" style="font-family: FontAwesome" onclick="viewer.setPage(viewer.getPageCount());" title="Letzte Seite">&#xf054;&#xf054;</div>
            </div>
            <div id="view-select" class="view-select">
              <div id="show-structure-button" class="show-structure-button navigation-button" onclick="viewer.setView('structure');" title="Metadaten/Lagenstruktur"><span style="font-size: smaller; font-family: FontAwesome;">&#xf0cb;</span></div>
              <div id="show-facsimile-button" class="show-facsimile-button navigation-button" onclick="viewer.setView('facsimile');" title="Faksimile"><span style="font-family: FontAwesome;">&#xf03e;</span></div>
              <div id="show-facsimile_document-button" class="show-facsimile-button navigation-button" onclick="viewer.setView('facsimile_document');" title="Faksimile | Dokumentarische Transkription"><span style="font-family: FontAwesome;">&#xf03e;</span> | <span style="font-weight: bold; font-family: TimesNewRoman,Times New Roman,Times,Baskerville,Georgia,serif;">T</span><span style="font-size: smaller; font-family: FontAwesome;">&#xf037;</span></div>
              <div id="show-document-button" class="show-document-button navigation-button" onclick="viewer.setView('document');" title="Dokumentarische Transkription"><span style="font-weight: bold; font-family: TimesNewRoman,Times New Roman,Times,Baskerville,Georgia,serif;">T</span><span style="font-size: smaller; font-family: FontAwesome;">&#xf037;</span></div>
              <div id="show-document_text-button" class="show-document-button navigation-button" onclick="viewer.setView('document_text');" title="Dokumentarische Transkription | Textuelle Transkription"><span style="font-weight: bold; font-family: TimesNewRoman,Times New Roman,Times,Baskerville,Georgia,serif;">T</span><span style="font-size: smaller; font-family: FontAwesome;">&#xf037;</span> | <span style="font-weight: bold; font-family: TimesNewRoman,Times New Roman,Times,Baskerville,Georgia,serif;">{ T }</span></div>
              <div id="show-text-button" class="show-text-button navigation-button" onclick="viewer.setView('text');" title="Textuelle Transkription"><span style="font-weight: bold; font-family: TimesNewRoman,Times New Roman,Times,Baskerville,Georgia,serif;">{ T }</span></div>
              <div id="show-print-button" class="show-text-button navigation-button" onclick="viewer.setView('print');" title="Variantenapparat"><span style="font-weight: bold; font-family: TimesNewRoman,Times New Roman,Times,Baskerville,Georgia,serif;">T</span></div>
            </div>
          </div>
        </div>

        <link rel="stylesheet" href="css/textual-transcript.css" />
        <script type="text/javascript" src="js/faust_structure.js"></script>
        <script type="text/javascript" src="js/faust_metadata.js"></script>
        <script type="text/javascript" src="js/faust_image_overlay.js"></script>
        <script type="text/javascript" src="js/faust_mousemove_scroll.js"></script>
        <script type="text/javascript" src="js/faust_viewer.js"></script>
        <script type="text/javascript" src="js/faust_print_interaction.js"></script>
        <script type="text/javascript" src="js/faust_app.js"></script>

        <script>
          // create viewer and assign parent element
          var viewer = (function(){
            "use strict";
            var viewer = createDocumentViewer(documentMetadata, document.getElementById("main-content2"));
            if(viewer.getCurrentView() === "facsimile" || viewer.getCurrentView() === "facsimile_document") {
              document.getElementById("facsimile-settings").style.display="block";
            }
            return viewer;
          })();

          // the viewer was created, but no listener was added before. update page information
          document.getElementById("pageCount").innerHTML = viewer.getCurrentPage() + " / " + viewer.getPageCount();

          // add a handler to the viewer to update the current page info in the navigation bar when changing a page
          var viewerPageLoadedEventHandler = (function() {
            var pageCountContainer = document.getElementById("pageCount");
            return function(pageNum) {
              pageCountContainer.innerHTML = pageNum + " / " + viewer.getPageCount();
            };
          })();
          viewer.addViewerEventListener("pageLoaded", viewerPageLoadedEventHandler);

          viewer.addViewerEventListener("viewChanged", function(newView) {
            if(newView === "facsimile" || newView === "facsimile_document") {
              document.getElementById("facsimile-settings").style.display = "block";
            } else {
              document.getElementById("facsimile-settings").style.display = "none";
            }
          });
        </script>
      <?php include "includes/footer.php"; ?>
