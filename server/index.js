/**
 * Created by Kong on 5/28/2017.
 */

//module requires
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

//set up app
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

app.set('port', (process.env.PORT || 5000));

//initialize routes
app.use('/api', require('./routes/api'));

//error handling middleware
app.use(function(err, req, res, next){
    // console.log(err);
    res.status(400).send({error: err})
});

//listen for requests
app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});
