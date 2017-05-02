'use strict';
/**
 * application servser entry
 */
var config = require('./app_constants'),
    cors = require('koa-cors'),
    convert = require('koa-convert'),
    bodyParser = require('koa-bodyparser'),
    debug = require('debug')('koa:log_service'),
    ES = require('../global_utils/config_elasticsearch'),
    Router = require('koa-router')(),
    koa = require('koa'),
    co = require('co'),
    app = new koa();

module.exports = app;

/**
 * Initiates a new APP server. Returns a promise.
 */
app.init = co.wrap((ctx, next) => {

   /**
    * create a global elasticsearch connection
    */
   if (!global.ESDB){
      global.ESDB = ES.connectService();
      debug("create global elastic db instance");
   };

   /**
    * create a global rabbitMQ connection
    */
   if (!global.RABBIT) {
     global.RABBIT = require('amqplib').connect('amqp://localhost');
     debug("create global rabbitmq db instance");
   }

   app.use(convert(cors({
      maxAge: config.app.hasOwnProperty("cacheTime") ? config.app.cacheTime / 1000 : 0,
      credentials: true,
      methods: 'GET, HEAD, OPTIONS, PUT, POST, DELETE',
      headers: 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
   })));

   /**
   *  a body parser base on co-body
   */
   app.use(convert(bodyParser()));

   /**  API router **/
    Router.get('/api', require('./mainCtrl').initialFetch);

    app
      .use(Router.routes())
      .use(Router.allowedMethods());

   // create http server and start listening for requests
   app.server = app.listen(config.app.port);
   if (config.app.env !== 'test') {
     console.log('server:app - APP listening on port ' + config.app.port);
   }
});

// auto init if this app is not being initialized by another module (i.e. using require('./app').init();)
if (!module.parent) {
  app.init();
  app.on('error', function(err){
     console.log(err.message);
  });
}




