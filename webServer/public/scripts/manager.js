const mqttIPServer = "localhost";

var client;

var textArea;

function load() { //funcion llamada despues de cargar la pagina

    textArea = document.getElementById('textArea');

    client = mqtt.connect('mqtt://' + mqttIPServer + ':3000');

    client.on('connect', () => {
        console.log('cliente Web conectado');
        textArea.value += 'cliente Web conectado\n';
        client.subscribe('web/messages');
    });

    client.on('message', (topic, message) => {
        message = message.toString('utf8');
        switch (topic) {
            case 'web/messages':
                handleServerMessage(message);
                break;
        }
    });
}

//Commandos
function activar() {
    client.publish('server/web', 'A1');
}

function desactivar() {
    client.publish('server/web', 'A0');
}

function silenciar(){
    client.publish('server/web', 'C0');
}

function getEstado(){
    client.publish('server/web', 'estado');
}

//
function handleServerMessage(msg) {
    textArea.value += "\n" + msg + "\n";
}

window.onbeforeunload = function reset() {
    textArea.value = "";
}