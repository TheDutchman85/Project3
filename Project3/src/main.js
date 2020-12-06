import * as map from "./map.js";
import * as ajax from "./ajax.js";
import * as classe from './classes.js';

//Local Storage
// declare some constants
let favsIndexOld = document.querySelectorAll("#favList li").length;
let favsIndexNew = document.querySelectorAll("#favList li").length;

const prefix = "ldv9727-";
const listKey = prefix + "list";
// grab the stored data, will return `null` if the user has never been to this page
const storedList = localStorage.getItem(listKey);

// if we find a previously set name value, display it
if(storedList){
  let obj = JSON.parse(storedList);
  for(let o of obj){
    addToFav(o[0], o[1], o[2]);
    let favsNew = document.querySelectorAll("#favList li");
    favsIndexNew = favsNew.length;
  }
}

//Bools
let bLocation = document.querySelector("#locationC").checked;
let bCities = document.querySelector("#cityC").checked;

let poi;

function loadPOI(type){
  const url = "https://people.rit.edu/ldv9727/330/customAPI.php?type=" + type;

  //callback function for when data shows up
  function poiLoaded(jsonString){
    
    poi = JSON.parse(jsonString);
    //make markers and add them to the map
    for(let p of poi){
      let temp = [p.lon, p.lat];
      let mark = new classe.MapLocation(temp, p.name, "One of my favorite spots", "poi", type);
      mark.addToMap();
    }
  }

  //start download
  ajax.downloadFile(url, poiLoaded);
}

function setupUI(){
  document.querySelector("#resetZoom").onclick = () => {
    map.setZoomLevel(2);
  }
  document.querySelector("#resetView").onclick = () => {
    map.setPitchAndBearing(0,0);
  }
  document.querySelector("#resetFav").onclick = () => {
    localStorage.clear();
    document.querySelector("#cityC").checked = false;
    document.querySelector("#locationC").checked = true;
    let favsList = document.querySelector("#favList");
    while(favsList.lastElementChild != null){
      favsList.removeChild(favsList.lastElementChild);
    }
  }
}

function init(){
  //To make the map
  map.initMap();
  //Load in the markers
  if(bLocation){
    loadPOI("locations");
    bLocation = false;
  }
  if(bCities){
    loadPOI("cities");
    bCities = false;
  }

  //To set up the UI
  setupUI();
  //To update the UI
  update();
}

//To run the mechanics that can change based on input
function update(){
  requestAnimationFrame(update);

  //Load in the markers
  if(bLocation){
    loadPOI("locations");
    bLocation = false;
  }
  if(bCities){
    loadPOI("cities");
    bCities = false;
  }

  //To handle the checkboxes
  document.querySelector("#locationC").onclick = (e) => {
    bLocation = document.querySelector("#locationC").checked;
    if(!bLocation){
      removeOld("#locations");
    }
  }

  document.querySelector("#cityC").onclick = (e) => {
    bCities = document.querySelector("#cityC").checked;
    if(!bCities){
      removeOld("#cities");
    }
  }

  //The Favorite button
  const favButton = document.querySelector(".favButton");
  if(favButton != null){
    favButton.onclick = e => {
      let favs = document.querySelectorAll("#favList li");
      if(favs.length != 0){
        for(let f of favs){
          if(f.innerHTML == favButton.id)
          {
            return;
          }
        }
      }
      let lon = favButton.getAttribute('longitude');
      let lat = favButton.getAttribute('latitude');
      addToFav(favButton.id, lon, lat);
      let favsNew = document.querySelectorAll("#favList li");
      favsIndexNew = favsNew.length;
    };
  }

  //If a favorite is clicked
  const favs = document.querySelectorAll("#favList li");
  if(favs.length != 0){
    for(let f of favs){
      f.onclick = e => {
        map.setZoomLevel(12);
        map.setPitchAndBearing(0,0);
        const location = [parseFloat(f.longitude),parseFloat(f.latitude)];
        map.flyTo(location);
      }
    }
  }
  
  //Update the local storage
  if(favsIndexNew != favsIndexOld){
    favsIndexOld = favsIndexNew;
    let string = [];
    for(let f of favs){
      let temp=[f.innerHTML,f.longitude,f.latitude];
      string.push(temp);
    }
    localStorage.setItem(listKey,JSON.stringify(string));
  }
}

//To add the location to your favorites
function addToFav(string, _longitude, _latitude){
  let list = document.querySelector("#favList");
  let li = document.createElement("li");
  li.longitude = _longitude;
  li.latitude = _latitude;
  li.appendChild(document.createTextNode(string));
  list.appendChild(li);
}

//To remove unwanted markers
function removeOld(name){
  let markers = document.querySelectorAll(name);
  for(let m of markers){
    m.remove();
  }
}

export{init};