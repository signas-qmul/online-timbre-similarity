const express = require('express');
const mongodb = require('mongodb');

const app = express();
app.use(express.static('client'));

console.log(process.env.NODE_ENV);
var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
});
