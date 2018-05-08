```js
  // A simple SIP proxy..
  
  const Srf = require('drachtio-srf');
  const srf = new Srf() ;
  const config = require('config');

  srf.connect(config.get('drachtio.server')) ;

  srf.invite((req, res) => {
    srf.proxyRequest(req, ['sip.example1.com', 'sip.example2.com'], {
      recordRoute: true,
      followRedirects: true
    });
  });
```
