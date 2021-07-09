'use strict';

const googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyBP5gLKx_rS7vlO0cSnJhhuzSD0FVzJX_Q',
});

var NodeGeocoder = require('node-geocoder');

var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: 'AIzaSyBP5gLKx_rS7vlO0cSnJhhuzSD0FVzJX_Q',
  formatter: 'json'
};

var geocoder = NodeGeocoder(options);

var GeoPoint = require('geopoint');


async function get_country(c) {
  return new Promise(function (resolve, reject) {
    geocoder.reverse({
      lat: c.lat,
      lon: c.lng
    }, function (err, response) {
      if (err) {
        reject(err);
      } else {
        resolve(response);
      }
    })
  });
}

async function get_time_zone(c) {
  return new Promise(function (resolve, reject) {
    googleMapsClient.timezone({
      location: c
    }, function (err, response) {
      if (err) {
        reject(err);
      } else {
        resolve(response.json);
      }
    })
  });
}

function get_distance(start, end) {
  var point1 = new GeoPoint(start.lat, start.lng);
  var point2 = new GeoPoint(end.lat, end.lng);
  var distance = point1.distanceTo(point2, true)

  return distance;
}



exports.get_distance_and_time = async function (req, res) {
  const item = req.body;
  let output = {};
  var start_country = await get_country(item.start);
  var end_country = await get_country(item.end);
  var start_time = await get_time_zone(item.start);
  var end_time = await get_time_zone(item.end);

  function time_calculation()
  {
    var diff = ((start_time.rawOffset + end_time.rawOffset) - (start_time.dstOffset + end_time.dstOffset));
    var diff_unit ='';
    if ( diff >= 3600 )
    {
      diff_unit = 'hours';
    }else if( diff >= 60 && diff < 3600)
    {
      diff_unit = 'minutes';

    }else if( diff >= 0 && diff < 60)
    {
      diff_unit = 'seconds';
    }
    return diff_unit;

  }

  output["start"] = {
    'country': start_country[0]["country"],
    'timezone': 'GMT' + (((start_time.dstOffset + start_time.rawOffset) / 3600) > 0 ? '+' :'') + ((start_time.dstOffset + start_time.rawOffset) / 3600),
    'location': item.start
  };
  output["end"] = {
    'country': end_country[0]["country"],
    'timezone': 'GMT' + (((end_time.dstOffset + end_time.rawOffset) / 3600) > 0 ? '+': '') + ((end_time.dstOffset + end_time.rawOffset) / 3600),
    'location': item.end
  };
  output["distance"] = {
    'value': Math.trunc(get_distance(item.start,item.end)),
    'units': 'km'
  };
  output["time_diff"] = {
    'value': ( (start_time.rawOffset + end_time.rawOffset) - (start_time.dstOffset + end_time.dstOffset) ) / 3600,
    'units': time_calculation()
  };

  res.send(output);



};