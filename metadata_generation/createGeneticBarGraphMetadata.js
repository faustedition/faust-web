// creates an object to store verse lines in and, when all verse lines were processed and stored in this object,
// create intervals for later metadata generation.
var createVerseLineResultObject = function() {
  "use strict";

  // create objects to store verse lines according to their type
  var verseLines = {
    normal: [],
    uncertain: [],
    variant: [],
    paralipomenon: [],
    paralipomenonUncertain: []
  };

  // result object
  var verseLineResultObject = {};

  // public function to store verse lines. all verse lines found on the same page are stored
  // in an array.
  verseLineResultObject.put = function(type, pageNumber, verseLine) {
    // find out if the verseLines of the given type already has an array for the current page
    if(verseLines[type][pageNumber] === undefined) {
      // if not create an array
      verseLines[type][pageNumber] = [];
    }
    // store verse line in page array
    verseLines[type][pageNumber].push(verseLine);
  };

  // transform the single verse lines that are stored in "verseLines" into objects. for each range
  // (which also can consist of only one line) an object is created which has members representing
  // the page number where the range is defined, first and last verse number of the range as well
  // as the type of the range
  var verseLinesToIntervals = function(verseLines, type) {
    var intervals = [];

    // process pages one by one
    verseLines.forEach(function(page, pageNumber) {
      // variables to keep track of start and end of an interval
      var rangeStart = -1;
      var rangeEnd = -1;

      // sort the verse lines for the current page in ascending order
      var verseLinesSorted = page.sort(function(a,b) {return a-b;});

      // iterate through all lines
      verseLinesSorted.forEach(function(verseLine, verseLineIndex) {
        if(rangeStart === -1) {
          // if this is the first line, begin a range
          rangeStart = rangeEnd = verseLine;
        } else if ( (verseLine === rangeEnd) || ( verseLine === (rangeEnd + 1) ) ){
          // adjust the end of the range if the current line is the same or the immediately following line
          rangeEnd = verseLine;
        } else {
          // if there is a gap between the current line and rangeEnd we've found a new range. return 
          // the current range
          intervals.push({"page": pageNumber, "start": rangeStart, "end": rangeEnd, "type": type});
          // and begin a new one
          rangeStart = rangeEnd = verseLine;
        }
        if(verseLineIndex === (verseLinesSorted.length - 1) ) {
          // if the current verse line is the last one on the current page it is also the end of the current
          // range.
          intervals.push({"page": pageNumber, "start": rangeStart, "end": rangeEnd, "type": type});
        }
      });


    });
    return intervals;

  };

  // create result containing all intervals for all types of verse lines
  verseLineResultObject.getVerseLineIntervals = function() {
    var result = [];

    result = result.concat(verseLinesToIntervals(verseLines.normal, "verseLine"));
    result = result.concat(verseLinesToIntervals(verseLines.uncertain, "verseLineUncertain"));
    result = result.concat(verseLinesToIntervals(verseLines.variant, "verseLineVariant"));
    result = result.concat(verseLinesToIntervals(verseLines.paralipomenon, "paralipomena"));
    result = result.concat(verseLinesToIntervals(verseLines.paralipomenonUncertain, "paralipomenaUncertain"));

    return result;

  };

  return verseLineResultObject;
};


// function select the sigil for a witness from all sigils that were found in metadata
var determineSigil = function(sigils) {
  // return object
  var sigil;

  // go through all availabe sigil types until an appropriate sigil was found. The following
  // if/else if cascade is based on the 
  if(sigils.idno_hagen !== undefined) {
    sigil = sigils.idno_hagen;
  } else if( (sigils.idno_wa_faust !== undefined) && (sigils.idno_wa_faust !== "none") ) {
    sigil = sigils.idno_wa_faust;
  } else if(sigils.idno_bohnenkamp !== undefined) {
    sigil = sigils.idno_bohnenkamp;
  } else if(sigils.idno_fischer_lamberg !== undefined) {
    sigil = sigils.idno_fischer_lamberg;
  } else if(sigils.idno_landeck !== undefined) {
    sigil = sigils.idno_landeck;
  } else if(sigils.idno_wa_helenaank !== undefined) {
    sigil = sigils.idno_wa_helenaank;
  } else if(sigils.idno_fa !== undefined) {
      sigil = sigils.idno_fa;
  } else if(sigils.idno_faustedition !== undefined) {
      sigil = sigils.idno_faustedition;

      
  } else if(sigils.idno_gsa_2 !== undefined) {
      sigil = sigils.idno_gsa_2;

  } else if(sigils.idno_agad_warszawa !== undefined) {
      sigil = sigils.idno_agad_warszawa;
  } else if(sigils.idno_bb_cologny !== undefined) {
      sigil = sigils.idno_bb_cologny;
  } else if(sigils.idno_bb_vicenza !== undefined) {
      sigil = sigils.idno_bb_vicenza;
  } else if(sigils.idno_bj_krakow !== undefined) {
      sigil = sigils.idno_bj_krakow;
  } else if(sigils.idno_bl_london !== undefined) {
      sigil = sigils.idno_bl_london;
  } else if(sigils.idno_bl_oxford !== undefined) {
      sigil = sigils.idno_bl_oxford;
  } else if(sigils.idno_dla_marbach !== undefined) {
      sigil = sigils.idno_dla_marbach;
  } else if(sigils.idno_fdh_frankfurt !== undefined) {
      sigil = sigils.idno_fdh_frankfurt;
  } else if(sigils.idno_gm_duesseldorf !== undefined) {
      sigil = sigils.idno_gm_duesseldorf;
  } else if(sigils.idno_mlm_paris !== undefined) {
      sigil = sigils.idno_mlm_paris;
  } else if(sigils.idno_sa_hannover !== undefined) {
      sigil = sigils.idno_sa_hannover;
  } else if(sigils.idno_sb_berlin !== undefined) {
      sigil = sigils.idno_sb_berlin;
  } else if(sigils.idno_thlma_weimar !== undefined) {
      sigil = sigils.idno_thlma_weimar;
  } else if(sigils.idno_tml_new_york !== undefined) {
      sigil = sigils.idno_tml_new_york;
  } else if(sigils.idno_ub_basel !== undefined) {
      sigil = sigils.idno_ub_basel;
  } else if(sigils.idno_ub_bonn !== undefined) {
      sigil = sigils.idno_ub_bonn;
  } else if(sigils.idno_ub_leipzig !== undefined) {
      sigil = sigils.idno_ub_leipzig;
  } else if(sigils.idno_ul_edinburgh !== undefined) {
      sigil = sigils.idno_ul_edinburgh;
  } else if(sigils.idno_ul_pennstate !== undefined) {
      sigil = sigils.idno_ul_pennstate;
  } else if(sigils.idno_ul_yale !== undefined) {
      sigil = sigils.idno_ul_yale;
  } else if(sigils.idno_veste_coburg !== undefined) {
      sigil = sigils.idno_veste_coburg;

  } else if(sigils.idno_gsa_1 !== undefined) {
      sigil = sigils.idno_gsa_1;

  } else if(sigils.idno_wa_gedichte !== undefined) {
      sigil = sigils.idno_wa_gedichte;
  }

  return(sigil);
};



// create metadata for bar graph view
var createGeneticBarGraphMetadata = function(documentMetadata, inputDirs, errorLog) {
  "use strict";

  var fs = require("fs");
  var path = require("path");

  var xpath = require("xpath");
  var DOMParser = require("xmldom").DOMParser;

  var barGraphMetadataResult = [];


  // create metadata for ber graph from all witnesses
  documentMetadata.metadata.forEach(function(docMetadata) {
    var transcriptFilename;
    var transcriptString;
    var transcriptDom;

    var currentPageNumber = 1;
    var verseLinesResult = createVerseLineResultObject();

    // create result object
    var result = {};
    // add sigil and metadata uri to result as well as the information if the
    // current witness is of type print
    result.sigil = determineSigil(docMetadata.sigils);
    result.source = documentMetadata.metadataPrefix +  docMetadata.document;
    result.print = docMetadata.type === "print";

    // a document must have a sigil
    if(result.sigil === undefined) {
      fs.appendFileSync(errorLog, "ERROR: metadata file " + result.source.replace(documentMetadata.metadataPrefix, inputDirs.metadata) + " has no sigil to extract\n");
    } else {
      // find out if transcript resides in transcript or in print directory and accordingly create filename
      if(docMetadata.base.indexOf(documentMetadata.printPrefix) !== -1) {
        // the document is an "archivalDocument"
        transcriptFilename = path.join(inputDirs.print, docMetadata.base.replace(documentMetadata.printPrefix, ""), docMetadata.text);
      } else {
        // the document is a "print" document
        transcriptFilename = path.join(inputDirs.transcript, docMetadata.base, docMetadata.text);
      }

      try {
        // try to open the transcript
        transcriptString = fs.readFileSync(transcriptFilename, "utf8");
      } catch (err) {
        fs.appendFileSync(errorLog, "ERROR: textTranscript " + transcriptFilename + " of metadata file " + result.source.replace(documentMetadata.metadataPrefix, inputDirs.metadata) + " couldn't be read\n");
      }

      if(transcriptString !== undefined) {
        // create DOM from textTranscipt
        // the actual transcript resides in first "text" node
        transcriptDom = new DOMParser().parseFromString(transcriptString, "text/xml").getElementsByTagName("text")[0];

        // select all nodes from transcript
        Array.prototype.slice.call(transcriptDom.getElementsByTagName("*")).forEach(function(textChild) {
          var nodePageNumber = 1;
          var transcriptPageNumber;
          var pbPageFound = false;

          // only process element nodes
          if(textChild.nodeType === 1) {
            switch(textChild.tagName) {

              // process pb elements. pb elements determine a page break and can/should contain an 'n' attribute which tells
              // on what page the following content can be found. this value can be matched with the docTranscript uris from
              // metadata files to determine on what physical page the content is located. 
              case "pb":
                nodePageNumber = textChild.getAttribute("n");
                // only try to determine the physical page if there is any information about the page (n-attribute)
                if(nodePageNumber !== "") {
                  // if the current document is a printed witness, pages don't have textTranscripts but the page number directly represents
                  // the correct page inside the witness. In this case take the page number
                  if(docMetadata.type === "print") {
                    currentPageNumber = nodePageNumber;
                  } else {
                    // if not, than the n attribute of the pb element is a reference to a uri that was defined inside the document's
                    // metadata. we need to find out, if there is a uri inside the metadata, that matches the n attribute.
                    // to complicate things, sometimes leading zeros are omitted, ranges were defined or even strings were used.

                    // if page number contains a range (e.g. 2-4) only take the first page
                    nodePageNumber = nodePageNumber.split("-")[0];

                    // now remove leading zeros (if exist)
                    nodePageNumber = nodePageNumber.replace(/^0+/, "");

                    // iterate through pages of current transcript's metadata and try to find a page uri that matches our pb@n value
                    docMetadata.page.forEach(function(currentPage, pageIndex) {
                      // see if there is any uri defined for the current page
                      if(currentPage.doc[0] !== undefined && currentPage.doc[0].uri !== undefined) {
                        // get name of transcript file from current page
                        transcriptPageNumber = currentPage.doc[0].uri;
                        // remove .xml suffix from name
                        transcriptPageNumber = transcriptPageNumber.substring(0, transcriptPageNumber.lastIndexOf(".xml"));
                        // remove leading zeros
                        transcriptPageNumber = transcriptPageNumber.replace(/^0+/, "");

                        // see if current transcript filename matches the pb's cleaned page value
                        if(transcriptPageNumber === nodePageNumber) {
                          currentPageNumber = pageIndex + 1;
                          pbPageFound = true;
                        }
                      }
                    });
                    // if no matching uri to our current n value was found write an error to the logfile. Also default to page number 1
                    // so that verseLines aren't skipped. Transcripts should be corrected.
                    if(pbPageFound === false) {
                      fs.appendFileSync(errorLog, "ERROR: couldn't find page for pb " + textChild.getAttribute("n") + " referenced in transcript " + transcriptFilename + "\n");
                      currentPageNumber = 1;
                    }
                  }
                } else {
                  // if there is no n attribute or the value is empty, fall back to first page
                  currentPageNumber = 1;
                }
              break;

              // line elements are simple verse lines. these lines can have one or multiple line numbers associated which
              // either represents a verse line, a verse line which is uncertain or a verse line variant.
              case "l":
                if(textChild.getAttribute("n") !== "") {
                  // split multiple verse lines into individual verse lines
                  textChild.getAttribute("n").split(" ").forEach(function(lineRange) {

                    if(lineRange.match(/^\d+$/)) {
                      // found a normal verse line
                      verseLinesResult.put("normal", currentPageNumber, parseInt(lineRange, 10));
                    } else if(lineRange.match(/^\d+\?$/)) {
                      // found an uncertain verse line. crop off questionmark and store in results
                      verseLinesResult.put("uncertain", currentPageNumber, parseInt(lineRange, 10));
                    } else if(lineRange.match(/^\d+[a-zA-Z]$/)) {
                      // found a verse line variant. crop off character and store in results
                      verseLinesResult.put("variant", currentPageNumber, parseInt(lineRange, 10));
                    }
                  });
                }
              break;

              // milestones can mark verse lines as a paralipomenon. these paralipomena can be uncertain or certain and
              // can also be given as ranges (e.g. the idea from a paralipomenon of the size of a few lines is later transformed
              // into a larger idea that spans even more lines).
              case "milestone":
                // find out if the current milestone is a paralipomenon and references verse lines
                if( (textChild.getAttribute("unit") === "paralipomenon") && (textChild.getAttribute("f:relatedLines") !== "") ) {
                  // if there are multiple ranges, split these and process them individually
                  textChild.getAttribute("f:relatedLines").split(",").forEach(function(lineRange) {
                    var i;
                    var rangeStart, rangeEnd;

                    // find out if paralipomenon is certain or uncertain
                    var isParalipomenonUncertain = textChild.getAttribute("f:relatedLinesUncertain") === "true" ? true : false;

                    // find single line ranges
                    if(lineRange.match(/^\d+$/) !== null) {
                      if(isParalipomenonUncertain === true) {
                        // found uncertain paralipomenon
                        verseLinesResult.put("paralipomenonUncertain", currentPageNumber, parseInt(lineRange, 10));
                      } else {
                        // found certain paralipomenon
                        verseLinesResult.put("paralipomenon", currentPageNumber, parseInt(lineRange, 10));
                      }
                    } else if(lineRange.match(/^\d+-\d+$/) !== null) {
                      // processing line ranges
                      
                      // find start of current range
                      rangeStart = parseInt(lineRange.split("-")[0], 10);
                      // find end of current range
                      rangeEnd = parseInt(lineRange.split("-")[1], 10);

                      // store all lines inside range
                      for(i = rangeStart; i <= rangeEnd; i++) {
                        if(isParalipomenonUncertain === true) {
                          // found uncertain paralipomenon
                          verseLinesResult.put("paralipomenonUncertain", currentPageNumber, i);
                        } else {
                          // found certain paralipomenon
                          verseLinesResult.put("paralipomenon", currentPageNumber, i);
                        }
                      }
                    }
                  });
                }
              break;
            }
          }
        });

        // add intervals for current document to its result
        result.intervals = verseLinesResult.getVerseLineIntervals();
        // and add current document's result to bar graph metadata
        barGraphMetadataResult.push(result);
      }

    }
  });

  return barGraphMetadataResult;
};

module.exports = createGeneticBarGraphMetadata;
