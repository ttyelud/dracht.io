const express = require('express');
const router = express.Router();
const {mdTree} = require('./utils');
const _ = require('lodash');

const Mailgun = require('mailgun-js');
const apiKey = 'key';
const domain = 'domain';
const from = 'email';

const docsTree = mdTree('./docs', './views');

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
  res.render('docs', {
    title : 'Documentation - dracht.io',
    description : 'Documentation for dracht.io, the node.js SIP application server framework.',
    tree: docsTree.children,
    active: 'developer-guide'
  });
});


router.get('/docs/:folder', (req, res) => {
  const t = 'Documentation - dracht.io';
  const d = 'Documentation for dracht.io, the node.js SIP application server framework.';

  const tree = _.find(docsTree.children, (c) => c.file === req.params.folder);
  if (tree) {
    console.log('found folder');
    res.render('docs', {
      title : t,
      description : d,
      tree: docsTree.children,
      active: req.params.folder
    });
  } else {
    res.render('docs', {
      title : t,
      description : d,
      tree: docsTree.children,
      active: 'api'
    });
  }
});

module.exports = router;
