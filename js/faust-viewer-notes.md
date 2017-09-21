## Refactoring Notes: `faust_viewer.js`

### Status Quo

#### Model

`state` variable, synchronized with the URL

```js
var state = {
    page: 1,
    view: "structure",
    scale: undefined,
    imageBackgroundZoomLevel: 3,
    showOverlay: true,
    section: undefined,         // opt. file name for textual / apparatus view
    fragment: undefined
  };
```

`doc` variable contains info on current document. This is initialized from document_metadata.json, which is, however, 
transformed such that it matches this info:

```js
var doc = {
    faustUri: null,
    metadata: null,    // <- transformed metadata record [1]
    pageCount: null,
    pages: [],
    textTranscript: null,
    structure: undefined,
    sections: {},
    getFacsCopyright: function getFacsCopyright() {};
```


##### Metadata

here is a typical metadata record as in `document_metadata.js` currently:

```json
{
            "document": "faust/0/gsa_390621.xml",   // faust URI tail
            "base": "transcript/gsa/390621/",       // transcript directory
            "text": "390621.xml",                   // text name
            "sigils": {                             // sigils + description, used in the lists etc.
                "headNote": "Zettel. – Entwurf zu ‚Faust I‘.",  
                "classification": "Konzept",
                "idno_faustedition": "1 H.3",
                "idno_gsa_1": "GSA 25/XVII,1,1",
                "idno_gsa_2": "GSA 25/W 1360",
                "idno_gsa_ident": "390621",
                "idno_wa_faust": "1 0 2 H",
                "idno_bohnenkamp": "H P5a",
                "idno_wa_gedichte": "P6",
                "note_gsa_1": "",
                "collection": "",
                "repository": "gsa"
            },
            "page": [{
                "doc": [{
                    "uri": "0002.xml",
                    "imgLink": "edecdfa7-4b43-4e7c-8f96-5c449460a7cc.svg",
                    "img": ["gsa/390621/390621_0002"]
                }], "empty": false
            }, {
                "doc": [{
                    "uri": "0003.xml",
                    "imgLink": "b2b0da4d-f1da-4afd-954f-8a15ef0a7a18.svg",
                    "img": ["gsa/390621/390621_0003"]
                }], "empty": false
            }]
        }
```

If this is called `metadata`, Faust.doc.createDocumentFromMetadata creates a record as follows, which is then assigned to `doc.metadata`:

```js
dm = {
    hasDocumentUri: true,
    documentUri: metadata.document,
    hasBaseUri: true,
    baseUri: metadata.base,    
    hasTextTranscript: true,
    textTranscriptUrl: 'transcript/text/' + metadata.document + '/transcript.html', // probably not used!?
    hasPages: true,
    pageCount: metadata.page.length,
    pages: [{ // map(page, pageidx), but see below!
        hasDocTranscripts: page.doc.length !== 0 && page.doc[0].uri !== undefined,
        docTranscriptCount: page.doc.length,
        docTranscripts: [{ // map(doc) // XXX wo gibt's da mehr als eins?
            hasUri: true,
            docTranscriptUrl: "transcript/diplomatic/" + metadata.documentUri + "/page_" + (pageidx+1) + ".svg",
            facsimileOverlayUrl: "transcript/overlay/" + metadata.documentUri + "/page_" + (pageidx+1) + ".svg",
            hasImages: true,
            imageCount: img.length,
            images: [{ // map(img)
                metadataUrl: "transcript/facsimile/metadata" + img + ".json",
                jpgUrlBase: "transcript/facsimile/jpg" + currentImage,
                tileUrlBase: "transcript/facsimile/jpg_tiles",
            }]
        }],
        hasImageTextLinks: true 
    }]
}
```

(so we have a lot of `has…`, but the actual metadata isn't available …)

In `load_pages()` (`faust_viewer.js:698`), an empty pages object is created. Following code stores the actual views for
the pages in fields of the corresponding `page` object for cacheing reasons:

```js
doc.pages[pageNum - 1] = {
  facsimile: null,
  facsimile_document: null,
  docTranscript: null,
  document_text: null,
  textTranscript: null,
  print: null
};
```

### HTML Structure

#### structure view

```html
<div id="previewDiv" class="preview-div">
    <div id="leftPreviewDiv" class="left-page-preview facsimile-preview"></div>
    <div id="rightPagePreview" class="right-page-preview facsimile-preview"></div>
</div>
<div id="structureDiv" class="structure-div">
    <div id="structureSvgDiv" class="structure-svg-div"><!-- here stuff from createFromXml() --></div>
</div>
<div id="metadataDiv" class="metadata-div"><!-- loaded HTML segment here --></div>

```

### facsimile | document

```html
<div style="height:100%; padding:0px; overflow:hidden">
    <div id="facsimileContainer" style="display: inline-block; width: 50%; height: 100%; background: #ebebeb; overflow:auto"></div>
    <div id="docTranscriptContainer" style="display:inline-block; width:50%; height:100%; overflow:auto; textAlign:center; paddingLeft: 1em; paddingRight: 1em"></div>
</div>
```

### document | text

```html
<div class="dbg-documentTextContainer" style="height:100%;padding:0px;overflow:hidden;">
<div id="dbg-documentContainer" style="display:inline-block; padding-left:1em; padding-right:1em; width: 50%; height: 100%; border: 0px solid #ccc; border-right-width: 1px; overflow: auto; text-align:center"></div>
<div id="textContainer" style="display: inline-block; width: 50%; height: 100%; overflow: auto; text-align: center;"></div>
</div>
```

### text (app)

```html
<div id="textContainer" style="width: 100%; height: 100%; overflow: auto; text-align: center"></div>
```



### Code Structure

* really global variables viewModes & contentHtml
* createDocumentViewer() as a global & exported function, everything else on this level
* events: event queue
* doc for metadata, see above
* state for status, see above
* domContainer as an object keeping substructure 


## Target Structure

* We have a __state__ that synchronizes with the URL and maintains the current position
* Probably the state will maintain a __doc__ object caching metadata & page information
* there's a __view__ for each, well, view. We have two kinds of view:

    * __primary views__ are facsimile, doctranscript, app, print, and structure
    * __composite views__ are composed of two primary views
    
Primary views perform the neccessary loading of other stuff. Cleanest solution would be promise based. Composite views
wait for the primary views to be finished and clone them afterwards.


## Viewer Properties

- container element
- (state)
- init(parent) builds container, returns a promise
