// create functions for on demand loading of variants and add tooltips 
// for showing number of variants per line

define(['/js/faust_common', 'jquery'],
  function(Faust, $) {
  return function addPrintInteraction(rootDir, node, faustUri) {
  "use strict";

  var verseLine;
  var variantCount;
  var witnessCount;
  var group;
  var variantsFilename;
  var color;
  var currentLine;
  var mouseclickCallback;

  var i;

  if (faustUri) {
    faustUri = faustUri.replace('faust://xml/', '');
  }


  // create function that dynamically loads the variants of a verse line when clicking on it
  var createMouseclickCallback = (function(){
    return function(currentLine, variantsFilename, verseLine) {
      return function() {
        // try to load variants if not yet loaded
        if(currentLine.variantsLoaded === undefined) {
          // skip multiple requests to load same variants. if variants are beeing loaded ignore further requests
          if(currentLine.variantsLoading === undefined) {
            // load variants
            currentLine.variantsLoading = Faust.xhr.getXhr(variantsFilename, function(xhr) {
              // loading is finished. remove loading flag
              delete currentLine.variantsLoading;
              // variants successfully loaded
              if(xhr.status === 200) {
                // create div to insert loaded html
                var variantsDiv;
                var resultContainer = document.createElement("div");
                resultContainer.innerHTML = xhr.responseText;

                // loaded html contains variants for several lines. find right one
                variantsDiv = resultContainer.querySelector("#v" + verseLine.replace(/ /g, '_'));

                // now sort the current witnesses entry first
                if (faustUri) {
                  var currentWitVariants = variantsDiv.querySelectorAll('div[data-source~="'+faustUri+'"]'),
                      first = variantsDiv.firstChild;
                  if (currentWitVariants[0] !== first) {
                    for (i = 0; i < currentWitVariants.length; i++) {
                      variantsDiv.insertBefore(currentWitVariants[i], first);
                      currentWitVariants[i].classList.add('currentWitness');
                    }
                  }
                }

                // append resulting div to node for later re-appending and append to dom
                currentLine.variantsDiv = variantsDiv;
//                  currentLine.parentNode.insertBefore(variantsDiv, currentLine);
                currentLine.parentNode.insertBefore(variantsDiv, currentLine.nextElementSibling);

                // now determine the macrogenesis link
                const sigils = Array.prototype.map.call(variantsDiv.querySelectorAll('.sigil'),
                        el => el.textContent),
                      unique = new Set(sigils);
                unique.delete('Text');
                const nodestr= [...unique].join(', '),
                      macrogenParams = new URLSearchParams({
                          nodes: nodestr,
                          order: true,
                          dir: 'TB',
                          inscriptions: true,
                          collapse: true
                      }),
                      macrogenContainer = Faust.dom.createElement({name: 'div', class: 'subgraphlink'});
                macrogenContainer.innerHTML = `<a title="Makrogenese-Graph zu den Zeugen dieses Verses"><i class="fa fa-sliders"></i> Makrogenese-Lab</a>`;
                macrogenContainer.firstElementChild.href = '/macrogenesis/subgraph?' + macrogenParams.toString();
                $(variantsDiv).hide();
                variantsDiv.insertBefore(macrogenContainer, variantsDiv.firstElementChild);
                $(variantsDiv).slideDown(250);



                // set flags that variants are loaded and currently shown
                currentLine.variantsLoaded = true;
                currentLine.isShown = true;

                // set css class
                currentLine.classList.add('show');

                // inti tooltips
                Faust.tooltip.addToTooltipElementsBySelector(".print [title]", "title");
              }
            });
          }
        } else {
          // variants have been loaded successfully before. find out if they are visible
          // and shall be removed from dom or if they aren't yet in dom and shall be appended
          if(currentLine.isShown === true) {
            currentLine.isShown = false;
            $(currentLine.variantsDiv).slideUp(250);
            currentLine.classList.remove('show');
          } else if (currentLine.isShown === false) {
            currentLine.isShown = true;
            $(currentLine.variantsDiv).slideDown(250);
            currentLine.classList.add('show');
          }
        }
      };
    };
  })();

  // collect all verse lines
  var lines;
  var varstr;
  // if a node was given, collect verse lines on node children
  if(node !== undefined) {
    lines = node.getElementsByClassName("hasvars");
  } else {
    lines = document.getElementsByClassName("hasvars");
  }

  // iterate through verse lines and add onclick events to show all variants of a line
  // and to add tooltips to every line to show the number of variants for each line
  for(i = 0; i < lines.length; i++) {
    currentLine = lines.item(i);
    verseLine = currentLine.getAttribute("data-n");
    variantCount = parseInt(currentLine.getAttribute("data-variants"));
    witnessCount = parseInt(currentLine.getAttribute("data-varcount"));
    group = currentLine.getAttribute("data-vargroup");
    variantsFilename = rootDir + "print/variants/" + group + ".html";

    // create mouse click listener to show variants of a line
    mouseclickCallback = createMouseclickCallback(currentLine, variantsFilename, verseLine);

    // append the listener to the line
    currentLine.addEventListener("click", mouseclickCallback);

    // call to externally defined addTooltip function to add tooltips on hover
    // data-varcount attribute can be an empty string and thus variantCount variable can
    // be "NaN". Only create tooltip, if variantCount is a number
    if (!isNaN(variantCount)) {
      switch (variantCount) {
        case 0:
          varstr = "Keine Varianz"; break;
        case 1:
          varstr = "Eine Variante"; break;
        default:
          varstr = variantCount + " Varianten";
      }
      Faust.tooltip.add(currentLine, document.createTextNode(varstr + " in " + witnessCount + " Textzeugen"));
    }
  }

    Faust.tooltip.addToTooltipElementsBySelector(".view-content [title], .print [title]", "title");

    const params = Faust.url.getParameters();
    if (params['#']) {
      for (const target of document.querySelectorAll('#' + params['#'])) {
        if (target.hasAttribute('data-variants')) {
          target.click();
        }
      }
    }
}});
