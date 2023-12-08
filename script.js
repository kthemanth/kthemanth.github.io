var blueMarkers = [];
var markersVisible = false;

var map = L.map('map').setView([1.3521, 103.8198], 12); // Coordinates of Singapore
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
    maxZoom: 19 ,
}).addTo(map);

console.log("Map initialized", map);

var southWest = L.latLng(1.217, 103.603), // These coordinates might need adjustment
northEast = L.latLng(1.470, 104.0);
var bounds = L.latLngBounds(southWest, northEast);
map.setMaxBounds(bounds);
map.on('drag', function() {
    map.panInsideBounds(bounds, { animate: false });
});


for (var zoneName in zones) {
if (zones.hasOwnProperty(zoneName)) {

    var zoneBoundary = L.polygon(zones[zoneName], {color: 'red'}).addTo(map);

    zoneBoundary.bindTooltip(zoneName, {
        permanent: true,
        direction: 'center',
        className: 'zone-label'
    }).openTooltip();

    zoneBoundary.on('mouseover', function (e) {
        this.setStyle({color: 'blue'});
    });
    zoneBoundary.on('mouseout', function (e) {
        this.setStyle({color: 'red'});
    });
    zoneBoundary.on('click', function (e) {
        document.getElementById('inputForm').style.display = 'block';
    });
}
}

function toggleMarkers() {
if (!markersVisible) {
if (blueMarkers.length === 0) {

    mapPoints.forEach(function(point) {
        var lat = parseFloat(point.latitude);
        var lon = parseFloat(point.longitude);

        var marker = L.circleMarker([lat, lon], {
            className: 'transparent-marker',
            color: 'blue',
            fillColor: '#30f',
            fillOpacity: 0.5,
            radius: 5
        });

        marker.bindPopup(point.address);

        marker.addTo(map);
        blueMarkers.push(marker);
    });
} else {

    blueMarkers.forEach(function(marker) {
        marker.addTo(map);
    });
}
markersVisible = true;
document.getElementById('showBlueMarkersBtn').innerText = 'Hide HDBs';
} else {

blueMarkers.forEach(function(marker) {
    map.removeLayer(marker);
});
markersVisible = false;
document.getElementById('showBlueMarkersBtn').innerText = 'Show HDBs';
}
}

document.getElementById('showBlueMarkersBtn').addEventListener('click', function(e) {
e.preventDefault();
toggleMarkers();
});

map.on('click', function(e) {
var lat = e.latlng.lat;
var lon = e.latlng.lng;

console.log("Clicked at Latitude: " + lat + ", Longitude: " + lon);
});

document.getElementById('inputForm').addEventListener('submit', async function(e){

  e.preventDefault();

  var year = document.getElementById('year').value;
  var storeyRange = document.getElementById('storeyRange').value;
  var flatType = document.getElementById('flatType').value;
  var floorArea = document.getElementById('floorArea').value;

  document.getElementById('loadingIcon').style.display = 'block';

  try {

    var apiUrl = `https://hdb-price-estimator-utpkxrm6xa-ew.a.run.app/predict?year=${year}&town=CHANGI&flat_type=${encodeURIComponent(flatType)}&storey_range=${encodeURIComponent(storeyRange)}&floor_area_sqm=${floorArea}&flat_model=Simplified&lease_commence_date=1980&sold_remaining_lease=50&max_floor_lvl=47&most_closest_mrt=TAMPINES&walking_time_mrt=300`;

    var response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });

    document.getElementById('loadingIcon').style.display = 'none';

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    var result = await response.json();
    console.log(result);

    displayPrediction(result.hdb_pricing);

  } catch (error) {
    console.error('Error during API call:', error);
    document.getElementById('loadingIcon').style.display = 'none';
  }

});

function displayPrediction(price) {
  var roundedPrice = Math.round(price);
  var priceDiv = document.getElementById('priceDisplay');
  priceDiv.innerHTML = `Your house will cost <br> $ ${roundedPrice} `;
  priceDiv.style.display = 'block';
}

var yearSelect = document.getElementById('year');

for (var i = 2024; i <= 2033; i++) {
  var option = document.createElement('option');
  option.value = i;
  option.text = i;
  yearSelect.appendChild(option);
}

var storeyRanges = ["01 - 03", "01 - 05", "04 - 06", "06 - 10", "07 - 09", "10 - 12",
            "11 - 15", "13 - 15", "16 - 18", "16 - 20", "19 - 21", "21 - 25",
            "22 - 24", "25 - 27", "26 - 30", "28 - 30", "31 - 33", "31 - 35",
            "34 - 36", "36 - 40", "37 - 39", "40 - 42", "43 - 45", "46 - 48", "49 - 51"];

var storeyRangeSelect = document.getElementById('storeyRange');
storeyRanges.forEach(function(range) {
  var option = document.createElement('option');
  option.value = range;
  option.text = range;
  storeyRangeSelect.appendChild(option);
});

var flatTypes = ["1 ROOM", "2 ROOM", "3 ROOM", "4 ROOM", "5 ROOM", "EXECUTIVE", "MULTI GENERATION"];
var flatTypeSelect = document.getElementById('flatType');

flatTypes.forEach(function(type) {
  var option = document.createElement('option');
  option.value = type;
  option.text = type;
  flatTypeSelect.appendChild(option);
});

var floorAreaSelect = document.getElementById('floorArea');
for (var i = 30; i <= 310; i += 10) {
  var option = document.createElement('option');
  option.value = i;
  option.text = i + ' sqm';
  floorAreaSelect.appendChild(option);
}
