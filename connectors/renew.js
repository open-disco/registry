/*******************************************************
 * service: disco registry
 * module: register connector
 * Mike Amundsen (@mamund)
 *******************************************************/

// handles HTTP resource operations 
var registry = require('./../components/registry.js');
var utils = require('./utils.js');
var wstl = require('./../wstl.js');

var gTitle = "DISCO Registry";
var pathMatch = new RegExp('^\/renew\/.*','i');

var actions = [
  {name:"dashboard",href:"/",rel:["self", "home", "dashboard", "collection"]},
  {name:"registerLink",href:"/reg/",rel:["create-form", "register", "reglink"]},
  {name:"unregisterLink",href:"/unreg/",rel:["delete-form", "unregister", "unreglink"]},
  {name:"renewLink",href:"/renew/",rel:["edit-form", "renew", "renewlink"]},
  {name:"findLink",href:"/find/",rel:["search", "find", "findlink"]},
  {name:"bindLink",href:"/bind/",rel:["search", "bind", "bindlink"]},
  {name:"renewForm", href:"/renew/",rel:["edit-form", "renew", "renewform"]}
];

exports.path = pathMatch;
exports.run = main;

function main(req, res, parts, respond) {

  switch (req.method) {
  case 'GET':
    sendPage(req, res, respond);
    break;
  case 'POST':
  case 'PATCH':
    postRenew(req, res, respond);
    break;
  default:
    respond(req, res, utils.errorResponse(req, res, 'Method Not Allowed', 405));
    break;
  }
}

function postRenew(req, res, respond) {
  var body, doc, msg, contentType;

  contentType = req.headers["content-type"];
  body = '';

  // collect body
  req.on('data', function(chunk) {
    body += chunk;
  });

  // If there is no body, get the query string parameters;
  // maybe they were passed in there.
  if (!body) {
    q = req.url.split('?');
    if (q[1] !== undefined) {
      body = q[1];
      contentType = 'application/x-www-form-urlencoded';
    }
  }

  // process body
  req.on('end', function() {
    try {
      msg = utils.parseBody(body, contentType);
      msg.id = msg.registryID;
      msg.renewLastPing = new Date();
      doc = registry('update', msg.id, msg);
      
      if(doc && doc.type==='error') {
        doc = utils.errorResponse(req, res, doc.message, doc.code);
      }
    } 
    catch (ex) {
      doc = utils.errorResponse(req, res, 'Server Error', 500);
    }

    respond(req, res, {code:301, doc:(!doc?"":doc), 
      headers:{'location':'//'+req.headers.host+"/find/?registryID="+msg.id}
    });
  });
}

function sendPage(req, res, respond) {
  var doc, coll, root, data, related, content;

  root = 'http://'+req.headers.host;
  coll = [];
  data = [];
  related = {};
  content = "";

  // append current root and load actions
  for(var i=0,x=actions.length;i<x;i++) {
    actions[i].root = root;
    coll = wstl.append(actions[i],coll);
  }    
  
  content =  '<div>';
  content += '<h2>Renew a Service</h2>';
  content += '</div>';
  
  // compose graph 
  doc = {};
  doc.title = gTitle;
  doc.data =  data;
  doc.actions = coll;
  doc.content = content;
  doc.related = related;

  // send the graph
  respond(req, res, {
    code : 200,
    doc : {
      disco : doc
    }
  });
  
}

// EOF

