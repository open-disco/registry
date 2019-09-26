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
var pathMatch = new RegExp('^\/reg\/.*','i');

var actions = [
  {name:"dashboard",href:"/",rel:["self", "home", "dashboard", "collection"]},
  {name:"registerLink",href:"/reg/",rel:["create-form", "register", "reglink"]},
  {name:"unregisterLink",href:"/unreg/",rel:["delete-form", "unregister", "unreglink"]},
  {name:"renewLink",href:"/renew/",rel:["edit-form", "renew", "renewlink"]},
  {name:"findLink",href:"/find/",rel:["search", "find", "findlink"]},
  {name:"bindLink",href:"/bind/",rel:["search", "bind", "bindlink"]},
  {name:"registerForm", href:"/reg/",rel:["create-form", "register", "regform"]}
];

exports.path = pathMatch;
exports.run = main;

function main(req, res, parts, respond) {

  switch (req.method) {
  case 'GET':
    sendPage(req, res, respond);
    break;
  case 'POST':
    acceptEntry(req, res, respond);
    break;  
  default:
    respond(req, res, utils.errorResponse(req, res, 'Method Not Allowed', 405));
    break;
  }
}

function acceptEntry(req, res, respond) {
  var body, doc, msg;

  body = '';
  
  // collect body
  req.on('data', function(chunk) {
    body += chunk;
  });

  // process body
  req.on('end', function() {
    try {
      msg = utils.parseBody(body, req.headers["content-type"]);
      doc = registry('add', msg);
      if(doc && doc.type==='error') {
        doc = utils.errorResponse(req, res, doc.message, doc.code);
      }
    } 
    catch (ex) {
      doc = utils.errorResponse(req, res, 'Server Error', 500);
    }

    if (!doc) {
      respond(req, res, {code:301, doc:"", 
        headers:{'location':'//'+req.headers.host+"/"}
      });
    } 
    else {
      respond(req, res, {code:301, doc:doc, 
        headers:{'location':'//'+req.headers.host+"/find/?registryID="+doc.registryID}
      });
    }
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
  content += '<h2>Register a Service</h2>';
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

