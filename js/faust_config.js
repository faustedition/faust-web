requirejs.config({
    waitSeconds: 0,
    baseUrl: '/js',
    paths: {
        data: '/data',
        sortable: 'sortable.min',
        jquery: 'jquery.min',
        'svg-pan-zoom': 'svg-pan-zoom.min',
        'jquery.slick': 'jquery.slick.min'
    },
    shim: {
        'jquery.table': { deps: ['jquery'] },
        'jquery.chocolat': { deps: ['jquery'] },
        'jquery.overlays': { deps: ['jquery'] },
        'jquery.clipboard': { deps: ['jquery'] },
        'scrollIntoView.min': { exports: 'scrollIntoView' },
        'data/scene_line_mapping' : { exports: 'sceneLineMapping' },
        /*'data/genetic_bar_graph': { exports: 'geneticBarGraphData' },*/
        'data/document_metadata': { exports: 'documentMetadata' },
        'data/concordance_columns': { exports: 'concordanceColumns' },
        'data/paralipomena': { exports: 'paralipomena' },
        'data/archives': { exports: 'archives' },
        'data/copyright_notes': { exports: 'copyright_notes' }

    }
});

// NodeList.foreach polyfill for IE
if (window.NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = function (callback, thisArg) {
        thisArg = thisArg || window;
        for (var i = 0; i < this.length; i++) {
            callback.call(thisArg, this[i], i, this);
        }
    };
}

// https://tc39.github.io/ecma262/#sec-array.prototype.find
if (!Array.prototype.find) {
  Object.defineProperty(Array.prototype, 'find', {
    value: function(predicate) {
     // 1. Let O be ? ToObject(this value).
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;

      // 3. If IsCallable(predicate) is false, throw a TypeError exception.
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }

      // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
      var thisArg = arguments[1];

      // 5. Let k be 0.
      var k = 0;

      // 6. Repeat, while k < len
      while (k < len) {
        // a. Let Pk be ! ToString(k).
        // b. Let kValue be ? Get(O, Pk).
        // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
        // d. If testResult is true, return kValue.
        var kValue = o[k];
        if (predicate.call(thisArg, kValue, k, o)) {
          return kValue;
        }
        // e. Increase k by 1.
        k++;
      }

      // 7. Return undefined.
      return undefined;
    },
    configurable: true,
    writable: true
  });
}
