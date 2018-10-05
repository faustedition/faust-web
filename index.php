<?php include "includes/header.php"; ?>

<section class="pure-noprint">
  <div class="slider">
    <div class="slide-left" style="background-image:url(img/slider/mephisto.png);">
      <div class="center">
        <div class="text">
          <h2>Johann Wolfgang Goethe: Faust</h2>
          <h3>Historisch-kritische Edition</h3>
                <p>
                  Herausgegeben von Anne Bohnenkamp, Silke Henke und Fotis Jannidis<br>
                  unter Mitarbeit von Gerrit Brüning, Katrin Henzel,
                  Christoph Leijser, Gregor Middell, Dietmar Pravida,
                  Thorsten Vitt und Moritz Wissenbach<br>
                  Frankfurt am Main, Weimar, Würzburg 2017
                </p>
                <a class="pure-button pure-button-primary" href="/archive">Archiv</a>
                <a class="pure-button pure-button-primary" href="/genesis">Genese</a>
                <a class="pure-button pure-button-primary" href="/text">Text</a>
              </p>
              <p>
                <a class="pure-button" href="/intro">Über die Ausgabe</a>
                <a class="pure-button" href="/project">Mitwirkende</a>
              </p>

              <p><a class="undecorated" href="http://www.dfg.de" target="_blank"><img alt="DFG - Deutsche Forschungsgesellschaft" src="img/DFG-Logo.svg" width="175"></a></p>
        </div>
      </div>
    </div>

    <div class="slide-right" style="background-color:#b7b18f; background-image:url(img/slider/2-II-H.1.png), url(img/slider/2-II-H.1-bg.png);">
      <div class="center">
        <div class="text">
          <h2>Archiv</h2>
              <p>Zum Faust ist <a href="/archive_locations?view=archives">weltweit</a>
                  ein umfangreicher Bestand an <a
                      href="/archive_manuscripts?view=manuscript-concordance"
                      >Handschriften</a> und <a
                      href="/archive_manuscripts?view=print-concordance">Drucken</a> aus
                  der Zeit von von etwa 1774 bis 1831 erhalten. Das <a href="/archive"
                      >Archiv</a> macht die gesamte Überlieferung in Abbildungen,
                  Transkriptionen und Zeugenbeschreibungen zugänglich.</p>
              <p>
                <a class="pure-button pure-button-primary" href="/archive">Archiv</a>
              </p>
        </div>
      </div>
    </div>

    <div class="slide-left" style="background-color:#d8d5ca; background-image:url(img/slider/H-P123.5.png), url(img/slider/H-P123.5-hg.png);">
      <div class="center">
        <div class="text">
          <h2>Genese</h2>
              <p>Goethe hat beinahe in jeder Phase seines Lebens an dem Werkprojekt Faust
                  gearbeitet. Verschiedene Grafiken stellen die <a
                      href="/genesis">Genese</a> von Goethes Faust
                  retrospektiv, d.h. vom abgeschlossenen Werk ausgehend dar.</p>
              <p>
                <a class="pure-button pure-button-primary" href="/genesis">Genese</a>
              </p>
        </div>
      </div>
    </div>

    <div class="slide-right" style="background-color:#cdc6ac; background-image:url(img/slider/2-H.png), url(img/slider/2-H-hg.png);">
      <div class="center">
        <div class="text">
          <h2>Text</h2>
              <p>Der Text des <a href="/print/faust#part1">Faust I</a> beruht auf dem
                  Erstdruck von 1808, der des <a href="/print/faust#part2">Faust II</a> auf
                  der großen Reinschrift, die heute im Goethe- und Schiller-Archiv liegt. Vom
                  Text aus sind alle übrigen handschriftlichen und gedruckten Fassungen
                  erreichbar.</p>
              <p>
                <a class="pure-button pure-button-primary" href="/text">Text</a>
              </p>
        </div>
      </div>
    </div>
  </div>
</section>
<script type="text/javascript">
      requirejs(['faust_common', 'jquery', 'jquery.slick'], function (Faust, $, slick) {
          $(function () {
              $(window).resize(function (event) {
                  $('.slider .center').css('height', $('body').height() - $('footer').outerHeight()); // adjust slider height
              });

              $(window).trigger('resize');
              /* onload */
              var slideshow = $('.slider').slick({
                  adaptiveHeight: true,
                  dots: true,
                  autoplaySpeed: 8000,
                  pauseOnHover: true,
                  responsive: [
                      {
                          breakpoint: 1125,
                          settings: {
                              arrows: false
                          }
                      }
                  ]
              });
              slideshow.slick('slickPlay'); // autoplay
              $('.slider *').click(function () {
                  slideshow.slick('slickPause'); // stop on click
              });
          });
      });
</script>

<?php include "includes/footer.php"; ?>
