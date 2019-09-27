/*******************************************************
 * service: disco registry
 * module: bind another service
 * Mike Amundsen (@mamund)
 *******************************************************/

// handles HTTP resource operations 
var registry = require('./../components/registry.js');
var binding = require('./../components/binding.js');
var utils = require('./utils.js');
var wstl = require('./../wstl.js');
var config = require('./../config.js');

var gTitle = "DISCO Registry";
var pathMatch = new RegExp('^\/bind\/.*','i');

var actions = [
  {name:"dashboard",href:"/",rel:["self", "home", "dashboard", "collection"]},
  {name:"registerLink",href:"/reg/",rel:["create-form", "register", "reglink"]},
  {name:"unregisterLink",href:"/unreg/",rel:["delete-form", "unregister", "unreglink"]},
  {name:"renewLink",href:"/renew/",rel:["edit-form", "renew", "renewlink"]},
  {name:"findLink",href:"/find/",rel:["search", "find", "findlink"]},
  {name:"bindLink",href:"/bind/",rel:["search", "bind", "bindlink"]},
  {name:"bindForm", href:"/bind/",rel:["edit-form", "bind", "bindform"]}
];


exports.path = pathMatch;
exports.run = main;

function main(req, res, parts, respond) {

  switch (req.method) {
  case 'GET':
    sendPage(req, res, respond, utils.getQArgs(req));
    break;
  case 'POST':
    postBind(req, res, respond);
    break;
  default:
    respond(req, res, utils.errorResponse(req, res, 'Method Not Allowed', 405));
    break;
  }
}

function postBind(req, res, respond) {
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
      var dt = new Date();
      var token = config.registryKey + ":"+msg.sourceRegistryID+":"+msg.targetRegistryID+":"+dt.toUTCString();
      msg.registryKey = config.registryKey;
      msg.bindToken = "simple:"+Buffer.from(token).toString('base64');
      doc = binding('add',msg);
      if(doc && doc.type==='error') {
        doc = utils.errorResponse(req, res, doc.message, doc.code);
      }
    }
    catch (ex) {
      doc = utils.errorResponse(req, res, 'Server Error', 500);
    }

    if (!doc) {
      respond(req, res, {code:302, doc:'',
        headers:{'location':'//'+req.headers.host+'/'}
      });
    } else {
      var statusCode = 302;
      var headers = {};
      if (req.headers['accept'] === 'application/json') {
        statusCode = 201;
      }
      if (doc.hasOwnProperty('code')) {
        statusCode = doc.code;
      }
      if (doc.hasOwnProperty('registryID')) {
        doc = {
          bind: [doc]
        };
        headers = {
          'location': '//' + req.headers.host + '/bind/?registryID=' + doc.bind[0].registryID
        };
      }
      respond(req, res, {code:statusCode, doc:doc, headers:headers});
    }
  });
}

function sendPage(req, res, respond, args) {
  var doc, coll, root, data, related, content;

  root = 'http://'+req.headers.host;
  coll = [];
  data = (args?binding('filter',args):binding('list'));
  related = {};
  content = "";
  
  // append current root and load actions
  for(var i=0,x=actions.length;i<x;i++) {
    actions[i].root = root;
    coll = wstl.append(actions[i],coll);
  }
  
  content =  '<div>';
  content += '<h2>Bind a Service</h2>';
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
      bind : doc
    }
  });
  
}

// EOF

