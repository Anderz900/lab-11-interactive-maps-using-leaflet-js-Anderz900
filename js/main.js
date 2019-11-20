
let allData = [];

// Variable for the visualization instance
let stationMap;

// Start application by loading the data
Promise.all([
	fetch("https://gbfs.bluebikes.com/gbfs/en/station_information.json").then(r=>r.json()),
	fetch("https://gbfs.bluebikes.com/gbfs/en/station_status.json").then(r=>r.json()),
	fetch("data/MBTA-Lines.json").then(r=>r.json())
]).then(datasets=>{
	let stationInfo = datasets[0];
	let stationStatus = datasets[1];
	let MBTAlines = {}; //datasets[2];

	console.log(stationStatus);
	
	
	// data processing
	
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

	visualize(stations, MBTAlines);
});
// loadData();

function visualize(stations, MBTAlines){

	// Instantiate the map object
	let viewCenter = [42.360082, -71.058880]; //lat lon
	let map = L.map('station-map').setView(viewCenter, 13);


	// Specify directory with leaflet images
	L.Icon.Default.imagePath = 'img';

	// Option 1: Load and display a tile layer on the map (OpenStreetMap)
	L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
  	attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);

	


	// Option 2: Load and display a tile layer on the map (Stamen)
	// L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.{ext}', {
	// 	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
	// 	subdomains: 'abcd',
	// 	ext: 'png'
	// }).addTo(map);


	// Option 3: Load and display a tile layer on the map (Carto)
	// More info https://github.com/CartoDB/basemap-styles
	// L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png', {
	// 	attribution:'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>',
	// }).addTo(map);

	// Add an empty layer group for the markers
	let allMarkers = L.layerGroup().addTo(map);

	// 	Remove all layers before drawing markers
	allMarkers.clearLayers();

	// // Defining an icon class 

	let LeafIcon = L.Icon.extend({
		options: {
			shadowUrl: 'img/marker-shadow.png',
			iconSize: [25, 41], // Size of the icon image in pixels.
				iconAnchor: [12, 41], // The coordinates of the "tip" of the icon (relative to its top left corner)
				popupAnchor: [0, -28] // The coordinates of the point from which popups will "open", relative to the icon anchor.
		}
	});

	// // Instantiate icons

	let redMarker = new LeafIcon({iconUrl:  'img/marker-red.png'});
	let blueMarker = new LeafIcon({iconUrl:  'img/marker-blue.png'});

	
	


	//  Create a marker for each station
	stations.forEach(function(d){
		// Add a marker for each station
		let markerColor = (d.num_bikes_available == 0 || d.num_docks_available == 0) ? redMarker : blueMarker;
		// Add a popup and bind it to the marker
		let marker = L.marker([d.lat, d.lon], { icon: markerColor }) // Icon instance to use for rendering the marker.
		let popupContent = 	'<strong>' + d.name + '</strong><br/>';
        popupContent +=	'Available Bikes: ' + d.num_bikes_available + '<br/>';
        popupContent +=	'Available Docks: ' + d.num_docks_available;

marker.bindPopup(popupContent); // Binds a popup to the marker with the passed content 
		// Add a marker to the allMarkers layer

		allMarkers.addLayer(marker);
	});

	// Add a GeoJSON for MBTA lines
	L.geoJson(MBTAlines).addTo(map);

}