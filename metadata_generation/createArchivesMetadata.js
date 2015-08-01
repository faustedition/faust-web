var createArchivesMetadata = function(archivesXmlString) {
  "use strict";

  var xpath = require("xpath");
  var DOMParser = require("xmldom").DOMParser;

  // create DOM from archives xml file
  var archivesDom = new DOMParser().parseFromString(archivesXmlString, "text/xml");
  // select all archives from dom
  var archiveNodes = xpath.select("//*[local-name(.)='archive']", archivesDom);

  var archives = {};

  archiveNodes.forEach(function(archiveNode) {
    var i, j;
    var archiveId;
    var childNode;
    var archiveResult = {};

    for(i = 0; i < archiveNode.attributes.length; i++) {
      // determine id for current archive
      if(archiveNode.attributes[i].nodeName === "id") {
        archiveId = archiveNode.attributes[i].nodeValue;
      }

      // process all child nodes for current archive
      for(i = 0; i < archiveNode.childNodes.length; i++) {
        childNode = archiveNode.childNodes[i];
        // only process child nodes that are element nodes
        if(childNode.nodeType === 1) {
          // children either have attributes or textContent
//          if(childNode.attributes.length !== 0) {
          if(childNode.textContent !== "") {
            // process children with text content
            archiveResult[childNode.nodeName] = childNode.textContent;
          } else {
            // process children with attributes
            archiveResult[childNode.nodeName] = {};
            for(j = 0; j < childNode.attributes.length; j++) {
              archiveResult[childNode.nodeName][childNode.attributes[j].nodeName] = childNode.attributes[j].nodeValue;
            }
          }
        }
      }
      // add data from current archive to return object
      archives[archiveId] = archiveResult;
    }
  });

  return archives;
};

module.exports = createArchivesMetadata;
