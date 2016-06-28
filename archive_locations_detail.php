<?php $showFooter = false; ?>
<?php include "includes/header.php"; ?>
<section class="center">

  <article class="pure-center">
      <p>
        <span id="institution"><br></span>
        <span id="location"><br></span>
        <a id="url"></a>
      </p>

      <h2>Archivalien</h2>
      <div id="archive-table-container" class="pure-left"></div>
  </article>

</section>

<script type="text/javascript" src="data/document_metadata.js"></script>
<script type="text/javascript" src="data/concordance_columns.js"></script>
<script type="text/javascript" src="data/archives.js"></script>

<script type="text/javascript" src="js/faust_tables.js"></script>
<script>
  var i;

  var repositoryName = "gsa";
  var repositorySigil;
  var idnoSigil;
  var waSigil;

  var displayData;

  // get actual parameters
  var parameters = Faust.url.getParameters();

  // if 'id' is set (mandatory), set repositoryName to that value
  if(parameters["id"]) {
    repositoryName = parameters["id"];
  }

  // set breadcrumbs
   document.getElementById("breadcrumbs").appendChild(Faust.createBreadcrumbs([{caption: "Archiv", link: "archive"}, {caption: "Aufbewahrungsorte", link: "archive_locations"}, {caption: archives[repositoryName].name}]));

  // write archive information

  // archive institution
  var institutionContainer = document.getElementById("institution");
  if(archives[repositoryName].institution) {
    institutionContainer.insertBefore(document.createTextNode(archives[repositoryName].institution), institutionContainer.childNodes[0]);
  } else {
  	institutionContainer.style.display = "none";
  }

  // archive location
  var locationContainer = document.getElementById("location");
  if(archives[repositoryName].country || archives[repositoryName].city) {
    var locationString = [];
    if(archives[repositoryName].city) {
      locationString.push(archives[repositoryName].city);
    }
    if(archives[repositoryName].country) {
      locationString.push(archives[repositoryName].country);
    }
    locationString = (locationString.length > 1) ? locationString.join(", ") : locationString;
    locationContainer.insertBefore(document.createTextNode(locationString), locationContainer.childNodes[0]);
  } else {
  	locationContainer.style.display = "none";
  }

  // archive link
  var urlContainer = document.getElementById("url");
  if(archives[repositoryName].url) {
    var link = document.createElement("a"); // need object to return hostname
    link.href = archives[repositoryName].url;
    urlContainer.appendChild(document.createTextNode(link.hostname));
    urlContainer.href = archives[repositoryName].url;
    urlContainer.title = archives[repositoryName].displayName;
  } else {
  	urlContainer.style.display = "none";
  }

  // write table

  createConcordanceTable(document.getElementById("archive-table-container"), repositoryName);

</script>

<?php include "includes/footer.php"; ?>
