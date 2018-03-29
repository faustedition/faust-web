## Bestandteile

* [faust_viewer.js](faust_viewer.js): GUI management for documentViewer
* [faust_app.js](faust_app.js): highlighting etc. for the inline apparatus
* [faust_common.js](faust_common.js): utilities for DOM, XHR etc.
* [faust_image_overlay.js](faust_image_overlay.js)
* [faust_metadata.js](faust_metadata.js)
* [faust_mousemove_scroll.js](faust_mousemove_scroll.js)
* [faust_print_interaction.js](faust_print_interaction.js): variant apparatus handling
* [faust_structure.js](faust_structure.js): calculates 


## Viewer-Struktur für den documentViewer

- `state` manages the current state of the viewer, i.e.

    - document and its metadata
    - page
    - view
    - fragment
    
- `controller` is the global access point for setting pages etc

### each view

Each view manages a view for the current state. It is responsible to load and cache the data it uses.

Required API:

- `init(parent, state, controller, [halfWidth], ...)`, exposed via main function

  creates the viewer, and appends it to the parent. Returns the viewer
  
- `container`

  the root element of the viewer.
  
- `setPage(pageNo)`

  goes to the respective page. Returns a promise
  
- `show()`, `hide()`
