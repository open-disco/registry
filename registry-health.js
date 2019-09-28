/**************************************
  registry-health.js
  runs health checks against services  
**************************************/

module.exports = main;

var http = require('http');

var defaultHealthTTL = 300000;
var defaultRenewTTL = 600000;
var registry = null;
var config = null;


// run healthchecks
function main(args) {
  var i, x, list;

  registry = args.registry;
  config = args.config
  
  console.log('healthChecks');

  list = registry('list');
  if(list) {
    for(i=0,x=list.length;i<x;i++) {
      // does this service define a healthURL?
      if(list[i].healthURL && list[i].healthURL!=="") {
        
        ping = (
          list[i].healthLastPing && 
          list[i].healthLastPing!==''?list[i].healthLastPing:list[i].dateUpdated
        );
        d = new Date(ping);
        d.setTime(d.getTime() + parseInt(config.healthTTL||defaultHealthTTL));
        t = new Date();
        if(t>d) {
          healthPing(list[i],healthErr,healthSuccess);
        }  
      }
    }
  }
}

// handle the actual health ping
function healthPing(service, errFunc, successFunc) {

  // run a request against the provided healthURL
  http.get(service.healthURL, function(rsp) {
    rsp.setEncoding('utf8');
    var body = '';
    rsp.on("data", function(data){body += data});
    rsp.on("end", function() {
      if(successFunc) {
        successFunc(service);
      }
    });
  }).on("error", function(e) {
    if(errFunc) {
      errFunc(service);
    }
  }); 
}

// update the service record
function healthSuccess(service) {
  var item;
    
  try {
    item = registry('read',service.registryID);
    if(item) {
      item.healthLastPing = new Date();
      registry('update', service.registryID, item);
    }
  } catch(e) {}
}

// unable to get healthcheck, remove it
function healthErr(service) {

  try {
    registry('remove',service.registryID);
    console.log('removed (healthErr): ' + service.registryID + ' -- ' + service.serviceURL);
  } catch(e) {}
}

