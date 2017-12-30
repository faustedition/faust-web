define(['faust_common', 'data/scene_line_mapping', 'data/genetic_bar_graph'],
  function(Faust,        sceneLineMapping,          geneticBarGraphData) {

  // Array.findIndex polyfill from https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex
  if (!Array.prototype.findIndex) {
    Object.defineProperty(Array.prototype, 'findIndex', {
      value: function(predicate) {
        'use strict';
        if (this == null) {
          throw new TypeError('Array.prototype.findIndex called on null or undefined');
        }
        if (typeof predicate !== 'function') {
          throw new TypeError('predicate must be a function');
        }
        var list = Object(this);
        var length = list.length >>> 0;
        var thisArg = arguments[1];
        var value;

        for (var i = 0; i < length; i++) {
          value = list[i];
          if (predicate.call(thisArg, value, i, list)) {
            return i;
          }
        }
        return -1;
      },
      enumerable: false,
      configurable: false,
      writable: false
    });
  };

  // import from faust_common
  var createSvgElement = Faust.dom.createSvgElement;

  var MIN_RANGE = 1, MAX_RANGE = 12500;
    

  var bargraph = {

    scenes : sceneLineMapping.filter(function(scene) { return scene.rangeStart && scene.rangeEnd && !scene.title.endsWith("Akt"); }), // FIXME refactor

    init : function init(container, navbar) {
      this.container = container || document.getElementById('genetic-bar-diagram-container')
      this.navbar    = navbar    || document.getElementById('navigation-bar-container')
      this.start = MIN_RANGE
      this.end = MAX_RANGE

      this.elFirst = document.getElementById('first-page-button');
      this.elPrev = document.getElementById('previous-page-button');
      this.elNext = document.getElementById('next-page-button');
      this.elLast = document.getElementById('last-page-button');
      this.elStart = document.getElementById('start-range-input');
      this.elEnd   = document.getElementById('end-range-input');
      // TODO handlers

      var that = this,
        lastSceneIndex = that.scenes.length-1;
      this.elFirst.title   = this.scenes[0].title;
      this.elLast.title    = this.scenes[lastSceneIndex].title;
      this.elFirst.onclick = function() { that.gotoScene(0); }
      this.elPrev.onclick  = function() { that.gotoScene(that.firstVisibleScene() - 1); }
      this.elNext.onclick  = function() { that.gotoScene(that.firstVisibleScene() + 1); }
      this.elLast.onclick  = function() { that.gotoScene(lastSceneIndex); }

      var lineNoChanged = function() {
        that.setRange(that.elStart.value, that.elEnd.value);
      }
      this.elStart.onchange = lineNoChanged;
      this.elEnd.onchange = lineNoChanged;

      var parameters = Faust.url.getParameters()
      this.setRange(parameters['rangeStart'], parameters['rangeEnd'])
    },

    updateNavigation : function updateNavigation() {
      this.elStart.value = this.start;
      this.elEnd.value = this.end;

      this.elPrev.title = this.getScene(this.firstVisibleScene()-1).title
      this.elNext.title = this.getScene(this.firstVisibleScene()+1).title
    },

    setRange : function setRange(start, end) {
      start = parseInt(start) || this.start
      end   = parseInt(end)   || this.end
      if (start > end) { return this.setRange(end, start); }
      if (start < MIN_RANGE) start = MIN_RANGE
      if (end   > MAX_RANGE) end   = MAX_RANGE

      this.start = start
      this.end   = end

      this.updateBargraph()
      this.updateBreadcrumb()
      this.updateNavigation()
      this.updateLocation()
    },

    // Set get parameter according to determined parameter Values
    updateLocation : function updateLocation() {
      var searchString = "?rangeStart=" + this.start + "&rangeEnd=" + this.end;
      if (searchString !== window.location.search) {
        window.location.search = searchString;
      }
    },

    // updates the breadcrumbs to match current range
    updateBreadcrumb : function updateBreadcrumb() {
      var breadcrumbs = document.getElementById("breadcrumbs")
      Faust.dom.removeAllChildren(breadcrumbs)
      breadcrumbs.appendChild(Faust.createBreadcrumbs(Faust.genesisBreadcrumbData(this.start, this.end, true)));
        // TODO refactor scene data extraction
    },

    // index of the first scene in range
    firstVisibleScene: function firstVisibleScene() {
      return this.scenes.findIndex(function(scene) { return scene.rangeStart >= this.start }, this);
    },

    getScene: function getScene(index) {
      if (index < 0)
        index = 0;
      if (index >= this.scenes.length)
        index = this.scenes.length - 1;
      return this.scenes[index];
    },

    gotoScene: function gotoScene(index) {
      var scene = this.getScene(index);
      return this.setRange(scene.rangeStart, scene.rangeEnd);
    },

    getCurrentWitnesses : function getCurrentWitnesses() {
      // select witnesses that are present in selection
      var firstLine = this.start, lastLine = this.end;
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
      return selectedWitnesses;

    },

    updateBargraph : function updateBargraph() {
      var verseInPx = 30;
      var verticalDistance = 20;
      var barHeightInPx = 10;
      var visibleVerses = this.end - this.start;


      // create svg container

      // start off by finding out how wide the diagram should be.
      var availableDiagramWidth = this.container.clientWidth - 15;

      var selectedWitnesses = this.getCurrentWitnesses()

      var svg = createSvgElement({name: "svg",
        id: "genetic-bar-diagram-svg",
        attributes:  [["class", "genetic-bar-diagram-svg"],
                      ["height", (selectedWitnesses.length + 2) * verticalDistance],
                      ["width", availableDiagramWidth]]
      });

      // The removebackground filter gives the scene labels a white opaque background so they don't run into another
      var svgDefs = createSvgElement({name: 'defs', parent: svg});
      var backgroundFilter = createSvgElement({name: 'filter', id: 'removebackground',
          attributes: [['x', 0], ['y', 0], ['width', 1], ['height', 1]],
          parent: svgDefs});
      createSvgElement({name: 'feFlood', attributes: [['flood-color', 'white']], parent: backgroundFilter});
      createSvgElement({name: 'feComposite', attributes: [['in', 'SourceGraphic']],  parent: backgroundFilter});

      var outerGroup = createSvgElement({name: "g", attributes: [["transform", "translate(150," + (verticalDistance + 5) + ") scale(1,1)"]], parent: svg});
      var geneticBarDiagramSigils = createSvgElement({name: "g", id: "genetic-bar-diagram-sigils", parent: outerGroup});
      var geneticBarDiagramGrid = createSvgElement({name: "g", id: "genetic-bar-diagram-grid", parent: outerGroup});
      var geneticBarDiagramVerseBars = createSvgElement({name: "g", id: "genetic-bar-diagram-verse-bars", parent: outerGroup});
// append svg diagram to container
      var geneticBarDiagramContainer = this.container;
      // TODO clear current contents
      geneticBarDiagramContainer.appendChild(svg);
      // height and width must be adjusted after svg is drawn since Internet Explorer 11 doesn't have proper
      // support for css transforms. (element is somehow transformed / scaled. the visible area will be scaled
      // properly, but the element will still need as much space as it did before the transformation. since we
      // generate a huge group in svg and scale that one, there would almost always be a huge vertical scroll bar)
      geneticBarDiagramContainer.style.width = availableDiagramWidth + "px";
      geneticBarDiagramContainer.style.height = ( (selectedWitnesses.length + 2) * verticalDistance) + "px";
      geneticBarDiagramContainer.style.overflow = "hidden";

      var geneticBarDiagramGridScale = (availableDiagramWidth - 160) / (visibleVerses*30);
      geneticBarDiagramGrid.setAttribute("transform", "translate(10,0) scale(" + geneticBarDiagramGridScale + ", 1)");
      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

      // TODO move this out of the function body to make it testable (and clearer)
      // TODO can we integrate scene boundaries here?
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

      var firstVisibleVerse = this.start,
          lastVisibleVerse  = this.end,
          bins = loose_labels(firstVisibleVerse, lastVisibleVerse, Math.min(visibleVerses, 10))
                 .filter(function(bin) { return bin >= firstVisibleVerse && bin <= lastVisibleVerse });


      bins.forEach(function(bin) {
        var verticalLine = createSvgElement({name: "line",
          attributes: [["x1", (bin - firstVisibleVerse) * verseInPx],
            ["x2", (bin - firstVisibleVerse) * verseInPx],
            ["style", "stroke-width: " + 1/geneticBarDiagramGridScale],
            ["y1", "-" + (verticalDistance/2)],
            ["y2", selectedWitnesses.length * verticalDistance],
            ["shape-rendering", "crispEdges"]],
          parent: geneticBarDiagramGrid
        });

        createSvgElement({name: "text",
          attributes: [["x", (bin - firstVisibleVerse) * verseInPx * geneticBarDiagramGridScale],
            ["y", "-" + (verticalDistance / 2)],
            ["text-anchor", "left"],
            ["transform", "scale(" + 1/geneticBarDiagramGridScale + ",1)"],
            ["style", "font-size: " + (verticalDistance/2) + "px"],
          ],
          children: [document.createTextNode(bin)],
          parent: geneticBarDiagramGrid});

        createSvgElement({name: "text",
          attributes: [["x", (bin - firstVisibleVerse) * verseInPx * geneticBarDiagramGridScale],
            ["y", (selectedWitnesses.length + 0.5) * verticalDistance],
            ["text-anchor", "left"],
            ["transform", "scale(" + 1/geneticBarDiagramGridScale + ",1)"],
            ["style", "font-size: " + (verticalDistance/2) + "px"],
          ],
          children: [document.createTextNode(bin)],
          parent: geneticBarDiagramGrid});

      });

      var that = this;

      this.scenes.forEach(function(scene) {
          var sceneStart = scene.rangeStart;
          if (sceneStart > firstVisibleVerse && sceneStart < lastVisibleVerse) {
              var tooltip = scene.title + " (Verse " + sceneStart + " – " + scene.rangeEnd + ")";
              createSvgElement({
                  name: "line",
                  attributes: [["x1", (sceneStart - firstVisibleVerse) * verseInPx],
                      ["x2", (sceneStart - firstVisibleVerse) * verseInPx],
                      ["style", "stroke-width: " + 1 / geneticBarDiagramGridScale],
                      ["y1", "-" + (verticalDistance / 2)],
                      ["y2", selectedWitnesses.length * verticalDistance],
                      ["class", "scene-bar show-tooltip"],
                      ["tooltiptext", tooltip],
                      ["shape-rendering", "crispEdges"]],
                  parent: geneticBarDiagramGrid
              });
              // var sceneLink = createSvgElement({name: "a", attributes: [['href', '#']], parent: geneticBarDiagramGrid});
              // sceneLink.addEventListener('onclick', function () { that.setRange(scene.rangeStart, scene.rangeEnd); });
              var sceneLabel = createSvgElement({
                  name: "text",
                  attributes: [["x", (sceneStart - firstVisibleVerse) * verseInPx * geneticBarDiagramGridScale],
                      ["y", "-" + (verticalDistance / 2)],
                      ["text-anchor", "left"],
                      ["transform", "scale(" + 1 / geneticBarDiagramGridScale + ",1)"],
                      ["class", "scene-label"],
                      ["filter", "url(#removebackground)"],
                      ["style", "font-size: " + (verticalDistance / 2) + "px"],
                  ],
                  children: [document.createTextNode(scene.title)],
                  parent: geneticBarDiagramGrid
              });
              sceneLabel.addEventListener('click', function () {
                  that.setRange(scene.rangeStart, scene.rangeEnd);
              });
          }
      });

      // add horizontal orientation line
      selectedWitnesses.forEach(function(witness, witnessIndex) {
        var horizontalLine = createSvgElement({name: "line",
          attributes: [["x1", "0"],
            ["x2", visibleVerses * verseInPx],
            ["y1", (witnessIndex * verticalDistance) + (barHeightInPx / 2)],
            ["y2", (witnessIndex * verticalDistance) + (barHeightInPx / 2)],
            ["shape-rendering", "crispEdges"]],
          parent: geneticBarDiagramGrid
        });
      });

      ////////////////////////////////////////////////////////
      // determine scale factor for genetic bar diagram
      // determine width of svg
      // 160 from (geneticBarDiagramVerseBars) 10 + 160 from outmost svg group (translate(150,0)
      var geneticBarDiagramVerseBarsScale = (availableDiagramWidth - 160) / (visibleVerses*30);
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
            ["width", visibleVerses * verseInPx],
            ["height", barHeightInPx],
            ["opacity", "0"]],
          parent: witnessLink
        });

        // process intervals
        witness.intervals.forEach(function(interval) {
          var barStart, barLength; // start/length of the bar in verse widths, starting with 0 at the left of the diagram

          // test if interval is visible / in selection
          if( (interval.start >= firstVisibleVerse && interval.start <= lastVisibleVerse)
              || (interval.end >= firstVisibleVerse && interval.end <= lastVisibleVerse)
              || (interval.start <= firstVisibleVerse && interval.end >= lastVisibleVerse) ) {
            // calculate start and end of interval relative to visible range
            if(interval.start > firstVisibleVerse) {
              barStart = interval.start - firstVisibleVerse;
              barLength = interval.end < lastVisibleVerse? interval.end - interval.start + 1 : interval.end - firstVisibleVerse;
            } else {
              barStart = 0;
              barLength = interval.end < lastVisibleVerse? interval.end - firstVisibleVerse + 1 : visibleVerses;
            };

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
              var result = typeLabel + " Vers " + start + " – " + stop + " in " + sigil;
              if (type !== 'print') { result += ", S. " + page; }
              return result;
            }



            // create rectangle for interval
            var relatedLines = createSvgElement({name: "rect",
              attributes: [["tooltiptext", toolTipLabel(witness.print? "print" : interval.type, interval.start, interval.end, witness.sigil, interval.page)],
                ["x", barStart * verseInPx],
                ["y", "0"],
                ["width", barLength * verseInPx],
                ["height", barHeightInPx]]
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


    },

  };

    bargraph.init(); 

    return bargraph;
});
