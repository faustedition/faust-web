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
                        <input id="index-text-de" type="radio" name="index" value="text-de"/>
                        <label for="index-text-de">Wörtern</label><br/>
                        <input id="index-text" type="radio" name="index" value="text"/>
                        <label for="index-text">allen Wortformen</label><br/>
                        <input id="index-text-ws" type="radio" name="index" value="text-ws"/>
                        <label for="index-text-ws">Exakten Tokens</label><br/>
                        <input id="index-ngram" type="radio" name="index" value="ngram" disabled="disabled"/>
                        <label for="index-ngram">Substrings</label>
                    </fieldset>
                    <fieldset>
                        <legend>Sortierung</legend>
                        <input id="order-sigil" type="radio" name="order" value="sigil"/>
                        <label for="order-sigil">Sigle</label><br/>
                        <input id="order-genesis" type="radio" name="order" value="genesis"/>
                        <label for="order-genesis">Makrogenese</label><br/>
                        <input id="order-relevance" type="radio" name="order" value="relevance"/>
                        <label for="order-relevance">Relevanz</label><br/>
                        <input id="order-verse" type="radio" name="order" value="verse"/>
                        <label for="order-verse">Vers</label><br/>
                    </fieldset>
                    <fieldset>
                        <legend>Optionen</legend>
                        <input id="option-sp" type="checkbox" name="sp" title="nur im Sprechtext">
                        <label for="option-sp">nur im Sprechtext</label>
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

      var state = {
        defaults: {
          q: null,
          index: "text-de",
          order: "sigil",
          sp: false,
          tab: "transcripts"
        },
        current: {},
        fromDefaults: function () { this.current = $.extend({}, this.defaults); },
        fromQuery: function (params) {
          if (typeof params === "undefined")
            params = Faust.url.getParameters();
          this.current = $.extend(this.current, params);
        },
        toForm: function () {
          $('#index-' + this.current.index).prop('checked', true);
          $('#order-' + this.current.order).prop('checked', true);
          $('#option-sp').prop('checked', this.current.sp)
          setTab(this.current.tab)
        },
        fromForm: function() {
          this.current.index = $('[name=index]:checked').val();
          this.current.order = $('[name=order]:checked').val();
          this.current.sp = $('#option-sp').is('checked');
        },
        toQuery: function () {
          var params = $.extend({}, this.current);
          delete params.tab;
          return $.param(params);
        }
      };

      var transcriptBody = document.getElementById('transcripts-content'),
        transcriptBtn = document.getElementById('btn-transcripts'),
        metaBody = document.getElementById('tab-metadata'),
        metaBtn = document.getElementById('btn-metadata'),
        testiBody = document.getElementById('tab-testimony'),
        testiBtn = document.getElementById('btn-testimony');

      var searchTranscripts = function searchTranscripts() {
        return Faust.xhr.get('/query/text?' + state.toQuery() + '&highlight=false', 'text').then(function (response) {
          transcriptBody.innerHTML = response;
          var hits = transcriptBody.children[0].getAttribute("data-hits");
          transcriptBtn.setAttribute("data-badge", hits);
          return hits;
        }).then(function (hits) {
          if (hits <= 500)
            return Faust.xhr.get('/query/text?' + state.toQuery() + '&highlight=true', 'text')
        }).then(function (response) {
          if (response) transcriptBody.innerHTML = response;
        }).catch(function (err) {
          Faust.error("Fehler bei der Suche", err, transcriptBody);
        });
      };

      var searchMetadata = function searchMetadata() {
        return Faust.xhr.get('/query/meta?' + state.toQuery(), 'text').then(function (response) {
          metaBody.innerHTML = response;
          metaBtn.setAttribute('data-badge', metaBody.children[0].getAttribute('data-hits'));
        }).catch(function (err) {
          Faust.error("Fehler bei der Metadatensuche", err, metaBody);
        });
      };

      var searchTestimony = function searchTestimony() {
        return Faust.xhr.get('/query/testimony?' + state.toQuery(), 'text').then(function (response) {
          testiBody.innerHTML = response;
          testiBtn.setAttribute('data-badge', testiBody.children[0].getAttribute('data-hits'));
        }).catch(function (err) {
          Faust.error("Fehler bei der Entstehungszeugnis-Suche", err, testiBody);
        });
      };

      var setTab = function setTab(currentVerb) {
        var currentTab = $('#tab-' + currentVerb),
          currentBtn = $('#btn-' + currentVerb);
        $('.tab-bar .pure-button').removeClass('pure-button-selected');
        $(currentBtn).addClass('pure-button-selected');
        $('#tabcontainer .tab').hide();
        currentTab.show();
      };


      // Initialize state
      state.fromDefaults();
      state.fromQuery();
      state.toForm();

      $('#tab-transcripts form').on("change", function () {
        state.fromForm();
        searchTranscripts();
      });


      // Tab handling
      $('.tab-bar .pure-button').on('click', function (event) {
        var currentBtn = event.currentTarget,
          currentVerb = currentBtn.id.replace('btn-', '');
        setTab(currentVerb);
        state.current.tab = currentVerb;
      });

      document.getElementById("breadcrumbs").appendChild(Faust.createBreadcrumbs([{caption: "Suche"}, {caption: state.current.q}]));

      // Initially perform the queries
      searchTranscripts();
      searchMetadata();
      searchTestimony();

});
</script>
