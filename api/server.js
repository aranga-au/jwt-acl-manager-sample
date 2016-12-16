var users = require('./users');
var _ = require('lodash');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());

//options 
var permissionDef={
    'USER_ROLE':1,
    'ADMIN_ROLE':32,
    'SITE_OWNER_ROLE':4,
    'CATEGORY_WRITE':8,
    'CATEGORY_DELETE':16

};
var acl ={
    '/category':{
        'GET':['USER_ROLE','ADMIN_ROLE'],
        'POST':['ADMIN_ROLE'],
        'PUT':[],
        'DELETE':[]
     },
    '/category/{id}':{
        'GET':['USER_ROLE','ADMIN_ROLE'],
        'POST':[],
        'PUT':['ADMIN_ROLE','CATEGORY_WRITE'],
        'DELETE':['ADMIN']
     },
    
};
var options={
    expiresIn:320000,
    issuer:'urn:api:budget:acnonline.net',
   
};
var aclManger = require('jwt-acl-manager')('password',options,acl,permissionDef);

app.use(function(req,res,next){
 console.log(req.originalUrl);
 req.resource =   req.originalUrl;
 next();
});

app.use(aclManger.accessController);

app.get('/', function (req, resp) {
    resp.send({ id: 1, message: "hello" });
});
app.get('/category', function (req, resp) {
    resp.send({ id: new Date().getTime(), message: "category access" },200);
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
        resp.send({ userId: u.userId, token: token });
    }).catch(function (e) {
        resp.status(500).send(e);

    });
});
var server = app.listen(4000, function (err) {
    if (err) {
        console.log(err);
        return;
    }
    console.log('server is running on :', server.address().port);
});
