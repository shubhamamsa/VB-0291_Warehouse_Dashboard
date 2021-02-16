var jsonEndPoint = 'https://spreadsheets.google.com/feeds/list/1PRbJucGsHYOauVvvfgDAqKK6UIw4s6qabqeTnvcb57g/1/public/full?alt=json'

google.charts.load("current", {packages:['corechart']});
google.charts.setOnLoadCallback(refreshContent);

$(document).ready(function() {
    // Fetch the initial table
    refreshContent();
    
    // Fetch every 1 second
    setInterval(refreshContent, 2000);
});
    
function refreshContent(){

    var container = L.DomUtil.get('map');

    if(container != null){
        container._leaflet_id = null;
    }
     
    var map = L.map('map').setView([20.5937, 78.9629], 5);
    var jsonDataObject =[];
    var jsonDataObject1 =[];
    var graph_arr = [['Order ID', 'Time Taken', { role: 'style' }]];
    var bar_color = [];
     
    $.getJSON(jsonEndPoint, function(data) {
    	
    	var trHTML = '';

    	for (var i = 0; i < data.feed.entry.length; ++i) {
        	var myData_map, myData_order;

            trHTML += '<tr><td>' + data.feed.entry[i].gsx$orderid.$t + 
                	  '</td><td>' + data.feed.entry[i].gsx$item.$t + 
                	  '</td><td>' + data.feed.entry[i].gsx$priority.$t + 
                	  '</td><td>' + data.feed.entry[i].gsx$city.$t + 
                	  '</td><td>'  + data.feed.entry[i].gsx$dispatched.$t + 
                      '</td><td>' + data.feed.entry[i].gsx$shipped.$t +
                      '</td><td>' + data.feed.entry[i].gsx$orderdateandtime.$t +
                      '</td><td>' + data.feed.entry[i].gsx$dispatchdateandtime.$t +
                      '</td><td>' + data.feed.entry[i].gsx$shippingdateandtime.$t +
                      '</td><td>' + data.feed.entry[i].gsx$timetaken.$t +
                	  '</td></tr>';

        }

        console.log(trHTML);
    	$('#tableContent').html(trHTML);
    	var trHTML = '';

        for (var i = 0; i < data.feed.entry.length; ++i) {

            var json_data = {
                "City": data.feed.entry[i].gsx$city.$t,
                "OderID" : data.feed.entry[i].gsx$orderid.$t,
                "Item" : data.feed.entry[i].gsx$item.$t,
                "Latitude": parseFloat(data.feed.entry[i].gsx$latitude.$t),
                "Longitude": parseFloat(data.feed.entry[i].gsx$longitude.$t)
            };
            jsonDataObject.push(json_data);
        
            for (var j = 0; j < jsonDataObject.length; j++) {
                var marker = L.marker(L.latLng(parseFloat(jsonDataObject[j].Latitude), parseFloat(jsonDataObject[j].Longitude)));
                marker.bindPopup(jsonDataObject[j].City, {
                    autoClose: false
                });
                map.addLayer(marker);
                marker.on('click', onClick_Marker)
                // Attach the corresponding JSON data to your marker:
                marker.myJsonData =jsonDataObject[j];

                function onClick_Marker(e) {
                    var marker = e.target;
                    popup = L.popup()
                    .setLatLng(marker.getLatLng())
                    .setContent("Order ID: " + marker.myJsonData.OderID + " || Item: " +   marker.myJsonData.Item)
                    .openOn(map);
                }

                L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                    subdomains: 'abcd',
                    maxZoom: 25
                }).addTo(map); 
            

            }
        }

        for (var i = 0; i < data.feed.entry.length; ++i) {
            var json_data = {
                "OderID" : data.feed.entry[i].gsx$orderid.$t,
                "TimeTaken": parseFloat(data.feed.entry[i].gsx$timetaken.$t),
                "Priority": data.feed.entry[i].gsx$priority.$t
            };
            jsonDataObject1.push(json_data);
        };
        // Setting color for the coloumns of graph according to priority of items
        for(var j in jsonDataObject1){
            if(jsonDataObject1[j].Priority == 'HP'){
                var color =  '#ff4d4d';
            }
            else if(jsonDataObject1[j].Priority == 'MP'){
                var color =  '#ffff4d';
            }
            else if(jsonDataObject1[j].Priority == 'LP'){
                var color =  '#489348';
            }
            bar_color.push(color)
        }

        // Converting Json Object to JavaScript Array
        for(var j in jsonDataObject1){
            graph_arr.push([jsonDataObject1[j].OderID,jsonDataObject1[j].TimeTaken, bar_color[j]]);
        }
        var graphArray_Final = google.visualization.arrayToDataTable(graph_arr);
        var data = new google.visualization.DataView(graphArray_Final); 

        var options = {
            title: 'Time Taken for items to be Shipped',
            titleTextStyle: {color: '#02abb1'},
            hAxis: { 
                title: 'Order ID',
                titleTextStyle: {color: '#cccccc'},
                textStyle: {color: '#cccccc'},
            },
            vAxis: { 
                title: 'Time Taken (s)',
                titleTextStyle: {color: '#cccccc'},
                textStyle: {color: '#cccccc'},
            },
            backgroundColor: '#0f141a',
            bar: {groupWidth: "20%"},
            legend: { position: "none" },
        };
        var chart = new google.visualization.ColumnChart(document.getElementById('columnChart'));
        chart.draw(data, options);
    });	 
}