      <?php include "includes/header.php"; ?>
      <div class="main-content-container">
        <style>
          .genetic-bar-diagram-svg {
          } 

          /*.genetic-bar-diagram-svg * {
            -webkit-user-select: none;
               -moz-user-select: none;
                -ms-user-select: none;
                    user-select: none;
          }*/

          .genetic-bar-diagram-svg text {
            font-size: 10;
            fill: black;
          }

          .genetic-bar-diagram-svg line {
            stroke: #eeeeee;
            stroke-width: 1;
          }
        </style>

        <div id="main-content" class="main-content">
          <div id="outer-genetic-bar-diagram-container" style="width: 100%; height: 100%;">
            <div id="genetic-bar-diagram-container" style="width: 100%; display: inline-block;">
            </div>
          </div>
        </div>

        <script>

          // remove test
          geneticBarGraphData = geneticBarGraphData.filter(function(graphData) {
            if(graphData.source.indexOf("test.xml") === -1) {
              return true;
            }
          });
          // import from faust_common
          var createSvgElement = Faust.dom.createSvgElement;

          // shortcut for creating elements in svg namespace
//          var createSvgElement = function(elementName) {
//            return document.createElementNS("http://www.w3.org/2000/svg", elementName);
//          };

          // Determine visible range from get parameters
          var getVisibleRange = function(minRange, maxRange) {
            var tmp;
            var parameters;
            var rangeStart = minRange;
            var rangeEnd = maxRange;
            
            parameters = Faust.url.getParameters();

            if(parameters["rangeStart"]) {
              try {
                rangeStart = parseInt(parameters["rangeStart"]);
              } catch (Exception) {}
            }

            if(parameters["rangeEnd"]) {
              try {
                rangeEnd = parseInt(parameters["rangeEnd"]);
              } catch (Exception) {}
            }
           
            // switch start and end if start > end
            if(rangeStart > rangeEnd) {
              tmp = rangeStart;
              rangeStart = rangeEnd;
              rangeEnd = tmp;
            }

            // if rangeStart or rangeEnd is outside boundaries limit to boundary
            if(rangeStart < minRange) {
              rangeStart = minRange;
            } else if(rangeStart > maxRange) {
              rangeStart = maxRange;
            } else 
            
            if(rangeEnd < minRange) {
              rangeEnd = minRange;
            } else if(rangeEnd > maxRange) {
              rangeEnd = maxRange;
            }

            // Set get parameter according to determined parameter Values
            searchString = "?rangeStart=" + rangeStart + "&rangeEnd=" + rangeEnd;
            if(searchString !== window.location.search) {
              window.location.search= "?rangeStart=" + rangeStart + "&rangeEnd=" + rangeEnd;
            }
            
            return { "rangeStart": rangeStart, "rangeEnd": rangeEnd };
          };


          var visibleRange = getVisibleRange(1, 12500);
          var firstLine = visibleRange.rangeStart;
          var lastLine = visibleRange.rangeEnd;
          var numberOfLines = lastLine - firstLine + 1;

          // determine current scene title and scene-line-mapping id
          var sceneTitle;
          var sceneLineMappingId;
          sceneLineMapping.forEach(function(mappingData) {
            if(firstLine >= mappingData.rangeStart && lastLine <= mappingData.rangeEnd) {
              sceneLineMappingId = mappingData.id;
              sceneTitle = mappingData.title;
            }
          });

          // set breadcrumbs
          if(sceneLineMappingId.split(".")[0] === "1") {
            document.getElementById("breadcrumbs").appendChild(Faust.createBreadcrumbs([{caption: "Genese (Übersicht)", link: "chessboard_overview.php"}, {caption: "Faust I", link: "chessboard_faust_i.php"}, {caption: sceneTitle}]));
          } else {
            document.getElementById("breadcrumbs").appendChild(Faust.createBreadcrumbs([{caption: "Genese (Übersicht)", link: "chessboard_overview.php"}, {caption: "Faust II", link: "chessboard_faust_ii.php"}, {caption: sceneTitle}]));
          }

          var horizontalDistance = 30;
          var verticalDistance = 20;
          var rowHeight = 10;

          // select witnesses that are present in selection
          var selectedWitnesses = geneticBarGraphData.filter(function(witness) {
            var selected = false;
            witness.intervals.forEach(function(interval) {
              var start = interval.start;
              var end = interval.end;
              if( (start >= firstLine && start <= lastLine) || (end >= firstLine && end <= lastLine) || (start <= firstLine && end >= lastLine) ) {
                selected = true;
              }
            });

            if(selected) {
              return witness;
            }
          });

          // sort witnesses
          selectedWitnesses = Faust.sort(selectedWitnesses, "ascEnd", "sigil");





          // create svg container

          // start off by finding out how wide the diagram should be.
          var availabelDiagramWidth = document.getElementById("genetic-bar-diagram-container").clientWidth - 15;

          var svg = createSvgElement({name: "svg",
                                      id: "genetic-bar-diagram-svg",
                                      attributes: [["class", "genetic-bar-diagram-svg"],
                                                   ["height", (selectedWitnesses.length + 2) * verticalDistance],
                                                   ["width", availabelDiagramWidth]]
                                    });
          var outerGroup = createSvgElement({name: "g", attributes: [["transform", "translate(150," + (verticalDistance + 5) + ") scale(1,1)"]], parent: svg});

          var geneticBarDiagramSigils = createSvgElement({name: "g", id: "genetic-bar-diagram-sigils", parent: outerGroup});


          var geneticBarDiagramGrid = createSvgElement({name: "g", id: "genetic-bar-diagram-grid", parent: outerGroup});
          var geneticBarDiagramVerseBars = createSvgElement({name: "g", id: "genetic-bar-diagram-verse-bars", parent: outerGroup});

          // append svg diagram to container
          var geneticBarDiagramContainer = document.getElementById("genetic-bar-diagram-container");
          geneticBarDiagramContainer.appendChild(svg);
          // height and width must be adjusted after svg is drawn since Internet Explorer 11 doesn't have proper
          // support for css transforms. (element is somehow transformed / scaled. the visible area will be scaled
          // properly, but the element will still need as much space as it did before the transformation. since we
          // generate a huge group in svg and scale that one, there would almost always be a huge vertical scroll bar)
          geneticBarDiagramContainer.style.width = availabelDiagramWidth + "px";
          geneticBarDiagramContainer.style.height = ( (selectedWitnesses.length + 2) * verticalDistance) + "px";
          geneticBarDiagramContainer.style.overflow = "hidden";

          var geneticBarDiagramGridScale = (availabelDiagramWidth - 160) / (numberOfLines*30);
          geneticBarDiagramGrid.setAttribute("transform", "translate(10,0) scale(" + geneticBarDiagramGridScale + ", 1)");
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// approach to determine nice values for graph axis based on approach described in Graphics Gems by Paul Heckbert
// (nice numbers for graph labels)
var nicenum = function(inputVal, round) {
  var normalizationFactor;
  var normalizedVal;
  var niceValue;

  normalizationFactor = Math.floor(Math.log(inputVal)/Math.log(10));
  normalizedVal = inputVal / Math.pow(10.0, normalizationFactor);

  if(round === true) {
    if(normalizedVal < 1.5) {
      niceValue = 1.0;
    } else if(normalizedVal < 3.0) {
      niceValue = 2.0;
    } else if(normalizedVal < 7.0) {
      niceValue = 5.0;
    } else {
      niceValue = 10.0;
    }
  } else {
    if(normalizedVal <= 1) {
      niceValue = 1.0;
    } else if(normalizedVal <= 2.0) {
      niceValue = 2.0;
    } else if(normalizedVal <= 5.0) {
      niceValue = 5.0;
    } else {
      niceValue = 10.0;
    }
  }
  return niceValue * Math.pow(10.0, normalizationFactor);
};


var loose_labels = function(start, end, nticks) {
  var bins = [];

  var intervalSize;
  var graphmin;
  var graphmax;
  var range;
  var bin;

  range = end - start;
  intervalSize = nicenum((range) / (nticks - 1), 1);
  graphmin = Math.floor(start / intervalSize) * intervalSize;
  graphmax = Math.ceil(end / intervalSize) * intervalSize;

  for(bin = graphmin; bin <= graphmax; bin = bin + intervalSize) {
    bins.push(bin);
  }

  return bins;
};

var bins = loose_labels(firstLine, lastLine, Math.min(numberOfLines, 10)).filter(
  function(bin) {
    if(bin >= firstLine && bin <=lastLine) {
        return true;
      } else {
        return false;
      }
    }
);


bins.forEach(function(bin) {
  var verticalLine = createSvgElement({name: "line",
                                       attributes: [["x1", (bin - firstLine) * horizontalDistance],
                                                    ["x2", (bin - firstLine) * horizontalDistance],
                                                    ["style", "stroke-width: " + 1/geneticBarDiagramGridScale],
                                                    ["y1", "-" + (verticalDistance/2)],
                                                    ["y2", selectedWitnesses.length * verticalDistance],
                                                    ["shape-rendering", "crispEdges"]],
                                       parent: geneticBarDiagramGrid
                                      });

  createSvgElement({name: "text",
                    attributes: [["x", (bin - firstLine) * horizontalDistance * geneticBarDiagramGridScale],
                                 ["y", "-" + (verticalDistance / 2)],
                                 ["text-anchor", "middle"],
                                 ["transform", "scale(" + 1/geneticBarDiagramGridScale + ",1)"],
                                 ["style", "font-weight: normal; font-size: " + (verticalDistance/2) + "px"],
                                ],
                    children: [document.createTextNode(bin)],
                    parent: geneticBarDiagramGrid});

  createSvgElement({name: "text",
                    attributes: [["x", (bin - firstLine) * horizontalDistance * geneticBarDiagramGridScale],
                                 ["y", (selectedWitnesses.length + 0.5) * verticalDistance],
                                 ["text-anchor", "middle"],
                                 ["transform", "scale(" + 1/geneticBarDiagramGridScale + ",1)"],
                                 ["style", "font-weight: normal; font-size: " + (verticalDistance/2) + "px"],
                                ],
                    children: [document.createTextNode(bin)],
                    parent: geneticBarDiagramGrid});

});

// add horizontal orientation line
selectedWitnesses.forEach(function(witness, witnessIndex) {
  var horizontalLine = createSvgElement({name: "line",
                                       attributes: [["x1", "0"],
                                                    ["x2", numberOfLines * horizontalDistance],
                                                    ["y1", (witnessIndex * verticalDistance) + (rowHeight / 2)],
                                                    ["y2", (witnessIndex * verticalDistance) + (rowHeight / 2)],
                                                    ["shape-rendering", "crispEdges"]],
                                       parent: geneticBarDiagramGrid
                                      });
});

////////////////////////////////////////////////////////
  // determine scale factor for genetic bar diagram
  // determine width of svg
          // 160 from (geneticBarDiagramVerseBars) 10 + 160 from outmost svg group (translate(150,0)
          var geneticBarDiagramVerseBarsScale = (availabelDiagramWidth - 160) / (numberOfLines*30);
          geneticBarDiagramVerseBars.setAttribute("transform", "translate(10,0) scale(" + geneticBarDiagramVerseBarsScale + ", 1)");
//

          // process all witnesses inside selection
          selectedWitnesses.forEach(function(witness, witnessIndex) {

            // add sigil name to vertical axis
            var witnessSigil = createSvgElement({name: "text"});
            witnessSigil.setAttribute("x", "0");
            witnessSigil.setAttribute("y", witnessIndex * verticalDistance);
            witnessSigil.setAttribute("dy", 8);
            witnessSigil.setAttribute("text-anchor", "end");
            // set sigil text
            witnessSigil.appendChild(document.createTextNode(witness.sigil));
            // append sigil to vertical axis
            geneticBarDiagramSigils.appendChild(witnessSigil);

            // group bars / rectangles and link per witness
            var witnessGroup = createSvgElement({name: "g"});
            witnessGroup.setAttribute("transform", "translate(0, " + witnessIndex * verticalDistance + ")");

            // set surrounding link for witness
            var witnessLink = createSvgElement({name: "a"});
            if(witness.print === true) {
              witnessLink.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "print/" + witness.source);
            } else {
              witnessLink.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "documentViewer.php?faustUri=" + witness.source);
            }
            witnessGroup.appendChild(witnessLink);

            // insert rectangle spanning complete row to make it clickable
            var barBackground = createSvgElement({name: "rect",
                                                  attributes: [["x", "0"],
                                                               ["y", "0"],
                                                               ["width", numberOfLines * horizontalDistance],
                                                               ["height", rowHeight],
                                                               ["opacity", "0"]],
                                                  parent: witnessLink
                                                });

            // process intervals
            witness.intervals.forEach(function(interval) {
              var start = interval.start;
              var end = interval.end;
              var barStart = start;
              var barEnd = end;

              // test if interval is visible / in selection
              if( (start >= firstLine && start <= lastLine) || (end >= firstLine && end <= lastLine) || (start <= firstLine && end >= lastLine) ) {
                // calculate start and end of interval relative to visible range
                if(start - firstLine >= 0) {
                  barStart = start - firstLine;
                } else {
                  barStart = 0;
                };

                barEnd = Math.min(end - start + 1, numberOfLines - barStart);

                // create rectangle for interval
                var relatedLines = createSvgElement({name: "rect", 
                                                     attributes: [["tooltiptext", "[" + start + "," + end + "]"],
                                                                  ["class", "show-tooltip"],
                                                                  ["x", barStart * horizontalDistance],
                                                                  ["y", "0"],
                                                                  ["width", barEnd * horizontalDistance],
                                                                  ["height", rowHeight]]
                                                     });

                var relatedLinesLink = createSvgElement({name: "a", parent: witnessGroup, children: [relatedLines]});

                if(witness.print === true) {
                  relatedLines.setAttribute("fill", "black");
                } else if (interval.type === "verseLine") {
                  relatedLines.setAttribute("fill", "blue");
                } else if (interval.type === "verseLineVariant") {
                  relatedLines.setAttribute("fill", "lightblue");
                } else if (interval.type === "verseLineUncertain") {
                  relatedLines.setAttribute("fill", "orange");
                } else if (interval.type === "paralipomena") {
                  relatedLines.setAttribute("fill", "green");
                } else if (interval.type === "paralipomenaUncertain") {
                  relatedLines.setAttribute("fill", "lightgreen");
                }

                // set surrounding link for witness
                if(witness.print === true) {
                  // select filename from metadata filename
                  var metadataName = witness.source.substring(witness.source.lastIndexOf("/") + 1, witness.source.lastIndexOf("."));
                  // select print document that belongs to metadata name
                  var printResourceName = { "A8": "A8_IIIB18.all.html", "B(a)9": "Ba9_A101286.all.html", "B9": "B9_IIIB20-2.all.html", "C(1)12": "C(1)12_IIIB23-1.all.html", "C(1)4": "C(1)4_IIIB24.html", "C(2alpha)4": "C(2a)4_IIIB28.html", "C(3)12": "C(3)12_IIIB27.all.html", "C(3)4": "C(3)4_IIIB27_chartUngleich.html", "Cotta_Ms_Goethe_AlH_C-1-12_Faust_I": "Cotta_Ms_Goethe_AlH_C-1-12_Faust_I.all.html", "D(1)": "D(1)_IV3-1.all.html", "D(2)": "D(2)_IV3-6.all.html", "GSA_30-447-1": "GSA_30-447-1_S_214-217.html", "J_1808": "J_XIIA149-1808.html", "KuA_VI_1": "KuA_IIIE43-5-1.html", "S(o)": "S(o)_IIIB11-2.all.html", "seckendorff1782": "GSA_32_1420.html" }[metadataName];
                  relatedLinesLink.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "print/" + printResourceName);
                } else {
                  relatedLinesLink.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "documentViewer.php?faustUri=" + witness.source + "&page=" + interval.page + "&view=facsimile");
                }

              }

            });

            geneticBarDiagramVerseBars.appendChild(witnessGroup);
          });

          Faust.tooltip.addToTooltipElements();

        </script>
      </div>
      <?php include "includes/footer.php"; ?>
