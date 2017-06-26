"use strict";

var ViewModel = function() {
  var self = this;
  this.green = ko.observable(true);
  this.green.subscribe(function () {setGroup('green');});
  this.red = ko.observable(true);
  this.red.subscribe(function () {setGroup('red');});
  this.gold = ko.observable(true);
  this.gold.subscribe(function () {setGroup('gold');});
  this.purple = ko.observable(true);
  this.purple.subscribe(function () {setGroup('purple');});
  this.blue = ko.observable(true);
  this.blue.subscribe(function () {setGroup('blue');});
  this.expo = ko.observable(true);
  this.expo.subscribe(function () {setGroup('expo');});
  this.showAll = function() {
    self.green(true);
    self.red(true);
    self.gold(true);
    self.purple(true);
    self.blue(true);
    self.expo(true);
  }
  this.hideAll = function() {
    self.green(false);
    self.red(false);
    self.gold(false);
    self.purple(false);
    self.blue(false);
    self.expo(false);
  }
  this.currentStops = ko.observableArray();
}
var lineDisplayStatus = new ViewModel;
ko.applyBindings(lineDisplayStatus);

var collections = {
  all: [],
  red: [],
  purple: [],
  blue: [],
  gold: [],
  expo: [],
  green: [],
}

var map;
var infowindow;
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 33.985, lng: -118.2},
    zoom: 11
  });
  infowindow = new google.maps.InfoWindow();
  //add markers and listings for every stop on every line
  var lines = ['green', 'red', 'gold', 'purple', 'blue', 'expo'];
  for (var i = 0; i < lines.length; i++) {
    setLine(lines[i]);
  }
  //adjust map to show all markers
  var bounds = new google.maps.LatLngBounds();
  for (var i = 0; i < collections['all'].length; i++) {
    bounds.extend(collections['all'][i].position);
  }
  map.fitBounds(bounds);
  //takes a rail line name as input, creates a stop object for every stop on the line
  function setLine(line) {
    var array = window[line]['items'];
    var image = "img/"+ line +".png"
    for (var i = 0; i < array.length; i++) {
      //create a map marker
      var marker = new google.maps.Marker({
        map: map,
        line: line,
        icon: image,
        position: {
          lat: array[i]['latitude'],
          lng: array[i]['longitude']
        },
        title: array[i]['display_name'],
        animation: google.maps.Animation.DROP
        });
      //set backup/defaults to display in case wikipedia info is not recieved
      marker.description = "we're sorry, information on this stop is unavailable";
      marker.link = "https://en.wikipedia.org/w/index.php?search=" + marker.title;
      //get wiki data to display in the info window
      var url = 'https://en.wikipedia.org/w/api.php?action=opensearch&origin=*&search=' + array[i]['display_name'];
      apiCall(url, (function(markerCopy) {
          return function(json) {
            if ((json[3][0]) != undefined) {
              markerCopy.link = (json[3][0]);
              markerCopy.description = (json[2][0]);
            }
          };
        })(marker));
      // Create an onclick event to open an infowindow at each marker.
      marker.addListener('click', function() {
        selectStop(this);
      });
      //create a listing object from which the view will create the displayed stop listing
      var listing = {
        name: array[i]['display_name'],
        classNames: ('listing ' + line),
        condition: lineDisplayStatus[line],
        markerReference: marker
      }
      //push the listing to a KO observable array
      lineDisplayStatus['currentStops'].push(listing);
      //push the marker object to it's line/master collections
      collections[line].push(marker);
      collections['all'].push(marker);
    }
  }
}

function setGroup(line) {// display/hide a collection of markers
  // 'line' must be one of ['all','green', 'red', 'gold', 'purple', 'blue', 'expo']
  for (var i = 0; i < collections[line].length; i++) {
    collections[line][i].setVisible(lineDisplayStatus[line]());
  }
  //check if info window should be closed
  if (infowindow.marker != undefined) {
    if (infowindow.marker.line == line) {
      infowindow.close();
    }
  }
}

function selectStop(marker) {
  // play a single bounce animation upon selection
  marker.setAnimation(google.maps.Animation.BOUNCE);
  setTimeout(() => {
    marker.setAnimation(null);
  }, 700)
  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker != marker) {
    infowindow.marker = marker;
    infowindow.setContent(
      '<h4>' + marker.title + '</h4>' + '<p>' + marker.description + '<br>' +
      '<a href="' + marker.link + '">' + '(more at Wikipedia)' + '</a>' + '</p>'
    );
    infowindow.open(map, marker);
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick',function(){
      infowindow.setMarker = null;
    });
  }
}

function mapFailure() {
  alert("unable to establish connection with google maps");
}

function apiCall(url, callback) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var json = JSON.parse(xhttp.responseText);
      callback(json);
    } else if (this.readyState == 4) {
      alert("unable to retrieve data from Wikipedia");
    }
  }
  xhttp.open("GET", url, true);
  xhttp.send();
}
