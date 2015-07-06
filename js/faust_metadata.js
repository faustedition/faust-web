var metadataText = (function() {
  "use strict";
  
  var metadata = {};

  var tagNameMapping = {
    "headNote": "Umfang – Inhalt",
    "repository": "Aufbewahrungsort",
    "subRepository": "Abteilung",
    "collection": "Sammlung",
    "subidno": "Teilsigle",
    //"textTranscript"": "entfällt als Angabe, wird direkt in Konvolutstruktur übersetzt und als Bild angezeigt
    "classification": "Handschriftentyp",
    "history": "Überlieferung",
    "container": "Aufbewahrungsform",
    "binding": "Einband",
    "numberingList": "Foliierung/Paginierung",
//    "numbering": "1., 2. usw. wäre das möglich, die einfach so durchzunummerieren? ",
    "condition": "Erhaltungszustand",
    "dimensions": "Blattmaße",
    "width": "Breite in mm",
    "height": "Höhe in mm ",
    "format": "Format",
    "bindingMaterial": "Bindematerial",
    "stabMarks": "Stichlöcher",
    "stabMark": "Stichloch in mm ",
    "leafCondition": "Erhaltungszustand des Blatts",
    "edges": "Ränder",
//    "edges>cut</edges> - beschnitten",
//    "edges>uncut</edges> - unbeschnitten ",
    "paperType": "Papiersorte",
    "paperColour": "Papierfarbe",
    "chainLines": "Steglinienabstand in mm",
    "paperMill": "Papiermühle",
    "watermarkID": "Wasserzeichen-Kürzel",
    "countermarkID": "Gegenzeichen-Kürzel",
//    "references /> / <reference": "Bibliographischer Nachweis",
    "patchDimensions": "Zettelmaße",
    "patchType": "Art der Anbringung",
//    "patchType>glue</patchType> - geklebt",
//    "patchType>pin</patchType> - geheftet",
//    "patchType>lose</patchType> - lose ",
    "patchPaperType": "Papiersorte (Zettel)",
    "patchPaperColour": "Papierfarbe (Zettel)",
    "patchChainLines": "Steglinienabstand in mm (Zettel)",
    "patchPaperMill": "Papiermühle (Zettel)",
    "patchWatermarkID": "Wasserzeichen-Kürzel (Zettel)",
    "patchCountermarkID": "Gegenzeichen-Kürzel (Zettel)",
    "references": "Bibliographischer Nachweis",
    "patchReferences": "Bibliographischer Nachweis (Zettel)",
  };



      var linearizeMetadata = function (node) {

        var txt = "";

        for (var i = 0; i < node.childNodes.length; i++) {

          var childNode = node.childNodes[i];
          if (childNode.nodeType === childNode.ELEMENT_NODE) {
            txt += childNode.nodeName + ": ";
          }
          if (childNode.nodeType === childNode.TEXT_NODE) {
            txt += childNode.textContent.replace(/^\s*|\s(?=\s)|\s*$/g, "");
          }

          txt += linearizeMetadata(childNode);

          if (childNode.nodeType === childNode.ELEMENT_NODE) {
            txt += ". ";
          }

        }

        return txt;
      };



  metadata.transformXml = (function(){
  
    return function(xmlDocument) {
      
      var metadataContainer = document.createElement("div");
      metadataContainer.id = "metadataContainer";
      metadataContainer.className = "metadata-container";

      var processXmlNode = function(xmlNode, inMetadata) {
        var childNode = xmlNode.firstElementChild;
        if(childNode !== null) {
          do {
            if(childNode.nodeName === "metadata") {
              processXmlNode(childNode, true);
            }
            
            if(inMetadata) {
              // don't process "textTranscript"
              if(childNode.tagName !== "textTranscript") {
                var childDiv = document.createElement("div");
                var title = document.createElement("span");
                title.className = "metadata-title";
                if(tagNameMapping[childNode.tagName] !== undefined) {
                  title.appendChild(document.createTextNode(tagNameMapping[childNode.tagName] + ": "));
                } else {
                  title.appendChild(document.createTextNode(childNode.tagName + ": "));
                }
                childDiv.appendChild(title);
                childDiv.appendChild(document.createTextNode(linearizeMetadata(childNode)));
                metadataContainer.appendChild(childDiv);
              }
            }
          } while( (childNode = childNode.nextElementSibling) );
        }
      };

      processXmlNode(xmlDocument.firstChild);
        return metadataContainer;
    };
  })();

  return metadata;
})();




