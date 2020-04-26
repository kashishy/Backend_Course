const express = require('express'); // for creating server
const  http = require('http'); // default module of node
const morgan = require('morgan'); // log information of incomming request to the screen
const bodyParser = require('body-parser'); //will add the body of the request message to the req parameter as req.body

const dishRouter = require('./routes/dishRouter');
const promoRouter = require('./routes/promoRouter');
const leaderRouter = require('./routes/leaderRouter');

const hostname = 'localhost';
const port = 3000;

const app = express();

// to use any middleware with express define like this
app.use(morgan('dev')); // dev for devlopment version, to print additional infromation on screen
app.use(bodyParser.json());

app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);

// for setting up static files to be used by the server, __dirname for root of the project
app.use(express.static(__dirname+'/public'));

app.use((req, res, next) => {   //next is optional parameter for using additional middlewares
  //console.log(req.headers); no longer needed as morgan will print required information
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.end('<html><body><h1>This is an Express Server</h1></body></html>');

});

const server = http.createServer(app);

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});