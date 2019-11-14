
let allData = [];

// Variable for the visualization instance
let stationMap;

// Start application by loading the data
Promise.all([
	fetch("https://gbfs.bluebikes.com/gbfs/en/station_information.json").then(r=>r.json()),
	fetch("https://gbfs.bluebikes.com/gbfs/en/station_status.json").then(r=>r.json())
]).then(datasets=>{
	let stationInfo = datasets[0];
	let stationStatus = datasets[1];
	let MBTAlines = {}; //datasets[2];

	console.log(stationStatus);
	
	
	// data processing
	
	// convert array to map for easier access by station id

	// combine station info with the station's status
	let stations = [];

	visualize(stations, MBTAlines);
});
// loadData();

function visualize(stations, MBTAlines){

	// Instantiate the map object
	let viewCenter = [42.360082, -71.058880]; //lat lon
	let map = L.map('station-map').setView(viewCenter, 13);


	// Specify directory with leaflet images
	// L.Icon.Default.imagePath = 'img';

	// Option 1: Load and display a tile layer on the map (OpenStreetMap)
	// L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
  	// attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
	// }).addTo(map);


	// Option 2: Load and display a tile layer on the map (Stamen)
	// L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.{ext}', {
	// 	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
	// 	subdomains: 'abcd',
	// 	ext: 'png'
	// }).addTo(map);


	// Option 3: Load and display a tile layer on the map (Carto)
	// More info https://github.com/CartoDB/basemap-styles
	L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png', {
		attribution:'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>',
	}).addTo(map);

	// Add an empty layer group for the markers

	// 	Remove all layers before drawing markers

	// // Defining an icon class 


	// // Instantiate icons


	
	


	//  Create a marker for each station
	stations.forEach(function(d){
		// Add a marker for each station

		// Add a popup and bind it to the marker

		// Add a marker to the allMarkers layer
	});

	// Add a GeoJSON for MBTA lines

}