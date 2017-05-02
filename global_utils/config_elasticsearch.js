'use strict';

/**
 * ElasticSearch configuration
 */

const elasticsearch = require('elasticsearch');
const CustomESHTTPConnector = require('./custom_es_connection');
const debug = require('debug')('app:server:mysql-config');

const config = {
  host : 'http://127.0.0.1:9200',
  maxSockets : 10,
  sniffOnStart : true,
  keepAlive : true
}

module.exports = {

     connectService : function() {
        config["connectionClass"] = CustomESHTTPConnector;
        return new elasticsearch.Client(config);
     }
}
