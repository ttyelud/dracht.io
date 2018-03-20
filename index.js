const express = require('express')
const pug = require('pug')
const morgan = require('morgan')

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
