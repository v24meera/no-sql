// Store JSON as url
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Pull in data from URL
d3.json(queryUrl).then(function (data) {
    console.log(data);
    createFeatures(data.features);
});

//Set marker size
function markerSize(magnitude) {
    return magnitude * 2000;
};

//set marker color by depth
function chooseColor(depth) {
    if (depth <10) return 'yellow';
    else if (depth <30) return 'lightgreen';
    else if (depth <50) return 'limegreen';
    else if (depth <70) return 'seagreen';
    else if (depth <90) return '#001a00';
    else return 'darkred';
}

function createFeatures(earthquakeData) {

    //define function to run fetures
    //create popups that provide data re earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>Location: ${feature.properties.place}</h3><p>Date: ${new Date(feature.properties.time)}</p><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
    }

    //create geojson layer 
    //run the feature function for data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,

        pointToLayer: function(feature, latlng) {

            //define style of markers based on properties
            var markers = {
                radius: markerSize(feature.properties.mag),
                fillColor: chooseColor(feature.geometry.coordinates[2]),
                fillOpacity: 0.7,
                color: 'black',
                stroke: true,
                weight: 0.5
            }
            return L.circle(latlng, markers);
        }
    });

    //send earthquake layer to createmap function
    createMap(earthquakes);
}

function createMap(earthquakes) {

    //Create tile layer
    var grayscale = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        style: `mapbox/light-v11`,
    });

    //create map to desplay
    var myMap = L.map('map', {
        center: [
            54.5260, -105.2551
        ], //Centered on North America
        zoom: 4.2, //Zoomed out to show high concentration of marks
        layers: [grayscale, earthquakes]
    });

    //Add legend
    var legend = L.control({position: 'bottomright'});
    legend.onAdd = function(){
        var div = L.DomUtil.create('div', 'info legend'),
        depth = [-10, 10, 30, 50, 70, 90];

        div.innerHTML += "<h3 style='text-align: center'>Depth</h3>"

        for (var i=0; i <depth.length; i++) {
            div.innerHTML +=
            '<i style="background:' + chooseColor(depth[i]+ 1) + '"></i>' + depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
        }
        return div;
    };
    legend.addTo(myMap)
};