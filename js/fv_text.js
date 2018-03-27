define(['faust_common', 'faust_print_interaction', 'faust_app'],
    function(Faust, addPrintInteraction, app) {

        var textualView = {
            init: function(container, state, controller, kind, halfWidth) {
                this.container = container;
                this.state = state;
                this.controller = controller;
                this.kind = kind;
                this.cache = {}; // FIXME we could generalize this, but then we would have to care for duplicate insertion
                this.currentFile = null;
                this.root = Faust.dom.createElement({name: "div", class: halfWidth? "viewer half-viewer" : "viewer full-viewer"});
                container.appendChild(this.root);

                // should we do this?
                return this.setPage(state.page, state.fragment);
            },

            /** retrieves the page with the given page number. Returns a promise that resolves to the html div. */
            fetchFile: function(filename) {
                var that = this;
                if (this.cache.hasOwnProperty(filename))
                    return Promise.resolve(that.cache[filename]);
                else {
                    return Faust.xhr.get(that.kind + '/' + filename, 'text')
                        .then(createPrintDiv)
                        .then(function(printDiv) {
                           that.cache[filename] = printDiv;
                           return printDiv;
                        })
                        .catch(function(reason) {
                            return Faust.error("Fehler beim Laden des Textuellen Transkripts", reason);
                        });
                }
            },

            /** inserts the file with the given name into the document. Loads it first, if required. */
            loadFile: function(filename) {
                var that = this;
                if (this.currentFile != filename) {
                    return this
                        .fetchFile(filename)
                        .then(function (printDiv) {
                            Faust.dom.removeAllChildren(that.root);
                            that.root.appendChild(printDiv);
                            that.currentFile = filename;
                            if (that.kind == 'print')
                                addPrintInteraction("", that.root, that.state.faustUri);
                            return that.root;
                        });
                } else {
                    return Promise.resolve(this.root);
                }
            },

            setPage: function(pageNum, fragment) {
                var filename = this.state.doc.findSection(pageNum);
                return this
                    .loadFile(filename)
                    .then(function (root) {
                        return revealState(root, pageNum, fragment);
                    })
                    .catch(function (reason) {
                        console.error('Fehler beim Laden von S. ' + pageNum + ' des textuellen Transkripts', reason);
                    });
            }
        };


        /**
         * Marks the current position in the given textual fragment.
         *
         * Current position comes from the given page and possibly from
         * the current state's .fragment part, and the target is revealed
         * and highlighted.
         *
         * @param doc HTML fragment (from textual transcript)
         * @param pageNum current page number
         */
        var revealState = function revealState(doc, pageNum, fragment) {
            var result = false;
            if(doc.querySelector("#dt" + pageNum) !== null) {
                doc.querySelector("#dt" + pageNum).scrollIntoView();
                result = true;
            }
            if (fragment) {
                result = false;
                var currentTarget = doc.querySelector("#" + fragment.replace(/\./g, '\\.'));
                if (currentTarget) {
                    currentTarget.scrollIntoView();
                    currentTarget.classList.add("target");
                    result = true;
                }
            }
            return result;
        };


        // FIXME we can probably just remove this if we generate the embedded view right away in the XSLTs
        // returns a <div> containing the given print state.doc to be inserted into the document.
        // printString = unparsed HTML of app / print view
        var createPrintDiv = function(printString) {
            // create container element for the text and add print class to it
            var printParentNode = document.createElement("div");
            printParentNode.className = "print pure-g-r center";
            printParentNode.style.textAlign = "initial";
            printParentNode.style.paddingTop = "1em";

            // create temporary div to parse received html
            var tempDiv = document.createElement("div");
            tempDiv.innerHTML = printString;

            // add contents of parsed html to container element and hide rightmost column
            Array.prototype.slice.call(tempDiv.getElementsByClassName("print")[0].childNodes).forEach(function(child) {
                printParentNode.appendChild(child);
            });

            return printParentNode;
        };

        var createTextualView = function createTextualView(container, state, controller, kind, halfWidth) {
            var view = Object.create(textualView);
            view.init(container, state, controller, kind, halfWidth);
            return view;
        }

        return createTextualView;

});