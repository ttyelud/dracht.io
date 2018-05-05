const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const tree = require('./tree');
const helpers = require('./helpers');
//const arrayMove = require('array-move');

const dirs = (p) => {
  return fs.readdirSync(p).filter((f) => fs.statSync(path.join(p, f)).isDirectory);
};
const files = (p) => {
  return fs.readdirSync(p).filter((f) => fs.statSync(path.join(p, f)));
};

const config = JSON.parse(fs.readFileSync('docs.conf.json'));

const Mailgun = require('mailgun-js');
const apiKey = 'key';
const domain = 'domain';
const from = 'email';

let f;
helpers.order(tree('./docs').children, config, (arr) => {
  f = arr;
});

/*******************************
*  You can edit the variables  *
*  `t` an `d` to change the    *
*  title and description of    *
*  each page.                  *
*******************************/


// Home

router.get('/', function(req, res) {
  const t = 'Welcome to dracht.io';
  const d = 'The node.js SIP application server framework.';
  res.render('index', {title : t, description : d});
});

// Interior Pages

router.get('/about', function(req, res) {
  const t = 'About - dracht.io';
  const d = 'Learn more about dracht.io, the node.js SIP application server framework.';
  res.render('about', {title : t, description : d});
});

router.get('/features', function(req, res) {
  const t = 'Features - dracht.io';
  const d = 'Learn more about what dracht.io has to offer.';
  res.render('features', {title : t, description : d});
});

// Contact

router.get('/contact', function(req, res) {
  const t = 'Contact - dracht.io';
  const d = 'Have a question? Contact us.';
  res.render('contact', {title : t, description : d, submitted: false});
});

router.post('/contact', function(req, res) {
  const t = 'Contact - dracht.io';
  const d = 'Have a question? Contact us.';
  console.log(req.body);
  const mailgun = new Mailgun({apiKey: apiKey, domain: domain});

  const data = {
    from: from,
    to: req.body.email,
    subject: req.body.subject,
    html: req.body.message
  };

  mailgun.messages().send(data, (err, body) => {
    if (err) {
      res.render('error', { error : err});
      console.log(`got an error: ${err}`);
    }
    else {
      res.render('contact', {title : t, description : d, submitted: true});
    }
  });
});

// Documentation

router.get('/docs', (req, res) => {
  const t = 'Documentation - dracht.io';
  const d = 'Documentation for dracht.io, the node.js SIP application server framework.';
  res.render('docs', {
    title : t, description : d,
    tree: f,
    active: 'getting-started'
  });
});

router.get('/docs/tutorials', (req, res) => {
  const t = 'Tutorials - dracht.io';
  const d = 'Learn how to use dracht.io';
  //console.log(tree('./docs/tutorials').children)
  if (tree('./docs/tutorials').children.length > 0) {
    const name = tree('./docs/tutorials').children[0].file;
    console.log(name);
    res.render('docs', {
      title : t, description : d,
      tree: f,
      active: 'tutorials',
      file: name
    });
  } else {
    res.render('docs', {
      title : t, description : d,
      tree: f,
    });
  }
});

router.get('/docs/tutorial/:tutorial', function(req, res) {
  const t = 'Tutorials - dracht.io';
  const d = 'Learn how to use dracht.io';
  if (files('./docs/tutorials').includes(req.params.tutorial + '.md')) {
    res.render('docs', {
      title : t, description : d,
      tree: f,
      active: 'tutorials',
      file: req.params.tutorial
    });
  } else {
    res.render('docs', {
      title : t, description : d,
      tree: f,
    });
  }
});

router.get('/docs/:folder', (req, res) => {
  const t = 'Documentation - dracht.io';
  const d = 'Documentation for dracht.io, the node.js SIP application server framework.';

  if (dirs('./docs').includes(req.params.folder)) {
    res.render('docs', {
      title : t, description : d,
      tree: f,
      active: req.params.folder
    });
  } else {
    res.render('docs', {
      title : t, description : d,
      tree: f,
      active: 'api'
    });
  }
});

module.exports = router;
