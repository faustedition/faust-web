# faust-gen

Generate static assets (diplomatic transcript SVGs, image tiles) for the Faust edition from XML sources and full-resolution images.

## Installation

Download the source files. Node.js, Chrome / Chromium, Java, and a local web
server are required to run them.

## Usage 

### Diplomatic transcript SVGs

The scripts for generating the diplomatic transcripts are in the subfolder [svg_rendering](svg_rendering). To run them,

* put the Faust XML sources somewhere on the local hard disk
* configure a local web server such that it serves the [page](svg_rendering/page) subdirectory
* adapt the paths in <code>settings.json</code>
* start Chromium in background, using `9222` as debugging port:

```sh
Xvfb :1000 -screen 0 1920x1080x24 +extension RANDR &
DISPLAY=:1000 fluxbox &
DISPLAY=:1000 chromium --user-data-dir=/path/to/debug/instance/profile/dir --remote-debugging-port=9222 -start-maximized &
```

* Run <code>node preprocessing.js</code>

### Metadata generation

To generate metadata for the `data` subdirectory of faust-web, adapt the paths in [settings.json](metadata_generation/settings.json) and run

    node generate_metadata.js

## License
