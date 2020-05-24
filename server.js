const express = require('express');
const body_parser = require('body-parser');
const mongodb = require('mongodb');
const experiment_spec = require('./experiment_spec');

const app = express();
app.use(body_parser.json());
app.use(express.static('client'));

console.log(process.env.NODE_ENV);
var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
});

app.get('/api/get-experiment-spec', function(req, res) {
    const spec = experiment_spec.create();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end(JSON.stringify(spec));
});

app.post('/api/store-experiment-data', function(req, res) {
    console.log(req.body);
    res.sendStatus(200);
});