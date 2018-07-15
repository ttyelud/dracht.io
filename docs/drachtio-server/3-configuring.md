# Configuring

The drachtio process can either be configured via command-line parameters, a configuration file, or a combination of the two.

The configuration file is installed by default at `/etc/drachtio.conf.xml`.  As the name suggests, it's an XML file.  The structure of the file is described below, and [a heavily commented version of the file can be found here](https://github.com/davehorton/drachtio-server/blob/develop/drachtio.conf.xml) that provides additional detail to the summary provided below. 

### drachtio.conf.xml

A drachtio configuration file has the following high-level structure:
```xml
<drachtio>
  <admin/>
  <request-handlers/>
  <sip/>
  <cdrs/>
  <logging/>
</drachtio>
```
#### admin section
The **admin** section is required and specifies how the drachtio server will listen for incoming connections from drachtio applications. The information includes the tcp port to listen on, the address(es) to listen on (0.0.0.0 means all available interfaces), and the shared secret that is used for authentication.
```xml
<admin port="9022" secret="cymru">0.0.0.0</admin>
```
#### request-handlers section
The **request-handlers** section is optional and configures the drachtio process to establish [outbound connections](/docs#outbound-connections) to drachtio servers for some or all SIP methods instead of **inbound connections**.

The `<request-handlers>` element can have zero or more child `<request-handler>` elements. Each `<request-handlers>` defines a specific SIP method (or `*` to wildcard all methods) and an http(s) web callback to invoke when a new request of the specified method type arrives.  It is the responsibility of the user-supplied web callback to return information in an HTTP 200 OK response indicating how to route the call.

```xml
<request-handlers>
    <request-handler sip-method="INVITE">http://38.187.89.96:8080</request-handler>
</request-handlers>
```
With the configuration above in place, when the drachtio server receives a new incoming INVITE request, it will send an HTTP GET to the URL above, with HTTP query arguments
* `method`: the SIP method of the request
* `domain`: the SIP domain in the Request-URI
* `protocol`: the transport protocol used (e.g. 'udp', 'tcp', 'wss', etc)
* `source_address`: the IP address of the sender
* `fromUser`: the user part of the uri in the From header
* `toUser`: the user part of the uri in the To header
* `uriUser`: the user part of the uri in the Request-URI
* `contentType`: the Content-Type header in the request, if any
* `uri`: the full Request-URI

An example HTTP URL that gets sent out looks like this:
```bash
 http://38.187.89.96:8080/?method=INVITE&domain=server-01.drachtio.org&protocol=udp&source_address=10.132.0.29&fromUser=%2b15083084809&toUser=calltest&uriUser=r-ee78299f-2f85-4d92-97ab-24f1d11e2b69&contentType=application%2fsdp&uri=sip%3ar-ee78299f-2f85-4d92-97ab-24f1d11e2b69%server-01.drachtio.org%3bdst%3d%2b15083084809%2540139.59.165.83%3a5060&dst=%2b15083084809%2540139.59.165.83%3a5060
 ```

Based on the information above provided in the HTTP request, the user-supplied callback is responsible for indicating one of the following actions in a JSON body of the HTTP 200 OK response:
* return a non-success response to the request
* proxy the request
* redirect the request (valid for INVITE only)
* route the request to a specified drachtio application

The first three actions completely disposition the incoming SIP request -- i.e. no further interaction with a drachtio application occurs.  

The final action (route to an application) causes the drachtio server to establish an outbound tcp connection to a drachtio application listening on a specified port, which then receives and processes the request normally (e.g. in a `srf.invite((req, res)))` or equivalent).

Example JSON responses for each of the above action are illustrated below (note: a response should include only one of the JSON payloads below):
```js
// this would reject the call with a "503 Max Calls Exceeded" response
// note: reason is optional
{
  "reject":
  "data": {
      "status": 503,
      "reason": "Max Calls Exceeded"
  }
}

// this redirects the call to the address specified.
// the Contact header of the response will be populated accordingly
{
  "redirect":
  "data": {
      "contacts": [
          "sip:foo@bar.com"
      ]
  }
}

// this proxies the call accordingly
{
  "proxy":
  "data": {
      "destination": [
          "sip:foo@bar.com"
      ],
      recordRoute: true
  }
}

// this causes the request to be delivered to a drachtio app for further processing.
// the drachtio app must be listening on the uri provided; i.e an outbound connection.
{
  "route":
  "data": {
      "uri": "call-recording.default.svc.cluster.local:4000"
  }
}

// this causes the request to be delivered to a drachtio app for further processing.
// the drachtio app must be using tagged inbound connections.
{
  "route":
  "data": {
      "tag": "conferencing-app"
  }
}
```
> Note: the last stanza above applies to using tagged inbound connections, which were added recently.  For more details, [see here](https://drachtio.org/blog/introducing-tagged-inbound-connections/)

#### sip section

The `<sip>` section defines which addresses and ports the SIP stack will listen on, which protocols will be supported, where to find (if necessary) SSL certificates, and other SIP options.

##### contacts
The drachtio server can listen on multiple interfaces/addresses for SIP traffic. These are defined in a `<contacts>` element that has child `<contact>` elements for each SIP endpoint.  Examples of possible configuration are shown below.

```xml
<!-- listen on all addresses, default port 5060 for udp and tcp protocols -->
<sip>
  <contacts>
    <contact>sip:*;transport=udp,tcp</contact>
  </contacts>
</sip>
```
```xml
<!-- listen on ports 5060 and 5080 -->
<contacts>
  <contact>sip:*;transport=udp,tcp</contact>
  <contact>sip:*:5080;transport=udp,tcp</contact>
</contacts>
```
```xml
<!-- listen for secure websockets on specific address and port -->
<contacts>
  <contact>sip:192.168.100.23:443;transport=wss</contact>
</contacts>
```
Additionally, if the SIP server has been assigned an external address that should be used in the SIP signaling, this should be specified as follows:
```xml
<contacts>
  <contact external-ip="35.195.28.194">sip:10.132.0.22;transport=udp,tcp</contact>
</contacts>
```
This will cause the drachtio server to advertise its address as `35.195.28.194` in Contact and Via headers, even though its local assigned IP address is `10.132.0.22`.

Furthermore, if the drachtio server has an assigned DNS name, this should be configured as well so that it can detect when the Request-URI of an incoming SIP request is referring to the local host when the DNS name appears in the host portion.
```xml
<contacts>
  <contact dns-names="server01.drachtio.org" external-ip="35.195.28.194">sip:10.132.0.22;transport=udp,tcp</contact>
</contacts>
```
> Note: multiple DNS names can be provided in comma-separated format.

##### timers
The [SIP spec contains definitions for timers](https://tools.ietf.org/html/rfc3261#page-265) governing retransmissions of SIP requests and the like.  Generally, there is no need to modify the setting for these timers, but if desired this can be done as follows:
```xml
<timers>
  <t1>500</t1>
  <t2>4000</t2>
  <t4>5000</t4>
  <t1x64>32000</t1x64>
</timers>
```
> Note: values are in milliseconds.  The example above actually sets the timers to their defined default values, so if you are using this section you would like be setting them to some other values.  You only need to specify those timers that you want to adjust from their default values.

##### tls
If you are using either TLS or WSS as a transport, then you must specify where the associated tls certificates are stored on the server.

```xml
<tls>
  <key-file>/etc/letsencrypt/live/yourdomain/privkey.pem</key-file>
  <cert-file>/etc/letsencrypt/live/yourdomain/cert.pem</cert-file>
  <chain-file>/etc/letsencrypt/live/yourdomain/chain.pem</chain-file>
</tls>
```

##### outbound-proxy
This causes all outbound requests to be sent through an outbound proxy
```xml
<outbound-proxy>sip:10.10.10.1</outbound-proxy>
```

##### spammers
The drachtio server can examine the Contact, To, and From headers for distinctive signatures that indicate the request was sent from a spam source.  If a spammer is detected, the message can either be rejected or silently discarded.
```xml
<spammers action="reject" action="discard">
  <header name="User-Agent">
    <value>sip-cli</value>
    <value>sipcli</value>
    <value>friendly-scanner</value>
  </header>
  <header name="To">
    <value>sipvicious</value>
  </header>
</spammers>
```

##### capture-server
The drachtio server can be configured to send to [Homer](http://www.sipcapture.org/) using the [HEP](https://github.com/sipcapture/HEP) protocol.

```xml
<capture-server port="9060" hep-version="3" id="101">127.0.0.1</capture-server>
```

##### udp-mtu
*Added in version 0.7.3-rc2*

sofia-sip has an annoying feature where it forces an outbound request to go out TCP if the packet size exceeds a specific threshold (usually 1300 bytes). Tis configuration setting allows users to increase this threshold to an arbitrary value.

```xml
<udp-mtu>4096</udp-mtu>
```

#### logging section

The `<logging>` section defines where drachtio server will send logging information, including sip traces.

Logging destinations include the console, a named log file on the server, or syslog.  Any or all of them may be used at one time.

##### console

To log output to the console simply include a `<console\>` child element.

##### syslog

To send log output to a syslog server via UDP, specify the following:
```xml
<syslog>
  <address>127.0.0.1</address>
  <port>514</port>
  <facility>local6</facility>
</syslog>
```

##### log file

To send log output to a log file on the server, specify the following:
```xml
 <file>
  <name>/var/log/drachtio/drachtio.log</name>
  <archive>/var/log/drachtio/archive</archive>
  <size>50</size> 
  <maxSize>100</maxSize>
  <minSize>2000</minSize>
  <auto-flush>true</auto-flush>
</file>
```
The options are as follows:
* `name`: path to the log file
* `archive`: path a directory where older log files were be archived
* `size`: the size (in MB) at which the log file is truncated
* `maxSize`: the max size (in MB) of archived files to keep
* `minSize`: the minimum freespace (in MB) on the filesytem to maintain when archiving
* `auto-flush`: if true, log information is written immediately to disk; otherwise log file is buffered and written intermittently (slightly better performance)

##### loglevel

The overall system log level: 'notice', 'warning', 'error', 'info, or 'debug'.

```xml
<loglevel>info</loglevel>
```

> Note: 'info' is the recommended log level for production systems.  At this log level you will get sip traces, which are useful for debugging.

##### sofia-loglevel

The drachtio server uses the [sofia](https://github.com/davehorton/sofia-sip) library internally.  The log level for this library can be set from 0 (minimal) to 9 (extensive).

```xml
<sofia-loglevel>3</sofia-loglevel>
```

### command-line arguments

The `drachtio` executable can accept command-line arguments that specify some configuration parameters.  If provided, the command-line configuration parameters take preference over those specified in the configuration file.

The supported drachtio command-line arguments are:
* `--daemon` detach from the console and run as a daemon process.  Note: when running as a systemd service, this parameter is not necessary.
* `--noconfig` ignore any logging configuration in the configuration file
* `--file|-f filename` read configuration from specified file rather that `/etc/drachtio.conf.xml`
* `--user|-u user` run as the named user rather than root
* `--port|-p port` listen for admin connections on the named port
* `--contact|-c` specifies a listening address/port/protocol.  Multiple instances of this parameter may be provided
* `--external-ip ip-address` specifies an external address that the drachtio server should advertise in the SIP signaling. This parameter applies to the `--contact` parameter that it follows in the command line.
* `dns-name name` a dns name that refer to the local server. This parameter applies to the `--contact` parameter that it follows in the command line.
* `http-handler url` an HTTP URL of a web callback that will be invoked for all new incoming requests.  Setting this parameter turns on outbound connections for all SIP request types.
* `--loglevel level` the overall log level to set
* `--sofia-loglevel level` the log level of the sofia library
* `--stdout` write log output to console
* `--homer ip-address:port` ip address of homer capture server to send to. HEP3  and udp transport will be used
* `--homer-id id` id to use to represent this server when sending messages to homer
* `--version` print the drachtio server version to console and exit.
* `--mtu` specifies a message size, in bytes, for requests such that when outgoing requests exceed this threshold use of tcp is forced (this overrides the default sofia stack setting for the same). &nbsp;*Added in version 0.7.3-rc2*.





