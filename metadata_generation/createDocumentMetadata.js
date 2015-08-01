var createDocumentMetadata = function(metadataDirectory, transcriptDirectory, errorLog) {
  "use strict";

  var getFilesRecursive = require("./getFilesRecursive.js");

  var fs = require("fs");
  var path = require("path");

  var xpath = require("xpath");
  var DOMParser = require("xmldom").DOMParser;

  var documentMetadata = {};
  // add prefix of xml docs to result
  documentMetadata.basePrefix = "faust://xml/";
  // add prefix of facsimiles to result
  documentMetadata.imgPrefix = "faust://facsimile/";
  // add prefix of image text link files to result
  documentMetadata.linkPrefix = "faust://xml/image-text-links/";
  // add prefix of metadata files to result
  documentMetadata.metadataPrefix = "faust://xml/document/";
  // add prefix of printed witnesses to result
  documentMetadata.printPrefix = "faust://xml/print/";
  documentMetadata.metadata = [];


  var metadataFiles = getFilesRecursive(metadataDirectory, {returnFiles: true, returnDirs: false, filter: {xml: true}});
  metadataFiles.forEach(function(metadataFilename) {
    var i;
    var documentResult = {};

    var metadataXmlString = fs.readFileSync(metadataFilename, "utf8");
    var metadataDom = new DOMParser().parseFromString(metadataXmlString, "text/xml");

    // add relative path to current metadata result
    documentResult.document = metadataFilename.replace(metadataDirectory, "");

    // add type "print" to documents that are of type print instead of archivalDocument
    if(metadataDom.documentElement.nodeName === "print") {
      documentResult.type = "print";
    }

    // extract sigils from metadata
    documentResult.sigils = {};

    
    // extract and store repository value
    var repositoryNodes = xpath.select("./*[local-name(.)='metadata']/*[local-name(.)='repository']", metadataDom.documentElement);
    // documents of type print don't have a repository in metadata
    if(repositoryNodes.length === 0) {
      documentResult.sigils.repository = "print";
    } else {
      documentResult.sigils.repository = repositoryNodes[0].textContent;
    }

    // extract and store subRepository value
    var subRepositoryNodes = xpath.select("./*[local-name(.)='metadata']/*[local-name(.)='subRepository']", metadataDom.documentElement);
    // documents have one or no subRepository
    if(subRepositoryNodes.length === 1) {
      documentResult.sigils.subRepository = subRepositoryNodes[0].textContent.replace(/\n +/g, " ");
    }

    var collectionNodes = xpath.select("./*[local-name(.)='metadata']/*[local-name(.)='collection']", metadataDom.documentElement);
    // documents have one or no collection
    if(collectionNodes.length === 1) {
      documentResult.sigils.collection = collectionNodes[0].textContent;
    }

    var idnoNodes = xpath.select("./*[local-name(.)='metadata']/*[local-name(.)='idno']", metadataDom.documentElement);
    // process individual sigils
    for(i = 0; i < idnoNodes.length; i++) {
      // store sigil name and value
      documentResult.sigils["idno_" + idnoNodes[i].getAttribute("type")] = idnoNodes[i].textContent;
      // if sigil is "gsa_1" also extract an associated "note". There can be several note elements in the same hierarchy.
      // only the note element that is the first element following a gsa_1 sigil is related to the sigil
      if(idnoNodes[i].getAttribute("type") === "gsa_1") {
        var gsa_1Sibling = idnoNodes[i].nextSibling;
        while(gsa_1Sibling.nodeType !== 1) {
          gsa_1Sibling = gsa_1Sibling.nextSibling;
        }
        if(gsa_1Sibling.nodeName === "note") {
          // gsa_1 note found. store in results
          documentResult.sigils.note_gsa_1 = gsa_1Sibling.textContent.replace(/\n +/g, " ");
        }
      }
    }

    var subidnoNodes = xpath.select("./*[local-name(.)='metadata']/*[local-name(.)='subidno']", metadataDom.documentElement);
    // process individual subidno sigils
    for(i = 0; i < subidnoNodes.length; i++) {
      // store sigil name and value
      documentResult.sigils["subidno_" + subidnoNodes[i].getAttribute("type")] = subidnoNodes[i].textContent;
    }

    // add headnote to sigils
    var headNoteNodes = metadataDom.getElementsByTagName("headNote");
    if(headNoteNodes.length === 1) {
      documentResult.sigils.headNote = headNoteNodes[0].textContent;
    } else {
      documentResult.sigils.headNote = "";
    }

    // add relative path to transcripts to metadata result. if no path is given, store null
    documentResult.base = metadataDom.documentElement.getAttribute("xml:base").replace(documentMetadata.basePrefix + "transcript/", "");
    if(documentResult.base === "") {
      documentResult.base = "null";
    }

    // textual transcript's filename to metadata result. if no filename is given, store null
    if(metadataDom.getElementsByTagName("textTranscript").length === 1) {
      documentResult.text = metadataDom.getElementsByTagName("textTranscript")[0].getAttribute("uri");
    } else {
      documentResult.text = "null";
    }


    // process all (diplomatic transcript) pages related to metadata document
    documentResult.page = [];

    // select and iterate through pages
    Array.prototype.slice.call(metadataDom.getElementsByTagName("page")).forEach(function(page) {
      // create object for current page's result and append to document's result
      var pageResult = {};
      documentResult.page.push(pageResult);
      pageResult.doc = [];

      // iterate through docTranscripts and store to page's result
      Array.prototype.slice.call(page.getElementsByTagName("docTranscript")).forEach(function(docTranscript) {
        var docTranscriptResult = {};
        pageResult.doc.push(docTranscriptResult);

        // if docTranscript has a uri attached, write uri to result
        if(docTranscript.getAttribute("uri") !== "") {
          docTranscriptResult.uri = docTranscript.getAttribute("uri");

          // open docTranscript to extract information about facsimile names and image-text-link names
          if(docTranscriptResult.uri) {
            try {
              var docTranscriptString = fs.readFileSync(path.join(transcriptDirectory, documentResult.base, docTranscriptResult.uri), "utf8");
              var docTranscriptDom = new DOMParser().parseFromString(docTranscriptString, "text/xml");

              docTranscriptResult.img = [];

              Array.prototype.slice.call(docTranscriptDom.getElementsByTagName("graphic")).forEach(function(graphicElement) {
                if(graphicElement.getAttribute("mimeType") === "image/svg+xml") {
                  docTranscriptResult.imgLink = graphicElement.getAttribute("url").replace(documentMetadata.linkPrefix, "");
                } else {
                  docTranscriptResult.img.push(graphicElement.getAttribute("url").replace(documentMetadata.imgPrefix, ""));
                }
              });
            } catch (err) {
              fs.appendFile(errorLog, "ERROR: failed to open docTranscript file: " + path.join(transcriptDirectory, documentResult.base, docTranscriptResult.uri) + "\n");
            }
          }
        }
      });
    });
    documentMetadata.metadata.push(documentResult);
  });

  return documentMetadata;
};

module.exports = createDocumentMetadata;
