'use strict';

L.Control.BeforeAfter = L.Control.extend({
    options: {
        position: 'topleft',
        left: [],
        right: []
    },

    onAdd: function(map) {
        this._map = map;

        var className = 'leaflet-control-beforeafter',
            container = L.DomUtil.create('div', className);

        container.style.width = this._map.getSize().x + 'px';
        container.style['margin-left'] = '0px';
        this.range = L.DomUtil.create('input', 'before-after-range', container);
        this.range.type = 'range';
        this.range.min = 0.0;
        this.range.max = 1.0;
        this.range.step = 0.0001;
        this.range.value = 1.0;
        this.range.style.width = '100%';

        L.DomEvent.disableClickPropagation(this.range);
        var evtName = 'oninput' in this.range ? 'input' : 'change';
        L.DomEvent.addListener(this.range, evtName, this._update, this);

        this._map.on('move moveend zoom zoomend', this._update, this);
        return container;
    },

    _onRangeChange: function() {

    },

    _clip: function(layer, amount, direction) {
        direction = direction || 'right';
        var nw = this._map.containerPointToLayerPoint([0, 0]),
            se = this._map.containerPointToLayerPoint(this._map.getSize()),
            clipX = nw.x + (se.x - nw.x) * amount;
        var layerShift = L.DomUtil.getPosition(layer.getContainer());
        layerShift = layerShift || L.point(0, 0);

        var rect = direction == 'left' ? [
            nw.y - layerShift.y, clipX - layerShift.x,
            se.y - layerShift.y, nw.x - layerShift.x
        ] : [
            nw.y - layerShift.y, se.x - layerShift.x,
            se.y - layerShift.y, clipX - layerShift.x
        ];

        layer.getContainer().style.clip = 'rect(' + rect.join('px,') + 'px)';
    },

    _update: function() {
        for(var idx = 0; idx < this.options.left.length; idx++) {
            var layer = this.options.left[idx];
            this._clip(layer, this.range.value, 'left');
        }

        for(var idx = 0; idx < this.options.right.length; idx++) {
            var layer = this.options.right[idx];
            this._clip(layer, this.range.value, 'right');
        }
    },

    left: function(layers) {
        this.options.left = layers;
        return this;
    },

    right: function(layers) {
        this.options.right = layers;
        return this;
    }
});

L.control.beforeAfter = function(options) {
    return new L.Control.BeforeAfter(options);
}

L.Map.mergeOptions({
   beforeAfter: false
});

L.Map.addInitHook(function() {
     if(this.options.beforeAfter) {
        this.beforeAfter = L.control.beforeAfter();
        this.addControl(this.beforeAfter);
     }
});
