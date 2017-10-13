    </main>

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
            <a href="/print/faust1">Faust I</a>
            <a href="/print/faust2">Faust II</a>
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

<script>
    requirejs(['./js/faust_common.js'], function(Faust) {
        requirejs(['jquery', 'jquery.chocolat', 'jquery.overlays'], function ($, $chocolat, $overlays) {
            $('main').Chocolat({className:'faustedition', loop:true});
            $('header nav').menuOverlays({highlightClass:'pure-menu-selected'});
        });
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
