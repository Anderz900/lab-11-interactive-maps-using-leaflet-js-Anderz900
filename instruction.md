--- 

layout: default
title: lab11

---

# <img src="img/instruction/logo.png" width="30px"> CSCI339001 Visualization


# Lab 11


## Learning Objectives

- Learn how to build an interactive map application using Leaflet.js


## Prerequisites

- Read [Leaflet Quick Start Guide](https://leafletjs.com/examples/quick-start/)
- Accept the lab assignment invitation from Github Classroom: 
	[https://classroom.github.com/a/hczY4DZ9](https://classroom.github.com/a/hczY4DZ9)


## Preview

In this lab, you will build an interactive map that visualizes Bluebikes stations with available bikes and docks. The final outcome of this lab will look like the following:

![Lab Preview](img/instruction/lab11-preview.png?raw=true "Lab Preview")

## Activity I - Request station data from *Bluebikes*

Bluebikes provide real-time data about station information and status. You can find more information about this website: [https://www.bluebikes.com/system-data](https://www.bluebikes.com/system-data). 


### Station Datasets

We will use the following two datasets:

* Station information:  [https://gbfs.bluebikes.com/gbfs/en/station_information.json](https://gbfs.bluebikes.com/gbfs/en/station_information.json)

```javascript
{
    "last_updated":1573674249,
    "ttl":10,
    "data":{
        "stations":[
            {
                "station_id":"11",
                "name":"Longwood Ave at Binney St",
                "lat":42.338629,
                "lon":-71.1065,
                ...
            },
            ...
        ]
    }
}
```
* Station status:  [https://gbfs.bluebikes.com/gbfs/es/station_status.json](https://gbfs.bluebikes.com/gbfs/es/station_status.json)

```javascript
{
    "last_updated":1573674436,
    "ttl":10,
    "data":{
        "stations":[
            {
                "station_id":"11",
                "num_bikes_available":7,
                "num_docks_available":8,
                ...
            },
            ...
        ]
    }
}
```

### Load Datasets

Use Promise and fetch to load the datasets as below, in `main.js`. Note that we don't use D3 in this lab. We are using [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch), Javascript built-in library, for loading the remove datasets. 

```javascript

Promise.all([
	fetch("https://gbfs.bluebikes.com/gbfs/en/station_information.json").then(r=>r.json()),
	fetch("https://gbfs.bluebikes.com/gbfs/en/station_status.json").then(r=>r.json())
]).then(datasets=>{
	let stationInfo = datasets[0];
	let stationStatus = datasets[1];
    console.log(stationInfo, stationStatus);
```


In the HTML file you will see two elements where you need to display the last updated date for the data and the number of stations.

```html
<p>
    Last Updated: <span id="last-updated"></span> | Total:  <span id="station-count"></span> Stations
</p>
```
 You can use the following code to display the information, after loading the datasets.

```javascript
document.querySelector('#last-updated').textContent = new Date(stationInfo.last_updated*1000).toString();

document.querySelector('#station-count').textContent = stationInfo.data.stations.length;
	

```

### Processing the Datasets for Visualization


Ideally, we want a list of stations in which each element in the list contains the station name, number of bikes available, and number of docks available. However, the information is currently separated into two datasets.

For convenience, we will process the datasets to create a single list of stations.

```javascript
// convert array to map for easier access by station id
let statusMap = stationStatus.data.stations.reduce((acc, d, i)=>{
    acc[d.station_id] = d;
    return acc;
},{});

// combine station info with the station's status
let stations = stationInfo.data.stations.map(d=>{
    d = {// ES6 way to combine two objects
        ...d, 
        ...statusMap[d.station_id]
    };
    // console.log(d); // print d to see what data is available for each station
    return d;
});
```

The above code loop through each station in `station_information.json` and look up its status in `station_status.json`. Also note that it uses [reduce](https://www.w3schools.com/jsref/jsref_reduce.asp), a well-known relative to [map](https://www.w3schools.com/jsref/jsref_map.asp). 

Make sure to get familiar with the resulting data structure after the data transformation.


---

## Activity I - Creating an Interactive Map using Leaflet

*Leaflet* is a lightweight JavaScript library for mobile-friendly interactive maps. It is open source, which means that there are no costs or dependencies for incorporating it into your visualization. Leaflet works across all major browsers, can be extended with a huge amount of plugins, and the implementation is straight-forward. The library provides a technical basis that is comparable to *Google Maps*, which means that most users are already familiar with it.

### Creating a Leaflet Map Placeholder

In the HTML file, you can find a `div` container for the map.

*Parent HTML container for the map:*

```html
<div id="station-map"></div>
```

You can initialize the map by supplying the parent id to `L.map`. `L` is a global variable that contains all relevant functions provided in Leaflet.js.


*Initialize the map object:*

```javascript
let viewCenter = [42.360082, -71.058880]; //lat lon
let map = L.map('station-map').setView(viewCenter, 13);
```

`[42.360082, -71.058880]` corresponds to the geographical center of the map (*[latitude, longitude]*). In this example we have specified the center to be in Boston City.

If you want to know the latitude-longitude pair of a specific city or address you can use a web service, for instance: [http://www.latlong.net](http://www.latlong.net)

Additionaly, we have defined a default zoom-level (*13*). All further specifications are optional and described in the [Leaflet documentation](http://leafletjs.com/reference.html).

*Add a tile layer to the map:*

```javascript
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
```
In this code snippet, the URL `http://{s}.tile.osm.org/{z}/{x}/{y}.png` is particularly important. Leaflet provides only the *"infrastructure"* but it does not contain any map imagery. For this reason, the data - called tiles - must be implemented by map data providers. That means that we have to choose a provider and specify the source of the map tiles (see URL).

A list of many *tile layer* examples (that work with Leaflet) is available on this webpage: [https://leaflet-extras.github.io/leaflet-providers/preview/](https://leaflet-extras.github.io/leaflet-providers/preview/)

Some of the map providers (e.g., *OpenStreetMap*, *Stamen*) made their data completely available for free, while others require the registration of an API key (*Google*, *MapBox*, ...) and charge fees after exceeding a specific limit.

*Examples:*

![Map Tiles - Examples](img/instruction/map-tiles-provider.png?raw=true "Map Tiles - Examples")

For now, we will use tiles from *OpenStreetMap* (*"http://{s}.tile.osm.org/{z}/{x}/{y}.png"*).

After adding a tile layer to the map object, the page still remains empty. You have to make sure that the map container has a defined height.

*Specify the size of the map container in CSS:*

```css
#station-map {
	width: 100%;
	height: 600px;
}
```


### Adding a Marker


You can add a marker with the following line of code:

```javascript
var marker = L.marker([42.347088, -71.081666]).addTo(map);
```

The array (```[42.347088, -71.081666]```) refers again to a latitude-longitude pair, in our example to the position of *Prudential Center*.

You have many more options. For example, you can bind a popup to a marker:

```javascript
var popupContent =  "<strong>Prudential Center</strong><br/>";
	popupContent += "Boston";

// Create a marker and bind a popup with a particular HTML content
var marker = L.marker([42.347088, -71.081666])
	.bindPopup(popupContent)
	.addTo(map);
```

Besides markers, you can also add other vector shapes like lines, circles, and polygons. See the [official documentation](https://leafletjs.com/reference-1.5.0.html) for details.

In this lab, we need to create markers from stations, which we will do after introducing a layer group.


### Organizing a Layer Group


Leaflet provides some features to organize markers and other objects that we would like to draw. Basically, it is a layering concept, which means that each marker, circle, polygon etc. is a single layer. These layers can be grouped into *Layer Groups* which makes the handling of these objects easier.

We want to put all markers into the same group layer:

```javascript
// Add an empty layer group for the markers
let allMarkers = L.layerGroup().addTo(map);
```

And, before you draw markers into the layer, you may want to clear the layer:

```javascript
// 	Remove all layers before drawing markers
allMarkers.clearLayers();
```

This assumes that you write a reusable visualization function that might be called on different datasets multiple times. 

### Adding Custom Icon Markers for Stations

In this lab, we will use custom icons to represent station markers.

The built-in styles of the marker class are rather sparse. There is only one marker style and you can't choose the color dynamically. In the event that you need different markers, which might happen in the future, you can either create your own images or use a Leaflet extension ([https://github.com/lvoogdt/Leaflet.awesome-markers](https://github.com/lvoogdt/Leaflet.awesome-markers)).


A simple method for integrating custom icons is to modify the Leaflet images or to search for proper icons online. Make sure that the background of the images are transparent. 

We already prepared icon images for you. You can check the images in the `img` folder.

![Leaflet - Custom Marker Icon](img/instruction/marker-icons.png?raw=true "Leaflet - Custom Marker Icon")

- marker-blue.png
- marker-green.png
- marker-red.png
- marker-yellow.png
- marker-shadow.png

If we want to create several icons that have a lot in common, we can define our own icon class:

```javascript
// // Defining an icon class : Represents an icon to provide when creating a marker.
let LeafIcon = L.Icon.extend({
    options: {
        shadowUrl: 'img/marker-shadow.png',
        iconSize: [25, 41], // Size of the icon image in pixels.
            iconAnchor: [12, 41], // The coordinates of the "tip" of the icon (relative to its top left corner)
            popupAnchor: [0, -28] // The coordinates of the point from which popups will "open", relative to the icon anchor.
    }
});
```

Next, we can use this class to create individual icons:

```javascript
var redMarker = new LeafIcon({ iconUrl:  'img/marker-icon-red.png' });
var blueMarker = new LeafIcon({ iconUrl:  'img/marker-icon-blue.png' });
```

And finally we can use these icons for our markers:

```javascript
// Instantiate icons
let redMarker = new LeafIcon({iconUrl:  'img/marker-red.png'});
let blueMarker = new LeafIcon({iconUrl:  'img/marker-blue.png'});
```

Now, we want to loop through each station in the data, draw a different marker depending on the status:

```javascript
//  Create a marker for each station
stations.forEach(function(d){

    // Set marker icon depending on the state of each station
    let markerColor = (d.num_bikes_available == 0 || d.num_docks_available == 0) ? redMarker : blueMarker;

    // L.Marker is used to display clickable/draggable icons on the map.
    let marker = L.marker([d.lat, d.lon], { icon: markerColor }) // Icon instance to use for rendering the marker.

    allMarkers.addLayer(marker);
});
```

On top of this, we create attach a popup to show the actual numbers in a HTML format, when a user clicks a specific marker.

```javascript
let popupContent = 	'<strong>' + d.name + '</strong><br/>';
        popupContent +=	'Available Bikes: ' + d.num_bikes_available + '<br/>';
        popupContent +=	'Available Docks: ' + d.num_docks_available;

marker.bindPopup(popupContent); // Binds a popup to the marker with the passed content 

});
```

To learn more about how to use custom icon markers, please take a look at this nice [tutorial](https://leafletjs.com/examples/custom-icons/).

## Activity3 - Adding MBTA Lines 

### Adding a GeoJSON layer

Leaflet has also built-in methods to support GeoJSON objects. You are already familiar with this special JSON format. 

GeoJSON support becomes very important if you want to draw complex shapes or many objects on a map.


We prepared `MBTA-Lines.json` that contains geographical coordinate information about MBTA lines. You need to modify the above data loading code to load this json as well.

```javascript
Promise.all([
	...
	fetch("data/MBTA-Lines.json").then(r=>r.json())
]).then(datasets=>{
    let MBTAlines = datasets[2];
}
```


You can add the GeoJSON data by simply calling `L.geoJson` as below, and add it to the map. 

```javascript
L.geoJson(MBTAlines).addTo(map);
```

Leaflet automatically detects the features and maps them to circles, lines, polygons etc on the map.

The library provides also a method to style individual features of the GeoJSON layer. You can assign a callback function to the option ```style``` which styles individual features based on their properties.

```javascript
	// L.geoJson: Represents a GeoJSON object or an array of GeoJSON objects. Allows you to parse GeoJSON data and display it on the map
	// see how to specify the style from GeoJSON features: https://leafletjs.com/reference-1.5.0.html#geojson
	L.geoJson(MBTAlines, {
		style: feature=> ({color: feature.properties.LINE}), // inline function
		weight: 8,
		opacity: 0.8
	}).addTo(map);
```
Please take a look at the GeoJSON file (`data/MBTA-Lines.json`) to see what the value of `feature.properties.LINE` is going to be; i.e., it contains color information for each MBTA line.


## Submission of lab 

Please submit the **Github Pages url**, as well as **the link to the repository**, to Canvas.

Thanks!
