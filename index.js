//require('dotenv').load();

const express = require('express')
const pug = require('pug')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const ghost = require('ghost')
const path = require('path')
const tree = require('./tree')
const utils = require('./node_modules/ghost/core/server/services/url/utils')

const app = express()
const http = require('http').Server(app)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const routes = require('./router')

app.set('port', (process.env.PORT || 8080))
app.set('view engine', 'pug')
app.use('/', routes)
app.use(morgan('tiny'))
app.use(express.static('public'))

app.locals.tutorials = tree('./docs/tutorials').children.slice(0,3);

http.listen(app.get('port'), function() {
  console.log('listening on *:' + app.get('port'))
})

ghost().then(function (ghostServer) {
    app.use('/blog', ghostServer.rootApp);
    ghostServer.start(app);
    app.use(function(req, res, next){
    res.locals.items = "Value";
    next();
});
});
