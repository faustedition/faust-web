<?php include "includes/header.php"; ?>

<div id="main-content" class="main-content">
</div>

<div id="loading-spinner" class="background-container">
    <div class="pure-center pure-fade-50">
        <i class="fa fa-spinner fa-pulse fa-5x"></i><br/>
        Ansicht wird geladen …
    </div>
</div>

<div id="navigation-bar-container" class="navigation-bar-container">
  <div id="navigation-bar-content" class="navigation-bar-content">
    <div id="facsimile-settings" class="facsimile">
      <div id="zoom-in-button" class="pure-button" title="Vergrößern"><i class="fa fa-plus"></i></div>
      <div id="zoom-out-button" class="pure-button" title="Verkleinern"><i class="fa fa-minus"></i></div>
      <div id="rotate-left" class="pure-button" title="Nach links drehen"><i class="fa fa-ccw"></i></div>
      <div id="rotate-right" class="pure-button" title="Nach rechts drehen"><i class="fa fa-cw"></i></div>
      <div id="toggle-overlay-button" class="pure-button pure-button-primary" title="Überblendung ein-/ausschalten"><i class="fa fa-text-overlay"></i></div>
      <!-- FIXME improve styling etc.: -->
      <div id="facsimile-layer-button" class="pure-button" title="nächstes Digitalisat dieser Seite" style="display: none;">
          <span class="fa-stack" style="display: inline-block; width: 1em; height: 1em; line-height: 1em;">
              <i class="fa fa-doc"></i>
              <span id="facsimile-layer-badge" class="fa-stack-1x">1</span>
          </span>
      </div>
    </div>
    <div id="page-navigation" class="page">
      <div id="first-page-button" class="pure-button" title="Erste Seite"><i class="fa fa-to-start"></i></div>
      <div id="previous-page-button" class="pure-button" title="Vorherige Seite"><i class="fa fa-left-dir"></i></div>
      <div id="page-info">
          <input id="page-input" type="number" size="3" min="1" max="1"> / <span id="page-count"></span>
      </div>
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
      <div id="show-facsimile_text-button" class="pure-button" title="Facsimile | Textuelle Transkription"><i class="fa fa-picture"></i> | <i class="fa fa-text-transscript"></i></div>
      <div id="show-text-button" class="pure-button" title="Textuelle Transkription"><i class="fa fa-text-transscript"></i></div>
      <div id="show-print-button" class="pure-button" title="Variantenapparat"><i class="fa fa-variants"></i></div>
    </div>
  </div>
</div>

<script>
    requirejs(['faust_common', 'faust_viewer'], function(Faust, createDocumentViewer) {

      var viewer = createDocumentViewer(document.getElementById("main-content"));

    });
</script>

<?php include "includes/footer.php"; ?>
