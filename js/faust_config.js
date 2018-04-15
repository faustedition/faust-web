requirejs.config({
    waitSeconds: 0,
    baseUrl: '/js',
    paths: {
        data: '/data',
        sortable: 'sortable.min',
        jquery: 'jquery.min',
        'jquery.slick': 'jquery.slick.min'
    },
    shim: {
        'jquery.table': { deps: ['jquery'] },
        'jquery.chocolat': { deps: ['jquery'] },
        'jquery.overlays': { deps: ['jquery'] },
        'jquery.clipboard': { deps: ['jquery'] },
        'data/scene_line_mapping' : { exports: 'sceneLineMapping' },
        'data/genetic_bar_graph': { exports: 'geneticBarGraphData' },
        'data/document_metadata': { exports: 'documentMetadata' },
        'data/concordance_columns': { exports: 'concordanceColumns' },
        'data/paralipomena': { exports: 'paralipomena' },
        'data/archives': { exports: 'archives' },
        'data/copyright_notes': { exports: 'copyright_notes' }

    }
});

