'use strict';

const MQTTSERVER = require('./mqttserver');
const Bot = require('./Bot');
const WebServer = require('./webServer/WebServer');

const mqttIPServer = "localhost";

//Se inician los servicios
const myServer = new MQTTSERVER(mqttIPServer);
const bot = new Bot(mqttIPServer);
const webServer = new WebServer();