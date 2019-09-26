/****************************************
  registry-renewals.js
  renews any registered services
****************************************/

module.exports = main;

var http = require('http');

var defaultHealthTTL = 300000;
var defaultRenewTTL = 600000;
var registry = null;
var config = null;

// handle evicting bad entries
function main(args) {
  var i,x,list;

  registry = args.registry;
  config = args.config;

  console.log('renewalChecks');
  
  list = registry('list');
  if(list) {
    for (i=0,x=list.length;i<x;i++) {
      // check for expired renewals
      if(list[i].renewTTL!=='') {
        d = new Date(list[i].renewLastPing||list[i].dateCreated);
        t = new Date();
        d.setTime(d.getTime() + parseInt(list[i].renewTTL));
        if(t>d) {
          registry('remove',list[i].registryID);
          console.log('removed (expired): '+list[i].registryID + ' -- ' + list[i].serviceURL);
        }
      }
      // unable to renew or health-check
      if((!list[i].renewTTL || list[i].renewTTL==='') && (!list[i].healthURL || list[i].healthURL==='')) {
         registry('remove',list[i].registryID);
         console.log('removed (invalid): '+list[i].registryID + ' -- ' + list[i].serviceURL);
       }
    }
  }
}

