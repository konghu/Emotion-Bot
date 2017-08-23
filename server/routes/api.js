/**
 * Created by Kong on 5/28/2017.
 */
//module requires
const express = require('express');
const router = express.Router();
var watson = require('watson-developer-cloud');

var alchemy_language = watson.alchemy_language({
    api_key: '09ef628a49a9e8fa40b423583d3dccdecbfa7232'
});

router.post("/sentiment", function(req, response, next) {
    var parameters = req.body;
    alchemy_language.sentiment(parameters, function (err, res) {
        if (err) {
            response.send("this is sentiment analysis error" + err);
        }
        else{
            response.send(res)
        }
    })
});

router.post("/emotion", function(req, response, next) {
    var parameters = req.body;
    alchemy_language.emotion(parameters, function (err, res) {
        if (err) {
            response.send("this is emotion analysis error" + err);
        }
        else{
            response.send(res)
        }
    })
});

var language_translator = watson.language_translator({
    "url": "https://gateway.watsonplatform.net/language-translator/api",
    "username": "10befa91-cdd1-4345-974a-360748c9b40e",
    "password": "G2Sa18ndaoyI",
    version: 'v2'
});
language_translator.translate({
    text: 'hello',
    target: 'es',
}, function(err, translation) {
    if (err)
        console.log(err)
    else
        console.log(translation);
});

module.exports = router;