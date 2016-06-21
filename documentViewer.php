<?php $showFooter = false; ?>
<?php include "includes/header.php"; ?>
<div id="main-content" class="main-content"></div>

<div id="navigation-bar-container" class="navigation-bar-container">
  <div id="navigation-bar-content" class="navigation-bar-content">
    <div id="facsimile-settings" class="facsimile-settings">
      <div id="zoom-in-button" class="pure-button" onclick="viewer.zoomIn()" title="Vergrößern"><i class="fa fa-plus"></i></div>
      <div id="zoom-out-button" class="pure-button" onclick="viewer.zoomOut()" title="Verkleinern"><i class="fa fa-minus"></i></div>
      <div id="rotate-left" class="pure-button" onclick="viewer.rotateLeft()" title="Nach links drehen"><i class="fa fa-ccw"></i></div>
      <div id="rotate-right" class="pure-button" onclick="viewer.rotateRight()" title="Nach rechts drehen"><i class="fa fa-cw"></i></div>
      <div id="toggle-overlay-button" class="pure-button pure-button-primary" onclick="viewer.toggleOverlay()" title="Überblendung ein-/ausschalten"><i class="fa fa-text-overlay"></i></div>
    </div>
    <div id="page-navigation" class="page-navigation">
      <div id="first-page-button" class="pure-button" onclick="viewer.setPage(1);" title="Erste Seite"><i class="fa fa-angle-double-left"></i></div>
      <div id="previous-page-button" class="pure-button" onclick="viewer.previousPage();" title="Vorherige Seite"><i class="fa fa-angle-left"></i></div>
      <div id="pageCount" style="display:inline-block;"></div>
      <div id="next-page-button" class="pure-button" onclick="viewer.nextPage();" title="Nächste Seite"><i class="fa fa-angle-right"></i></div>
      <div id="last-page-button" class="pure-button" onclick="viewer.setPage(viewer.getPageCount());" title="Letzte Seite"><i class="fa fa-angle-double-right"></i></div>
    </div>
    <div id="view-select" class="view-select">
      <a id="diplomatic-debug-button" class="pure-button" title="Dokumentarische Transkription debuggen" disabled="disabled"><i class="fa fa-bug"></i></a>
      <a id="diplomatic-pdf-button" class="pure-button" title="Dokumentarische Transkription / PDF" disabled="disabled"><i class="fa fa-file-pdf"></i></a>
      <div id="show-structure-button" class="pure-button" onclick="viewer.setView('structure');" title="Metadaten/Lagenstruktur"><i class="fa fa-structure"></i></div>
      <div id="show-facsimile-button" class="pure-button" onclick="viewer.setView('facsimile');" title="Faksimile"><i class="fa fa-picture"></i></div>
      <div id="show-facsimile_document-button" class="pure-button" onclick="viewer.setView('facsimile_document');" title="Faksimile | Dokumentarische Transkription"><i class="fa fa-picture"></i> | <i class="fa fa-doc-transscript"></i></div>
      <div id="show-document-button" class="pure-button" onclick="viewer.setView('document');" title="Dokumentarische Transkription"><i class="fa fa-doc-transscript"></i></div>
      <div id="show-document_text-button" class="pure-button" onclick="viewer.setView('document_text');" title="Dokumentarische Transkription | Textuelle Transkription"><i class="fa fa-doc-transscript"></i> | <i class="fa fa-text-transscript"></i></div>
      <div id="show-text-button" class="pure-button" onclick="viewer.setView('text');" title="Textuelle Transkription"><i class="fa fa-text-transscript"></i></div>
      <div id="show-print-button" class="pure-button" onclick="viewer.setView('print');" title="Variantenapparat"><i class="fa fa-variants"></i></div>
    </div>
  </div>
</div>

<script type="text/javascript" src="data/document_metadata.js"></script>
<script type="text/javascript" src="data/archives.js"></script>

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
    var viewer = createDocumentViewer(documentMetadata, document.getElementById("main-content"));
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
