var hostname = "localhost";
var port = 8883;
var clientId = "WebSocket";
clientId += new Date().getUTCMilliseconds();;
var topic = "topik";
mqttClient = new Paho.MQTT.Client(hostname, port, clientId);
mqttClient.onMessageArrived = MessageArrived;
mqttClient.onConnectionLost = ConnectionLost;
Connect();
/*Initiates a connection to the MQTT broker*/
function Connect(){
 mqttClient.connect({
 onSuccess: Connected,
 onFailure: ConnectionFailed,
 keepAliveInterval: 10,
});
}
/*Callback for successful MQTT connection */
function Connected() {
 console.log("Connected to MQTT-over-WebSocket broker.");
 mqttClient.subscribe(topic);
}
/*Callback for failed connection*/
function ConnectionFailed(res) {
console.log("Connect failed:" + res.errorMessage);
}
/*Callback for lost connection*/
function ConnectionLost(res) {
 if (res.errorCode !== 0) {
 console.log("Connection lost:" + res.errorMessage);
 Connect();
 }
}
/*Callback for incoming message processing */
function MessageArrived(message) {
 console.log(message.destinationName +" : " + message.payloadString);

 var a = parseInt(message.payloadString);
 var ht = 100-a;
 document.getElementById("top").style.height = ""+ht+"%" ;
 document.getElementById("top").innerHTML = message.payloadString+"%";
 document.getElementById("container").style.backgroundColor = "#74add6";
}