<?php $showFooter = false; ?>
<?php include "includes/header.php"; ?>
<div id="main-content" class="main-content"></div>

<div id="navigation-bar-container" class="navigation-bar-container">
  <div id="navigation-bar-content" class="navigation-bar-content">
    <div id="facsimile-settings" class="facsimile">
      <div id="zoom-in-button" class="pure-button" title="Vergrößern"><i class="fa fa-plus"></i></div>
      <div id="zoom-out-button" class="pure-button" title="Verkleinern"><i class="fa fa-minus"></i></div>
      <div id="rotate-left" class="pure-button" title="Nach links drehen"><i class="fa fa-ccw"></i></div>
      <div id="rotate-right" class="pure-button" title="Nach rechts drehen"><i class="fa fa-cw"></i></div>
      <div id="toggle-overlay-button" class="pure-button pure-button-primary" title="Überblendung ein-/ausschalten"><i class="fa fa-text-overlay"></i></div>
    </div>
    <div id="page-navigation" class="page">
      <div id="first-page-button" class="pure-button" title="Erste Seite"><i class="fa fa-to-start"></i></div>
      <div id="previous-page-button" class="pure-button" title="Vorherige Seite"><i class="fa fa-left-dir"></i></div>
      <div id="pageCount"></div>
      <div id="next-page-button" class="pure-button" title="Nächste Seite"><i class="fa fa-right-dir"></i></div>
      <div id="last-page-button" class="pure-button" title="Letzte Seite"><i class="fa fa-to-end"></i></div>
    </div>
    <div id="view-select" class="view">
      <a id="diplomatic-debug-button" class="pure-button" title="Dokumentarische Transkription debuggen" disabled="disabled"><i class="fa fa-bug"></i></a>
      <a id="diplomatic-pdf-button" class="pure-button" title="Dokumentarische Transkription / PDF" disabled="disabled"><i class="fa fa-file-pdf"></i></a>
      <div id="show-structure-button" class="pure-button" title="Metadaten/Lagenstruktur"><i class="fa fa-structure"></i></div>
      <div id="show-facsimile-button" class="pure-button" title="Faksimile"><i class="fa fa-picture"></i></div>
      <div id="show-facsimile_document-button" class="pure-button" title="Faksimile | Dokumentarische Transkription"><i class="fa fa-picture"></i> | <i class="fa fa-doc-transscript"></i></div>
      <div id="show-document-button" class="pure-button" title="Dokumentarische Transkription"><i class="fa fa-doc-transscript"></i></div>
      <div id="show-document_text-button" class="pure-button" title="Dokumentarische Transkription | Textuelle Transkription"><i class="fa fa-doc-transscript"></i> | <i class="fa fa-text-transscript"></i></div>
      <div id="show-text-button" class="pure-button" title="Textuelle Transkription"><i class="fa fa-text-transscript"></i></div>
      <div id="show-print-button" class="pure-button" title="Variantenapparat"><i class="fa fa-variants"></i></div>
    </div>
  </div>
</div>

<script>
  requirejs(['./js/faust_common'], function(Faust) {
    requirejs(['faust_viewer', 'data/document_metadata'], function(createDocumentViewer, documentMetadata) {
      //
      // create viewer and assign parent element
      var viewer = (function(){
        "use strict";
        var viewer = createDocumentViewer(documentMetadata, document.getElementById("main-content"));
        if(viewer.getCurrentView() === "facsimile" || viewer.getCurrentView() === "facsimile_document") {
          document.getElementById("facsimile-settings").style.display="block";
        }
        return viewer;
      })();

      // FIXME generating the button bar and attaching the listeners should be factored into the viewer
      // in order to be able to generate variants with different buttons etc.
      var on = function on(id, func, event) {
        var el = document.getElementById(id);
        if (!(event)) event = "click";
        if (el) {
          el.addEventListener(event, func);
        }
      };
      on('zoom-in-button', viewer.zoomIn);
      on('zoom-out-button', viewer.zoomOut);
      on('rotate-left', viewer.rotateLeft);
      on('rotate-right', viewer.rotateRight);
      on('toggle-overlay-button', viewer.toggleOverlay);

      on('first-page-button', function() { viewer.setPage(1); });
      on('previous-page-button', viewer.previousPage);
      on('next-page-button', viewer.nextPage);
      on('last-page-button', function() { viewer.setPage(viewer.getPageCount()); });

      on('show-structure-button', function() { viewer.setView('structure'); });
      on('show-facsimile-button', function() { viewer.setView('facsimile'); });
      on('show-facsimile_document-button', function() { viewer.setView('facsimile_document'); });
      on('show-document-button', function() { viewer.setView('document'); });
      on('show-document_text-button', function() { viewer.setView('document_text'); });
      on('show-text-button', function() { viewer.setView('text'); });
      on('show-print-button', function() { viewer.setView('print'); });



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
    });
  });
</script>
<?php include "includes/footer.php"; ?>
