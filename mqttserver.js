'use strict';

const mqtt = require('mqtt');
const Email = require('./Email');
var ping = require('ping');

var espinoClients = [];
var hostAvisados = [];
var serverClient;
var email;

var msg;
var alert;

class MqttServer {

    constructor(mqttIPServer) {
        serverClient = mqtt.connect('mqtt://' + mqttIPServer);

        serverClient.on('connect', () => {
            console.log('serverClient Server conectado');
            serverClient.subscribe('server/clients');
            serverClient.subscribe('server/espino');
            serverClient.subscribe('server/web');
            serverClient.subscribe('server/bot');
        });

        serverClient.on('message', (topic, message) => {
            message = message.toString('utf8');
            switch (topic) {
                case 'server/clients':
                    this.handleESPINOClients(message);
                    break;
                case 'server/espino':
                    this.handleESPINOMessage(message);
                    break;
                case 'server/web':
                    this.handleWebMessage(message);
                    break;
                case 'server/bot':
                    this.handleBotMessage(message);
                    break;
            }
        });

        email = new Email();

        var t = setInterval(this.verificarConexion, 5000);
    }

    //Añade los clientes espinos en un arreglo
    handleESPINOClients(message) {
        console.log('Cliente ESPino: ' + message);
        for (let ec of espinoClients) {
            if (ec === message) {
                console.log('El cliente ya se encuentra registrado');
                return;
            }
        }
        espinoClients.push(message);
    }

    //Manejo de mensajes recibidos desde ESPino
    handleESPINOMessage(message) {
        console.log('Mensaje desde ESPino: ' + message);

        if (message === "MS Detection" || message === "PIR Detection") {
            email.sendMail(message);
        }
        serverClient.publish('web/messages', message);
        serverClient.publish('bot/messages', message);
    }

    //Manejo de mensajes recibidos desde la pagina Web
    handleWebMessage(message) {
        console.log('Mensaje desde Web: ' + message);
        if (message === 'estado'){
            this.verificarEstado();
            return;
        }
        serverClient.publish('Espino/commands', message);
    }

    //Manejo de mensajes recibidos desde el Bot Telegram
    handleBotMessage(message) {
        console.log('Mensaje desde TelegramBot: ' + message);
        if (message === 'estado'){
            this.verificarEstado();
            return;
        }
        serverClient.publish('Espino/commands', message);
    }

    //Verificado el estado de cada cliente espino registrado
    verificarEstado() {
        espinoClients.forEach((host) => {
            ping.sys.probe(host, (isAlive) => {
                msg = isAlive ? 'host ' + host + ' esta conectado' : 'host ' + host + ' no esta conectado';
                console.log(msg);
                serverClient.publish('web/messages', msg);
                serverClient.publish('bot/messages', msg);
                serverClient.publish('Espino/' + host, 'C1');
            });
        });
    }

    //verifica la conexion con los clientes para detectar la perdida de conexion de alguno
    verificarConexion() {
        if (espinoClients.length != 0) {
            espinoClients.forEach((host) => {
                ping.sys.probe(host, (isAlive) => {
                    if (!isAlive) { //Si algun cliente espino esta desconectado, se manda notificacion
                        var i;
                        for (i = 0; i < hostAvisados.length; i++) {
                            if (hostAvisados[i] === host) {
                                return;
                            }
                        }
                        alert = 'host ' + host + ' no esta conectado';
                        console.log(alert);
                        serverClient.publish('web/messages', alert);
                        serverClient.publish('bot/messages', alert);
                        email.sendMail(alert);
                        hostAvisados.push(host);
                    } else {
                        var i;
                        for (i = 0; i < hostAvisados.length; i++) {
                            if (hostAvisados[i] === host) {
                                hostAvisados[i] = '';
                            }
                        }
                    }
                });
            });
        }
    }

    /*
    isHostContained(host) {
        var i;
        for (i = 0; i < hostAvisados.length; i++) {
            if (hostAvisados[i] === host) {
                return true;
            }
        }
        return false;
    }*/
}

module.exports = MqttServer;