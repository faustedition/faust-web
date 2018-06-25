    </main>

    <noscript>
        <div class="pure-alert pure-alert-warning">
            <h3>JavaScript erforderlich</h3>
            <p>Die Faustedition bietet ein interaktives Userinterface, für das JavaScript erforderlich ist.</p>
            <p>Bitte deaktivieren Sie ggf. vorhandene Skriptblocker für diese Seite.</p>
        </div>
    </noscript>


    <footer>
      <div class="center pure-g-r">
        <div class="pure-u-1-2 pure-fade-50">
          <a class="undecorated" rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/"><img alt="Creative Commons Lizenzvertrag" src="https://i.creativecommons.org/l/by-nc-sa/4.0/80x15.png" align="middle"></a>
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
            <a href="/archive_testimonies">Dokumente zur Entstehungsgeschichte</a>
          </div>
          <div class="pure-u-1-4 pure-gap">
            <a><big>Genese</big></a>
            <a href="/genesis">Werkgenese</a>
            <a href="/genesis_faust_i">Genese Faust I</a>
            <a href="/genesis_faust_ii">Genese Faust II</a>
          </div>
          <div class="pure-u-1-4 pure-gap">
            <a href="/text"><big>Text</big></a>
            <a href="/print/faust#part_1.1">Faust I</a>
            <a href="/print/faust#part_2">Faust II</a>
            <a href="/paralipomena">Paralipomena</a>
          </div>
          <div class="pure-u-1-4 pure-gap pure-fade-50">
            <a><big>Informationen</big></a>
            <a href="/intro">Über die Ausgabe</a>
            <a href="/project">Über das Projekt</a>
            <a href="/contact">Kontakt</a>
            <a href="/imprint">Impressum</a>
            <a href="/intro#sitemap">Sitemap</a>
            <a class="undecorated" rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/"><img alt="Creative Commons Lizenzvertrag" src="https://i.creativecommons.org/l/by-nc-sa/4.0/80x15.png" align="middle"></a>
          </div>
        </div>
    </script>


    <script type="text/template" id="quotation">
        <div class="center pure-g-r quotation">
          <div class="pure-u-1">
            <h3>Zitierempfehlung</h3>
            <p class="quotation-content">
              Historisch-kritische Faustedition.
              Herausgegeben von Anne Bohnenkamp, Silke Henke und Fotis Jannidis.
              Unter Mitarbeit von Gerrit Brüning, Katrin Henzel, Christoph Leijser, Gregor Middell, Dietmar Pravida, Thorsten Vitt und Moritz Wissenbach.
              Version 1. Frankfurt am Main / Weimar / Würzburg 2016,
              <span>Startseite</span>,
              <span>URL: <?php echo $_SERVER['HTTP_HOST']; ?></span>,
              abgerufen am <?php echo date('d.m.Y'); ?>.
            </p>
            <p><i class="fa fa-paste pure-fade-50"></i> <a href="#" data-target=".quotation-content">kopieren</a></p>
          </div>
        </div>
    </script>

<script>
requirejs(['jquery', 'jquery.chocolat', 'jquery.overlays', 'jquery.clipboard', 'faust_common'],
  function ($, $chocolat, $overlays, $clipboard, Faust) {
    $('main').Chocolat({className:'faustedition', loop:true});
    $('header nav').menuOverlays({highlightClass:'pure-menu-selected', onAfterShow: function() {
        $('[data-target]').copyToClipboard();
    }});
    Faust.addToTopButton();
});
</script>

<!-- Piwik -->
<script type="text/javascript">
  var _paq = _paq || [];
  _paq.push(['trackPageView']);
  _paq.push(['enableLinkTracking']);
  (function() {
    var u="//analytics.faustedition.net/";
    _paq.push(['setTrackerUrl', u+'piwik.php']);
    _paq.push(['setSiteId', 1]);
    var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
    g.type='text/javascript'; g.async=true; g.defer=true; g.src=u+'piwik.js'; s.parentNode.insertBefore(g,s);
  })();
</script>
<noscript><p><img src="//analytics.faustedition.net/piwik.php?idsite=1" style="border:0;" alt="" /></p></noscript>
<!-- End Piwik Code -->
  </body>
</html>
