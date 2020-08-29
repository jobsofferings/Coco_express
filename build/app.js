"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var app = express();
var port = 4396;
app.get('/', function (req, res, next) {
    next(404);
});
app.listen(port, function () {
    console.log("listening on port " + port + "!");
});
