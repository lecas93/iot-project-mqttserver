'use strict';

const nodemailer = require('nodemailer');
var config = require('./config.json');

var transporter;

var mailOptions = {
    from: config.emailUser,
    to: config.emailUser,
    subject: 'Aviso de Actividad ESPino',
    text: ''
};

class Email {
    constructor() {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: config.emailUser,
                pass: config.emailPass
            }
        });
    }

    sendMail(message) {
        mailOptions.text = message;
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email enviado: ' + info.response);
            }
        });
    }
}

module.exports = Email;