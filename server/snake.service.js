const { SerialPort } = require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline')
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const readline = require('readline-sync');

let comPort = process.argv[2];

if (!comPort) {
  const { execSync } = require('node:child_process');
  // MacOS only
  const availablePorts = execSync('ls /dev/cu*');
  const portsList = availablePorts.toString().split('\n');
  portsList.pop()
  console.log(`List of available COM ports`);
  portsList.map((port, i) => {
    console.log(`=> ${i + 1}: ${port}`)}
  )
  const comPortIndex = readline.question(`Enter USB port [1-${portsList.length}]: `);
  comPort = portsList[comPortIndex - 1];
}

if (!comPort) {
  throw new Error('No USB port defined.');
}

const serialConn = new SerialPort({ 
  path: comPort, 
  baudRate: 9600 
});

const parser = serialConn.pipe(new ReadlineParser({ delimiter: '\r\n' }));

serialConn.on('open', () => console.log('Serial port open'));
serialConn.on('close', () => console.log('Serial port closed'));
serialConn.on('error', err => console.error(err));

parser.on('data', data => {
  console.log('Message from Device:', data);
  sendEventsToAll(data);
});

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

const PORT = 3000;

let clients = [];
let clientInput = [];

function eventsHandler(request, response) {
  const headers = {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
  };

  response.writeHead(200, headers);

  const data = `data: ${JSON.stringify(clientInput)}\n\n`;

  response.write(data);

  const clientId = Date.now();

  const newClient = {
    id: clientId,
    response
  };

  clients.push(newClient);

  request.on('close', () => {
    console.log(`${clientId} connection closed`);
    clients = clients.filter(client => client.id !== clientId);
  });
}

function sendEventsToAll(joystickValue) {
  clients.forEach(client => client.response.write(`data: ${JSON.stringify(joystickValue)}\n\n`));
}

app.get('/status', (request, response) => response.json({clients: clients.length}));
app.get('/events', eventsHandler);

app.listen(PORT, () => {
  console.log(`Snake Events service listening at http://localhost:${PORT}`);
})


