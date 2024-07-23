window.addEventListener("load", function () {

    var map = L.map('map').fitWorld();

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);

    map.locate({ setView: true, maxZoom: 16 });

    function onLocationFound(e) {
        var radius = e.accuracy;

        L.marker(e.latlng).addTo(map)
            .bindPopup("Ti trovi entro una distanza di " + Math.round(e.accuracy) + " metri da questo indirizzo").openPopup();

        L.circle(e.latlng, radius).addTo(map);
    }

    map.on('locationfound', onLocationFound);


    function onLocationError(e) {
        alert(e.message);
    }

    map.on('locationerror', onLocationError);

});