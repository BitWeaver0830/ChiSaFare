window.addEventListener("load", function () {
  loadMap();
});

function loadMap() {

  var coordinates = [51.505, -0.09];
  var map = L.map('map').setView(coordinates, 13);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

var address = $(".azienda-indirizzo").first().text().trim();
var geocodeUrl = "https://nominatim.openstreetmap.org/search?format=json&q=" + address;

fetch(geocodeUrl)
  .then(function(response) {
    return response.json();
  })
  .then(function(data) {
    if (data.length > 0) {
      var lat = data[0].lat;
      var lon = data[0].lon;

      console.log(data[0].lat);
      console.log(data[0].lon);

      var marker = L.marker( [data[0].lat,data[0].lon] ).addTo(map)
        .bindPopup(address)
        .openPopup();


      map.setView([lat, lon], 13);
    } else {
      console.log("Geocoding failed: No results found");
    }
  })
  .catch(function(error) {
    console.log("Geocoding failed:", error);
  });
 
}