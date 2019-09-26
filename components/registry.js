/*`******************************************************
 * DISCO - Discover service
 * registry middleware component (server)
 * Mike Amundsen (@mamund)
 *******************************************************/

var storage = require('./../simple-storage.js');
var utils = require('./../connectors/utils.js');

module.exports = main;

// app-level actions for tasks
function main(action, args1, args2, args3) {
  var name, rtn, props;

  elm = 'disco';
    
  props = [
    "registryID",
    "serviceURL",
    "serviceName",
    "semanticProfile",
    "requestMediaType",
    "responseMediaType",
    "healthURL",
    "healthTTL",
    "healthLastPing",
    "renewTTL",
    "renewLastPing",
    "tags",
    "dateCreated",
    "dateUpdated"
  ];
  reqd = [
    "serviceURL",
    "serviceName"
  ];

  switch (action) {
    case 'exists':
      rtn = (storage({object:elm, action:'item', id:args1})===null?false:true);
      break;
    case 'props' :
      rtn = utils.setProps(args1,props);
      break;  
    case 'profile':
      rtn = profile;
      break;
    case 'list':
      rtn = utils.cleanList(storage({object:elm, action:'list'}));
      break;
    case 'read':
      rtn = utils.cleanList(storage({object:elm, action:'item', id:args1}));
      break;
    case 'filter':
      rtn = utils.cleanList(storage({object:elm, action:'filter', filter:args1}));
      break;
    case 'add':
      rtn = addEntry(elm, args1, props);
      break;
    case 'update':
      rtn = updateEntry(elm, args1, args2, props);
      break;
    case 'remove':
      rtn = removeEntry(elm, args1, args2, props);
      break;
    default:
      rtn = null;
      break;
  }
  return rtn;
}

function addEntry(elm, entry, props) {
  var rtn, item, error;
  
  item = {}
  for(i=0,x=props.length;i<x;i++) {
    if(props[i]!=="registryID") {
      item[props[i]] = (entry[props[i]]||"");
    }
  }

  error = "";
  for(i=0,x=reqd.length;i<x;i++) {
    if(item[reqd[i]]==="") {
      error += "Missing "+ reqd[i] + " ";
    }
  }

  if(error.length!==0) {
    rtn = utils.exception(error);
  }
  else {
    rtn = storage(
      {
        object:elm, 
        action:'add', 
        item:utils.setProps(item,props)
      }
    );
  }
  
  return rtn;
}

function updateEntry(elm, id, entry, props) {
  var rtn, check, item, error;

  check = storage({object:elm, action:'item', id:id});  
  if(check===null) {
    rtn = utils.exception("File Not Found", "No record on file", 404);
  }
  else {
    item = check;
    for(i=0,x=props.length; i<x; i++) {
      if(props[i]!=="registryID") {
        item[props[i]] = (entry[props[i]]===undefined?check[props[i]]:entry[props[i]]);
      }
    }
   
    error = "";
    for(i=0,x=reqd.length;i<x;i++) {
      if(item[reqd[i]]==="") {
        error += "Missing "+ reqd[i] + " ";
      }
    }
     
    if(error!=="") {
      rtn = utils.exception(error);
    } 
    else {
      rtn = storage(
        {
          object:elm, 
          action:'update', 
          id:id, 
          item:utils.setProps(item, props)
        }
      );
    }
  }
  
  return rtn;
}

function removeEntry(elm, id) {
  var rtn, check;
  
  check = storage({object:elm, action:'item', id:id});
  if(check===null) {
    rtn = utils.exception("File Not Found", "No record on file", 404);
  }
  else {
    storage({object:elm, action:'remove', id:id});
  }
  
  return rtn;
  
}
// EOF

