define(["jquery", "js.cookie"], function ($, Cookies) {
   var VERSION = "1.0 RC",
       oldversion = true,
       hostmatch = /(v[^.]+)\.faustedition\.net/.test(),
       newURL = window.location.protocol + '//faustedition.net' + window.location.pathname + window.location.search + window.location.hash;

   var showVersionNote = function() {
       var versionDiv = $('<div id="version-note" class="pure-alert pure-alert-top pure-alert-success">' +
           '<strong><a class="newest-version-link internal" href="//faustedition.net">Neuere Version verfügbar</a></strong> ' +
           'Dies ist Version <span class="current-version-no">1.0 RC</span> – besuchen Sie die '+
           '<a class="newest-version-link internal" href="//faustedition.net">neueste Version der Edition.</a> ' +
           '<a href="#" class="pull-right closebtn">Schließen <b>×</b></a></div>');
       versionDiv.find('.newest-version-link').attr('href', newURL);
       versionDiv.find('.current-version-no').text(VERSION);
       $('header').after(versionDiv);
       versionDiv.on('click', '.closebtn', function (event) {
          versionDiv.remove();
          if (navigator.cookieEnabled)
              Cookies.set('faust-version-note', 'no', {domain: window.location.hostname});
       });
   };

   if (oldversion && (hostmatch !== null) && Cookies.get('faust-version-note') !== 'no') {
           $(showVersionNote());
   }
});
