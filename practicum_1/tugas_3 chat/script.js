var hostname = "";
var port = 8883;
var topic = "chat/room";
var username = "";
var mqttClient = null;

/* Called when user clicks Join Chat */
function joinChat() {
  var input = document.getElementById("username-input");
  var name = input.value.trim();
  if (!name) {
    alert("Please enter a username.");
    return;
  }
  username = name;
  hostname = document.getElementById("broker-host").value.trim();
  port = parseInt(document.getElementById("broker-port").value, 10) || 8883;
  topic = document.getElementById("broker-topic").value.trim() || "chat/room";
  if (!hostname) {
    alert("Please enter a broker IP address.");
    return;
  }
  document.getElementById("login-overlay").style.display = "none";
  document.getElementById("status").textContent = "Connecting...";
  connectMQTT();
}

function connectMQTT() {
  var clientId = "chat_" + username + "_" + Math.floor(Math.random() * 10000);
  mqttClient = new Paho.MQTT.Client(hostname, port, clientId);
  mqttClient.onMessageArrived = onMessageArrived;
  mqttClient.onConnectionLost = onConnectionLost;
  mqttClient.connect({
    onSuccess: onConnected,
    onFailure: onConnectionFailed,
    keepAliveInterval: 30,
  });
}

function onConnected() {
  console.log("Connected to MQTT broker as", username);
  document.getElementById("status").textContent = "Connected as " + username;
  document.getElementById("msg-input").disabled = false;
  document.getElementById("send-btn").disabled = false;
  mqttClient.subscribe(topic);
  publishMessage(username + " has joined the chat", true);
}

function onConnectionFailed(res) {
  console.log("Connection failed:", res.errorMessage);
  document.getElementById("status").textContent = "Connection failed: " + res.errorMessage;
}

function onConnectionLost(res) {
  if (res.errorCode !== 0) {
    console.log("Connection lost:", res.errorMessage);
    document.getElementById("status").textContent = "Reconnecting...";
    document.getElementById("msg-input").disabled = true;
    document.getElementById("send-btn").disabled = true;
    setTimeout(connectMQTT, 3000);
  }
}

function onMessageArrived(message) {
  try {
    var data = JSON.parse(message.payloadString);
    displayMessage(data.sender, data.text, data.timestamp, data.system || false);
  } catch (e) {
    console.log("Invalid message format:", message.payloadString);
  }
}

function sendMessage() {
  var input = document.getElementById("msg-input");
  var text = input.value.trim();
  if (!text || !mqttClient) return;
  input.value = "";
  publishMessage(text, false);
}

function publishMessage(text, isSystem) {
  var payload = JSON.stringify({
    sender: username,
    text: text,
    timestamp: new Date().toLocaleTimeString(),
    system: isSystem
  });
  var msg = new Paho.MQTT.Message(payload);
  msg.destinationName = topic;
  mqttClient.send(msg);
}

function displayMessage(sender, text, timestamp, isSystem) {
  var container = document.getElementById("chat-container");
  var div = document.createElement("div");
  if (isSystem) {
    div.className = "system-msg";
    div.textContent = text;
  } else {
    var isMine = sender === username;
    div.className = "message " + (isMine ? "mine" : "others");
    div.innerHTML =
      (!isMine ? '<div class="sender">' + escapeHtml(sender) + '</div>' : '') +
      '<div class="text">' + escapeHtml(text) + '</div>' +
      '<div class="time">' + escapeHtml(timestamp) + '</div>';
  }
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}