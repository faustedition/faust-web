define(['faust_common'], function (Faust) {

    var errorMessages = {
      missingDocTranscript: "<div>Kein dokumentarisches Transkript vorhanden</div>",
      loadErrorDocTranscript: "<div>Dokumentarisches Transkript konnte nicht geladen werden</div>",
    };

    /**
     * Make patches transparent on mouse hover.
     */
    var addPatchHandlers = function addPatchHandlers(targetElement) {
        var patches = targetElement.getElementsByClassName("element-patch");
        for (var i = 0; i < patches.length; i++) {
            patches[i].addEventListener("mouseenter", function() {
                for (var i = 0; i < patches.length; i++) {
                    Faust.dom.addClassToElement(patches[i], 'patch-transparent');
                }
            });
            patches[i].addEventListener("mouseleave", function() {
                for (var i = 0; i < patches.length; i++) {
                    Faust.dom.removeClassFromElement(patches[i], 'patch-transparent');
                }
            });
        }
    };

    // setup for the transcript tooltips.
    // XXX does this need to have its stuff inside a closure?
    var transcriptTooltips = (function() {

        // text replacements for classNames on elements
        var tooltipText = {
            "hand": {
                "hand-g": "Goethe",
                "hand-aj": "Anna Jameson",
                "hand-ec": "Eckermann",
                "hand-f": "Färber",
                "hand-gt": "Geist",
                "hand-gh": "Goechhausen",
                "hand-go": "Goettling",
                "hand-hd": "Herder",
                "hand-jo": "John",
                "hand-kr": "Kräuter",
                "hand-m": "Müller",
                "hand-ovg": "Ottilie von Goethe",
                "hand-re": "Reichel",
                "hand-ri": "Riemer",
                "hand-st": "Schuchardt",
                "hand-sd": "Seidler",
                "hand-so": "Soret",
                "hand-sp": "Spiegel",
                "hand-sta": "Stadelmann",
                "hand-sti": "Stieler",
                "hand-ve": "Varnhagen von Ense",
                "hand-v": "Helene Vulpius",
                "hand-we": "Weller",
                "hand-wi": "Maria Anna Katharina Theresia Willemer, genannt Marianne",
                "hand-wo": "Pius Alexander Wolff",
                "hand-avg": "August von Goethe",
                "hand-w-owvg": "Walther oder Wolfgang von Goethe",
                "hand-wvg": "Wolfgang von Goethe",
                "hand-sc": "Schreiberhand",
                "hand-zs": "zeitgenössische Schrift",
                "hand-xx": "fremde Hand #1",
                "hand-xy": "fremde Hand #2",
                "hand-xz": "fremde Hand #3"
            },
            "property": {
                "under": "überschrieben",
                "over": "daraufgeschrieben",
                "patch": "Aufklebung",
                "interline": "eingefügte Zeile",
                "inbetween": "Dazwischenschreibung",
                "gap": "nicht lesbar",
                "supplied": "editorische Ergänzung",
                "unclear-cert-high": "Unsichere Lesung (wahrscheinlich)",
                "unclear-cert-low": "Unsichere Lesung (vielleicht)",
                "used": "als erledigt markiert"
            },
            "text-decoration": {
                "text-decoration-type-underline": "Unterstreichung",
                "text-decoration-type-overline": "Überstreichung",
                "text-decoration-type-strikethrough": "Durchstreichung",
                "text-decoration-type-underdots": "Unterpungierung",
                "text-decoration-type-rewrite": "Fixierung",
                "text-decoration-type-erase": "Rasur"
            },
            "material": {
                "material-t": "Tinte",
                "material-tr": "rote/braune Tinte",
                "material-bl": "Bleistift",
                "material-ro": "Rötel",
                "material-ko": "Kohlestift",
                "material-blau": "blauer Bleistift"
            },
            "script": {
                "script-lat": "lateinische Schrift",
                "script-gr": "griechische Schrift"
            },
            "inline-decoration": {
                "inline-decoration-type-rect": "Einkästelung",
                "inline-decoration-type-circle": "Einkreisung"
            }
        };

        var appendClassSpecificElements = function appendClassSpecificElements(classNames, classType, node, linebreak) {
            var spanElement;
            classNames.forEach(function(className) {
                if(tooltipText[classType][className] !== undefined) {
                    if(linebreak && node.childNodes.length !== 0) {
                        node.appendChild(document.createElement("br"));
                    }
                    spanElement = document.createElement("span");
                    spanElement.className = "transcript-tooltip-" + classType + " transcript-tooltip-span";
                    spanElement.appendChild(document.createTextNode(tooltipText[classType][className]));
                    node.appendChild(spanElement);
                }
            });
        };

        return (function(){
            var textWrapperElements;
            var child;
            var childClasses;
            var childTooltipContent;
            var childTooltipBottom;

            var classTypesWriter = ["hand", "material", "script", "text-decoration", "inline-decoration", "property"];

            return function(elementNode) {
                // the information for tooltips is contained in elements with the assigned class text-wrapper.
                // the information can be derived by reading all children of text-wrapper 'elements' and replace them
                // with appropriate strings
                textWrapperElements = elementNode.getElementsByClassName("text-wrapper");
                // process every group with a text-wrapper class
                Array.prototype.slice.call(textWrapperElements).forEach(function(textWrapperElement) {
                    // create the tooltip div and assign tooltip class
                    childTooltipContent = document.createDocumentFragment();
                    childTooltipBottom = document.createDocumentFragment();

                    // each text-wrapper has a background rect with the same classes as the text element,
                    // so it is skipped in the following steps. for every other element extract class names
                    // and match them with the names that shall be used in the tooltip

                    // go through every child of a g-element with the text-wrapper class
                    Array.prototype.slice.call(textWrapperElement.childNodes).forEach(function(child) {

                        // each text-wrapper has a 'rect'-element as first child. this is also the area
                        // that shall react to the mouse-events. if another element is child of our group
                        // it might catch mouse events result in not desired behaviour (e.g. only showing
                        // tooltip when over a part of the group like a line under text). To mute all children
                        // except the rect set their pointer-events to none
                        if(child.tagName !== "rect") {
                            child.style.pointerEvents = "none";

                            // now extract all classes from the selected child and try to find a textual representation that
                            // shall be used in a tooltip
                            childClasses = child.className.baseVal.split(" ");
                            classTypesWriter.forEach(function(classType) {
                                if(classType === "hand") {
                                    appendClassSpecificElements(childClasses, classType, childTooltipContent, true);
                                } else {
                                    appendClassSpecificElements(childClasses, classType, childTooltipContent, false);
                                }
                            });

                        }
                    });

                    if(childTooltipContent.childNodes.length > 0 && childTooltipBottom.childNodes.length > 0) {
                        childTooltipContent.appendChild(document.createElement("br"));
                    }
                    childTooltipContent.appendChild(childTooltipBottom);
                    if(childTooltipContent.childNodes.length > 0) {
                        child = textWrapperElement.firstChild;
                        Faust.tooltip.add(child, childTooltipContent);
                    }
                });
            };
        })();

    })();

    var docTranscriptViewer = {
        state: null,
        doc: null,
        container: null,
        cache: {},  // map page -> rendered stuff


        init: function (parent, state, controller) {
            this.container = document.createElement('div');
            this.container.className = 'viewer-content doc-transcript-content';

            var documentContainer = this.container;
            documentContainer.style.display = "inline-block";
            documentContainer.style.paddingLeft = "1em";
            documentContainer.style.paddingRight = "1em";
            documentContainer.style.width = "50%";
            documentContainer.style.height = "100%";
            documentContainer.style.border = "0px solid #CCC";
            documentContainer.style.borderRightWidth = "1px";
            documentContainer.style.overflow = "auto";
            documentContainer.style.textAlign = "center";



            this.state = state;
            this.controller = controller;
            this.doc = state.doc;
            this.setPage(state.page);
            parent.appendChild(this.container);


        },

        setPage: function (pageNo) {
            // if (this.cache.hasOwnProperty(pageNo))
            //    return Promise.resolve(this.cache[pageNo]);

            var that = this,
                page = this.doc.metadata.pages[pageNo - 1],
                url = page.docTranscripts[0].docTranscriptUrl,
                loadDocTranscript = page.hasDocTranscripts ?
                    Faust.xhr.get(url, "text")
                    : Promise.resolve(errorMessages.missingDocTranscript);
            return loadDocTranscript.then(
                function (docTranscriptHtml) {
                    var docTranscriptDiv = document.createElement("div");
                    docTranscriptDiv.style.margin = "auto";
                    docTranscriptDiv.style.paddingTop = "1em";
                    if (docTranscriptHtml) {
                        docTranscriptDiv.innerHTML = docTranscriptHtml;
                    } else {
                        docTranscriptDiv.innerHTML = errorMessages.missingDocTranscript;
                    }

                    // that.cache[pageNo] = docTranscriptDiv;
                    Faust.dom.removeAllChildren(that.container);
                    that.container.appendChild(docTranscriptDiv);
                    addPatchHandlers(that.container);
                    transcriptTooltips(that.container);

                    // FIXME remove after global viewer refactoring
                    // that.doc.pages[pageNo-1].docTranscript = docTranscriptDiv;
                    that.controller.events.triggerEvent("docTranscriptPage" + pageNo + "Loaded");

                    return docTranscriptDiv;
                })
                .catch(function (err) {
                    Faust.error("Failed to load transcript from " + url, err, that.container);
                });
        },

        show : function () { this.container.style.display = 'block'; },
        hide : function () { this.container.style.display = 'none'; },
    };

    var createDocTranscriptViewer = function createDocTranscriptViewer(parent, state, controller) {
        var result = Object.create(docTranscriptViewer);
        result.init(parent, state, controller);
        return result;
    };

    createDocTranscriptViewer.addPatchHandlers = addPatchHandlers;
    createDocTranscriptViewer.transcriptTooltips = transcriptTooltips;

    return createDocTranscriptViewer;

});