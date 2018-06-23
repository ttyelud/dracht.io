const express = require('express');
const router = express.Router();
const {mdTree} = require('./utils');
const _ = require('lodash');
const config = require('config');
const Mailgun = require('mailgun-js');

const docsTree = mdTree('./docs', './views');

// Home

router.get('/', function(req, res) {
  const t = 'drachtio: the Node.js SIP application server';
  const d = 'The node.js SIP application server framework.';
  res.render('index', {title : t, description : d});
});

router.get('/api-test', function(req, res) {
  const t = 'drachtio: the Node.js SIP application server';
  const d = 'The node.js SIP application server framework.';
  res.render('api', {title : t, description : d});
});


// Interior Pages

router.get('/about', function(req, res) {
  const t = 'About - drachtio';
  const d = 'Learn more about drachtio, the node.js SIP application server framework.';
  res.render('about', {title : t, description : d});
});

router.get('/features', function(req, res) {
  const t = 'Features - drachtio';
  const d = 'Learn more about what drachtio has to offer.';
  res.render('features', {title : t, description : d});
});

router.get('/middleware', function(req, res) {
  const t = 'drachtio middleware';
  const d = 'drachtio middleware';
  res.render('middleware', {title : t, description : d});
});

router.get('/apps', function(req, res) {
  const t = 'drachtio reference applications';
  const d = 'Reference applications';
  res.render('apps', {title : t, description : d});
});

router.get('/api', function(req, res) {
  const t = 'drachtio API';
  const d = 'drachtio API documentation';
  res.render('api', {title : t, description : d});
});

// Contact

router.get('/contact', function(req, res) {
  const t = 'Contact - drachtio';
  const d = 'Have a question? Contact us.';
  res.render('contact', {title : t, description : d, submitted: false});
});

router.post('/contact', function(req, res) {
  const mailgun = Mailgun(config.get('mailgun'));
  const t = 'Contact - drachtio';
  const d = 'Have a question? Contact us.';
  console.log(req.body);

  const data = {
    from: req.body.email,
    to: config.get('mailgun.to'),
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
    title : 'drachtio developer docs',
    description : 'Documentation for dracht.io, the node.js SIP application server framework.',
    tree: docsTree.children,
    active: 'developer-guide'
  });
});


router.get('/docs/:folder', (req, res) => {
  const t = 'drachtio developer docs';
  const d = 'Documentation for drachtio, the node.js SIP application server framework.';

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
