``` js
  const Srf = require('drachtio-srf');
  const srf = new Srf() ;
  srf.connect({
    host: '127.0.0.1',
    port: 9022,
    secret: 'cymru'
  }) ;
  srf
    .on('connect', (err, hostport) => {
      if (err) return console.log(`error connecting: ${err}`);
      console.log(`successfully connected to drachtio on: ${hostport}`);
    })
    .on('error', (err) => {
      console.log(`srf error: ${error}`);
    });
```
