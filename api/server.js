var users = require('./users');
var _ = require('lodash');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());

//options 
var permissionDef={
    'USER_ROLE':1,
    'ADMIN_ROLE':2,
    'SITE_OWNER_ROLE':4,
    'CATEGORY_WRITE':8,
    'CATEGORY_DELETE':16,
    'CATEGORY_DELETE':32

};
var acl ={
    '/category/*':{
        'GET':['ADMIN_ROLE'],
        'POST':['ADMIN_ROLE'],
        'PUT':[],
        'DELETE':[]
     },
      '/category/group/*':{
        'GET':['SITE_OWNER_ROLE','ADMIN_ROLE'],
        'POST':['ADMIN_ROLE'],
        'PUT':[],
        'DELETE':[]
     },
};
var options={
    expiresIn:320000,
    issuer:'urn:api:budget:acnonline.net',
   
};
var aclManger = require('jwt-acl-manager')('password',options,acl,permissionDef);


app.use(aclManger.accessController());

app.get('/', function (req, resp) {
    resp.send({ id: 1, message: "hello" },200);
});
app.get('/category', function (req, resp) {
    console.log(req);
    resp.send({ id: new Date().getTime(), message: "category access no id" },200);
});
app.get('/category/:id', function (req, resp) {
    console.log(req.route.path);
    //console.log(req);
    resp.send({ id: new Date().getTime(), message: "category access" },200);
});
app.get('/category/group/my', function (req, resp) {
 
    //console.log(req);
    resp.send({ id: new Date().getTime(), message: "category access group my" },200);
});
app.get('/list', function (req, resp) {
    resp.send({ id: new Date().getTime(), message: "un protected route" },200);
});

app.post('/login', function (req, resp) {
    var user = req.body;
    console.log(user);
    if (!user.userId || !user.password) {
        resp.status(400).send('bad request');
        return;
    }
    var u = users.findById(user.userId);

    if (!u || u.password !== user.password) {
        resp.status(401).send('invalid user/passwrd');
        return;
    }
    var payLoad = {
        sub: u.userId,
        loggedInAs: u.permission
    }
    aclManger.generateToken(payLoad).then(function (token) {
        resp.send({ userId: u.userId, auth_token: token });
    }).catch(function (e) {
        resp.status(500).send(e);

    });
});
var server = app.listen(4000, function (err) {
    if (err) {
        console.log(err);
        return;
    }
    console.log('server is listening on :', server.address().port);
});
