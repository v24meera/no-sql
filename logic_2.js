// Store query url and tectonic plates url
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
var tectonicUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

//perform request to call URL
d3.json(queryUrl).then(function (data) {
    console.log(data);
    createFeatures(data.features);
});

// Function to determine maker color by depth
function chooseColor(depth) {
    if (depth <10) return 'yellow';
    else if (depth <30) return 'lightgreen';
    else if (depth <50) return 'limegreen';
    else if (depth <70) return 'seagreen';
    else if (depth <90) return '#001a00';
    else return 'darkred';
}

function createFeatures(earthquakeData) {

    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>Location: ${feature.properties.place}</h3><hr><p>Date: ${new Date(feature.properties.time)}</p><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
    }
    //Make Geo JSON Layer
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,

        pointToLayer: function(feature, latlng) {
            
            //Make markers
            var markers = {
                radius: feature.properties.mag * 20000,
                fillColor: chooseColor(feature.geometry.coordinates[2]),
                fillOpacity: 0.7,
                color: "black",
                weight: 0.5
            }
            return L.circle(latlng,markers);
        }
    });

    //create map function for earthquake layer
    createMap(earthquakes);
}

function createMap(earthquakes) {

    //Tile Layers
    var satellite = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    });

    var grayscale = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    });

    var outdoors = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    });

    //Tectonic Plates layer
    var tectonicPlates = new L.layerGroup();

        //call for tetpltURL
        d3.json(tectonicUrl).then(function (plates) {
            console.log(plates);
            L.geoJSON(plates, {
                color: 'orange',
                weight: 2
            }).addTo(tectonicPlates);
        });

        //Basemap
        var baseMaps = {
            'Satellite': satellite,
            'Grayscale': grayscale,
            'Outdoors': outdoors
        };

        //create overlay for overlay
        var overlayMaps = {
            'Earthquakes': earthquakes,
            'Tectonic Plates': tectonicPlates
        };

        //Create map and add layers
        var myMap = L.map('map', {
            center: [
            54.5260, -105.2551
        ], //Centered on North America
            zoom: 4.2, //Zoomed out to show high concentration of marks
            layers: [satellite, earthquakes, tectonicPlates]
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

    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);
};
