define(['faust_common'],
  function(Faust) {
  "use strict";

  // import from faust_common
  var createSvgElement = Faust.dom.createSvgElement;

  var documentStructure = {};

  var horizontalIndentation = 15;
  var verticalDistance = 15;
  var horizontalLineLength = 200;

  var appendPagesGroup = function(parent, className, events, leftPageNum, rightPageNum) {
    var group = createSvgElement({name: "g", parent: parent, class: "pages-group", properties: [["pages", {"left": leftPageNum, "right": rightPageNum}]]});

    // add event listeners
    ["mouseenter", "mousemove", "mouseleave", "click"].forEach(function(eventName){
      group.addEventListener(eventName, function(){
        events.triggerEvent(eventName, group.pages);
      });
    });

    return group;
  };

  documentStructure.createFromXml = function(xmlDocument) {
    
    var currentY = 0;
    var currentPage = 1;

    var events = Faust.event.createEventQueue();

    // create basic dom structure
    // create outmost svg element
    var svg = createSvgElement({name: "svg"});

    // create group that will contain all rects that fill the space between the lines in lineGroup and have
    // event listeners to react to user interactions
    var rectGroup = createSvgElement({name: "g", parent: svg, id: "rectGroup", attributes: [["transform", "translate(" + (2 * horizontalIndentation) + "," + verticalDistance + ")"]]});

    // add event to notify when mouse leaves rect group
    rectGroup.addEventListener("mouseleave", function(){
      events.triggerEvent("rectGroupLeave");
    });

    // create group that will contain all lines that sketch the sheets and pages
    var lineGroup = createSvgElement({name: "g", parent: svg, id: "lineGroup", attributes: [["transform", "translate(" + (2 * horizontalIndentation) + "," + verticalDistance + ")"]]});

    var pageNumTextGroup = createSvgElement({name: "g", parent: svg, id: "pageNumTextGroup", attributes: [["transform", "translate(" + (horizontalLineLength + 2 * horizontalIndentation + 5) + ", 20)"]]});
    
    var setLockedGroup = (function() {
      var lockedGroup;

      return function(pageNum) {
        Array.prototype.slice.call(rectGroup.childNodes).forEach(function(pageGroup) {
          // when a group is clicked, it is locked. that is it will be highlighted until
          // another group is clicked. so if a previous group was clicked remove the 
          // class "pages-locked"
          if(pageGroup.pages.left === pageNum || pageGroup.pages.right === pageNum) {
            if(lockedGroup !== undefined) {
              Faust.dom.removeClassFromElement(lockedGroup, "pages-locked");
            }
            // store new clicked group and assign "pages-locked" css class
            lockedGroup = pageGroup;
            Faust.dom.addClassToElement(pageGroup, "pages-locked");
            events.triggerEvent("structureLockedGroupChange", pageGroup.pages);
          }
        });
      };
    
    })();


    // add pages to svg. there are two things beeing done. first there will be elements added to the lineGroup which
    // show the structure of the document. second there will be elements added to the rectGroup which will allow
    // user interaction with the drawn structure. there will be a group inside the rectGroup containing (in most cases)
    // two rects that represent single pages.
    var addPage = function(nodeDepth) {
      var pagesGroup;

      // special case: generally group inside rectGroup contains two pages. The first and the last page of a document
      // are special since they reside solitary in their parent group. this is caught here. since there is only one page
      // inside the created group, the left hand side gets assigned "undefined" value
      if(currentPage === 1) {
        pagesGroup = appendPagesGroup(rectGroup, "pages-group", events, undefined, currentPage++, setLockedGroup);
      }

      // write the page number of the upper page next to the line representing the leaf the page is on
      var pageNumText = createSvgElement({name: "text",
                                          class: "structure-page-num",
                                          parent: pageNumTextGroup,
                                          attributes: [
                                            ["x", 0],
                                            ["y", currentY],
                                            ["text-anchor", "start"]
                                          ]
      });
      pageNumText.appendChild(document.createTextNode(currentPage - 1));

      // draw rects for user interaction. the problem is, that the last page of the current leaf must be put in a group with the first page
      // of the next group (like when opening a book one sees the bottom side of one page and the upper side of the next page).
      // To achive this we first put our first page in the group that was created before (by the previously processed leaf) and than create
      // a new group to append the second page to. the next processed page will be put into this group, too.
      createSvgElement({name: "rect",
                        class: "structure-rect",
                        parent: rectGroup.lastChild,
                        attributes: [
                          ["x", 0 + (horizontalIndentation * nodeDepth)],
                          ["y", currentY - verticalDistance/2],
                          ["width", horizontalLineLength - (horizontalIndentation * nodeDepth)],
                          ["height", verticalDistance/2]
                        ]
      });

      pagesGroup = appendPagesGroup(rectGroup, "pages-group", events, currentPage++, currentPage++, setLockedGroup);

      createSvgElement({name: "rect",
                        class: "structure-rect",
                        parent: rectGroup.lastChild,
                        attributes: [
                          ["x", 0 + (horizontalIndentation * nodeDepth)],
                          ["y", currentY],
                          ["width", horizontalLineLength - (horizontalIndentation * nodeDepth)],
                          ["height", verticalDistance/2]
                        ]
      });

      // draw the line that symbolises the document structure
      createSvgElement({name: "line",
                        class: "structure-line",
                        parent: lineGroup,
                        attributes: [
                          ["x1", 0 + (horizontalIndentation * nodeDepth)],
                          ["x2", horizontalLineLength],
                          ["y1", currentY],
                          ["y2", currentY]
                        ]
      });

      // assign new y position
      currentY = currentY + verticalDistance;
    };


    var processXmlNode = function(xmlNode, nodeDepth) {
      var sheetYPosBegin;

      // try to get first element child of xmlNode
      var childNode = xmlNode.firstElementChild;

      // check if a child was found and iterate through all children
      if(childNode !== null) {
        do {

          if(childNode.nodeName === "sheet") {
            // store current y position to draw vertical line when finished processing children
            sheetYPosBegin = currentY;

            // add first leaf of sheet to svg
            addPage(nodeDepth);

            // process child elements wrapped into sheet (if exist)
            processXmlNode(childNode, nodeDepth + 1);

            // add last leaf of sheet to svg
            addPage(nodeDepth);

            // draw a line connecting both sheat leafs
            createSvgElement({name: "line", class: "structure-sheet-connector", parent: lineGroup, attributes: [["x1", 0 + (horizontalIndentation * nodeDepth)], ["x2", 0 + (horizontalIndentation * nodeDepth)], ["y1", sheetYPosBegin], ["y2", currentY - verticalDistance]]});

          } else if(childNode.nodeName === "disjunctLeaf") {
            // add leaf to svg
            addPage(nodeDepth);
            processXmlNode(childNode, nodeDepth);
          }

        } while ( (childNode = childNode.nextElementSibling) );
      }
    };


    processXmlNode(xmlDocument.firstChild, 0);
    // since there is only one page in the last rectGroup / pagesGroup the second page is empty. we have assigned it a page
    // number before, so remove it
    rectGroup.lastChild.pages.right = undefined;

    // adjust width and height of svg
    // left has a padding of "horizontalIndentation" and there is a gap of the same size between vertical line and horizontal lines.
    // space is added on right side for page numbers and right side padding
    svg.setAttribute("width", horizontalLineLength + (2 * horizontalIndentation) + 30);
    svg.setAttribute("height", currentY + verticalDistance);

    // add  addEventListener function
    svg.addStructureEventListener = events.addEventListener;
    svg.setLockedGroup = setLockedGroup;

    return svg;
  };

  return documentStructure;
  
});
