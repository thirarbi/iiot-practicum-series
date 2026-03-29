const { Aedes } = require('aedes');
const net = require('net');

async function startBroker() {
  try {
    // Initialize the broker asynchronously
    const aedes = await Aedes.createBroker();
    const broker = net.createServer(aedes.handle);
    const broker_port = 1883;

    broker.listen(broker_port, function () {
      console.log('MQTT broker started and listening on port ', broker_port);
    });
    
  } catch (error) {
    console.error('Failed to start the MQTT broker:', error);
  }
}

// Execute the async function
startBroker();