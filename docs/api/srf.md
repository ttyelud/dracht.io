<a name="Srf"></a>

## Srf
Applications create an instance of Srf in order to create and manage SIP [Dialogs](Dialog)
and SIP transactions.  An application may have one or more Srf instances, although for most cases a single
instance is sufficient.


* [Srf](#Srf)

    * [new Srf()](#new_Srf_new)

    * [.createUAS(req, res, opts, [callback])](#Srf+createUAS)

    * [.createUAC(uri, opts, [progressCallbacks], [callback])](#Srf+createUAC)

    * [.createB2BUA(req, res, uri, opts, [progressCallbacks], [callback])](#Srf+createB2BUA)

    * [.proxyRequest(req, [destination], [opts], [callback])](#Srf+proxyRequest)

    * [.request(uri, opts, [headers], [body], [callback])](#Srf+request)

    * [.connect(opts)](#Srf+connect)

    * [.listen(opts)](#Srf+listen)

    * ["connect" (err, hostport)](#Srf+event_connect)

    * ["cdr:attempt" (source, time, msg)](#Srf+cdr_attempt)

    * ["cdr:start" (source, time, role, msg)](#Srf+cdr_start)

    * ["cdr:stop" (source, time, reason, msg)](#Srf+cdr_stop)


<a name="new_Srf_new"></a>

### new Srf()
Creates an Srf instance.  No arguments are supplied.

<a name="Srf+createUAS"></a>

### *srf*.createUAS(req, res, opts, [callback])

| Param | Type | Description |
| --- | --- | --- |
| req | <code>Object</code> | the incoming sip request object |
| res | <code>Object</code> | the sip response object |
| opts | <code>Object</code> | configuration options |
| opts.localSdp | <code>string</code> | the local session description protocol to include in the SIP response |
| [opts.headers] | <code>Object</code> | SIP headers to include on the SIP response to the INVITE |
| [callback] | <code>function</code> | if provided, callback with signature <code>(err, dialog)</code> |

create a SIP dialog, acting as a UAS (user agent server); i.e.
respond to an incoming SIP INVITE with a 200 OK
(or to a SUBSCRIBE request with a 202 Accepted).

Note that the [Dialog](Dialog) is generated (i.e. the callback invoked / the Promise resolved)
at the moment that the 200 OK is sent back towards the requestor, not when the ACK is subsequently received.

**Returns**: <code>[Srf](#Srf)</code> &#124; <code>Promise</code> - if a callback is supplied, a reference to the Srf instance.
<br/>If no callback is supplied, then a Promise that is resolved
with the [sip dialog](Dialog) that is created.  
**Example** *(returning a Promise)*  
```js
const Srf = require('drachtio-srf');
const srf = new Srf();

srf.invite((req, res) => {
  const mySdp; // populated somehow with SDP we want to answer in 200 OK
  srf.createUas(req, res, {localSdp: mySdp})
    .then((uas) => {
      console.log(`dialog established, remote uri is ${uas.remote.uri}`);
      uas.on('destroy', () => {
        console.log('caller hung up');
      });
    })
    .catch((err) => {
      console.log(`Error establishing dialog: ${err}`);
    });
});
```
**Example** *(using callback)*  
```js
const Srf = require('drachtio-srf');
const srf = new Srf();

srf.invite((req, res) => {
  const mySdp; // populated somehow with SDP we want to offer in 200 OK
  srf.createUas(req, res, {localSdp: mySdp},
    (err, uas) => {
      if (err) {
        return console.log(`Error establishing dialog: ${err}`);
      }
      console.log(`dialog established, local tag is ${uas.sip.localTag}`);
      uas.on('destroy', () => {
        console.log('caller hung up');
      });
    });
});
```
**Example** *(specifying standard or custom headers)*  
```js
srf.createUas(req, res, {
    localSdp: mySdp,
    headers: {
      'User-Agent': 'drachtio/iechyd-da',
      'X-Linked-UUID': '1e2587c'
    }
  }).then((uas) => { ..});
```
<a name="Srf+createUAC"></a>

### *srf*.createUAC(uri, opts, [progressCallbacks], [callback])

| Param | Type | Description |
| --- | --- | --- |
| uri | <code>string</code> | request uri to send to |
| opts | <code>Object</code> | configuration options |
| [opts.headers] | <code>Object</code> | SIP headers to include on the SIP INVITE request |
| opts.localSdp | <code>string</code> | the local session description protocol to include in the SIP INVITE request |
| [progressCallbacks] | <code>Object</code> | callbacks providing call progress notification |
| [progressCallbacks.cbRequest] | <code>function</code> | callback that provides request sent over the wire, with signature (req) |
| [progressCallbacks.cbProvisional] | <code>function</code> | callback that provides a provisional response with signature (provisionalRes) |
| [callback] | <code>function</code> | if provided, callback with signature <code>(err, dialog)</code> |

create a SIP dialog, acting as a UAC (user agent client)

**Returns**: <code>[Srf](#Srf)</code> &#124; <code>Promise</code> - if a callback is supplied, a reference to the Srf instance.
<br/>If no callback is supplied, then a Promise that is resolved
with the [sip dialog](Dialog) that is created.  
**Example** *(returning a Promise)*  
```js
const Srf = require('drachtio-srf');
const srf = new Srf();

const mySdp; // populated somehow with SDP we want to offer
srf.createUac('sip:1234@10.10.100.1', {localSdp: mySdp})
  .then((uac) => {
    console.log(`dialog established, call-id is ${uac.sip.callId}`);
    uac.on('destroy', () => {
      console.log('called party hung up');
    });
  })
  .catch((err) => {
    console.log(`INVITE rejected with status: ${err.status}`);
  });
});
```
**Example** *(Using a callback)*  
```js
const Srf = require('drachtio-srf');
const srf = new Srf();

const mySdp; // populated somehow with SDP we want to offer
srf.createUac('sip:1234@10.10.100.1', {localSdp: mySdp},
   (err, uac) => {
     if (err) {
       return console.log(`INVITE rejected with status: ${err.status}`);
     }
    uac.on('destroy', () => {
      console.log('called party hung up');
    });
  });
```
**Example** *(Canceling a request by using a progress callback)*  
```js
const Srf = require('drachtio-srf');
const srf = new Srf();

const mySdp; // populated somehow with SDP we want to offer
let inviteSent;
srf.createUac('sip:1234@10.10.100.1', {localSdp: mySdp},
  {
    cbRequest: (reqSent) => { inviteSent = req; }
  })
  .then((uac) => {
    // unexpected, in this case
    console.log('dialog established before we could cancel');
  })
  .catch((err) => {
    assert(err.status === 487); // expected sip response to a CANCEL
  });
});

// cancel the request after 0.5s
setTimeout(() => {
  inviteSent.cancel();
}, 500);
```
<a name="Srf+createB2BUA"></a>

### *srf*.createB2BUA(req, res, uri, opts, [progressCallbacks], [callback])

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| req | <code>Object</code> |  | incoming sip request object |
| res | <code>Object</code> |  | incoming sip response object |
| uri | <code>string</code> |  | sip uri or IP address[:port] to send the UAC INVITE to |
| opts | <code>Object</code> |  | configuration options |
| [opts.headers] | <code>Object</code> |  | SIP headers to include on the SIP INVITE request |
| [opts.localSdpA] | <code>string</code> &#124; <code>function</code> |  | the local session description protocol to offer in the response to the SIP INVITE request on the A leg; either a string or a function may be provided. If a function is provided, it will be invoked with two parameters (sdp, res) correspnding to the SDP received from the B party, and the sip response object received on the response from B. The function must return either the SDP (as a string) or a Promise that resolves to the SDP. If no value is provided (neither string nor function), then the SDP returned by the B party in the provisional/final response on the UAC leg will be sent back to the A party in the answer. |
| opts.localSdpB | <code>string</code> |  | the local session description protocol to offer in the SIP INVITE request on the B leg |
| [opts.proxyRequestHeaders] | <code>Array</code> |  | an array of header names which, if they appear in the INVITE request on the A leg, should be included unchanged on the generated B leg INVITE |
| [opts.proxyResponseHeaders] | <code>Array</code> |  | an array of header names which, if they appear in the response to the outgoing INVITE, should be included unchanged on the generated response to the A leg |
| [opts.passFailure] | <code>Boolean</code> | <code>true</code> | specifies whether to pass a failure returned from B leg back to the A leg |
| [progressCallbacks] | <code>Object</code> |  | callbacks providing call progress notification |
| [progressCallbacks.cbRequest] | <code>function</code> |  | callback that provides request sent over the wire, with signature (req) |
| [progressCallbacks.cbProvisional] | <code>function</code> |  | callback that provides a provisional response with signature (provisionalRes) |
| [callback] | <code>function</code> |  | if provided, callback with signature <code>(err, {uas, uac})</code> |

create back-to-back dialogs; i.e. act as a back-to-back user agent (B2BUA), creating a
pair of dialogs {uas, uac} -- a UAS dialog facing the caller or A party, and a UAC dialog
facing the callee or B party such that media flows between them

**Returns**: <code>[Srf](#Srf)</code> &#124; <code>Promise</code> - if a callback is supplied, a reference to the Srf instance.
<br/>If no callback is supplied, then a Promise that is resolved
with the [sip dialog](Dialog) that is created.  
**Example** *(simple B2BUA)*  
```js
const Srf = require('drachtio-srf');
const srf = new Srf();

srf.invite((req, res) => {
  srf.createB2BUA('sip:1234@10.10.100.1', req, res, {localSdpB: req.body})
    .then({uas, uac} => {
      console.log('call connected');

      // when one side terminates, hang up the other
      uas.on('destroy', () => { uac.destroy(); });
      uac.on('destroy', () => { uas.destroy(); });
    })
    .catch((err) => {
      console.log(`call failed to connect: ${err}`);
    });
});
```
**Example** *(use opts.passFailure to attempt a fallback URI on failure)*  
```js
const Srf = require('drachtio-srf');
const srf = new Srf();

function endCall(dlg1, dlg2) {
  dlg1.on('destroy', () => {dlg2.destroy();})
  dlg2.on('destroy', () => {dlg1.destroy();})
}
srf.invite((req, res) => {
  srf.createB2BUA('sip:1234@10.10.100.1', req, res, {localSdpB: req.body, passFailure: false})
    .then({uas, uac} => {
      console.log('call connected to primary destination');
      endcall(uas, uac);
    })
    .catch((err) => {
      // try backup if we got a sip non-success response and the caller did not hang up
      if (err instanceof Srf.SipError && err.status !== 487) {
          console.log(`failed connecting to primary, will try backup: ${err}`);
          srf.createB2BUA('sip:1234@10.10.100.2', req, res, {
            localSdpB: req.body}
          })
            .then({uas, uac} => {
              console.log('call connected to backup destination');
              endcall(uas.uac);
            })
            catch((err) => {
              console.log(`failed connecting to backup uri: ${err}`);
            });
      }
    });
});
```
**Example** *(B2BUA with media proxy using rtpengine)*  
```js
const Srf = require('drachtio-srf');
const srf = new Srf();
const rtpengine = require('rtpengine-client').Client

// helper functions

// clean up and free rtpengine resources when either side hangs up
function endCall(dlg1, dlg2, details) {
  [dlg1, dlg2].each((dlg) => {
    dlg.on('destroy', () => {(dlg === dlg1 ? dlg2 : dlg1).destroy();});
    rtpengine.delete(details);
  });
}

// function returning a Promise that resolves with the SDP to offer A leg in 18x/200 answer
function getSdpA(details, remoteSdp, res) {
  return rtpengine.answer(Object.assign(details, {
    'sdp': remoteSdp,
    'to-tag': res.getParsedHeader('To').params.tag
   }))
    .then((response) => {
      if (response.result !== 'ok') throw new Error(`Error calling answer: ${response['error-reason']}`);
      return response.sdp;
   })
}

// handle incoming invite
srf.invite((req, res) => {
  const from = req.getParsedHeader('From');
  const details = {'call-id': req.get('Call-Id'), 'from-tag': from.params.tag};

  rtpengine.offer(Object.assign(details, {'sdp': req.body})
    .then((rtpResponse) => {
      if (rtpResponse && rtpResponse.result === 'ok') return rtpResponse.sdp;
      throw new Error('rtpengine failure');
    })
    .then((sdpB) => {
      return srf.createB2BUA('sip:1234@10.10.100.1', req, res, {
        localSdpB: sdpB,
        localSdpA: getSdpA.bind(null, details)
      });
    })
    .then({uas, uac} => {
      console.log('call connected with media proxy');
      endcall(uas, uac, details);
    })
    .catch((err) => {
      console.log(`Error proxying call with media: ${err}`);
    });
});
```
<a name="Srf+proxyRequest"></a>

### *srf*.proxyRequest(req, [destination], [opts], [callback])

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| req | <code>Request</code> |  | drachtio request object representing an incoming SIP request |
| [destination] | <code>String</code> &#124; <code>Array</code> |  | an IP address[:port], or list of same, to proxy the request to |
| [opts] | <code>Object</code> |  | configuration options for the proxy operation |
| [opts.forking] | <code>String</code> | <code>sequential</code> | when multiple destinations are provided, this option governs whether they are attempted sequentially or in parallel. Valid values are 'sequential' or 'parallel' |
| [opts.remainInDialog] | <code>Boolean</code> | <code>false</code> | if true, add Record-Route header and remain in the SIP dialog (i.e. receiving futher SIP messaging for the dialog, including the terminating BYE request). Alias: `recordRoute`. |
| [opts.provisionalTimeout] | <code>String</code> |  | timeout after which to attempt the next destination if no 100 Trying response has been received.  Examples of valid syntax for this property is '1500ms', or '2s' |
| [opts.finalTimeout] | <code>String</code> |  | timeout, in milliseconds, after which to cancel the current request and attempt the next destination if no final response has been received. Syntax is the same as for the provisionalTimeout property. |
| [opts.followRedirects] | <code>Boolean</code> | <code>false</code> | if true, handle 3XX redirect responses by generating a new request as per the Contact header; otherwise, proxy the 3XX response back upstream without generating a new response |
| [callback] | <code>function</code> |  | callback invoked when proxy operation completes, signature (err, results) where `results` is a JSON object describing the individual sip call attempts and results |

proxy an incoming request

**Returns**: <code>[Srf](#Srf)</code> &#124; <code>Promise</code> - returns a Promise if no callback is supplied, otherwise the Srf object  
**Example** *(simple proxy)*  
```js
const Srf = require('drachtio-srf');
const srf = new Srf();

srf.invite((req, res) => {
  srf.proxyRequest(req, 'sip.example.com');
});
```
**Example** *(proxy with options)*  
```js
const Srf = require('drachtio-srf');
const srf = new Srf();

srf.invite((req, res) => {
  srf.proxyRequest(req, ['sip.example1.com', 'sip.example2.com'], {
    recordRoute: true,
    followRedirects: true,
    provisionalTimeout: '2s'
  }).then((results) => {
    console.log(JSON.stringify(result)); // {finalStatus: 200, finalResponse:{..}, responses: [..]}
  });
});
```
<a name="Srf+request"></a>

### *srf*.request(uri, opts, [headers], [body], [callback])

| Param | Type | Description |
| --- | --- | --- |
| uri | <code>string</code> | sip request-uri to send request to |
| opts | <code>Object</code> | configuration options |
| opts.method | <code>String</code> | SIP method to send (lower-case) |
| [headers] | <code>Object</code> | SIP headers to apply to the outbound request |
| [body] | <code>String</code> | body to send with the SIP request |
| [callback] | <code>function</code> | callback invoked when sip request has been sent, invoked with signature (err, request) where `request` is a sip request object representing the sip message that was sent. |

send a SIP request outside of a dialog

**Example** *(sending OPTIONS request)*  
```js
srf.request('sip.example.com', {
  method: 'OPTIONS',
  headers: {
    'User-Agent': 'drachtio'
  }
 }, (err, req) => {
  req.on('response', (res) => {
    console.log(`received ${res.statusCode} response`);
  });
});
```
<a name="Srf+connect"></a>

### *srf*.connect(opts)

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| opts | <code>Object</code> |  | connection options |
| [opts.host] | <code>string</code> | <code>&quot;&#x27;localhost&#x27;&quot;</code> | address drachtio server is listening on for client connections |
| [opts.port] | <code>Number</code> | <code>9022</code> | address drachtio server is listening on for client connections |
| opts.secret | <code>String</code> |  | shared secret used to authenticate connections |

make an inbound connection to a drachtio server

**Example**  
```js
const Srf = require('drachtio-srf');
const srf = new Srf();

srf.connect({host: '127.0.0.1', port: 9022, secret: 'cymru'});
srf.on('connect', (hostport) => {
  console.log(`connected to drachtio server offering sip endpoints: ${hostport}`);
})
.on('error', (err) => {
  console.error(`error connecting: ${err}`);
});

srf.invite((req, res) => {..});
```
<a name="Srf+listen"></a>

### *srf*.listen(opts)

| Param | Type | Description |
| --- | --- | --- |
| opts | <code>Object</code> | listen options |
| opts.port | <code>number</code> | address drachtio server is listening on for client connections |
| opts.secret | <code>string</code> | shared secret used to authenticate connections |

listen for outbound connections from a drachtio server

**Example**  
```js
const Srf = require('drachtio-srf');
const srf = new Srf();

srf.listen({port: 9023, secret: 'cymru'});

srf.invite((req, res) => {..});
```
<a name="Srf+event_connect"></a>

### "connect" (err, hostport)

| Param | Type | Description |
| --- | --- | --- |
| err | <code>Object</code> | error encountered when attempting to connect |
| hostport | <code>String</code> | the SIP address[:port] drachtio server is listening on for incoming SIP messages |

a <code>connect</code> event is emitted by an Srf instance when a connect method completes
with either success or failure

<a name="Srf+cdr_attempt"></a>

### "cdr:attempt" (source, time, msg)

| Param | Type | Description |
| --- | --- | --- |
| source | <code>String</code> | 'network'|'application', depending on whether the INVITE is \inbound (received), or outbound (sent), respectively |
| time | <code>String</code> | the time (UTC) recorded by the SIP stack corresponding to the attempt |
| msg | <code>Object</code> | the actual message that was sent or received |

a <code>cdr:attempt</code> event is emitted by an Srf instance when a call attempt has been
received (inbound) or initiated (outbound)

<a name="Srf+cdr_start"></a>

### "cdr:start" (source, time, role, msg)

| Param | Type | Description |
| --- | --- | --- |
| source | <code>String</code> | 'network'|'application', depending on whether the INVITE is inbound (received), or outbound (sent), respectively |
| time | <code>String</code> | the time (UTC) recorded by the SIP stack corresponding to the attempt |
| role | <code>String</code> | 'uac'|'uas'|'uac-proxy'|'uas-proxy' indicating whether the application is acting as a user agent client, user agent server, proxy (sending message), or proxy (receiving message) for this cdr |
| msg | <code>Object</code> | the actual message that was sent or received |

a <code>cdr:start</code> event is emitted by an Srf instance when a call attempt has been connected successfully

<a name="Srf+cdr_stop"></a>

### "cdr:stop" (source, time, reason, msg)

| Param | Type | Description |
| --- | --- | --- |
| source | <code>String</code> | 'network'|'application', depending on whether the INVITE is inbound (received), or outbound (sent), respectively |
| time | <code>String</code> | the time (UTC) recorded by the SIP stack corresponding to the attempt |
| reason | <code>String</code> | the reason the call was ended |
| msg | <code>Object</code> | the actual message that was sent or received |

a <code>cdr:stop</code> event is emitted by an Srf instance when a connected call has ended

