var _ = require('lodash');

var users=[
    {
        userId:'arangan',
        displayName:'Aranga',
        permission:2,
        password:'password'
    },
    {
        userId:'nirashau',
         displayName:'Nirasha',
        permission:1,
        password:'password'
    },
];

function findById(id){
    var user = null;
    _.each(users,function(v){
        if (v.userId === id){
            user = v;
        }
    });
    return user;
}

module.exports ={
    allUser:function(){
        return users;
    },
    findById:findById
};