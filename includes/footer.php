    </main>

    <noscript>
        <div class="pure-alert pure-alert-warning">
            <h3>JavaScript erforderlich</h3>
            <p>Die Faustedition bietet ein interaktives Userinterface, für das JavaScript erforderlich ist.</p>
            <p>Bitte deaktivieren Sie ggf. vorhandene Skriptblocker für diese Seite.</p>
        </div>
    </noscript>

    <div id="cookie-consent" class="pure-modal center" style="top:auto;">
        <div class="pure-modal-body">
            <p>Diese Website verwendet Cookies und vergleichbare Technologien zur Sicherstellung der 
               Funktionalität und – optional entsprechend Ihren Einstellungen – für eine anonymisierte 
               Nutzungsstatistik zur Verbesserung der Edition und zur Erforschung der Nutzung digitaler
               Editionen. Lesen Sie auch unsere <a href="imprint#privacy">Datenschutzerklärung</a>.</p>
            <p><a id="functional-cookies-button" class="pure-button pull-right">nur funktionale Cookies zulassen</a></p>
            <p><a id="cookie-consent-button" class="pure-button pull-right">auch Statistik erlauben</a></p>
        </div>

    </div>


    <footer>
      <div class="center pure-g-r">
        <div class="pure-u-1-2 pure-fade-50">
          <a class="undecorated" rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/"><img alt="Creative-Commons-Lizenzvertrag CC-BY-NC-SA 4.0" src="/img/cc-by-nc-sa-40-80x15.png" align="middle"></a>
        </div>
        <div class="pure-u-1-2 pure-right pure-fade-50 pure-noprint">
          <a href="project">Projekt</a>
          &middot;
          <a href="intro">Ausgabe</a>
          &middot;
          <a href="contact">Kontakt</a>
          &middot;
          <a href="imprint">Impressum</a>
          &middot;
          <a href="intro#sitemap">Sitemap</a>
        </div>
      </div>
    </footer>

    <script type="text/template" id="navigation">
        <div class="center pure-g-r navigation">
          <div class="pure-u-1-4 pure-gap">
            <a href="/archive"><big>Archiv</big></a>
            <a href="/archive_locations">Aufbewahrungsorte</a>
            <a href="/archive_manuscripts">Handschriften</a>
            <a href="/archive_prints">Drucke</a>
            <a href="/archive_testimonies">Entstehungszeugnisse</a>
            <a href="/archive_materials">Materialien</a>
          </div>
          <div class="pure-u-1-4 pure-gap">
            <a><big>Genese</big></a>
            <a href="/genesis">Werkgenese</a>
            <a href="/genesis_faust_i">Genese Faust I</a>
            <a href="/genesis_faust_ii">Genese Faust II</a>
            <a href="/macrogenesis">Makrogenese-Lab</a>
          </div>
          <div class="pure-u-1-4 pure-gap">
            <a href="/text"><big>Text</big></a>
            <a href="/print/faust">Faust: Konstituierter Text</a>
            <a href="/print/app">Apparat</a>
            <a href="/intro_text">Editorischer Bericht</a>
            <br />
            <a href="/paralipomena">Paralipomena</a>
          </div>
          <div class="pure-u-1-4 pure-gap pure-fade-50">
            <a><big>Informationen</big></a>
            <a href="/intro">Über die Ausgabe</a>
            <a href="/project">Über das Projekt</a>
            <a href="/contact">Kontakt</a>
            <a href="/imprint">Impressum</a>
            <a href="/intro#sitemap">Sitemap</a>
            <a class="undecorated" rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/"><img alt="Creative-Commons-Lizenzvertrag CC BY-NC-SA 4.0" src="/img/cc-by-nc-sa-40-80x15.png" align="middle"></a>
          </div>
        </div>
    </script>


    <script type="text/template" id="quotation">
        <div class="center pure-g-r quotation">
          <div class="pure-u-1">
            <h3>Zitierempfehlung</h3>
            <p class="quotation-content">
              Johann Wolfgang Goethe: Faust. Historisch-kritische Edition.
              Herausgegeben von Anne Bohnenkamp, Silke Henke und Fotis Jannidis
              unter Mitarbeit von Gerrit Brüning, Katrin Henzel, Christoph Leijser, Gregor Middell, Dietmar Pravida, Thorsten Vitt und Moritz Wissenbach.
              Version alpha. Frankfurt am Main / Weimar / Würzburg 2018,
              <span>{context}</span>,
              <span>URL: <a href="{url}">{url}</a></span>,
              abgerufen am {date}.
            </p>
            <p><i class="fa fa-paste pure-fade-50"></i> <a href="#" data-target=".quotation-content">kopieren</a></p>
          </div>
        </div>
    </script>


    <script type="text/template" id="download">

        <div class="center pure-g-r navigation">
          <div class="pure-u-1">
            <h3><i class="fa fa-code" aria-hidden="true"></i> XML-Quellen</h3>
          </div>
          <div id="xml-global" class="pure-u-1-3 pure-gap">
            <a><big>Globale TEI-Daten</big></a>
            <a href="https://github.com/faustedition/faust-xml"><i class="fa fa-github-circled"></i> alle XML-Daten</a>
            <a href="/downloads/testimony-split.zip" disabled="disabled"><i class="fa fa-file-archive"></i> Entstehungszeugnisse</a>
            <a href="/downloads/faust.xml" disabled="disabled"><i class="fa fa-file-code"></i> konstituierter Text</a>
          </div>

          <div id="xml-current" class="pure-u-1-3 pure-gap disabled">
            <a><big>aktueller Zeuge</big></a>
            <a id="zip-current-facsimile"       href="#"><i class="fa fa-file-archive"></i> Facsimiles (ZIP mit JPEGs)</a>
            <a id="xml-current-doc-pdf"         href="#"><i class="fa fa-file-pdf"></i> Dokumentarische Transkription (PDF)</a>
            <a id="xml-current-text-source"     href="#"><i class="fa fa-file-code"></i> Textuelles Transkript (TEI)</a>
            <a id="xml-current-metadata"        href="#"><i class="fa fa-file-code"></i> Metadaten (XML)</a>
          </div>

          <div id="more-downloads" class="pure-u-1-3 pure-gap"  >
            <a><big>aktuelle Seite</big></a>
            <a id="jpg-current-facsimile" class="disabled" disabled="disabled" download="" href="#"><i class="fa fa-file-image"></i> Facsimile (JPEG)</a>
            <a id="xml-current-doc-source-page" class="disabled" disabled="disabled" href="#"><i class="fa fa-file-code"></i> Dokumentarisches Transkript (TEI)</a>
          </div>
        </div>
    </script>



<script>
requirejs(['jquery', 'jquery.chocolat', 'jquery.overlays', 'jquery.clipboard', 'faust_common', 'js.cookie'],
  function ($, $chocolat, $overlays, $clipboard, Faust, Cookies) {
    $('main').Chocolat({className:'faustedition', loop:true});
    $('header nav').menuOverlays({highlightClass:'pure-menu-selected', onAfterShow: function() {
        $('[data-target]').copyToClipboard();
    }});
    Faust.addToTopButton();

    var _paq = window._paq = window._paq || [];
    _paq.push(['requireConsent']);
    var consent = Cookies.get('faust-cookie-consent');
    if (consent == 'yes') {
      _paq.push(['rememberConsentGiven'])
    } else if (navigator.cookieEnabled && (consent != 'yes' && consent != 'no')) {
        $('#cookie-consent-button').bind('click', function () {
           _paq.push(['rememberConsentGiven'])
           var domain = window.location.hostname;
           if (/faustedition\.net$/.test(domain))
               domain = '.faustedition.net';
           Cookies.set('faust-cookie-consent', 'yes', {expires: 365, domain: domain});
           $('#cookie-consent').hide();
        });
        $('#functional-cookies-button').bind('click', function() {
           var domain = window.location.hostname;
           if (/faustedition\.net$/.test(domain))
               domain = '.faustedition.net';
           Cookies.set('faust-cookie-consent', 'no', {expires: 365, domain: domain});
           $('#cookie-consent').hide();
        })
        $('#cookie-consent').show();
    }
});
</script>

<!-- Matomo -->
<script type="text/javascript">
  var _paq = window._paq = window._paq || [];
  /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
  if (window.location.pathname != "/document") {
    _paq.push(['trackPageView']);
  }
  _paq.push(['enableLinkTracking']);
  (function() {
    var u="//analytics.faustedition.net/";
    _paq.push(['setTrackerUrl', u+'matomo.php']);
    _paq.push(['setSiteId', '2']);
    var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
    g.type='text/javascript'; g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
  })();
  window.addEventListener('popstate', (event) => {
	if (event.state && event.state.referrer) {
	    _paq.push(['setReferrerUrl', event.state.referrer]);
	}
	_paq.push(['trackPageView']);
    });
</script>
<noscript><p><img src="//analytics.faustedition.net/matomo.php?idsite=2&amp;rec=1" style="border:0;" alt="" /></p></noscript>
<!-- End Matomo Code -->

  </body>
</html>
