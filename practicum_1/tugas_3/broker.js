const { Aedes } = require('aedes');
const net = require('net');
const http = require('http');
const ws = require('ws');

const broker_port = 1883;
const websocket_port = 8883;

async function startBroker() {
  try {
    const aedes = await Aedes.createBroker();

    const broker = net.createServer(aedes.handle);
    broker.listen(broker_port, function () {
      console.log('MQTT broker started and listening on port ', broker_port);
    });

    const httpServer = http.createServer();
    const wss = new ws.WebSocketServer({ server: httpServer });
    wss.on('connection', (socket) => {
      const stream = ws.createWebSocketStream(socket);
      aedes.handle(stream);
    });
    httpServer.listen(websocket_port, function () {
      console.log('Aedes MQTT-WS listening on port: ' + websocket_port);
    });

  } catch (error) {
    console.error('Failed to start the MQTT broker:', error);
  }
}

startBroker();