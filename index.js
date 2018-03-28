const express = require('express')
const pug = require('pug')
const morgan = require('morgan')
const ghost = require('ghost')
const path = require('path')
const utils = require('./node_modules/ghost/core/server/services/url/utils')

const app = express()
const http = require('http').Server(app)

const routes = require('./router')

app.set('port', (process.env.PORT || 8080))
app.set('view engine', 'pug')

app.use('/', routes)
app.use(morgan('tiny'))
app.use(express.static('public'))

http.listen(app.get('port'), function() {
  console.log('listening on *:' + app.get('port'))
})

ghost().then(function (ghostServer) {
    app.use('/blog', ghostServer.rootApp);
    ghostServer.start(app);
});
