const http = require("http");
const fs = require("fs");
const url = require("url");

const host = '0.0.0.0';  // listen on all network interfaces
const port = 8080;

const mimeTypes = {
  '.html': 'text/html',
  '.js':   'text/javascript',
  '.css':  'text/css',
};

const requestListener = function (request, response) {
  const pathname = url.parse(request.url).pathname;
  console.log("Request for " + pathname + " received.");

  let filePath;
  if (pathname === '/') {
    filePath = __dirname + '/index.html';
  } else if (pathname === '/script.js') {
    filePath = __dirname + '/script.js';
  } else {
    response.writeHead(404);
    response.end('Not found');
    return;
  }

  const ext = filePath.slice(filePath.lastIndexOf('.'));
  const contentType = mimeTypes[ext] || 'text/plain';

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    response.writeHead(200, { 'Content-Type': contentType });
    response.end(content);
  } catch (err) {
    response.writeHead(500);
    response.end('Error reading file: ' + err.message);
  }
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
  console.log(`Web server running at http://${host}:${port}`);
});