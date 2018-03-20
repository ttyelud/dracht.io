const express = require('express')
const router = express.Router()

router.get('/', function(req, res) {
  let t = 'Welcome to dracht.io'
  let d = 'The node.js SIP application server framework.'
  res.render('index', {title : t, description : d})
})

router.get('/alt', function(req, res) {
  let t = 'Welcome to dracht.io'
  let d = 'The node.js SIP application server framework.'
  res.render('alternative', {title : t, description : d})
})


module.exports = router;
