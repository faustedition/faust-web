    </main>
    <?php if ( $showFooter !== false ) : ?>
    <footer>
      <div class="pure-g-r">
        <div class="pure-u-1-2 pure-fade-50">
          <b>Faustedition<sup><mark>alpha</mark></sup></b>
          <a class="undecorated" rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/"><img alt="Creative Commons Lizenzvertrag" src="https://i.creativecommons.org/l/by-nc-sa/4.0/80x15.png" align="middle"></a>
        </div>
        <div class="pure-u-1-2 pure-right pure-fade-50 pure-noprint">
          <a href="help">Hilfe</a>
          <a href="contact">Kontakt</a>
          <a href="project">Projekt</a>
          <a href="intro">Ausgabe</a>
        </div>
      </div>
    </footer>
    <?php endif; ?>



<script>
    requirejs(['./js/faust_common.js'], function(Faust) {
        requirejs(['jquery', 'jquery.chocolat'], function ($, $chocolat) {
            $('main').Chocolat({imageSelector:'figure a', className:'faustedition', loop:true});
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
