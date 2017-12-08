'use strict';

var TelegramBot = require('node-telegram-bot-api');
var config = require('./config.json');
var mqtt = require('mqtt');

var mqttclient;
var bot;

var chatID = config.chatID;
var prefix = config.prefix;

class Bot {
    constructor(mqttIPServer) {
        bot = new TelegramBot(config.token, { polling: true });
        bot.on('text', this.handleBotCommands);

        mqttclient = mqtt.connect('mqtt://' + mqttIPServer);

        mqttclient.on('connect', () => {
            console.log('cliente Bot conectado');
            mqttclient.subscribe('bot/messages');
        });

        mqttclient.on('message', (topic, message) => {
            message = message.toString('utf8');
            switch (topic) {
                case 'bot/messages':
                    this.handleServerMessage(message);
                    break;
            }
        });
    }

    //procesar comandos enviados desde telegram
    handleBotCommands(msg) {
        var chatId = msg.chat.id;

        /*
        if (msg.text.indexOf(prefix) > -1) {
            console.log("Comando recibido: " + msg.text);
        } else {
            console.log("Texto recibido: " + msg.text);
        }
        */

        console.log("Bot - Mensaje recibido: " + msg.text);

        if (msg.text === "activar") {
            mqttclient.publish("server/bot", "A1");
        }

        if (msg.text === "desactivar") {
            mqttclient.publish("server/bot", "A0");
        }

        if (msg.text === "silenciar") {
            mqttclient.publish("server/bot", "C0");
        }

        if (msg.text === "estado") {
            mqttclient.publish("server/bot", "estado");
        }
    }

    //procesar mensajes recibidos del servidor
    handleServerMessage(msg) {
        bot.sendMessage(chatID, msg);
    }
}

module.exports = Bot;