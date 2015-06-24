(function() {
  "use strict";

  var createSimpleQueue = require("./simpleQueue.js");
  var getFilesRecursive = require("./getFilesRecursive.js");
  var mkdirSyncRecursive = require("./mkdirSyncRecursive.js");
  var renderSvgContent = require("./renderSvgContent.js");

  var fs = require("fs");
  var path = require("path");
  var cp = require("child_process");
  var Buffer = require("buffer").Buffer;

  var xpath = require("xpath");
  var DOMParser = require("xmldom").DOMParser;

  var conf;  // variable to store loaded configuration

  // try to open configuration file
  fs.readFile("settings.json", "utf8", function(err, data) {
    var metadataFiles;

    if(err) {
      // config could't be loaded
      console.log("ERROR: no config file (settings.json) was found");
    } else {
      // config loaded - parse into js object
      conf = JSON.parse(data);

      // create empty error logfile
      fs.writeFile(conf.errorLog, "", "utf8", function(err) {
        if(err) {
          console.log("ERROR: failed to create error logfile");
        } else {
          // get all metadata filenames and process files
          metadataFiles = getFilesRecursive(conf.input.doc.metadata, {returnFiles: true, returnDirs: false, filter: {xml: true}});
//TODO replace variables (createSimpleQueue) with parameters!
          var metadataFileQueue = createSimpleQueue(processMetadataFile, 10, 10);
          metadataFiles.forEach(function(metadataFilename) {
            metadataFileQueue.push({"metadataFilename": metadataFilename});
          });
        }
      });
    }
  });

  var renderSvg = (function() {
  
    return function(data, taskFinishedCallback) {
      var imageTextLinkString;
      if(data.imageTextLinkFilename !== undefined) {
        imageTextLinkString = fs.readFileSync(data.imageTextLinkFilename, "utf8");
      }

      var renderSvgContentRendered = function(svgResults) {
        if(svgResults.diplomaticSvg !== undefined) {
          fs.writeFileSync(path.join(data.diplomaticOutputDir, "page_" + data.pageNumber + ".html"), svgResults.diplomaticSvg);
        }
        if(svgResults.facsimileOverlaySvg !== undefined) {
          fs.writeFileSync(path.join(data.facsimileOverlayOutputDir, "page_" + data.pageNumber + ".html"), svgResults.facsimileOverlaySvg);
        }
        taskFinishedCallback();
      };

      renderSvgContent(JSON.stringify(data.transcriptJson), imageTextLinkString, conf.rendering.url, renderSvgContentRendered);
    };
  })();

  var transformTranscript = (function() {

    var svgGenerationQueue = createSimpleQueue(renderSvg, 1, 10);

    return function(data, taskFinishedCallback) {
//    console.log("started");

      var result;
      var errResult;
      var java = cp.spawn("java", ["-Dfile.encoding=UTF-8", "-cp", "./*", "de.faustedition.transcript.simple.SimpleTransform"], {cwd: conf.javaApp.path});

      // collect result from process
      java.stdout.on("data", function(data) {
        if(result === undefined) {
          result = data;
        } else {
          result = Buffer.concat([result, data]);
        }
      });

      // return completed result to callback
/*          java.stdout.on("end", function() {
        if(result !== undefined) {
          callback(result.toString());
        }
      });
*/
      // collect error message from process
      java.stderr.on("data", function(data) {
        if(errResult === undefined) {
          errResult = data;
        } else {
          errResult = Buffer.concat([errResult, data]);
        }
      });

      // write error to error log
      java.stderr.on("end", function() {
        if(errResult !== undefined) {
          fs.appendFile(conf.errorLog, "ERROR: failed to transform transcript from xml to json\n");
        }
      });

      // decrease process counter on process close
      java.on("close", function() {
//        console.log("stopped");
        if(result !== undefined) {
          //callback(result.toString());
          svgGenerationQueue.push({"transcriptJson": result.toString(), "imageTextLinkFilename": data.imageTextLinkFilename, "diplomaticOutputDir": data.diplomaticOutputDir, "facsimileOverlayOutputDir": data.facsimileOverlayOutputDir, "pageNumber": data.pageNumber});
          taskFinishedCallback();
        }
      });

      java.stdin.write(data.transcriptString);
      java.stdin.end();
    };
  })();

  var processDiplomaticTranscript = (function() {

    var transcriptTransformQueue = createSimpleQueue(transformTranscript, 3, 10);
  
    return function(data, taskFinishedCallback) {

      var facsimileFilename; 
      var imageTextLinkFilename;

      var diplomaticOutputDir = path.join(conf.output.svg.diplomatic, data.metadataFilename.replace("/var/www/html/new2/xml/document/", ""));
      var facsimileOverlayOutputDir = path.join(conf.output.svg.facsimileOverlay, data.metadataFilename.replace("/var/www/html/new2/xml/document/", ""));
      mkdirSyncRecursive(diplomaticOutputDir);
      mkdirSyncRecursive(facsimileOverlayOutputDir);

      fs.readFile(data.transcriptFilename, "utf8", function(err, transcriptString) {
        if(err) {
          fs.appendFile(conf.errorLog, "ERROR: failed to open transcript \"" + data.transcriptFilename + "\" from metadata file: \"" + data.metadataFilename + "\"\n", function(err) {
            if(err) {
              console.log(err);
            }
          });
        } else {

          // transform transcript to json
          // create diplomatic rendering
          // create overlay rendering

          var transcriptDom = new DOMParser().parseFromString(transcriptString, "text/xml");

          var imageNodes = xpath.select("//*[local-name(.)='facsimile']/*[local-name(.)='graphic' and not(@mimeType) and @url]/@url", transcriptDom);
          var imageTextLinkNodes = xpath.select("//*[local-name(.)='facsimile']/*[local-name(.)='graphic' and @mimeType='image/svg+xml' and @url]/@url", transcriptDom);
          if(imageNodes.length > 0) {
// first image name: imageNodes[0].nodeValue
//                          console.log(imageNodes[0].nodeValue);
            facsimileFilename = path.join(conf.input.doc.facsimile, imageNodes[0].nodeValue.replace("faust://xml/transcript/", ""));
          }
          if(imageTextLinkNodes.length > 0) {
            // first image-text-link file name: imageTextLinkNodes[0].nodeValue
            imageTextLinkFilename = path.join(conf.input.doc.imageTextLink, imageTextLinkNodes[0].nodeValue.replace("faust://xml/image-text-links/", ""));
          }
          transcriptTransformQueue.push({"transcriptString": transcriptString, "diplomaticOutputDir": diplomaticOutputDir, "imageTextLinkFilename": imageTextLinkFilename, "facsimileOverlayOutputDir": facsimileOverlayOutputDir, "facsimileFilename": facsimileFilename, "pageNumber": data.pageNumber});
        }

        taskFinishedCallback();
      });

    };

  })();

  var processMetadataFile = (function() {

//    var diplomaticTranscriptQueue = createSimpleQueue(processDiplomaticTranscript, 3, 10);
//TODO replace variables (createSimpleQueue) with parameters!
//    var diplomaticTranscriptQueue = createSimpleQueue(function(data, end) {console.log(data.transcriptFilename); end();}, 3, 10);
//    var diplomaticTranscriptQueue = createSimpleQueue(function(data, end) {end();}, 3, 10);
    var diplomaticTranscriptQueue = createSimpleQueue(processDiplomaticTranscript, 3, 10);
  
    return function(data, taskFinishedCallback) {
      fs.readFile(data.metadataFilename, "utf8", function(err, metadataString) {
        var metadataDom;
        var transcriptPageNodes;
        var pageNumber = 0;

        if(err) {
          fs.appendFile(conf.errorLog, "ERROR: failed to open \"" + metadataFilename + "\"\n");
        }

        // create DOM from metadata xml document
        metadataDom = new DOMParser().parseFromString(metadataString, "text/xml"); 

        // try to get xml:base attribute value
        var xmlBaseNodes = xpath.select("/*/attribute::base", metadataDom);
        // only continue if exactly one attribute by the name of (xml)base was found
        if(xmlBaseNodes.length === 1) {
          var xmlBase = xmlBaseNodes[0].nodeValue;
          // determine local directory from faust uri
          var transcriptDirectory = path.join(conf.input.doc.transcript, xmlBase.replace("faust://xml/transcript/", ""));


          transcriptPageNodes = xpath.select("//*[local-name(.)='page' and namespace-uri(.)='http://www.faustedition.net/ns']", metadataDom);
          transcriptPageNodes.forEach(function(transcriptPageNode) {
            var uri = xpath.select(".//*[local-name(.)='docTranscript']/@uri", transcriptPageNode);
            pageNumber = pageNumber + 1;

            if(uri.length > 0) {
              var transcriptFilename = path.join(transcriptDirectory, uri[0].nodeValue);
              diplomaticTranscriptQueue.push({"transcriptFilename": transcriptFilename, "metadataFilename": data.metadataFilename, "pageNumber": pageNumber});
  // name of transcript: transcriptFilename
//                      console.log(transcriptFilename);
            } else {
              // page has no uri / no transcript attached
            }

        });


        }
      taskFinishedCallback();
      });
    };
  })();

  
})();
