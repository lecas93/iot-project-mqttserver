'use strict';

// importar
var express = require('express');

class WebServer {
    constructor() {
        // instanciar
        var app = express();

        app.use('/', express.static(__dirname + '/public'));

        // ruteo
        app.get('/', function (req, res) {
            res.sendFile(__dirname + '/public/index.html');
        });
        app.get('/about', function (req, res) {
            res.sendFile(__dirname + '/public/about.html');
        });

        // escuchar
        app.listen(9000);

        console.log("Servidor Express escuchando en modo %s", app.settings.env);
    }
}

module.exports = WebServer;