'use strict';

let moment = require('moment');
let DATE_ES_FORMAT = 'YYYY-MM-DD HH:mm:ss';

let recieveTrackingCtrl = {
  /**
   * main function to store/update bag tracking info
   * @param  {object}   ctx  [server main object]
   * @param  {Function} next
   * @return {string}        [json result]
   */
  storeTrackingInfo: async function (ctx, next) {
    console.time('storeTrackingInfo');
    let postParams = ctx.request.body;
    let arrangeRes = await recieveTrackingCtrl.arrangeTrackingStructure(postParams);

    let optionalFn = arrangeRes['rest'] ? 'updateExistTracking' : 'createNewTracking';
    let elasticRes = await recieveTrackingCtrl[optionalFn](arrangeRes['obj']);
    ctx.status = 200;
    ctx.set('Content-Type', 'application/json');
    if (!elasticRes.created) return ctx.body = {status: 'elasticsearch connectivity'};

    let queueMsg = recieveTrackingCtrl.queueTrackingMsg(arrangeRes['rest'], elasticRes);
    ctx.body = { status: 'ok' };
    console.timeEnd('storeTrackingInfo');
  },

  /**
   * check if bag id exist on DB
   * @param  {string} id [bag id]
   * @return {boolean}
   */
  checkExist: function (id) {
    return new Promise(function (resolve, reject) {
        global.ESDB.searchExists({
            index: 'bags_tracking',
            type: "tracking_info",
            id : id
        }, function(err, response, status){
            if(response == undefined) reject(err);
            resolve(response.exists);
        });
    })
  },

  /**
   * arrange tracking elasticsearch structure according to result (update || create)
   * @param  {object} trackingInfo, post params
   * @return {object} elasticsearch object
   */
  arrangeTrackingStructure: async function (trackingInfo) {
    let trackExist = await recieveTrackingCtrl.checkExist(trackingInfo['id']);
    let now = new Date();

    let elasticObj = {
      index: 'bags_tracking',
      type: 'tracking_info',
      id: trackingInfo['id']
    }
    let trackingObj = {
      bag_id: trackingInfo['id'],
      location_lng: trackingInfo['lng'],
      location_lat: trackingInfo['lat'],
      updated_date: moment(now).format(DATE_ES_FORMAT),
      status: trackingInfo['status'],
    }
    if(!trackExist) {
      trackingObj['created_date'] = moment(now).format(DATE_ES_FORMAT);
      trackingObj['remarks'] = trackingInfo.hasOwnProperty('i') ? trackingObj['i'] : '';
      elasticObj['body'] = trackingObj;
    }else{
      if(trackingInfo.hasOwnProperty('i')) trackingObj['remarks'] = trackingInfo['i'];
      elasticObj['body'] = { doc : trackingObj };
    }
    return {rest: trackExist, obj: elasticObj};
  },

  /**
   * elasticsearch update bags_tracking
   * @param  {object} trackingObj
   * @return {object} db results
   */
  updateExistTracking: function (trackingObj) {
    return new Promise(function (resolve, reject) {
      global.ESDB.update(trackingObj, function (error, response) {
         if(error) reject(error);

         resolve({id: response["_id"], created: response["_shards"]["successful"]})
      });
    });
  },

  /**
   * elasticsearch create new document for new bag id
   * @param  {object} trackingObj
   * @return {object} db results
   */
  createNewTracking: function (trackingObj) {
    console.log(trackingObj);
    return new Promise(function (resolve, reject) {
      global.ESDB.create(trackingObj, function (error, response){
        if(error) reject(error);

        resolve({id: response["_id"], created: response["created"]})
      });
    });
  },

  /**
   * create new tracking queue
   * @param  {boolean} indication for db action: update || create
   * @param  {object} elasticRes
   * @return {console} inside log for queue results
   */
  queueTrackingMsg: function (existParam, elasticRes) {
    let q = 'trackingQueue';
    let msg = recieveTrackingCtrl.arrangeQueueMsg(existParam, elasticRes);

    global.RABBIT.then(function(conn) {
      return conn.createChannel();
    }).then(function(ch) {
      return ch.assertQueue(q).then(function(ok) {
        console.log(ok);
        ch.sendToQueue(q, new Buffer(msg));
        return ch.close();
      });
    }).catch(console.warn);
  },

  /**
   * build queue string
   * @param  {boolean} indication for db action: update || create
   * @param  {object} elasticRes
   * @return {string} queue message
   */
  arrangeQueueMsg: function (existParam, elasticRes) {
    let restOp = existParam ? 'update' : 'create';
    return JSON.stringify({id: elasticRes.id, msg: `Tracking has been ${restOp} for bag id ${elasticRes.id}`})
  }
}

module.exports = recieveTrackingCtrl;
