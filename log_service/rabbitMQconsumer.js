'use strict';

let moment = require('moment');

/**
 * rabbitMQ consumer for tracking queues
 */
module.exports = (function () {
  let q = 'trackingQueue';

  /**
   * fetch queue and convert it to log doc in DB
   * @param  {object} msg
   * @param  {object} ch
   * @return {console} inside log for action
   */
  function insertQmsg(msg, ch) {
    let msgObj = JSON.parse(msg.content.toString());

    global.ESDB.create({
      index: 'sys_logs',
      type: 'logs_bucket',
      body : {
        log_type: 'tracking',
        log_msg: msgObj.msg,
        created_date: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      }
    }, function (error, response){
      if(error) reject(error);
      console.log(JSON.stringify({id: response["_id"], created: response["created"]}));
      if(response["created"]) ch.ack(msg);
    });
  }

  global.RABBIT.then(function(conn) {
    return conn.createChannel();
  }).then(function(ch) {
    return ch.assertQueue(q).then(function(ok) {
      return ch.consume(q, function(msg) {
        if (msg !== null) {
          insertQmsg(msg, ch);
        }
      });
    });
  }).catch(console.warn);
})();
