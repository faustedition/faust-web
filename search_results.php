<?php include "includes/header.php"; ?>
<section>

    <nav class="pure-center tab-bar">
     <a id="btn-transcripts" href="#" class="pure-button pure-button-selected">Transkripte</a>
     <a id="btn-metadata" href="#" class="pure-button">Metadaten</a>
     <a id="btn-testimony" href="#" class="pure-button">Entstehungszeugnisse</a>
     <!--<a id="btn-about" href="#" class="pure-button pure-button-disabled">Über die Edition</a>
        <span> </span>
     <a href="#" class="pure-button">Erweiterte Suche</a>-->
    </nav>

    <div id="tabcontainer">
        <article class="tab pure-grid-r" id="tab-transcripts">
            <div class="pure-u-1-5">
                <form class="pure-form">
                    <fieldset>
                        <legend>Suche nach</legend>
                        <input id="index-de" type="radio" name="index" value="text-de" checked="checked"/>
                        <label for="index-de">Wörtern</label><br/>
                        <input id="index-text" type="radio" name="index" value="text"/>
                        <label for="index-text">allen Wortformen</label><br/>
                        <input id="index-ws" type="radio" name="index" value="text-ws"/>
                        <label for="index-ws">Exakten Tokens</label><br/>
                        <input id="index-ngram" type="radio" name="index" value="ngram" disabled="disabled"/>
                        <label for="index-ngram">Substrings</label>
                    </fieldset>
                    <fieldset>
                        <legend>Sortierung</legend>
                        <input id="sort-sigil" type="radio" name="sort" value="sigil"/>
                        <label for="sort-sigil">Sigle</label><br/>
                        <input id="sort-genesis" type="radio" name="sort" value="genesis"/>
                        <label for="sort-genesis">Makrogenese</label><br/>
                        <input id="sort-sigil" type="radio" name="sort" value="relevance" checked="checked"/>
                        <label for="sort-sigil">Relevanz</label><br/>
                        <input id="sort-sigil" type="radio" name="sort" value="verse"/>
                        <label for="sort-sigil">Vers</label><br/>
                    </fieldset>
                </form>
            </div><div class="pure-u-4-5" id="transcripts-content">
                Suche läuft …
            </div>
        </article>

        <article class="tab" id="tab-metadata" style="display: none">
            Metadatenergebnisse
        </article>

        <article class="tab" id="tab-testimony" style="display: none">
            Entstehungszeugnisergebnisse
        </article>

        <article class="tab" id="tab-about" style="display: none">
            Infotextergebnisse
        </article>
    </div>
</section>
<?php include "includes/footer.php"; ?>

<script type="text/javascript">
requirejs(['faust_common', 'jquery'], function(Faust, $) {
      document.getElementById("breadcrumbs").appendChild(Faust.createBreadcrumbs([{caption: "Suche"}]));

      // Tab handling
      $('.tab-bar .pure-button').on('click', function (event) {
        var currentBtn = event.currentTarget,
            currentVerb = currentBtn.id.replace('btn-', ''),
            currentTab = $('#tab-' + currentVerb);
        $('.tab-bar .pure-button').removeClass('pure-button-selected');
        $(currentBtn).addClass('pure-button-selected');
        $('#tabcontainer .tab').hide();
        currentTab.show();
      });


      // Perform the queries
      var transcriptBody = document.getElementById('transcripts-content'),
          transcriptBtn = document.getElementById('btn-transcripts'),
          metaBody = document.getElementById('tab-metadata'),
          metaBtn = document.getElementById('btn-metadata'),
          testiBody = document.getElementById('tab-testimony'),
          testiBtn = document.getElementById('btn-testimony');

      Faust.xhr.get('/search/text' + window.location.search + '&highlight=false', 'text').then(function(response) {
            transcriptBody.innerHTML = response;
            var hits = transcriptBody.children[0].getAttribute("data-hits");
            transcriptBtn.setAttribute("data-badge", hits);
            return hits;
        }).then(function(hits) {
          if (hits <= 500)
              return Faust.xhr.get('/search/text' + window.location.search + '&highlight=true', 'text')
        }).then(function(response) {
           if (response) transcriptBody.innerHTML = response;
        }).catch(function(err) {
          Faust.error("Fehler bei der Suche", err, transcriptBody);
        });

      Faust.xhr.get('/search/meta' + window.location.search, 'text').then(function(response) {
          metaBody.innerHTML = response;
          metaBtn.setAttribute('data-badge', metaBody.children[0].getAttribute('data-hits'));
      }).catch(function(err) {
          Faust.error("Fehler bei der Metadatensuche", err, metaBody);
      });

      Faust.xhr.get('/search/testimony' + window.location.search, 'text').then(function(response) {
        testiBody.innerHTML = response;
        testiBtn.setAttribute('data-badge', testiBody.children[0].getAttribute('data-hits'));
        }).catch(function(err) {
        Faust.error("Fehler bei der Entstehungszeugnis-Suche", err, testiBody);
      });

});
</script>
