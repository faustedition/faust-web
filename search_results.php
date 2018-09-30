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
        <article class="tab" id="tab-transcripts">
            Transkriptergebnisse
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
      var transcriptBody = document.getElementById('tab-transcripts'),
          transcriptBtn = document.getElementById('btn-transcripts'),
          metaBody = document.getElementById('tab-metadata'),
          metaBtn = document.getElementById('btn-metadata');

      Faust.xhr.get('/search/text' + window.location.search + '&highlight=false', 'text').then(function(response) {
          transcriptBody.innerHTML = response;
          transcriptBtn.setAttribute("data-badge", transcriptBody.children[0].getAttribute("data-hits"));
        }).then(function() {
          return Faust.xhr.get('/search/text' + window.location.search + '&highlight=true', 'text')
        }).then(function(response) {
          transcriptBody.innerHTML = response;
        }).catch(function(err) {
          Faust.error("Fehler bei der Suche", err, transcriptBody);
        });

      Faust.xhr.get('/search/meta' + window.location.search, 'text').then(function(response) {
          metaBody.innerHTML = response;
          metaBtn.setAttribute('data-badge', metaBody.children[0].getAttribute('data-hits'));
      }).catch(function(err) {
          Faust.error("Fehler bei der Metadatensuche", err, metaBody);
      });

});
</script>
