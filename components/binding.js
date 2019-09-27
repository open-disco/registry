/*******************************************************
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

  elm = 'bind';
    
  props = [
    "registryID",
    "registryURL",
    "registryKey",
    "sourceRegID",
    "targetRegID",
    "bindToken",
    "dateCreated",
    "dateUpdated"
  ];

  switch (action) {
    case 'exists':
      rtn = (storage(elm, 'item', args1)===null?false:true);
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
  
  error = "";
  
  item = {}
  item.registryKey = (entry.registryKey||"");
  item.sourceRegID = (entry.sourceRegID||"");
  item.targetRegID = (entry.targetRegID||"");
  item.bindToken = (entry.bindToken||"");
  
  if(item.registryKey === "") {
    error += "Missing registryKey ";
  }
  if(item.sourceRegID === "") {
    error += "Missing sourceRegID ";
  } 
  if(item.targetRegID === "") {
    error += "Missing targetRegID ";
  } 
  
  if(error.length!==0) {
    rtn = utils.exception(error);
  }
  else {
    checkSource = storage({object:'disco', action:'item', id:item.sourceRegID});
    checkTarget = storage({object:'disco', action:'item', id:item.targetRegID});
    if(checkSource===null || (checkSource.hasOwnProperty('type') && checkSource.type === 'error')) {
      rtn = utils.exception("File Not Found", "No record on file for sourceRegID=" + item.sourceRegID, 404);
    } else if(checkTarget===null || (checkTarget.hasOwnProperty('type') && checkTarget.type === 'error')) {
      rtn = utils.exception("File Not Found", "No record on file for targetRegID=" + item.targetRegID, 404);
    } else {
      rtn = storage({object:elm, action:'add', item:utils.setProps(item,props)});
    }
  }
  
  return rtn;
}

function updateEntry(elm, id, entry, props) {
  return utils.exception("Unsupported");
}

function removeEntry(elm, id) {
  var rtn, check;
  
  check = storage({object:elm, action:'item', id:id});
  if(check===null) {
    rtn = utils.exception("File Not Found", "No record on file", 404);
  }
  else {
    rtn = storage({object:elm, action:'remove', id:id});
  }
  
  return rtn;
  
}
// EOF

