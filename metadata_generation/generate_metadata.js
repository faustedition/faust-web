(function() {
  "use strict";

  var createArchivesMetadata = require("./createArchivesMetadata.js");
  var createDocumentMetadata = require("./createDocumentMetadata.js");
  var createGeneticBarGraphMetadata = require("./createGeneticBarGraphMetadata.js");

  var fs = require("fs");
  var path = require("path");

  var conf;  // variable to store loaded configuration

  // try to open configuration file
  fs.readFile("settings.json", "utf8", function(err, data) {

    if(err) {
      // config could't be loaded
      console.log("ERROR: no config file (settings.json) was found");
    } else {
      // config loaded - parse into js object
      conf = JSON.parse(data);

      // create empty error logfile
      fs.writeFile(conf.errorLog, "", "utf8", function(err) {
        var archivesXmlString;

        var archivesMetadata;
        var documentMetadata;
        var geneticBarGraphMetadata;

        if(err) {
          console.log("ERROR: failed to create error logfile");
        } else {
          try {
            archivesXmlString = fs.readFileSync(conf.archivesXmlFilename, "utf8");
            archivesMetadata = createArchivesMetadata(archivesXmlString);
          } catch (err) {
            fs.appendFileSync(conf.errorLog, "ERROR: failed to open archives.xml\n");
          }
          documentMetadata = createDocumentMetadata(conf.input.doc.metadata, conf.input.doc.transcript, conf.errorLog);
          geneticBarGraphMetadata = createGeneticBarGraphMetadata(documentMetadata, conf.input.doc, conf.errorLog);

          try {
            fs.writeFile(path.join(conf.output, "document_metadata.js"), "var documentMetadata = " + JSON.stringify(documentMetadata, null));
            fs.writeFile(path.join(conf.output, "genetic_bar_graph.js"), "var geneticBarGraphData = " + JSON.stringify(geneticBarGraphMetadata, null));
            fs.writeFile(path.join(conf.output, "archives.js"), "var archives = " + JSON.stringify(archivesMetadata, null));
          } catch (err) {
            fs.appendFileSync(conf.errorLog, "ERROR: failed to write metadata results to output directory\n");
          }
        }
      });
    }
  });
})();
