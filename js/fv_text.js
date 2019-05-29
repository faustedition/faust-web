define(['faust_common', 'faust_print_interaction', 'faust_app', 'scrollIntoView.min'],
    function(Faust, addPrintInteraction, app, scrollIntoView) {

        var textualView = {
            init: function(parent, state, controller, kind, halfWidth) {
                this.state = state;
                this.controller = controller;
                this.kind = kind;
                this.cache = {}; // FIXME we could generalize this, but then we would have to care for duplicate insertion
                this.currentFile = null;
                this.container = Faust.dom.createElement({name: "div", class: halfWidth? "viewer half-viewer" : "viewer full-viewer"});
                parent.appendChild(this.container);

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
                            Faust.dom.removeAllChildren(that.container);
                            that.container.appendChild(printDiv);
                            that.currentFile = filename;
                            if (that.kind == 'print')
                                addPrintInteraction("", that.container, that.state.faustUri);
                            return that.container;
                        });
                } else {
                    return Promise.resolve(this.container);
                }
            },

            updateHash: function(hash) {
                var fragment = hash || this.state.fragment;
                revealState(this.container, this.state.page, fragment);
            },

            setPage: function(pageNum, fragment) {
                var filename = this.state.getSectionFileName(pageNum);
                if (typeof filename === "undefined") {
                    var msg = "Kein textuelles Transkript zu dieser Seite vorhanden.";
                    if (!this.container.hasChildNodes())
                        Faust.error('', msg, this.container);
                    return Promise.reject(msg);
                }
                fragment = fragment || this.state.fragment;
                return this
                    .loadFile(filename)
                    .then(function (root) {
                        return revealState(root, pageNum, fragment);
                    })
                    .catch(function (reason) {
                        console.error('Fehler beim Laden von S. ' + pageNum + ' des textuellen Transkripts', reason);
                    });
            },
            show : function () { this.container.style.display = 'block'; revealState(this.container, this.state.page, this.state.fragment); },
            hide : function () { this.container.style.display = 'none'; },
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
            window.setTimeout(() => {


            var result = false;
            // remove old fragment highlight class
            doc.querySelectorAll('.target').forEach(function(el) {el.classList.remove('target');});

            let pageNoLabel = doc.querySelector("#dt" + pageNum);
            if(pageNoLabel !== null) {
                scrollIntoView(pageNoLabel);
                // pageNoLabel.scrollIntoView();
                // console.log('Page scrolling', pageNoLabel.getBoundingClientRect())
                result = true;
            }

            if (fragment) {
                result = false;
                const currentTarget = doc.querySelector("#" + fragment.replace(/\./g, '\\.'));
                if (currentTarget) {
                    scrollIntoView(currentTarget);
                    // currentTarget.scrollIntoView();
                    currentTarget.classList.add("target");
                    result = true;
                    // console.log('Fragment scrolling, ', currentTarget.getBoundingClientRect())
                } else {
                    console.warn('Fragment', fragment, 'not found! So we can’t scroll there.')
                }
            } else {
                console.log('revealState w/o fragment!')
            }
            });
            return true
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