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
