// noinspection JSAnnotator
define(["faust_common", "fv_doctranscript", "faust_mousemove_scroll"],
  function(Faust, docTranscriptViewer, addMouseMoveScroll) {
  "use strict";

  var htmlStrings = {
    "loadingMetadata": "Lade Faksimile.",
    "metadataLoaded": "Metadaten geladen. Lade Grafiken und Überblendung (falls vorhanden).",
    "noFacsimileAvailable": "Kein Faksimile verfügbar.",
    "emptyPage": "Leere Seite",
    "imageMetadataLoadError": "Metadaten zum Faksimile konnten nicht geladen werden.",
    "imageMetadataParseError": "Metadaten zum Faksimile konnten nicht verarbeitet werden.",
    "overlayLoadError": "Keine Überblendung gefunden."
  };

  var minZoom = 0.005;
  var maxZoom = 4;


  /* based on echo.js from Todd Motto (http://toddmotto.com/labs/echo/ | https://travis-ci.org/toddmotto/echo)
     adjusted to be called with an element as parameter that will be watched for scroll events rather than
     listening to window.onscroll events */
  var lazyTileLoader = function lazyTileLoader(root) {

      'use strict';

      var echo = {};

      var callback = function () {};

      var offset, poll, delay, useDebounce, unload;

      var inView = function (element, view) {
        var box = element.getBoundingClientRect();
        return (box.right >= view.l && box.bottom >= view.t && box.left <= view.r && box.top <= view.b);
      };

      var debounceOrThrottle = function () {
        if(!useDebounce && !!poll) {
          return;
        }
        clearTimeout(poll);
        poll = setTimeout(function(){
          echo.render();
          poll = null;
        }, delay);
      };

      echo.init = function (opts) {
        opts = opts || {};
        var offsetAll = opts.offset || 0;
        var offsetVertical = opts.offsetVertical || offsetAll;
        var offsetHorizontal = opts.offsetHorizontal || offsetAll;
        var optionToInt = function (opt, fallback) {
          return parseInt(opt || fallback, 10);
        };
        offset = {
          t: optionToInt(opts.offsetTop, offsetVertical),
          b: optionToInt(opts.offsetBottom, offsetVertical),
          l: optionToInt(opts.offsetLeft, offsetHorizontal),
          r: optionToInt(opts.offsetRight, offsetHorizontal)
        };
        delay = optionToInt(opts.throttle, 250);
        useDebounce = opts.debounce !== false;
        unload = !!opts.unload;
        callback = opts.callback || callback;
        echo.render();
        if (document.addEventListener) {
          root.addEventListener('scroll', debounceOrThrottle, false);
          root.addEventListener('load', debounceOrThrottle, false);
        } else {
          root.attachEvent('onscroll', debounceOrThrottle);
          root.attachEvent('onload', debounceOrThrottle);
        }
      };

      echo.render = function () {
        var nodes = document.querySelectorAll('img[data-echo], [data-echo-background]');
        var length = nodes.length;
        var src, elem;
        var view = {
          l: 0 - offset.l,
          t: 0 - offset.t,
          b: (root.innerHeight || document.documentElement.clientHeight) + offset.b,
          r: (root.innerWidth || document.documentElement.clientWidth) + offset.r
        };
        for (var i = 0; i < length; i++) {
          elem = nodes[i];
          if (inView(elem, view)) {

            if (unload) {
              elem.setAttribute('data-echo-placeholder', elem.src);
            }

            if (elem.getAttribute('data-echo-background') !== null) {
              elem.style.backgroundImage = "url(" + elem.getAttribute('data-echo-background') + ")";
            }
            else {
              elem.src = elem.getAttribute('data-echo');
            }

            if (!unload) {
              elem.removeAttribute('data-echo');
              elem.removeAttribute('data-echo-background');
            }

            callback(elem, 'load');
          }
          else if (unload && !!(src = elem.getAttribute('data-echo-placeholder'))) {

            if (elem.getAttribute('data-echo-background') !== null) {
              elem.style.backgroundImage = "url(" + src + ")";
            }
            else {
              elem.src = src;
            }

            elem.removeAttribute('data-echo-placeholder');
            callback(elem, 'unload');
          }
        }
        if (!length) {
          echo.detach();
        }
      };

      echo.detach = function () {
        if (document.removeEventListener) {
          root.removeEventListener('scroll', debounceOrThrottle);
        } else {
          root.detachEvent('onscroll', debounceOrThrottle);
        }
        clearTimeout(poll);
      };

      return echo;

  };

  /**
   * Creates the element structure and returns it. The root node has a property .echo that contains
   * the lazyTileLoader. div#text-layer -> overlay svg
   */
  var createNodes = function(container) {

      // creating dom nodes
      var imageContainer;
      if (container) {
        Faust.dom.removeAllChildren(container);
        imageContainer = container;
      } else {
          imageContainer = document.createElement("div");
      }
        var rotateContainer = document.createElement("div");
          var scaleContainer = document.createElement("div");
            var overlayContainer = document.createElement("div");
              var image = document.createElement("div");
              var tile = document.createElement("div");
              var text = document.createElement("div");
        var imageInfo = document.createElement("div");
          var facsCopyright = document.createElement("div");
            var facsCopyrightP = document.createElement("p");

      imageContainer.id = "image-container";
      imageContainer.className = "image-container";
      rotateContainer.id = "rotate-container";
      rotateContainer.className = "rotate-container";
      scaleContainer.id = "scale-container";
      scaleContainer.className = "scale-container";
      overlayContainer.id = "overlay-container";
      overlayContainer.className = "overlay-container";
      image.id = "image-layer";
      image.className = "image-layer";
      tile.id = "tile-layer";
      tile.className = "tile-layer";
      text.id = "text-layer";
      text.className = "text-layer";
      imageInfo.id = "image-info";
      imageInfo.className = "image-info";

      facsCopyright.id = "facs-copyright";
      facsCopyright.className = "facs-copyright";


      // appending all children to parents
      imageContainer.appendChild(rotateContainer);
        rotateContainer.appendChild(scaleContainer);
          scaleContainer.appendChild(overlayContainer);
            overlayContainer.appendChild(image);
            overlayContainer.appendChild(tile);
            overlayContainer.appendChild(text);
      imageContainer.appendChild(imageInfo);
      imageContainer.appendChild(facsCopyright);
      imageContainer.facsCopyright = facsCopyright;

      // append direct element access to container
      imageContainer.rotateContainer = rotateContainer;
        imageContainer.scaleContainer = scaleContainer;
          imageContainer.overlayContainer = overlayContainer;
            imageContainer.image = image;
            imageContainer.tile = tile;
            imageContainer.text = text;
      imageContainer.imageInfo = imageInfo;

      imageContainer.currentRotation = 0;

      imageContainer.echo = lazyTileLoader(imageContainer);
      imageContainer.echo.init();

      return imageContainer;
    };

  /* calculates the next zoom level / zoom. The zoom level is calculated so that
   it reaches powers of 2 (1/4, 1/2, 1, 2, 4, ...).
   The interval between two powers of 2 is divided into four equally sized
   elements (eg. 0.5, 0.625, 0.75, 0.825, 1, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0, 3.5, 4.0, ...)
   The function takes the current zoom as well as the direction as a parameter and returns
   the next zoom. */
  var getNextScale = function getNextScale(currentScale, direction) {
      /* first step: calculate the next two larger powers of two (compared to zoom) as well
       as the next two lower powers of 2 */
      var zoomBase = [ Math.floor(Math.log(currentScale) / Math.log(2)) - 1,
        Math.floor(Math.log(currentScale) / Math.log(2)),
        Math.ceil( Math.log(currentScale) / Math.log(2)),
        Math.ceil( Math.log(currentScale) / Math.log(2) + 1)
      ];

      /* second step: create an array that contains all possible values that the new
       zoom could take. The array contains the lower power of 2 in the [1]st field
       and the next bigger power of 2 in the [5] field.
       */
      var zoomSteps = [];
      zoomSteps[1] = Math.pow(2, zoomBase[1]);
      zoomSteps[5] = Math.pow(2, zoomBase[2]);

      /* Fields [2]...[4] contain the values between the powers of two (eg currentScale is
       1.1, than [1] = 1.0, [2] = 1.25, [3] = 1.5, [4] = 1.75, [5] = 2.0
       */
      // noinspection PointlessArithmeticExpressionJS
      zoomSteps[2] = zoomSteps[1] + 1 * ( ( zoomSteps[5] - zoomSteps[1] ) / 4);
      zoomSteps[3] = zoomSteps[1] + 2 * ( ( zoomSteps[5] - zoomSteps[1] ) / 4);
      zoomSteps[4] = zoomSteps[1] + 3 * ( ( zoomSteps[5] - zoomSteps[1] ) / 4);

      /* If the currentScale is a power of two, than [1]...[5] will all have the same vale -
       the same as the current zoom. Therefore the next lower zoom value will be stored in [0]
       and the next larger value in [6]
       */
      zoomSteps[0] = zoomSteps[1] - ( ( zoomSteps[1] - Math.pow(2, zoomBase[0]) ) / 4);
      zoomSteps[6] = zoomSteps[5] + ( ( Math.pow(2, zoomBase[3]) - zoomSteps[5] ) / 4);

      /* If the currentScale is a power of 2, then zoomSteps[1]===zoomSteps[5] */
      if(zoomSteps[1] === zoomSteps[5]) {
        if(direction > 0) {
          currentScale = zoomSteps[6];
        } if(direction < 0) {
          currentScale = zoomSteps[0];
        }
      } else {
        // determine the first zoomStep that is larger than the current zoom
        var curZoomIndex = 0;
        while(currentScale > zoomSteps[++curZoomIndex]) {
        };

        if(currentScale === zoomSteps[curZoomIndex]) {
          curZoomIndex = curZoomIndex + direction;
        } else {
          if(direction < 0) {
            curZoomIndex = curZoomIndex + direction;
          }
        }
        // determine which zoomStep is closer to our current zoom
        var zoomDeltaLower = currentScale - zoomSteps[curZoomIndex - 1];
        var zoomDeltaUpper = currentScale - zoomSteps[curZoomIndex];
        if(zoomDeltaLower < zoomDeltaUpper) {
          currentScale = zoomSteps[curZoomIndex - 1];
        } else {
          currentScale = zoomSteps[curZoomIndex];
        }
      }

      return currentScale;
  };

  /* determines in which direction the mouse wheel was spun. Normalises
   the result value (-1 or 1) */
  var getScrollDirection = function(scrollEvent) {
      var direction = scrollEvent.wheelDelta ? scrollEvent.wheelDelta : -scrollEvent.detail;
      direction = parseInt(direction, 10);

      if(direction !== 0) {
        direction = direction / Math.abs(direction);
      }
      return direction;
  };

  /**
   * Creates the controls for a single page.
   */
  var createImageOverlay = function createImageOverlay(options) {
    var args = null;
    var metadata = null;
    var domNodes = null;
    var pageRect = null;

    var showElement = function (element, show) {
        if (show === true) {
          element.style.display = "block";
        } else if (show === false) {
          element.style.display = "none";
        }
    };

    var setBackgroundImage = function(zoomLevel) {
        var currentImage = domNodes.image.images[zoomLevel];
        // determine if src is set
        if(currentImage.getAttribute("src") === null) {
          // if src is not set - set attribute
          currentImage.setAttribute("src", currentImage.imgSrc);
        }
        // replace content (if set) with new image
        Faust.dom.removeAllChildren(domNodes.image);
        domNodes.image.appendChild(currentImage);
    };

    // select specific tile div to be put in dom and be rendered. a zoom level of 0
    // represents the original unscaled source image as tiles, zoom level 1 represents
    // the tiles of the original image, scaled to 50% in height and width, level 2
    // scaled to 25%, ...
    var setTileDiv = function(zoomLevel) {
        var adjustedZoomLevel = zoomLevel;
        // zoom levels are in the range of 0...metadata.zoomLevels
        if(zoomLevel < 0) {
          // if zoomLevel is lower than 0 it means an upscaled version of the original image.
          // so set zoomLevel to 0 (=100% of the original image = maximum quality) and do
          // upscaling with html scale transformation in scale container
          adjustedZoomLevel = 0;
        } else if (zoomLevel > metadata.zoomLevels - 1) {
          // if zoomLevel is higher than the maximum zoom level available (the smallest scaled
          // down version of the input image available), then use these smalled versions of tiles
          // available
          adjustedZoomLevel = metadata.zoomLevels - 1;
        }
        // now put selected tiled in dom
        var currentTile = domNodes.tile.tiles[adjustedZoomLevel];
        Faust.dom.removeAllChildren(domNodes.tile);
        domNodes.tile.appendChild(currentTile);
    };

    // set the scale of the scaleContainer. that is resizing the facsimile. returns the newly set scale value
    var setScale = function(newScale) {
        // scaling can only be done if any images exists to scale. If no facsimile exists scaling isn't possible, so skip
        if(domNodes.image.images !== undefined) {


          // test if new scale factor is in allowed range
          if(newScale >= minZoom && newScale <= maxZoom) {
            // if so, determine zoom level. zoom level 0 refers to (jpg) images which havent been scales (100%),
            // level 1 to images half in width and size compared to original image, level 2 to a fourth, ...
            // 1/(2^zoomLevel)
            var newZoomLevel = Math.floor(-(Math.log(newScale) / Math.log(2)));
            // determine if the zoomLevel for current scale is different to previous scale's zoomLevel
            if(!domNodes.currentZoomLevel || domNodes.currentZoomLevel !== newZoomLevel) {
              domNodes.currentZoomLevel = newZoomLevel;
              setTileDiv(newZoomLevel);
              domNodes.echo.init();
            } else {
              domNodes.echo.render();
            }

            // calculate the center of the image's area that is currently shown. this is needed to adjust the
            // scroll positions after scaling the image so that the same area is shown after scaling.
            // the values calculated are relative (percent) to the image dimensions
            var centerXpercent = ( domNodes.scrollLeft + (domNodes.clientWidth / 2) ) / domNodes.rotateContainer.clientWidth;
            var centerYpercent = ( domNodes.scrollTop + (domNodes.clientHeight / 2) ) / domNodes.rotateContainer.clientHeight;

            var currentRotation;
            // scale image. to do so the image may not be rotated or the image transformation will
            // produce a result with a shifted image. so store current rotation and rotate to 0 deg
            currentRotation = domNodes.currentRotation;
            rotate(0);
            // set scale
            domNodes.scaleContainer.style.transform = "scale(" + newScale + ")";
            domNodes.rotateContainer.style.width = Math.round(newScale * metadata.imageWidth) + "px";
            domNodes.rotateContainer.style.height = Math.round(newScale * metadata.imageHeight) + "px";
            domNodes.currentScale = newScale;
            // restore previous rotation
            rotate(currentRotation);

            // center the area of the image that was shown befor the image was scaled
            // if horizontal scrollbar is shown
            if(domNodes.clientWidth < domNodes.rotateContainer.clientWidth) {
              // adjust horizontal scrollbar
              domNodes.scrollLeft = (centerXpercent * domNodes.rotateContainer.clientWidth) - (domNodes.clientWidth / 2);
            }
            // if vertical scrollbar is shown
            if(domNodes.clientHeight < domNodes.rotateContainer.clientHeight) {
              // adjust vertical scrollbar
              domNodes.scrollTop = (centerYpercent * domNodes.rotateContainer.clientHeight) - (domNodes.clientHeight / 2);
            }

            events.triggerEvent("scaleChanged", newScale);

            return newScale;
          }
        } else {
          // there is no content to scale, so scaling can't be done and the current scale is not available.
          return undefined;
        }
    };

    // function to zoom in or out. zooming in by applying "in" or 1 as parameter,
    // zooming out with "out" or -1 as parameter
    var zoom = function zoom(direction) {
        if(direction === "in" || direction === 1) {
          setScale(getNextScale(domNodes.currentScale, 1));
        } else if(direction === "out" || direction === -1) {
          setScale(getNextScale(domNodes.currentScale, -1));
        }
    };

    var fitTo = function fitTo(left, top, right, bottom) {
      const width = right - left;
      const height = bottom - top;           
      const scale = setScale(Math.min(domNodes.getBoundingClientRect().width / width, domNodes.getBoundingClientRect().height / height));
      domNodes.scrollTo(left * scale, top * scale);
      return scale;
    }

    var getDefaultScale = function getDefaultScale() {
      return Math.min(domNodes.getBoundingClientRect().width / metadata.imageWidth,
            domNodes.getBoundingClientRect().height / metadata.imageHeight)
    }

    // calculates the scale to apply to (original sized) image so that it will
    // fully fit inside the facsimile container (outermost node / domNodes)
    // returns the determined scale value
    var fitScale = function fitScale(force) {
      if (force != true && (pageRect != null)) {
        console.log('fitScale right turn');
        return fitTo(...pageRect);
      } else {
        try {
          try { throw "fitScale wrong turn!" } catch (e) { console.error(e);}
          var scale = setScale(getDefaultScale());
          return scale;
        } catch (e) {
          console.log(e);
          return undefined;
        }
      }
    };

    var setPageRect = function setPageRect(coords) {
      console.log('setPageRect', coords)
      pageRect = coords;
      if (pageRect !== null)
        return fitTo(...pageRect);
    }

    var rotate = function(direction) {
        if(direction === "right") {
          domNodes.currentRotation = (domNodes.currentRotation + 1) % 4;
        } else if(direction === "left") {
          domNodes.currentRotation = domNodes.currentRotation - 1;
          if(domNodes.currentRotation < 0) {
            domNodes.currentRotation = 3;
          }
        } else if ((direction%1) === 0 && direction >= 0 && direction <= 4) {
          domNodes.currentRotation = direction;
        }
        switch(domNodes.currentRotation) {
          case 0: domNodes.rotateContainer.style.transform = "rotate(0deg) translate(0px, 0px)";
                  break;
          case 1: domNodes.rotateContainer.style.transform = "rotate(90deg) translate(0px, -" + Math.round(domNodes.currentScale * metadata.imageHeight) + "px)";
                  break;
          case 2: domNodes.rotateContainer.style.transform = "rotate(180deg) translate(-" + Math.round(domNodes.currentScale * metadata.imageWidth) + "px, -" + Math.round(domNodes.currentScale * metadata.imageHeight) + "px)";
                  break;
          case 3: domNodes.rotateContainer.style.transform = "rotate(270deg) translate(-" + Math.round(domNodes.currentScale * metadata.imageWidth) + "px, 0px)";
                  break;
        }
        domNodes.echo.render();
    };

    // 
    var showOverlay = function showOverlay(showOverlay) {
        var i;
        var facsimileElementLines;
        if(showOverlay === true) {
          facsimileElementLines = domNodes.text.querySelectorAll("g.element-line");
          for(i = 0; i < facsimileElementLines.length; i++) {
            Faust.dom.removeClassFromElement(facsimileElementLines.item(i), "element-line-hidden");
          }
        } else if (showOverlay === false) {
          facsimileElementLines = domNodes.text.querySelectorAll("g.element-line");
          for(i = 0; i < facsimileElementLines.length; i++) {
            Faust.dom.addClassToElement(facsimileElementLines.item(i), "element-line-hidden");
          }
        }
    };

    /* the eventhandler first determines whether the mozilla
     'detail' attribute or the world's wheelDelta shall
     be used. When we know that we can continue to normalize
     the retrieved scroll-event-data. when all other browsers
     return a positive number mozilla will return a negative
     one and vice versa. Additionally most browsers return a
     lage number like the amount of pixles that shall be
     scrolled where mozilla returns the numer of lines...

     Result: we only return a normalized value:
     1 if there was a scroll event scrolling  UP  and
     -1 if there was a scroll event scrolling DOWN
     Further: the event propagation is beeing stopped */
    var mouseWheelEventHandler = function(event) {

        var direction = getScrollDirection(event);
        zoom(direction);
        event.preventDefault();

        return false;
    };

    // function to create a div containing all tiles of a specific zoom level. All generated divs will have
    // the same dimensions as the original image. To realize this, all scaled down tiles (tiles not the same
    // resolution as the unscaled original image) will be resized / magnified.
    // The resulting div will contain divs that will make up a row of tiles. Each of this rows / "row divs"
    // than contains one div for each tile to be shown on that specific row.
    var createTileDiv = function createTileDiv(imageMetadata, tileBaseUrl, zoomLevel) {
        var i, j;

        var zoomedWidth = imageMetadata.imageWidth;
        var zoomedHeight = imageMetadata.imageHeight;

        for(i = 0; i < zoomLevel; i++) {
          zoomedWidth = Math.round(zoomedWidth / 2);
          zoomedHeight = Math.round(zoomedHeight / 2);
        }

        // calculate number of horizontal and vertical tiles
        var horizontalTileCount = Math.ceil(zoomedWidth / imageMetadata.tileWidth);
        var verticalTileCount = Math.ceil(zoomedHeight / imageMetadata.tileHeight);

        var zoomFactor = Math.pow(2, zoomLevel);

        // create container div for tile rows
        var tileImageDiv = document.createElement("div");
        tileImageDiv.style.width = imageMetadata.imageWidth + "px";
        tileImageDiv.style.height = imageMetadata.imageHeight + "px";
        tileImageDiv.style.position = "relative";
        tileImageDiv.style.top = "0px";
        tileImageDiv.style.left = "0px";

        // create tile rows and attach to container.
        for(i = 0; i < verticalTileCount; i++) {
          var tileRowDiv = document.createElement("div");
          tileRowDiv.style.width = "100%";
          tileRowDiv.style.height = imageMetadata.tileHeight * zoomFactor + "px";
          tileRowDiv.style.overflow = "hidden";
          tileImageDiv.appendChild(tileRowDiv);

          // in most cases the last tile in a column has not the full height of a tile (tileHeight). Adjust height width to actual tile height
          if(i === verticalTileCount - 1) {
            if( (imageMetadata.imageHeight % (imageMetadata.tileHeight * zoomFactor)) === 0 ) {
              // if last tile in column appears to be as high as all other tiles, set to same height as other tiles...
              tileRowDiv.style.height = (imageMetadata.tileHeight * zoomFactor) + "px";
            } else {
              // ...else set height to actual tile height
              tileRowDiv.style.height = (imageMetadata.imageHeight % (imageMetadata.tileHeight * zoomFactor)) + "px";
            }
          }

          // create tiles and attach to row container / parent div
          for(j = 0; j < horizontalTileCount; j++) {
            var tileDiv = document.createElement("div");
            tileDiv.style.height = "100%";
            tileDiv.style.width = imageMetadata.tileWidth * zoomFactor + "px";

            // in most cases the last tile in a row has not the full with of a tile (tileWidth). Adjust width to actual tile width
            if(j === horizontalTileCount - 1) {
              if( (imageMetadata.imageWidth % (imageMetadata.tileWidth * zoomFactor)) === 0 ) {
                // if last tile appears to be as wide as all other tiles, set to same width as other tiles...
                tileDiv.style.width = (imageMetadata.tileWidth * zoomFactor) + "px";
              } else {
                // ...else set width to actual tile width
                tileDiv.style.width = (imageMetadata.imageWidth % (imageMetadata.tileWidth * zoomFactor)) + "px";
              }
            }

            tileDiv.style.display = "inline-block";
            tileDiv.style.overflow = "hidden";

            var image = document.createElement("img");
            image.style.height = "100%";
            image.style.width = "100%";
            image.setAttribute("src", "img/tilebg.png");
            image.setAttribute("data-echo", tileBaseUrl + "_" + zoomLevel + "_" + j + "_" + i + ".jpg");
            tileDiv.appendChild(image);

            tileRowDiv.appendChild(tileDiv);
          }
        }

        return tileImageDiv;
    };

    var createZoomImage = function createZoomImage(imageMetadata, jpgBaseUrl, zoomLevel) {
        var image = document.createElement("img");
        image.style.width = imageMetadata.imageWidth;
        image.height = imageMetadata.imageHeight;
        image.imgSrc = jpgBaseUrl + "_" + zoomLevel  + ".jpg";
        return image;
    };

      var insertOverlay = function(overlayText) {
          domNodes.text.innerHTML = overlayText;
          events.triggerEvent("overlayLoaded");
          // Faust.dom.removeAllChildren(domNodes.imageInfo);
          showElement(domNodes.rotateContainer, true);
          return domNodes.text;
      };

    var insertFacsimileTiles = function(metadataText) {

        var i;

          // metadata was found. Try to parse
        try {
            metadata = JSON.parse(metadataText);
            // Metadata is available.
            domNodes.imageInfo.innerHTML = htmlStrings.metadataLoaded;

            // Set width and height of all elements beneath rotate container to width
            // and height of original image
            domNodes.rotateContainer.style.width = metadata.imageWidth + "px";
            domNodes.scaleContainer.style.width = metadata.imageWidth + "px";
            domNodes.overlayContainer.style.width = metadata.imageWidth + "px";
            domNodes.image.style.width = metadata.imageWidth + "px";
            domNodes.tile.style.width = metadata.imageWidth + "px";
            domNodes.text.style.width = metadata.imageWidth + "px";

            domNodes.rotateContainer.style.height = metadata.imageHeight + "px";
            domNodes.scaleContainer.style.height = metadata.imageHeight + "px";
            domNodes.overlayContainer.style.height = metadata.imageHeight + "px";
            domNodes.image.style.height = metadata.imageHeight + "px";
            domNodes.tile.style.height = metadata.imageHeight + "px";
            domNodes.text.style.height = metadata.imageHeight + "px";

            domNodes.currentScale = 1.0;

            // create an image for each available zoom level
            domNodes.image.images = [];
            for (i = 0; i < metadata.zoomLevels; i++) {
                domNodes.image.images[i] = createZoomImage(metadata, args.jpgBaseUrl, i);
            }

            // create a div with tiles for each available zoom level
            domNodes.tile.tiles = [];
            for (i = 0; i < metadata.zoomLevels; i++) {
                domNodes.tile.tiles[i] = createTileDiv(metadata, args.tileBaseUrl, i);
            }

            // now set the background image (full image small quality - as preview) to
            // the zoom level given with arguments
            setBackgroundImage(args.backgroundZoomLevel);

            addMouseMoveScroll(domNodes);

        } catch (e) {
            Faust.error("Error reading page metadata", e + '<pre>' + metadataText + '</pre>', domNodes.rotateContainer);
        }

            showElement(domNodes.rotateContainer, true);
    };


      var events = Faust.event.createEventQueue();
      // store arguments for later use
      args = options;
      // create dom nodes / div elements to store content
      domNodes = createNodes();
      // set load message, that is hide (not yet available) images and show imageInfo div. then set text
      showElement(domNodes.rotateContainer, false);
      showElement(domNodes.imageInfo, true);
      domNodes.imageInfo.innerHTML = htmlStrings.loadingMetadata;

      var facsimilePromise, overlayPromise;
      // test if facsimile is available
      if(args.hasFacsimile === false) {
        // if no facsimile exists, set text to imageInfo div. images are still hidden, so text is modal
        domNodes.imageInfo.innerHTML = htmlStrings.noFacsimileAvailable;
        facsimilePromise = Promise.resolve(domNodes.imageInfo);
      } else {
        // else try to get metadata
        // Faust.xhr.getXhr(args.imageMetadataUrl, metadataLoadHandler);
        facsimilePromise = Faust.xhr.get(args.imageMetadataUrl, 'text')
          .then(insertFacsimileTiles)
          .catch(function(e) {
            Faust.error('Fehler beim Laden der Facsimile-Metadaten', e.toString(), domNodes);
          })

      }

      if(args.hasImageTextLink === true) {
        overlayPromise = Faust.xhr.get(args.overlayUrl, 'text')
          .then(insertOverlay)
          .catch(function(reason) {
            console.error('Fehler beim Laden der Transkriptionsüberblendung', reason);
            return Promise.resolve(true);
          })
      } else {
        Faust.dom.removeAllChildren(domNodes.imageInfo);
        showElement(domNodes.rotateContainer, true);
        overlayPromise = Promise.resolve(domNodes.imageInfo);
      }

      if (args.copyright) {
        var facsCopyright = domNodes.facsCopyright;
        facsCopyright.textContent = args.copyright;
        var closeBtn = document.createElement('i');
        closeBtn.className = "fa fa-cancel closebtn";
        closeBtn.addEventListener("click", function closeFacs() { 
          facsCopyright.innerHTML = ""; });
        facsCopyright.appendChild(closeBtn);
      }

      // Add event handler to zoom in and out by using the scroll wheel.
      // Allmost all browsers listen to a mousewheel event if the mousewhell is spun...
      domNodes.addEventListener('mousewheel', mouseWheelEventHandler);
      // ...while mozilla reacts to DOMMouseScroll events
      domNodes.addEventListener('DOMMouseScroll', mouseWheelEventHandler);

      domNodes.setScale = setScale;
      domNodes.rotate = rotate;
      domNodes.zoom = zoom;
      domNodes.fitScale = fitScale;
      domNodes.getDefaultScale = getDefaultScale;
      domNodes.setPageRect = setPageRect;
      domNodes.showOverlay = showOverlay;
      domNodes.addFacsimileEventListener = events.addEventListener;

      if (args.hasFacsimile) {
        return Promise
          .all([facsimilePromise, overlayPromise])
          .then(function () {
            showElement(domNodes.imageInfo, false);
            return domNodes;
          })
          .catch(function (reason) {
            Faust.error('Fehler beim Laden des Digitalisats', reason, domNodes.imageInfo);
            showElement(domNodes.imageInfo, true);
          })
      } else if (args.empty) {
        domNodes.imageInfo.innerHTML = htmlStrings.emptyPage;
        showElement(domNodes.imageInfo, true);
        return Promise.resolve(domNodes);
      } else {
          domNodes.imageInfo.innerHTML = htmlStrings.noFacsimileAvailable;
          showElement(domNodes.imageInfo, true);
          return Promise.resolve(domNodes);
      }
  };

  var imageOverlay = {

      createImageOverlay: createImageOverlay,

      currentPageNo: null,
      currentLayer: null,
      facsimile: null,

      init: function init(parent, state, controller) {
          var that = this;
          this.state = state;
          this.controller = controller;


          var container = document.createElement("div");
          container.id = "facsimile-content";         // FIXME do we need an ID?
          container.className = "facsimile-content view-content";
          this.container = container;
          container.faust_debug = this;
          parent.appendChild(container);
          this.loadPage(state.page)
            .then(function (value) { that.bindControls() });
      },

      loadPage : function(pageNo) {
          if ((this.currentPageNo === pageNo) && (this.currentLayer === this.state.layer) && (this.facsimile != null)) {
            return Promise.resolve(this.facsimile);
          }
          var currentPage = this.state.doc.pages[pageNo - 1];
          var currentMetadata = this.state.doc.metadata.pages[pageNo - 1];
          var that = this;
          var pagePromise, rectPromise;
          // only load facsimile if images do exist. images are encoded in docTranscripts, so check if
          // docTranscript exists and if it has images attached
          this.setLayer(this.state.layer);
          var layer = this.state.layer;
          this.currentLayer = layer;
          if (currentMetadata.docTranscriptCount > 0 && currentMetadata.docTranscripts[0].hasImages) {
              function getPageRect() {
                const mdUrl = currentMetadata.docTranscripts[0].images[layer].metadataUrl,
                  docMetadata = that.state.doc.metadata,
                  slash = mdUrl.lastIndexOf('/'),
                  pageName = mdUrl.substring(slash + 1, mdUrl.lastIndexOf('.')),
                  zoomFile = mdUrl.substring(0, slash + 1) + 'zoom.json';
                if (docMetadata.pageRects) {
                  return Promise.resolve(docMetadata.pageRects[pageName]);
                } else {
                  return Faust.xhr.get(zoomFile, 'text')
                    .then(function (text) {
                      docMetadata.pageRects = JSON.parse(text);
                      return docMetadata.pageRects[pageName]
                    })
                    .catch(function () { return null;})
                }
              }
              rectPromise = getPageRect();
              pagePromise = this.createImageOverlay(
                  {
                      "hasFacsimile": currentMetadata.docTranscripts[0].hasImages,
                      "hasImageTextLink": currentMetadata.docTranscripts[0].hasImageTextLink,
                      "imageMetadataUrl": currentMetadata.docTranscripts[0].images[layer].metadataUrl,
                      "jpgBaseUrl": currentMetadata.docTranscripts[0].images[layer].jpgUrlBase,
                      "tileBaseUrl": currentMetadata.docTranscripts[0].images[layer].tileUrlBase,
                      "overlayUrl": currentMetadata.docTranscripts[0].facsimileOverlayUrl,
                      "backgroundZoomLevel": this.state.imageBackgroundZoomLevel,
                      "copyright": this.state.doc.getFacsCopyright()
                  });
          } else {
              rectPromise = Promise.resolve(null);
              pagePromise = this.createImageOverlay({hasFacsimile: false, empty: currentMetadata.empty});
          }
          return Promise.all([pagePromise, rectPromise]).then(function (details) {
            const facsimile = details[0], zoomRect = details[1];
            Faust.dom.removeAllChildren(that.container);
            that.container.appendChild(facsimile);
            that.facsimile = facsimile;
            facsimile.addFacsimileEventListener("scaleChanged", function (newScale) {
              if (newScale != facsimile.getDefaultScale()) {
                that.state.scale = newScale;
                console.log('Registered new scale:', newScale);
              }
            });
            if (zoomRect != null)
              facsimile.setPageRect(zoomRect);
            else
              if (that.state.scale === undefined) {
                  facsimile.fitScale();
              } else {
                facsimile.setScale(that.state.scale);
              }
            facsimile.showOverlay(that.state.showOverlay);
            docTranscriptViewer.transcriptTooltips(facsimile);
            facsimile.overlayContainer.addEventListener("click", function (event) {
              that.toggleOverlay();
            });
            that.facsimile = facsimile;
            that.currentPageNo = pageNo;
            return facsimile;
          }).catch(function(e) { Faust.error('Fehler beim Laden der Ansicht', e, that.facsimile)});
      },
      show : function () { this.visible = true;  this.container.style.display = 'block'; this.shown(); },
      hide : function () { this.visible = false; this.container.style.display = 'none';  this.hidden(); },
      shown: function () {
          document.getElementById("facsimile-settings").style.display = "block";
          document.getElementById("facsimile-layer-button").style.display =
            this.getLayerCount() > 1? "inline-block" : "none";
          if (this.facsimile) {
            if (this.state.scale)
              this.facsimile.setScale(this.state.scale);
            else
              this.facsimile.fitScale();
          }
      },
      hidden: function() {
          document.getElementById("facsimile-settings").style.display = "none";
      },
      setPage: function (pageNo) {
          var that = this;
          return this.loadPage(pageNo)
            .then(function (facsimile) {
              that.facsimile = facsimile;
              facsimile.fitScale();
              return facsimile; });
      },
      getLayerCount: function() {
        var pageMetadata = this.state.doc.metadata.pages[this.state.page - 1];
        if (pageMetadata.docTranscripts.length > 0 && pageMetadata.docTranscripts[0].hasImages)
          return pageMetadata.docTranscripts[0].images.length;
        else return 1;
      },
      nextLayer: function() {
        if (this.visible) {
          var layers = this.getLayerCount();
          if (layers > 1) {
            this.setLayer((this.state.layer + 1) % layers);
            this.state.toLocation();
          } else {
            this.setLayer(0);
          }
        }
        this.setPage(this.state.page);
      },
      setLayer: function(layer) {
        var newLayer = layer % this.getLayerCount();
        if (this.state.layer !== newLayer) {
          this.state.layer = newLayer;
          this.state.toLocation(true);
        }
        document.getElementById("facsimile-layer-button").style.display =
          this.getLayerCount() > 1? "inline-block" : "none";
        document.getElementById("facsimile-layer-badge").innerHTML = this.state.layer;
      },
      toggleOverlay: function () {
        if (this.visible && this.facsimile) {
          this.state.showOverlay = !this.state.showOverlay;
          Faust.toggleButtonState('#toggle-overlay-button', this.state.showOverlay);
          this.facsimile.showOverlay(this.state.showOverlay);
        }
      },
      bindControls: function() {
          var that = this;
          var zoomIn = function () { if (that.visible) that.facsimile.zoom("in"); };
          var zoomOut = function () { if (that.visible) that.facsimile.zoom("out"); };
          var rotateLeft = function () { if (that.visible) that.facsimile.rotate("left"); };
          var rotateRight = function () { if (that.visible) that.facsimile.rotate("right"); };
          var toggleOverlay = function () { that.toggleOverlay(); };
          var nextLayer = function () {
            that.nextLayer();
          }

          Faust.bindBySelector('#zoom-in-button', zoomIn);
          Faust.bindBySelector('#zoom-out-button', zoomOut);
          Faust.bindBySelector('#rotate-left', rotateLeft);
          Faust.bindBySelector('#rotate-right', rotateRight);
          Faust.bindBySelector('#toggle-overlay-button', toggleOverlay);
          Faust.bindBySelector('#facsimile-layer-button', nextLayer);
      }
  };
  return function (container, state, controller) {
    var result = Object.create(imageOverlay);
    result.init(container, state, controller);
    return result;
  }
});
