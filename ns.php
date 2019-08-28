      <?php include "includes/header.php"; ?>
      <section class="center pure-g-r">
        
        <article class="pure-u-1">
            <h1><a class="internal" href="http://www.faustedition.net/ns">http://www.faustedition.net/ns</a></h1>
            <h2>Namespace für proprietäre Schemata in der Faustedition</h2>
            <p>
            Die URI <strong>http://www.faustedition.net/ns</strong> dient als Sammel-<a href="https://de.wikipedia.org/wiki/Namensraum_(XML)">Namespace</a>-URI für Namen, die Spezifisches für die Faustedition beschreiben. Bitte beachten Sie die jeweils mit den konkreten XML-Dokumenten verknüpften Schemadokumente für mehr Informationen zum konkreten Format.
            </p>
            <p>Insbesondere wird der Namespace benutzt:</p>
            <ul>
                <li>für Fausteditions-spezifische Elemente in der <a href="https://github.com/faustedition/faust-schema">TEI-Customization der Edition</a></li>
                <li>für das <a href="https://github.com/faustedition/faust-schema/blob/master/src/main/xsd/metadata.xsd">Metadaten-Format</a> der Edition</li>
                <li>für die Codierung der Quellen zur <a href="/intro_macrogenesis">Makrogenese</a></li>
                <li>für einige kleinere spezifischere Dateien, siehe die dort verlinkten Schemata</a></li>
            </ul>
        </article>
        
        <div class="pure-u-1-5"></div>

      </section>
      <?php include "includes/footer.php"; ?>

      <script type="text/javascript">
      // set breadcrumbs
      requirejs(['faust_common'], function(Faust) {
        document.getElementById("breadcrumbs").appendChild(Faust.createBreadcrumbs([{caption: "Namespace"}]));
      });
      </script>
