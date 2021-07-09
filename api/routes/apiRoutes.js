'use strict';
module.exports = function(app) {
  var api = require('../controllers/apiControllers');

 
  app.route('/api/get_distance_and_time')
    .post(api.get_distance_and_time);

};