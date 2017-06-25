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

var lines = ['green', 'red', 'gold', 'purple', 'blue', 'expo'];

var map;
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 33.985, lng: -118.2},
    zoom: 11
  });
  var largeInfowindow = new google.maps.InfoWindow();
  //add markers and listings for every stop on every line
  for (var i = 0; i < lines.length; i++) {
    setLine(lines[i]);
  }
  //adjust map to show all markers
  var bounds = new google.maps.LatLngBounds();
  for (var i = 0; i < collections['all'].length; i++) {
    bounds.extend(collections['all'][i]['marker'].position);
  }
  map.fitBounds(bounds);

  function setLine(line) {
    var array = window[line]['items'];
    var image = "img/"+ line +".png"
    for (var i = 0; i < array.length; i++) {
      //create a map marker

      var marker = new google.maps.Marker({
        map: map,
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
        //get wiki data for info window
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
        populateInfoWindow(this, largeInfowindow);
      });
      //create a sidePanel listing
      var listing = document.createElement("div");
      listing.setAttribute('class', 'listing '+line);
      listing.addEventListener('click', (function(markerCopy) {
        return function() {
          populateInfoWindow(markerCopy, largeInfowindow);
          markerCopy.setAnimation(google.maps.Animation.BOUNCE);
          setTimeout(() => {
            markerCopy.setAnimation(null);
          }, 700)
        };
      })(marker));
      listing.innerHTML = array[i]['display_name'];
      document.getElementById('stopList').appendChild(listing);

      //create a Stop object that will hold both marker and listing
      var stop = {
        marker: marker,
        listing: listing
      }
      //push the stop object to it's line/master collections
      collections[line].push(stop);
      collections['all'].push(stop);
    }
  }
}

function setGroup(line) {// display/hide a collection of markers and corresponding listings
  // 'line' must be one of ['all','green', 'red', 'gold', 'purple', 'blue', 'expo']
  if (lineDisplayStatus[line]() == true) {
    var setAs = map;
    var action = function(element) {element.classList.remove("removed");}
  }
  else {
    var setAs = null;
    var action = function(element) {element.classList.add("removed");}
  }
  for (var i = 0; i < collections[line].length; i++) {
    collections[line][i]['marker'].setMap(setAs);
    action(collections[line][i]['listing']);
  }
}

function populateInfoWindow(marker, infowindow) {
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

function apiCall(url, callback) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var json = JSON.parse(xhttp.responseText);
      callback(json);
    }
  }
  xhttp.open("GET", url, true);
  xhttp.send();
}
