const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')
const tree = require('./tree')

const dirs = p => fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isDirectory())


router.get('/', function(req, res) {
  let t = 'Welcome to dracht.io'
  let d = 'The node.js SIP application server framework.'
  res.render('index', {title : t, description : d})
})

router.get('/docs', function(req, res) {
  let t = 'Documentation - dracht.io'
  let d = 'Documentation for dracht.io, the node.js SIP application server framework.'
  res.render('docs', {
    title : t, description : d,
    tree: tree('./docs').children,
    active: 'getting-started'
  })
  console.log(tree('./docs').children)
})

router.get('/docs/:folder', function(req, res) {
  let t = 'Documentation - dracht.io'
  let d = 'Documentation for dracht.io, the node.js SIP application server framework.'

  if (dirs('./docs').includes(req.params.folder)) {
    res.render('docs', {
      title : t, description : d,
      tree: tree('./docs').children,
      active: req.params.folder
    })
  } else {
    res.render('docs', {
      title : t, description : d,
      tree: tree('./docs').children,
      active: 'api'
    })
  }
})

router.get('/docs/tutorials', function(req, res) {

})

router.get('/docs/tutorial/:tutorial', function(req, res) {

})


module.exports = router;
