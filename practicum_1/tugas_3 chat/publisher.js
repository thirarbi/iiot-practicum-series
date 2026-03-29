const mqtt = require('mqtt');

const broker_address = process.env.MQTT_BROKER || 'mqtt://localhost:1883';
const topic = process.env.MQTT_TOPIC || 'chat/room';
const botName = 'ChatBot';

const client = mqtt.connect(broker_address);

client.on('connect', function () {
  console.log('[ChatBot] Connected to broker.');
  client.subscribe(topic);
  sendMessage('ChatBot is online! Type !help for available commands.', false);
});

client.on('message', function (t, payload) {
  try {
    const data = JSON.parse(payload.toString());
    // Ignore messages sent by the bot itself
    if (data.sender === botName) return;

    const text = data.text.trim().toLowerCase();
    if (text.startsWith('!')) {
      handleCommand(data.sender, text);
    }
  } catch (e) {
    // ignore malformed messages
  }
});

function handleCommand(sender, command) {
  if (command === '!help') {
    sendMessage('Commands: !help, !time, !hello, !ping', false);
  } else if (command === '!time') {
    sendMessage('Current time: ' + new Date().toLocaleTimeString(), false);
  } else if (command === '!hello') {
    sendMessage('Hello, ' + sender + '! How are you?', false);
  } else if (command === '!ping') {
    sendMessage('Pong! 🏓', false);
  } else {
    sendMessage('Unknown command "' + command + '". Type !help for available commands.', false);
  }
}

function sendMessage(text, isSystem) {
  const payload = JSON.stringify({
    sender: botName,
    text: text,
    timestamp: new Date().toLocaleTimeString(),
    system: isSystem || false,
  });
  client.publish(topic, payload);
  console.log('[ChatBot]:', text);
}