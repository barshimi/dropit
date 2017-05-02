'use strict';

let mainCtrl = {

  initialFetch: async function (ctx, next) {
    console.time('initialFetch');
    let fetchRes = await Promise.all([mainCtrl.fetchTrackingData(), mainCtrl.fetchLogsData()]);
    console.log(fetchRes);
    ctx.set('Content-Type', 'application/json');
    ctx.status = 200;
    ctx.body = JSON.stringify({tracking: fetchRes[0], logs: fetchRes[1]});
    console.timeEnd('initialFetch');
  },

  fetchTrackingData: function () {
    return new Promise(function (resolve, reject) {
      global.ESDB.search({
        index: 'bags_tracking',
        type: 'tracking_info',
        size: 100
      }, function(err, response, status){
        if(err) reject(err);
        if(!response || response.hits.total == 0) return resolve([]);

        resolve(response.hits.hits);
      });
    });
  },

  fetchLogsData: function () {
    return new Promise(function (resolve, reject) {
      global.ESDB.search({
        index: 'sys_logs',
        type: 'logs_bucket',
        size: 100
      }, function(err, response, status){
        if(err) reject(err);
        if(!response || response.hits.total == 0) return resolve([]);
        console.log(response);

        resolve(response.hits.hits);
      });
    });
  }
};

module.exports = mainCtrl;
