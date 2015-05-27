//Javascript file for LifeMapping sample

L.mapbox.accessToken = 'pk.eyJ1IjoiZGVhbm9sc2VuMSIsImEiOiJ1dkxBdm9FIn0.kapau_lUukKIE93Y8I0A9g';
// Here we don't use the second argument to map, since that would automatically
// load in non-clustered markers from the layer. Instead we add just the
// backing tileLayer, and then use the featureLayer only for its data.
var map = L.mapbox.map('map')
    .setView([37.8, -96], 4)
    .addLayer(L.mapbox.tileLayer('deanolsen1.m93pgn91'));

// Since featureLayer is an asynchronous method, we use the `.on('ready'`
// call to only use its marker data once we know it is actually loaded.
L.mapbox.featureLayer('data/lmtest1.geojson').on('ready', function(e) {
    // The clusterGroup gets each marker in the group added to it
    // once loaded, and then is added to the map
    var clusterGroup = new L.MarkerClusterGroup();
    e.target.eachLayer(function(layer) {
        clusterGroup.addLayer(layer);
    });
    map.addLayer(clusterGroup);
});
