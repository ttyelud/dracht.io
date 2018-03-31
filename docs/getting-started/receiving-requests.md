# Receiving Requests

*Note:* The sample code below assumes that a drachtio server process is running on the localhost and is listening for connections from applications on port 9022 (tcp).

Applications connect to a drachtio server as follows:

```js
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
    console.log(`successfully connected to drachtio server accepting SIP traffic on: ${hostport}`);
  })
  .on('error', (err) => {
    console.log(`srf error: ${error}`);
  });
```

> Note: It is recommended to always listen for 'error' events, as above, because drachtio-srf will automatically reconnect to the drachtio server if the connection is lost for some reason as long as your application listens for 'error' events.
