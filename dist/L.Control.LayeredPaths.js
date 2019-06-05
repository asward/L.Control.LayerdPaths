
L.Control.LayeredPaths = L.Control.extend(/** @lends L.Control.Markup.prototype */ {
    includes: (L.Evented.prototype || L.Mixin.Events),

    options: {
        id: 'markup',
    },

    initialize: function (_opts) {
        this.opts = Object.assign({debug: false}, _opts);

        this.path_layer_groups = [];
        this.nextPathId = 0;
        this.paths = new Map();
        this.OnPathClicked  = [];
    },
    
    addTo: function (map) {
        this._map = map;
        return this;
    },

    remove: function (map) {
        this._map = null;
        return this;
    },

    add_path: function (id,path) {
        
        let leafletPath;
        switch (path.type) {
            case 'rectangle':
            default:
                leafletPath = L.rectangle(path.bounds);
                break;
        }

        this.paths.set(id, { leafletElement: leafletPath, status: path });

        this.set_path_color(id, path.argb);

        let self = this;
        leafletPath.addEventListener('click', (e) => {
            self.path_clicked(e, id);
        }, false);
        
        let layer = this.get_layer_group(path.layer_num);
        leafletPath.addTo(layer);

        if (this.opts.debug) {
            this.set_path_outline(id,'#FF7F50')
        }
    },

    path_clicked: function (e, id) {
        //Do work
        this.OnPathClicked.forEach((poc) => {
            poc(e, id);
        });
    },

    set_path_color: function (id, argb) {

        var path = this.paths.get(id);

        let alpha, color;
        [alpha, color] = Utility.color.ARGBToHexAlphaColor(argb);

        path.leafletElement.setStyle({
            fillColor: color,
            fillOpacity: alpha,
            weight: 0,
            opacity: 0
        });

        path.status.argb = argb;

    },


    set_path_outline: function (id, color) {

        var path = this.paths.get(id);

        //let alpha, color;
        //[alpha, color] = Utility.color.ARGBToHexAlphaColor(argb);

        path.leafletElement.setStyle({
            color: color,
            weight: 1,
            opacity: 0.75,
        });
        
    },

    get_element: function (id) {
        return this.paths.get(id).leafletElement;
    },

    get_status: function (id) {
        return this.paths.get(id).status;
    },

    get_layer_group: function (layer_num) {

        if (!this.path_layer_groups[layer_num]) {
            this.path_layer_groups[layer_num] = L.layerGroup();
        }
        return this.path_layer_groups[layer_num];
    },

    show_layer: function (layer_num, { hide_layers = true } = {}) {
        if (hide_layers) {
            this.hide_layers();
        }
        var layer = this.get_layer_group(layer_num);
        layer.addTo(this._map);
    },

    hide_layers: function () {
        this.path_layer_groups.forEach((layer) => {
            this._map.removeLayer(layer);
        });
    },

    clear: function () {
        this.hide_layers();
        this.markup_layer_groups = [];
    },

});

L.control.layeredpaths = function (options) {
    return new L.Control.LayeredPaths(options);
};

