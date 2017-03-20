<?php $showFooter = false; ?>
<?php include "includes/header.php"; ?>
<section>

  <article>

      <div id="genetic-bar-diagram-container"></div>

  </article>

</section>

<?php /* 
<div id="navigation-bar-container" class="navigation-bar-container">
  <div id="navigation-bar-content" class="navigation-bar-content">
    <div id="facsimile-settings" class="facsimile"></div>
    <div id="page-navigation" class="page">
      <div id="first-page-button" class="pure-button" onclick="viewer.setPage(1);" title="Erste Seite"><i class="fa fa-angle-double-left"></i></div>
      <div id="previous-page-button" class="pure-button" onclick="viewer.previousPage();" title="Vorherige Seite"><i class="fa fa-angle-left"></i></div>
      <div id="pageCount" class="pure-form">
        <input type="text" size="1" class="pure-center" value="<?php echo filter_input(INPUT_GET, "rangeStart", FILTER_SANITIZE_NUMBER_INT); ?>">
        bis
        <input type="text" size="1" class="pure-center" value="<?php echo filter_input(INPUT_GET, "rangeEnd", FILTER_SANITIZE_NUMBER_INT); ?>">
      </div>
      <div id="next-page-button" class="pure-button" onclick="viewer.nextPage();" title="Nächste Seite"><i class="fa fa-angle-right"></i></div>
      <div id="last-page-button" class="pure-button" onclick="viewer.setPage(viewer.getPageCount());" title="Letzte Seite"><i class="fa fa-angle-double-right"></i></div>
    </div>
    <div id="view-select" class="view"></div>
  </div>
</div>
*/ ?>

<script type="text/javascript" src="data/scene_line_mapping.js"></script>
<script type="text/javascript" src="data/genetic_bar_graph.js"></script>

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

  function findScene(firstLine, lastLine) {
    var result = [];
    sceneLineMapping.forEach(function(mappingData) {
      if(firstLine >= mappingData.rangeStart && lastLine <= mappingData.rangeEnd) {
          result.push(mappingData);
      }
    });
    result.reverse();
    return result;
  }

  function genesisBreadcrumbData(sceneData) {
    var breadcrumbs = [{caption: "Genese", link: "genesis"}];
    if (sceneData.length > 0) {
      if (sceneData[0].id[0] === "1") {
        breadcrumbs.push({caption: "Faust I", link: "genesis_faust_i"});
      } else {
        breadcrumbs.push({caption: "Faust II", link: "genesis_faust_ii"});
      } 
      sceneData.forEach(function(scene) {
        breadcrumbs.push({caption: scene.title, link: "genesis_bargraph?rangeStart=" + scene.rangeStart + "&rangeEnd=" + scene.rangeEnd});
      });
    }
    return breadcrumbs;
  }

  document.getElementById("breadcrumbs").appendChild(Faust.createBreadcrumbs(genesisBreadcrumbData(findScene(firstLine, lastLine))));

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
  selectedWitnesses = Faust.sort(selectedWitnesses, "sigil", "sigil");





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
                         ["style", "font-size: " + (verticalDistance/2) + "px"],
                        ],
            children: [document.createTextNode(bin)],
            parent: geneticBarDiagramGrid});

createSvgElement({name: "text",
            attributes: [["x", (bin - firstLine) * horizontalDistance * geneticBarDiagramGridScale],
                         ["y", (selectedWitnesses.length + 0.5) * verticalDistance],
                         ["text-anchor", "middle"],
                         ["transform", "scale(" + 1/geneticBarDiagramGridScale + ",1)"],
                         ["style", "font-size: " + (verticalDistance/2) + "px"],
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
      witnessLink.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "documentViewer?faustUri=" + witness.source);
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

        function toolTipLabel(type, start, stop, sigil, page) {
          var typeLabels = { 
                verseLine: "handschriftliche Fassung von",
                verseLineUncertain: "handschriftliche Fassung (unsicher) von",
                print: "gedruckte Fassung von",
                paralipomena: "Paralipomenon zu",
                paralipomenaUncertain: "Paralipomenon (unsicher) zu"
            },
            typeLabel = typeLabels[type];
            if (type === 'print') { typeLabel = typeLabels.print; }
            var result = typeLabel + " v. " + start + " – " + stop + " in " + sigil;
            if (type !== 'print') { result += ", S. " + page; }
            return result;
        }
        


        // create rectangle for interval
        var relatedLines = createSvgElement({name: "rect", 
                                             attributes: [["tooltiptext", toolTipLabel(witness.print? "print" : interval.type, start, end, witness.sigil, interval.page)],
                                                          ["x", barStart * horizontalDistance],
                                                          ["y", "0"],
                                                          ["width", barEnd * horizontalDistance],
                                                          ["height", rowHeight]]
                                             });

        var relatedLinesLink = createSvgElement({name: "a", parent: witnessGroup, children: [relatedLines]});

        if(witness.print === true) {
          relatedLines.setAttribute("class", "show-tooltip printed");
        } else if (interval.type === "verseLine") {
          relatedLines.setAttribute("class", "show-tooltip verse");
        } else if (interval.type === "verseLineVariant") {
          relatedLines.setAttribute("class", "show-tooltip verse variant");
        } else if (interval.type === "verseLineUncertain") {
          relatedLines.setAttribute("class", "show-tooltip verse uncertain");
        } else if (interval.type === "paralipomena") {
          relatedLines.setAttribute("class", "show-tooltip paralipomena");
        } else if (interval.type === "paralipomenaUncertain") {
          relatedLines.setAttribute("class", "show-tooltip paralipomena uncertain");
        }

        // set surrounding link for witness
        if(witness.print === true) {
          // select filename from metadata filename
          var metadataName = witness.source.substring(witness.source.lastIndexOf("/") + 1, witness.source.lastIndexOf("."));
          // select print document that belongs to metadata name
          // var printResourceName = { "A8": "A8_IIIB18.html", "B(a)9": "Ba9_A101286.html", "B9": "B9_IIIB20-2.html", "C(1)12": "C(1)12_IIIB23-1.html", "C(1)4": "C(1)4_IIIB24.html", "C(2alpha)4": "C(2a)4_IIIB28.html", "C(3)12": "C(3)12_IIIB27.html", "C(3)4": "C(3)4_IIIB27_chartUngleich.html", "Cotta_Ms_Goethe_AlH_C-1-12_Faust_I": "Cotta_Ms_Goethe_AlH_C-1-12_Faust_I.html", "D(1)": "D(1)_IV3-1.html", "D(2)": "D(2)_IV3-6.html", "GSA_30-447-1": "GSA_30-447-1_S_214-217.html", "J_1808": "J_XIIA149-1808.html", "KuA_VI_1": "KuA_IIIE43-5-1.html", "S(o)": "S(o)_IIIB11-2.html", "seckendorff1782": "GSA_32_1420.html" }[metadataName];
          relatedLinesLink.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "print/" + interval.section);
        } else {
          relatedLinesLink.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "documentViewer?faustUri=" + witness.source + "&page=" + interval.page + "&view=facsimile");
        }

      }

    });

    geneticBarDiagramVerseBars.appendChild(witnessGroup);
  });

  Faust.tooltip.addToTooltipElements();

</script>

<?php include "includes/footer.php"; ?>
