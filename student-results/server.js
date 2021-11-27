const express = require('express');
const app = express();
const logger = require('morgan');
const fs = require('fs');
const mongoose = require('mongoose');
const router = express.Router();
const routes = require('./app/routes/api.js')(router);
const bodyParser = require('body-parser');
const path = require('path');
const socialLogin = require('./app/passport/passport.js')(app, passport);
const passport = require('passport');

// var autoIncrement = require('mongoose-auto-increment');

//middleware
app.use(logger('dev'));
app.use(logger('common', {stream: fs.createWriteStream('./access.log', {flags: 'a'})}));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true}));
app.use(express.static(__dirname + '/public'));
app.use('/api',routes);

mongoose.connect('mongodb+srv://student_results:vdeyyBGERVy42WIm@cluster0.mbzjk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', function(err){
    if(err){
        console.log('Connection to DB failed');
    }else{
        console.log('Connection to Database Successful');        
    }
});
    
// Routes
app.get('*', function(req, res, err){
    res.sendFile(path.join(__dirname + "/public/app/views/index.html"));
});

var server = app.listen(process.env.PORT || 3100, function(){
    var port = this.address().port;
    console.log ('App server listening on port ' + port);
});
