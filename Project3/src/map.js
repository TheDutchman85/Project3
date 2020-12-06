let map;
let geojson = {
  type: 'FeatureCollection',
  features: []
};

function initMap(){
  mapboxgl.accessToken = 'pk.eyJ1IjoidGgzZHV0aGNtYW44NSIsImEiOiJja2hmNnc3MWUwYjl3MnJtZ3MwNXNsbDd3In0.AT-3c4SrQ2xGm5oOTUFJKw';

  //Setting up the map
  map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/satellite-v9',
      center: [0.0,0.0],
      zoom: 2
  })

  // Add zoom and rotation controls to the map.
  map.addControl(new mapboxgl.NavigationControl());

  // The 'building' layer in the mapbox-streets vector source contains building-height
  // data from OpenStreetMap.
  map.on('load', function () {
    // Insert the layer beneath any symbol layer.
    let layers = map.getStyle().layers;
    
    let labelLayerId;
    for (let i = 0; i < layers.length; i++) {
      if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
        labelLayerId = layers[i].id;
        break;
      }
    }
  });
}

function addMarkersToMap(id){
  // add markers to map
  for (let feature of geojson.features){
    addMarker(feature.geometry.coordinates, feature.properties.title, feature.properties.description, "marker",id);
  }
}

function loadMarkers(type){
  let id;
  geojson.features = [];

  const xhr = new XMLHttpRequest();
  let url = "https://people.rit.edu/ldv9727/330/customAPI.php?type=locations";

  //To see what type of markers are being requested
  if(type == "cities"){
    url = "https://people.rit.edu/ldv9727/330/customAPI.php?type=cities";
    id = "cities";
  }else{
    url = "https://people.rit.edu/ldv9727/330/customAPI.php?type=locations";
    id = "locations";
  }

  xhr.onerror = (e) => console.log("error");

  xhr.onload = (e) => {
    const headers = e.target.getAllResponseHeaders();
    const jsonString = e.target.response;
    
    const json = JSON.parse(jsonString);
    
    for(let i =0;i < json.length; i++){
      const newFeature = {
        type: 'feature',
        geometry: {
          type: 'point',
          coordinates: []
        },
        properties: {
          title: "",
          description: 'A place on earth!'
        }
      };

      newFeature.properties.title = json[i].name;
      newFeature.geometry.coordinates[0] = json[i].lon;
      newFeature.geometry.coordinates[1] = json[i].lat;

      geojson.features.push(newFeature);
    }

    addMarkersToMap(id);
  }; // end xhr.onload

  xhr.open("GET",url);
  xhr.send();
}

function flyTo(center = [0,0]){
    //https://docs.mapbox.com/mapbox-gl-js/api/#map#flyto
    map.flyTo({center:center});
}

function setZoomLevel(value = 0){
    //https://docs.mapbox.com/help/glossary/zoom-level/
    map.setZoom(value);
}

function setPitchAndBearing(pitch=0,bearing=0){
    //https://docs.mapbox.com/mapbox-gl-js/example/live-update-feature/
    //https://docs.mapbox.com/mapbox-gl-js/example/set-perspective/
    map.setPitch(pitch);
    map.setBearing(bearing);
}

function addMarker(coordinates, title, description, className, id){
  let el = document.createElement("div");
  el.className = className;
  el.id = id;

  new mapboxgl.Marker(el)
      .setLngLat(coordinates)
      .setPopup(new mapboxgl.Popup({offset: 25})
      //.setHTML('<h3>' + title + '</h3><p>' + description + '</p><button id="favButton" onclick="addToFav()">Favorite</button>'))
      .setHTML('<h3>' + title + '</h3><p>' + description + '</p><button class ="favButton" id="' + title  + '" longitude="' + coordinates[0] + '" latitude="' + coordinates[1] + '">Favorite</button>'))
      .addTo(map);
}

export {initMap,loadMarkers,addMarkersToMap,flyTo,setZoomLevel,setPitchAndBearing,addMarker};