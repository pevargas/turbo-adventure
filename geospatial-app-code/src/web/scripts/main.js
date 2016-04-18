/**
* GEOSPATIAL RECOMMENDATION ENGINES | FRONT END CODE
* This code uses AWS API Gateway to query Elastic Search and to make Amazon Machine Learning Queries.
* In this demo, we will use Mapbox to plot restaurants on a map.
* To get started, change the inital configuration values below.
*      ___ _       _______
*     /   | |     / / ___/
*    / /| | | /| / /\__ \
*   / ___ | |/ |/ /___/ /
*  /_/  |_|__/|__//____/
*
* Constants
* -------------------------------------------------------
* MAPBOX_TOKEN: Your mapbox API token.
* ENDPOINT: The URL to your AWS API Gateway ENDPOINT
* DEFAULT_COORDINATES:
*    [location] - The geocoordiates of where to center the map.
*    [zoom] - The initial map zoom level.
*
* MARKER_GROUP_COLOR: The color of the group pins on the map.
*
* Variables
* --------------------------------------------------------
* slideOut: The current state of the user settings and address slide out forms.
* locationArray: The geolocations of the map bounds to send to the AWS API Gateway endpoint. The system is expecting:
*  [Northwest Longitude, Northwest Latitude, Southeast Longitude, Southeast Latitude]
* user: A JSON object that stores the user information.
* clusterGroup:
*/

/* CONSTANTS */
// ============ CHANGE THESE VALUES BELOW =============== //

var ENDPOINT = "<YOUR_ENDPOINT";

// OPTIONAL: Feel free to use the Mapbox API token here, or create your own at http://www.mapbox.com/
var MAPBOX_TOKEN = "pk.eyJ1IjoiamVyd2FsbGFjZSIsImEiOiIxMjIzOTlmMjYzZGYxNjg5YTEwYWUyYzAwZDAwM2YzZiJ9.ixDFhSmn8fHkc6fExkobzA";

// =================== REST OF CODE ===================== //

var DEFAULT_COORDINATES = {
  location: [-122.4090, 37.7946],
  zoom: 14
};
var MARKER_GROUP_COLOR = '#422';

/* VARIABLES */

var slideOut = { isOut: false, type: undefined };
var user, clusterGroup, driverClusterGroup;
var driverMarkers = {};

// Load map details

L.mapbox.accessToken = MAPBOX_TOKEN;
var map = L.mapbox.map('map', 'mapbox.streets')
.setView([DEFAULT_COORDINATES.location[1], DEFAULT_COORDINATES.location[0]], DEFAULT_COORDINATES.zoom)
.on("move", function() {
  displayMessage("info","Map Resized.", "Click here to redo your search in this area.", true);
}).addControl(L.mapbox.geocoderControl('mapbox.places'));

/* EVENT HANDLERS */

$("#edit-preferences").click(function (){
  "use strict";
  if (slideOut.isOut&&slideOut.type!=0) {
    closeAll();
  }
  $("#user-settings").show();
  $("#user-settings").animate({right:'0px'}, {queue: false, duration: 200});
  slideOut.isOut = true;
  slideOut.type = 0;
});

$("#edit-address").click(function (){
  "use strict";
  if (slideOut.isOut&&slideOut.type!=1) {
    closeAll();
  }
  $("#user-address").show();
  $("#user-address").animate({right:'0px'}, {queue: false, duration: 200});
  slideOut.isOut = true;
  slideOut.type = 1;
});

$(".close-box").click(function (){
  closeAll();
});

$("#no-pref").click(function (){
  "use strict";
  setPrice(0);
});

$("#under20").click(function (){
  "use strict";
  setPrice(1);
});

$("#20_30").click(function (){
  "use strict";
  setPrice(2);
});

$("#30_50").click(function (){
  "use strict";
  setPrice(3);
});

$("#over50").click(function (){
  "use strict";
  setPrice(4);
});

$("#update-preferences").click(function (){
  "use strict";
  setUser();
});

$("#update-address").click(function (){
  "use strict";
  setUser();
});

$("#go").click(function (){
  search();
});

$(".info").click(function (){
  $(".info").fadeOut();
  search();
});

$('input').keypress(function (e) {
  "use strict";
  if (e.which == 13) {
    search();
  }
});

/* ADDRESS FIELD */

$('#address-block').validate({/* ... */});

$('#address-block fieldset').addressfield({
  json: '/scripts/addressfield.json',
  fields: {
    country: '#country',
    thoroughfare: '#address1',
    premise: '#address2',
    localityname: '#city',
    administrativearea: '#state',
    postalcode: '#zip'
  }
});

/* FUNCTIONS */

/**
 * This function displays a message on the map.
 * @param {string} type Is the class name to lookup when writing the message.
 * @param {string} title Is the message title.
 * @param {string} message Is the message body.
 * @param {boolean} stick True if you want the message to stick to the screen.
 */
function displayMessage(type, title, message, stick) {
  $("."+type+" .message-title").html(title);
  $("."+type+" .message").html(message);
  $("."+type).fadeIn();
  if (stick!=true) {
    setTimeout(function() {
      $("."+type).fadeOut();
    }, 2000);
  }
}

/**
* This returns a new feature layer that will be temporarily popluated with the data from the search.
*/
function getDriverLayer() {
  return L.mapbox.featureLayer()
      .on('layeradd', function(e) {
        var marker = e.layer,
        feature = marker.feature;

        // Create custom popup content
        var popupContent = '<div id="driver-info-'+feature.properties.driverId+'">';
        popupContent += '<div class="price"><i class="fa fa-car"></i></div>';
        popupContent += '<div class="caps-titles">Driver '+feature.properties.driverId+'</div>';
        popupContent += '<div class="tool-tip-title">'+feature.properties.title+'</div>';
        popupContent += '<div class="contact"><a onclick="contactDriver(\''+feature.properties.driverId+'\')" href="#" class="btn btn-primary prediction-button"><i class="fa fa-phone fa-lg"></i> Contact Driver</a></div></div>';

        marker.setIcon(L.divIcon({
                    className: 'label',
                    html: '<i class="fa fa-car fa-2x blacktext">',
                    iconSize: [100, 40]
                }));

        marker.bindPopup(popupContent,{
          closeButton: false,
          minWidth: 100
        });
      })
}

/**
* This returns a new feature layer that will be temporarily popluated with the data from the search.
*/
function getRestaurantLayer() {
  return L.mapbox.featureLayer()
    .on('layeradd', function(e) {
    var marker = e.layer,
    feature = marker.feature;

    // Create custom popup content
    var popupContent = '<div id="restaurant-info-'+feature.properties.restaurantId+'"><div class="price">';
    for (i = 0; i < feature.properties.price; i++) {
      popupContent += '<i class="fa fa-dollar"></i>';
    }
    popupContent += '</div>'+
    '<span class="tool-tip-title">'+
      '<span class="spinner-prediction"><i class="fa fa-spinner fa-spin"></i></span>'+
    feature.properties.title+'</span>'+
    '<p>'+feature.properties.description+'</p>'+
    '<div class="machine-learning">'+
    '<div class="caps-titles">Amazon Machine Learning Personal Rating</div>'+
    '<div class="likeability"><i class="star-one fa fa-star"></i><i class="star-two fa fa-star"></i><i class="star-three fa fa-star"></i><i class="star-four fa fa-star"></i></div>'+
    '<div id="likeability-response-'+feature.properties.restaurantId+'"><a onclick="getPrediction(\''+feature.properties.restaurantId+'\')" href="#" class="btn btn-primary prediction-button"><i class="fa fa-caret-right fa-lg"></i> Will I like this restaurant?</a></div>'+
    '</div>'+
    '</div>';

    // http://leafletjs.com/reference.html#popup
    marker.bindPopup(popupContent,{
      closeButton: false,
      minWidth: 320
    });
  });
}

/**
* This function colors the stars and displays the final recommendation in the tooltip based on a machine learning prediction.
* @param {string} rid The restaurant ID.
* @param {string} recommendation The recommendation that was returned from Amazon Machine Learning.
*/
function setRecommendation(rId, recommendation) {

  var star_one = $(".star-one"),
  star_two = $(".star-two"),
  star_three = $(".star-three"),
  star_four = $(".star-four");

  var text = $("#likeability-response-"+rId);
  text.html('<span class="'+recommendation.replace(" ", "-")+'">Your predicted reaction: <br /> <strong class="uppercase">'+recommendation+'</strong></span>');

  switch(recommendation) {
    case 'dislike':
    star_one.addClass("aws-yellow-text");
    break;
    case 'satisfactory':
    star_one.addClass("aws-yellow-text");
    star_two.addClass("aws-yellow-text");
    break;
    case 'very good':
    star_one.addClass("aws-yellow-text");
    star_two.addClass("aws-yellow-text");
    star_three.addClass("aws-yellow-text");
    break;
    case 'excellent':
    star_one.addClass("aws-yellow-text");
    star_two.addClass("aws-yellow-text");
    star_three.addClass("aws-yellow-text");
    star_four.addClass("aws-yellow-text");
    break;
    default:
    break;
  }
}

/**
* This function gets the elastic search formatted bounds based on the initial coordinates defined for the map or the current map bounds.
* @param {Object} bounds The bounds object returned from mapbox featureLayer.getBounds()
*/
function getLocationArray(bounds) {
  if (bounds===undefined||bounds._southWest===undefined) {
    console.log("Using default.");
    return null
  } else {
    console.log("Using bounds.");
    return [bounds._southWest.lng,bounds._northEast.lat,bounds._northEast.lng,bounds._southWest.lat];
  }
}

/**
 * Contact Driver feature... To be implemented...
 */
function contactDriver(dId) {
   displayMessage("info","You're up!", "Feature not yet implemented.", false);
}

/**
* This function runs an AJAX POST HTTP request to update user information and settings.
*/
function setUser() {
  $(".spinner").show();
  var record = {
    "userId": $("#userId").val(),
    "email": $("#email").val(),
    "budgetPreference": $("#budget").val(),
    "age": $("#age").val(),
    "gender": $("#gender").val(),
    "deliveryAddress": {
      "address_1": $("#address1").val(),
      "address_2": $("#address2").val(),
      "city": $("#city").val(),
      "state": $("#state").val(),
      "zip": $("#zip").val()
    }
  }
  $.ajax({
    contentType: "application/json",
    type: "POST",
    crossDomain: true,
    cache: false,
    url: ENDPOINT+"/users/",
    data: JSON.stringify(record),
    success: function(response) {
      $(".spinner").hide();
      closeAll();
      if (response.errorMessage!==undefined) {
        displayMessage("error","Update Failed", "There was an error.", false);
      } else {
        console.log("Posted record: ",record);
        displayMessage("saved","Success!", "Updates successfully posted.", false);
      }
    },
    error: function(err) {
      $(".spinner").hide();
      console.error("Error: "+err);
    }
  });
}

/**
* This function closes all open slide out windows.
*/
function closeAll() {
  $("#user-settings").animate({right:'-350px'}, {queue: false, duration: 200}).fadeOut();
  $("#user-address").animate({right:'-350px'}, {queue: false, duration: 200}).fadeOut();
  $(".saved").fadeOut();
  slideOut.isOut = false;
}

/**
* This function toggles the budget preference buttons based on user selection.
*/
function clearAddSelectedBudget(identifier) {
  $("#no-pref").removeClass("selected");
  $("#20_30").removeClass("selected");
  $("#30_50").removeClass("selected");
  $("#under20").removeClass("selected");
  $("#over50").removeClass("selected");
  $(identifier).addClass("selected");
}

/**
* This function sets the hidden form field to the value / budget preference selected.
*/
function setPrice(val) {
  $("#budget").val(val);
  switch(val) {
    case 1:
      clearAddSelectedBudget("#under20");
      break;
    case 2:
      clearAddSelectedBudget("#20_30");
      break;
    case 3:
      clearAddSelectedBudget("#30_50");
      break;
    case 4:
      clearAddSelectedBudget("#over50");
      break;
    default:
      clearAddSelectedBudget("#no-pref");
  }
}

/**
* This function runs an AJAX GET HTTP request to get user information and settings.
* @param {string} email The user's email address.
*/
function getUser(email) {
  $.ajax({
    dataType : 'json',
    type: "GET",
    cache: false,
    url: ENDPOINT+"/users/"+email,
    contentType: "application/json",
    success: function(data) {
      if (data.errorMessage!==undefined) {
        $(".failed").html("<strong>Could not get user data.</strong> There was an error.");
        $(".failed").fadeIn();
        setTimeout(function() {
          $(".failed").fadeOut();
        }, 2000);
      }
      var user = data;
      $("#email").val(user.email);
      $("#gender").val(parseInt(user.gender));
      $("#age").val(parseInt(user.age));
      setPrice(parseInt(user.budgetPreference));
      $("#address1").val(user.deliveryAddress.address_1);
      $("#address2").val(user.deliveryAddress.address_2);
      $("#city").val(user.deliveryAddress.city);
      $("#zip").val(user.deliveryAddress.zip);
      $("#country").val("US");
      $("#state").val(user.deliveryAddress.state);
    }
  });
}

/**
* This function runs an AJAX GET HTTP request to get user information and settings.
* @param {string} rId The restaurant ID.
*/
function getPrediction(rId) {
  console.log("Loading prediction for user: " +$("#email").val());
  $(".spinner-prediction").show();
  var record = {
    email: $("#email").val(),
    restaurantId: rId
  }
  $.ajax({
    type: "GET",
    cache: false,
    url: ENDPOINT+"/predictions/",
    data: record,
    success: function(data) {
      if (data.errorMessage!==undefined) {
        $(".failed").html("<strong>Could not get prediction.</strong> There was an error.");
        $(".failed").fadeIn();
        setTimeout(function() {
          $(".failed").fadeOut();
        }, 2000);
      }
      $(".spinner-prediction").hide();
      setRecommendation(rId, data.prediction.rating);
    }
  });
}

/**
* This function displays the circular loading animation when running a geospatial search query.
*/
function startLoading() {
  $('#loader').removeClass('done');
  $('#loader').removeClass('hide');
}

/**
* This function hides the circular loading animation when running a geospatial search query has completed.
* @param {string} keywords The keywords to show on the info screen.
*/
function finishedLoading(keywords) {
  $('#loader').addClass('done');
  setTimeout(function() {
    $('#loader').addClass('hide');
  }, 500);
  displayMessage("saved","Search completed", " for \"<strong>"+keywords+"</strong>\".", false);
}

function refreshDriverLayer() {
  console.log("Loading Driver");
  var locationArray = getLocationArray(map.getBounds());
  getDriverLayer().loadURL(ENDPOINT+"/drivers/search?locations="+locationArray.join(","))
  .on("ready", function() {
    var i = 0;
    this.eachLayer(function(marker) {
      var driverId = marker.feature.properties.driverId;

      // If the driver is not already on the map, add the driver to the map.
      // This adds a new layer to the map and is not part of the DriverLayer object
      // created when the geoJSON is loaded.
      if (driverMarkers[driverId]===undefined) {
        driverMarkers[driverId] = marker;
        driverMarkers[driverId].addTo(map);
      } else {
      // Update the driver coordinates if the driver is already on the map.
        var lat = marker.feature.geometry.coordinates[1];
        var long = marker.feature.geometry.coordinates[0];

        // Random driver movement.
        // lat = parseInt(lat) + (Math.random()/100000);
        // long = parseInt(long) - (Math.random()/100000);

        driverMarkers[driverId].setLatLng(L.latLng(lat,long));
      }
    });
  });

}
/**
 * Refresh the map pins based on a search query
 * @param {string} q The keyword search query to perform.
 */
function refreshMap(q) {
  var locationArray = getLocationArray(map.getBounds());
  if (clusterGroup!==undefined) {
    clusterGroup.clearLayers();
  }
  startLoading();
  getRestaurantLayer().loadURL(((q===undefined) ? ENDPOINT+"/restaurants/search?locations="+locationArray.join(",") : ENDPOINT+"/restaurants/search?searchTerms="+q+"&locations="+locationArray.join(", ")))
  .on('ready', function(e) {
    clusterGroup = new L.MarkerClusterGroup({
      iconCreateFunction: function(cluster) {
        return L.mapbox.marker.icon({
          'marker-symbol': cluster.getChildCount(),
          'marker-color': MARKER_GROUP_COLOR
        });
      }
    });
    e.target.eachLayer(function(layer) {
      clusterGroup.addLayer(layer);
    });
    map.addLayer(clusterGroup);
    finishedLoading(q);
  });

}

/**
* This function runs the search via refreshMap.
*/
function search() {
  refreshMap($("#q").val());
}

/* OPERATIONS ON PAGE LOAD */

$(function() {
  // Get the default user.
  getUser("test-user@test.com");
  refreshMap();
  setInterval(function(){
    refreshDriverLayer();
  }, 2000);
});
