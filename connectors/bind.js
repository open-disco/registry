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
    //try {
      msg = utils.parseBody(body, contentType);
      if(msg.sourceRegID && msg.targetRegID) {
        var dt = new Date();
        var token = config.registryKey + ":"+msg.sourceRegID+":"+msg.targetRegID+":"+dt.toUTCString();
        msg.registryKey = config.registryKey;
        msg.bindToken = "simple:"+Buffer.from(token).toString('base64');
        doc = binding('add',msg);
        console.log(token);
        console.log(doc);
        console.log(Buffer.from(msg.bindToken.substring(7),'base64').toString('ascii'));
      }
      else {
        doc = {};
        doc.type="error"
        doc.message="Not Found";
        doc.code = 404;
      }
      if(doc && doc.type==='error') {
        doc = utils.errorResponse(req, res, doc.message, doc.code);
      }
    //} 
    //catch (ex) {
    //  doc = utils.errorResponse(req, res, 'Server Error', 500);
   //}

    var responseCode, responseDoc, responseHeaders;

    responseCode = 302;
    if (doc.hasOwnProperty('code')) {
        responseCode = doc.code;
    }

    responseDoc = doc;
    if (doc.hasOwnProperty('doc')) {
        responseDoc = doc.doc;
    }

    responseHeaders = {
      'location' : '//' + req.headers.host + '/bind/?registryID=' + doc.registryID
    };

    if (responseCode !== 302) {
      responseHeaders = {};
    }

    respond(req, res, {
      code: responseCode,
      doc: responseDoc,
      headers: responseHeaders
    });
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

