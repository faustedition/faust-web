<?php $showFooter = false; ?>
<?php include "includes/header.php"; ?>
<section class="center">

  <article class="pure-center">
      <h1 id="archiveName"></h1>
      <p>
        <span id="institution"></span><br>
        <span id="location"></span><br>
        <a id="urlLink"><span id="url"></span></a>
      </p>

      <h2>Archivalien</h2>
      <div id="archive-table-container" class="pure-left"></div>
  </article>

</section>

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

  // archive name
  document.getElementById("archiveName").appendChild(document.createTextNode(archives[repositoryName].name));

  // archive institution
  if(archives[repositoryName].institution) {
    document.getElementById("institution").appendChild(document.createTextNode(archives[repositoryName].institution));
  }

  // archive location
  if(archives[repositoryName].country || archives[repositoryName].city) {
    var locationString = "";
    if(archives[repositoryName].city) {
      locationString = archives[repositoryName].city;
    }
    if(archives[repositoryName].country) {
      if(locationString !== "") {
        locationString = locationString + ", ";
      }
      locationString = locationString + archives[repositoryName].country;
    }
    document.getElementById("location").appendChild(document.createTextNode(locationString));
  }

  // archive link
  if(archives[repositoryName].url) {
    var link = document.createElement("a"); // need object to return hostname
    link.href = archives[repositoryName].url;
    document.getElementById("url").appendChild(document.createTextNode(link.hostname));
    document.getElementById("urlLink").href = archives[repositoryName].url;
    document.getElementById("urlLink").title = archives[repositoryName].displayName;
  }
  createConcordanceTable(document.getElementById("archive-table-container"), repositoryName);

</script>

<?php include "includes/footer.php"; ?>
