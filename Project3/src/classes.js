import * as map from "./map.js";

"use strict";
//create a marker on the map
class MapLocation{
    constructor(location, name, description, className, type){
        this.location = location;
        this.name = name;
        this.description = description;
        this.className = className;
        this.type = type;
    }

    addToMap(){
        map.addMarker(this.location, this.name, this.description, this.className, this.type);
    }
}

export{MapLocation};