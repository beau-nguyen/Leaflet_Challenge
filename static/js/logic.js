

// Store our API endpoint for USGS earthquake data for all earthquakes in the past 7 days
var Url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";


//-----markerSize function--------------------
function markerSize(magnitude) {
  return magnitude * 7;
}


// GET request for JSON data
d3.json(Url, function(data) {
  createFeatures(data.features);
  
//-----createMap function-------------------
function createMap(earthquakes) {
  
  // Basemap layers
  var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors,\
     <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
    });

  var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors,\
     <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
    });

  var outdoorsmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors,\
     <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
    });

  // Object to hold the base layers
  var baseMaps = {
    "Satellite": satellitemap,
    "Grayscale": lightmap,    
    "Outdoors": outdoorsmap
  };

  // Object to hold overlay layer
  var overlayMaps = {
    "Earthquakes": earthquakes
  };

  // Create map object
  var myMap = L.map("map", {
    center: [40, -98],
    zoom: 5,
    layers: [satellitemap, earthquakes]
  });

  // Layer control
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Create legend
  var info = L.control({
    position: 'bottomleft'
  });

  // Insert 'legend' div when layer control is added
  info.onAdd = function(){
    labels = ['0-1', '1-2', '2-3', '3-4', '4-5', '5+']
    var div = L.DomUtil.create('div', 'legend');
    div.innerHTML += '<h3>Magnitude</h3>'
    for (var i = 0; i <= 5; i++) {
      div.innerHTML += '<p><span style="font-size:20px; background-color:' + colorScale(i) +
        ';">&nbsp;&nbsp;&nbsp;&nbsp;</span> ' + labels[i] + '</p>';
    }
    
    return div;
  };

  // Add legend
  info.addTo(myMap);
}

//-----createFeatures function--------------------
function createFeatures(earthquakeData) {
  
  // Function for feature pop-up
  function popUpText(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" +
      "<p>Magnitude: " + feature.properties.mag + "</p>" +
      "<p>Type: " + feature.properties.type + "</p>");
  }
  
  // Basic marker features
  var baseMarkerOptions = {
    color: '#191919',
    weight: 1,
    fillOpacity: 0.9
  }

  // Create GeoJSON layer containing the features array
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, baseMarkerOptions);
    }, 
    style: function(feature) {
      return {
        radius: markerSize(feature.properties.mag),
        fillColor: colorScale(feature.properties.mag)
      }
    },
    onEachFeature: popUpText
  });

  // Send earthquake layer to the createMap function
  createMap(earthquakes);
}

//-----colorScale function--------------------
function colorScale(magnitude) {
  return magnitude >= 5 ? '#F30':
         magnitude >= 4 ? '#F60':
         magnitude >= 3 ? '#F90':
         magnitude >= 2 ? '#FC0':
         magnitude >= 1 ? '#FF0':
                          '#9F3';
}

});