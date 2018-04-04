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
    requirejs(['faust_common', 'faust_viewer'], function(Faust, createDocumentViewer) {

      var viewer = createDocumentViewer(document.getElementById("main-content"));

      // FIXME generating the button bar and attaching the listeners should be factored into the viewer
      // in order to be able to generate variants with different buttons etc.
      var bindEvent = function on(selector, func, event) {
        if (!(event)) event = "click";
        var elements = document.querySelectorAll(selector);
        elements.forEach(function(el) {
            el.addEventListener(event, func);
        });
      };
      bindEvent('#zoom-in-button', viewer.zoomIn);
      bindEvent('#zoom-out-button', viewer.zoomOut);
      bindEvent('#rotate-left', viewer.rotateLeft);
      bindEvent('#rotate-right', viewer.rotateRight);
      bindEvent('#toggle-overlay-button', viewer.toggleOverlay);

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
</script>

<?php include "includes/footer.php"; ?>
