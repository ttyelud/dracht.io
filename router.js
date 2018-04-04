const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')
const tree = require('./tree')
const arrayMove = require('array-move');

const dirs = p => fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isDirectory())
const files = p => fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)))

const config = JSON.parse(fs.readFileSync('docs.conf.json'));

const Mailgun = require('mailgun-js')
const apiKey = 'key'
const domain = 'domain'
const from = 'email'

/*******************************
*  You can edit the variables  *
*  `t` an `d` to change the    *
*  title and description of    *
*  each page.                  *
*******************************/

function order(t, c) {
  console.log('sgsg')
  for (var k = 0; k < t.length; k++) {
    for (var i = 0; i < t[k].children.length; i++) {
      if (t[k].file in c) {
        console.log(c[t[k].file])
        for (var j = 0; j < c[t[k].file].length; j++) {
          if (t[k].children[i].file == c[t[k].file][j]) {
            console.log(t[k].children[i].file, 'whoa')
            arrayMove(t[k].children, i + 2, j + 1)
          }
        }
      }
    }
  }

  return t;
}



// Home

router.get('/', function(req, res) {
  let t = 'Welcome to dracht.io'
  let d = 'The node.js SIP application server framework.'
  res.render('index', {title : t, description : d})
})

// Interior Pages

router.get('/about', function(req, res) {
  let t = 'About - dracht.io'
  let d = 'Learn more about dracht.io, the node.js SIP application server framework.'
  res.render('about', {title : t, description : d})
})

router.get('/features', function(req, res) {
  let t = 'Features - dracht.io'
  let d = 'Learn more about what dracht.io has to offer.'
  res.render('features', {title : t, description : d})
})

// Contact

router.get('/contact', function(req, res) {
  let t = 'Contact - dracht.io'
  let d = 'Have a question? Contact us.'
  res.render('contact', {title : t, description : d, submitted: false})
})

router.post('/contact', function(req, res) {
  let t = 'Contact - dracht.io'
  let d = 'Have a question? Contact us.'
  console.log(req.body)
  var mailgun = new Mailgun({apiKey: apiKey, domain: domain});

  var data = {
    from: from,
    to: req.body.email,
    subject: req.body.subject,
    html: req.body.message
  }

  mailgun.messages().send(data, function (err, body) {
    if (err) {
      res.render('error', { error : err});
      console.log("got an error: ", err);
    }
    else {
      res.render('contact', {title : t, description : d, submitted: true})
    }
  });
})

// Documentation

router.get('/docs', function(req, res) {
  let f = order(tree('./docs').children, config)
  let t = 'Documentation - dracht.io'
  let d = 'Documentation for dracht.io, the node.js SIP application server framework.'
  res.render('docs', {
    title : t, description : d,
    tree: f,
    active: 'getting-started'
  })
})

router.get('/docs/tutorials', function(req, res) {
  let t = 'Tutorials - dracht.io'
  let d = 'Learn how to use dracht.io'
  //console.log(tree('./docs/tutorials').children)
  if (tree('./docs/tutorials').children.length > 0) {
    let name = tree('./docs/tutorials').children[0].file;
    console.log(name)
    res.render('docs', {
      title : t, description : d,
      tree: tree('./docs').children,
      active: 'tutorials',
      file: name
    })
  } else {
    res.render('docs', {
      title : t, description : d,
      tree: tree('./docs').children,
    })
  }
})

router.get('/docs/tutorial/:tutorial', function(req, res) {
  let t = 'Tutorials - dracht.io'
  let d = 'Learn how to use dracht.io'
  console.log(files('./docs/tutorials'))
  if (files('./docs/tutorials').includes(req.params.tutorial + '.md')) {
    res.render('docs', {
      title : t, description : d,
      tree: tree('./docs').children,
      active: 'tutorials',
      file: req.params.tutorial
    })
  } else {
    res.render('docs', {
      title : t, description : d,
      tree: tree('./docs').children,
    })
  }
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

module.exports = router;
