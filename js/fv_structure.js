define(['faust_common', 'faust_structure'],
    function(Faust, documentStructure) {


        var structureView = {

            /**
             * Builds the following structure:
             *
             * @param parentNode
             * @returns {structureView}
             * @private
             */
            _initHtmlFrame: function _initHtmlFrame(parentNode) {
                this.parentNode = parentNode;

                // create structure element // FIXME adjust to new viewer
                var structure = document.createElement("div");
                structure.id = "structureContainer";
                structure.className = "structure-container view-content";

                this.container = structure;
                this.parentNode.appendChild(this.container);

                // create elements for previews
                var previewDiv = document.createElement("div");
                previewDiv.id = "previewDiv";
                previewDiv.className = "preview-div";

                var leftPagePreview = document.createElement("div");
                leftPagePreview.id = "leftPreviewDiv";
                leftPagePreview.className = "left-page-preview facsimile-preview";
                previewDiv.appendChild(leftPagePreview);
                this.leftPreview = leftPagePreview;

                var rightPagePreview = document.createElement("div");
                rightPagePreview.id = "rightPreviewDiv";
                rightPagePreview.className = "right-page-preview facsimile-preview";
                previewDiv.appendChild(rightPagePreview);
                this.rightPreview = rightPagePreview;
                this.previewDiv = previewDiv;

                // create dom elements for structure display
                var structureDiv = document.createElement("div");
                structureDiv.id = "structureDiv";
                structureDiv.className = "structure-div";
                this.structureDiv = structureDiv;

                // create svg image of document structure
                var structureSvgDiv = document.createElement("div");
                structureSvgDiv.id = "structureSvgDiv";
                structureSvgDiv.className = "structure-svg-div";
                this.structureSvgDiv = structureSvgDiv;
                this.structureDiv.appendChild(structureSvgDiv);

                this.metadataDiv = Faust.dom.createElement({name: "div", id: "metadataDiv", class: "metadata-div"});

                return this;
            },

            _insertFinishedHtml: function () {
                var that = this;

                // TODO check timing: do we need the view containers before all views have been loaded?
                this.container.appendChild(this.previewDiv);
                this.container.appendChild(this.structureDiv);
                this.container.appendChild(this.metadataDiv);


                // set current active page on structure view
                this.structureSvg.setLockedGroup(this.state.page);

                // XXX Was soll DAS HIER???
                // Es bewirkt offenbar die Scrollbarkeit, aber wieso?
                // metadataDiv.firstElementChild.style.height = parentDomNode.offsetHeight + "px";
                this.structureDiv.firstElementChild.style.height = this.parentNode.offsetHeight + "px";
                this.metadataDiv.firstElementChild.style.height = this.parentNode.offsetHeight + "px";
                this.structureDiv.firstElementChild.style.height = this.parentNode.offsetHeight + "px";
                window.addEventListener("resize", function() {
                    that.metadataDiv.firstElementChild.style.height = that.parentNode.offsetHeight + "px";
                    that.structureDiv.firstElementChild.style.height = that.parentNode.offsetHeight + "px";
                });


                return this;
            },

            init: function init(parent, state, controller) {
                var that = this;
                this.state = state;
                this.controller = controller;
                var baseName = state.doc.metadata.documentUri.replace(/^.*\/(\S+)\.xml/, '$1');

                this._initHtmlFrame(parent);

                var loadStructure = state.doc.metadata.type == "print"?
                    Promise.resolve(documentStructure.createFromPageCount(state.doc.pageCount)) :
                    Faust.xhr.get("xml/document/" + state.doc.metadata.documentUri, "xml")
                        .then(function (documentXmlMetadata) {
                            return structureSvg = documentStructure.createFromXml(documentXmlMetadata);
                        });


                return Promise.all([
                    // structure
                        loadStructure.then(function(structureSvg) {
                            state.doc.structure = structureSvg; // FIXME refactor cache?
                            that.structureSvgDiv.appendChild(structureSvg);
                            that.structureSvg = structureSvg;
                        })
                        .catch(function (err) {
                            Faust.error("Error loading structure", err, that.container)
                        }),

                    // metadata html
                    Faust.xhr.get("meta/" + state.doc.sigil + '.html', 'text')
                        .then(function (documentHtml) {
                            that.metadataDiv.innerHTML = documentHtml;
                            // that.metadataDiv.firstElementChild.style.height = parentDomNode.offsetHeight + "px"; FIXME when we know that offset?
                        })
                        .catch(function (err) {
                            Faust.error("Error loading metadata", err, that.metadataDiv)
                        })
                ])
                    .then(function() { that.setupInteraction(); })
                    .then(function() { that._insertFinishedHtml(); })
                    .catch(function(err) {
                        Faust.error("Error loading structure view", err, that.container)
                    })
            },


            // create div when no image is available. a div is created every time because if there is
            // only one div with a message it can only be added to one dom element - which is a
            // problem when both pages are without an image (only one message would be shown)
            // creating two divs would impose additional management to get the right div and this would
            // be uselessly more complex since creating a simple div is extremly fast in browsers.
            //
            // If there is no facsimile (display of first and last page) don't add text
            createMissingPreviewDiv : function createMissingPreviewDiv(message) {
                var missingPreviewDiv = document.createElement("div");
                if(message) {
                    missingPreviewDiv.appendChild(document.createTextNode(message));
                }
                return missingPreviewDiv;
            },


            // function used to get preview images. this function is used so that images once loaded
            // will be buffered so that images are downloaded once and only once (chrome would buffer
            // images by itself but firefox would reload images every single time - not suitable when
            // listening to mousemove ;)
            // When there is no preview image for a requested image a div with a message will be returned

            // actual function assigned to getPreviewElement. if no uri is given a div with a message
            // is created.
            // else it is tried to load a previously generated img element for that uri. if that doesn't exist
            // create a new one and add to list of created img's
            previewCache: {},
            getPreviewElement: function getPreviewElement(uri) {
                var img;

                // create message div if no image was given
                if(uri === undefined) {
                    return this.createMissingPreviewDiv(false);
                } else if (uri === "noFacsimile") {
                    return this.createMissingPreviewDiv("Kein Faksimile verfügbar");
                } else if (uri === "empty") {
                    return this.createMissingPreviewDiv("Leere Seite");
                } else if (this.previewCache.hasOwnProperty(uri) === true) {
                    return this.previewCache[uri];
                } else {
                    // else create new image
                    img = document.createElement("img");
                    img.setAttribute("alt", "Faksimile wird geladen");
                    img.setAttribute("src", uri);
                    this.previewCache[uri] = img;
                    return img;
                }
            },

            // set a preview of a facsimile. the preview will be appended to the given parent (preview
            // container) according to the given page number. the page number is used to get the image
            // uri from the document's metadata
            setPreviewElement: function(parent, pageNum) {
                var pageUri;

                // remove contaier content / parent element's children
                Faust.dom.removeAllChildren(parent);

                // try to get a uri from document's metadata and load the preview image. else create a message
                // to inform about a missing preview
                if( pageNum !== undefined ) {
                    if((this.state.doc.metadata.pages[pageNum - 1].docTranscripts[0].hasImages) ) {
                        // load existing preview image
                        pageUri = this.state.doc.metadata.pages[pageNum - 1].docTranscripts[0].images[0].jpgUrlBase + "_preview.jpg";
                        parent.appendChild(this.getPreviewElement(pageUri));
                    } else if (this.state.doc.metadata.pages[pageNum - 1].empty) {
                        parent.appendChild(this.getPreviewElement("empty"))
                    } else {
                        // no facsimile exists - display info
                        parent.appendChild(this.getPreviewElement("noFacsimile"));
                    }
                } else {
                    // empty page with no pageNum (before first page or after last page). Don't display anything
                    parent.appendChild(this.getPreviewElement(undefined));
                }

                // set pageNum of displayed facsimile to parent container
                parent.pageNum = pageNum;

                // set the visibility og the appended image to visible. if image was buffered and shown before
                // it might have visibility set to hidden
                parent.firstElementChild.style.visibility = "visible";
            },

            setupInteraction: function () {
                var that = this;

                var structurePagePreviewHandler = function(pages) {
                    that.setPreviewElement(that.leftPreview, pages.left);
                    that.setPreviewElement(that.rightPreview, pages.right);
                };

                // on mousemove or mouseenter load the preview images of the pages beneath the cursor
                this.structureSvg.addStructureEventListener("mouseenter", structurePagePreviewHandler);
                this.structureSvg.addStructureEventListener("mousemove", structurePagePreviewHandler);

                // when leaving the rect symbolising two pages hide the previously shown images
                this.structureSvg.addStructureEventListener("mouseleave", function(){
                    that.leftPreview.firstElementChild.style.visibility = "hidden";
                    that.rightPreview.firstElementChild.style.visibility = "hidden";
                });

                // if a user clicks on a rect the selected pages should be locked. that is when
                // the mouse leaved the image symbolising the whole document structure the
                // selected pages must be shown
                this.structureSvg.addStructureEventListener("structureLockedGroupChange", function(pages){
                    that.lockedPages = pages;
                    structurePagePreviewHandler(pages);
                });

                // if the mouse leaved the document's structure view (not only a rect visualising
                // two pages) than the mouse is above no page and thus the preview images should
                // be hidden.
                // If a user previously clicked on a pagesRect than these two pages must be shown
                // as preview images
                this.structureSvg.addStructureEventListener("rectGroupLeave", function(){
                    that.leftPreview.firstElementChild.style.visibility = "hidden";
                    that.rightPreview.firstElementChild.style.visibility = "hidden";

                    if(that.lockedPages !== undefined) {
                        that.setPreviewElement(that.leftPreview, that.lockedPages.left);
                        that.setPreviewElement(that.rightPreview, that.lockedPages.right);
                    }
                });

                this.structureSvg.addStructureEventListener("click", function(pages){
                    if(pages.left !== undefined) {
                        that.structureSvg.setLockedGroup(pages.left);
                        that.controller.setPage(pages.left);
                    } else if (pages.right !== undefined) {
                        that.structureSvg.setLockedGroup(pages.right);
                        that.controller.setPage(pages.right);
                    }
                });

                // if a user clicks on a facsimile page, go to the relevant pages in the facsimile view
                var previewClickHandler = function () {
                    if (this.pageNum !== undefined) {
                        that.controller.setPage(this.pageNum);
                        that.controller.setView("facsimile");
                    }
                };

                this.leftPreview.addEventListener("click", previewClickHandler);
                this.rightPreview.addEventListener("click", previewClickHandler);

                return this;
            },

            show : function () { this.container.style.display = 'block'; },
            hide : function () { this.container.style.display = 'none'; },
            setPage : function (pageNo) {
                if (this.structureSvg)
                    this.structureSvg.setLockedGroup(pageNo);
                // otherwise it's not yet initialized
            }
        };

        return function(parent, state, controller) {
            var viewer = Object.create(structureView);
            viewer.init(parent, state, controller);
            return viewer;
        }
});
