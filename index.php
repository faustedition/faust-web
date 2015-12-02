      <?php include "includes/header.php"; ?>
      <section class="pure-noprint">
        <div class="slider">
          <div>
            <div class="center">
              <img src="img/slider/mephisto.png">
              <div class="text">
                <p>Die digitale Faust-Edition besteht aus einem <a href="/archives.php">Archiv</a> der Handschriften und der zu Lebzeiten erschienenen textkritisch relevanten Drucke zum  ‚Faust‘, einem Lesetext des ‚<a href="/print/faust1.html">Faust I</a> und des ‚<a href="/print/faust2.html">Faust II</a>‘ sowie  Visualisierungen zur <a href="/chessboard_overview.php">Genese</a> des Werks.</p>
              </div>
            </div>
          </div>

          <div>
            <div class="center">
              <img src="img/slider/2-II-H.1.png">
              <div class="text">
                <h2>Archiv</h2>
                <p>Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus.</p>
              </div>
            </div>
          </div>

          <div>
            <div class="center">
              <img src="img/slider/H-P123.5.png">
              <div class="text">
                <h2>Genese</h2>
                <p>Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet.</p>
              </div>
            </div>
          </div>

          <div>
            <div class="center">
              <div class="text">
                <h2>Text</h2>
                <p>Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt.</p>
              </div>
              <img src="img/slider/2-H.png">
            </div>
          </div>
        </div>
      </section>
      <script type="text/javascript" src="js/jquery.min.js"></script>
      <script type="text/javascript" src="js/jquery.slick.min.js"></script>
      <script type="text/javascript">
        jQuery(document).ready(function($){
          $('.slider').slick({
            adaptiveHeight: true,
            autoplay: true,
            dots:true,
            autoplaySpeed: 3000,
            responsive: [
              {
                breakpoint: 1125,
                settings: {
                  arrows: false
                }
              }
            ]
          });
        });
      </script>

      <section class="center pure-g-r">
        <div class="pure-u-1-5"></div>
        
        <article class="pure-u-3-5 pure-gap">

          <h2>Historisch-kritische Edition von Goethes Faust</h2>
          <p>Herausgegeben von Anne Bohnenkamp, Silke Henke und Fotis Jannidis</p>
          <p>Gefördert von: <a href="http://www.dfg.de" target="_blank"><img style="vertical-align:middle; height:45px; margin-top:-12px;" alt="DFG - Deutsche Forschungsgesellschaft" src="img/DFG-Logo.png"></a></p>
          <p><a href="project.php">Informationen zum Projekt</a></p>
          <p><a href="intro.php">Informationen zur Ausgabe</a></p>

        </article>

        <div class="pure-u-1-5"></div>

        </div>
      </section>
      <?php include "includes/footer.php"; ?>