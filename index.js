//require('dotenv').load();

const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const ghost = require('ghost');
const tree = require('./tree');
const fs = require('fs');

const app = express();
const http = require('http').Server(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const routes = require('./router');

app.set('port', (process.env.PORT || 8080));
app.set('view engine', 'pug');
app.use('/', routes);
app.use(morgan('tiny'));
app.use(express.static('public'));

app.locals.tutorials = tree('./docs/tutorials').children.slice(0, 3);

const conf = JSON.parse(fs.readFileSync('docs.conf.json'));
console.log(conf['getting-started']);

http.listen(app.get('port'), () => {
  console.log('listening on *:' + app.get('port'));
});

ghost().then((ghostServer) => {
  app.use('/blog', ghostServer.rootApp);
  return ghostServer.start(app);
})
  .catch((err) => {
    console.error(`Error starting ghost: ${err}`);
  });
