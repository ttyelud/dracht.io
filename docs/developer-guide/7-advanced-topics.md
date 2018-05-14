# Advanced Topics

## Outbound connections

The examples so far have illustrated **inbound connections**; that is, a drachtio application establishing a tcp connection to a drachtio server.  These are created by calling [Srf#connect](/docs/api#Srf+connect):
```js
const Srf = require('drachtio-srf');
const srf = new Srf();

srf.connect({
  address: '192.168.1.100',
  port: 9022, 
  secret: 'cymru'
});

srf.on('connect', (hp) => console.log(`connected to drachtio listening on ${hp}`));
srf.on('error', (err) => console.log(`error connecting: ${err}`));
```
An inbound connection is intended to be a **long lasting** connection: the application connects when the application starts, and that connection is then used to transmit all SIP events and commands as long as the application is running.  

> Note: If the connection between the drachtio client and the server is interrupted, it will be automatically reestablished as long as the application has installed a listener for the 'error' event on the Srf instance.

Inbound connections are generally most useful in scenarios when a drachtio server is single-purposed, meaning all SIP requests are handled by a single application.  For example, if a drachtio server is specifically purposed to be a SIP proxy, and all incoming calls are treated by the same application logic, then an inbound connection between the drachtio application and server would probably be preferred.

However, it is also possible for the connections between the drachtio application and the server to be reversed: that is, the drachtio server establishes the connection to a drachtio server on a per-call (more specifically, a per SIP request) basis.  This is called an **outbound connection**, and it requires two things:
1. The drachtio server configuration file must include a [request-handler](/docs/drachtio-server#request-handlers-section) xml section that maps a specific SIP method type to an HTTP web callback, and
2. The drachtio application must call the [Srf#listen](/docs/api#Srf+listen) method, which causes it to listen for connections from a drachtio server rather than initiate them.

The sequence of events when outbound connections have been enabled are as follows:
1. The drachtio application starts, and begins listening on a specific IP address and port for connections from drachtio servers.
2. An incoming INVITE request (for example) is received by a drachtio server.
3. Because the drachtio server has been configured with a web callback for INVITE request types, an HTTP GET request is made to the web callback.  Information about the incoming call is passed to the web callback via url parameters in the request.
4. The web callback -- which is a user-supplied web app -- returns a JSON body indicating the ip address or dns name and tcp port where the drachtio application is listening.
5. The drachtio server retrieves the ip address and port from the response to the web callback and establishes a tcp connection to the drachtio application listening on that address:port.
6. The INVITE information is sent to the drachtio application over this new connection, and the standard drachtio middleware is invoked; e.g. `srf.invite((req, res))`.

### Mixing inbound and outbound connections

Is it possible to mix inbound and outbound connections?  

Sort of.  Here are the limitations:

1. A drachtio server can have both inbound and outbound connections, but a given SIP method type (e.g. INVITE) will exclusively use one or the other.  Specifically, if there is a `<request-handler>` element with a `sip-method` property set to either the method name or `*`, then outbound connections will be used for all incoming SIP requests of that method type; otherwise inbound connections will be used.
2. A single `Srf` instance must exclusively use only inbound or outbound connections; that is to say that it must call *either* [Srf#connect](/docs/api#Srf+connect) *or* [Srf#listen](/docs/api#Srf+listen) but not both.  A single application that wants to use both must create two (or more) Srf instances, or alternatively the functionality can be split into multiple applications.

### Terminating outbound connections

We mentioned above that inbound connections are long-lasting.

Outbound connections are not.  

An outbound connection is established when a specific SIP request arrives, and it is intended to last only until the application has determined that all logic related to that request has been performed. From a practical standpoint, since each new arriving request spawns a new tcp connection, it is important that connections are destroyed when the application logic is complete, so that we don't exhaust file descriptor or other resources on the server.

Because the determination of when all application logic has complete is, by definition, something that only the application can signal, we require the application to destroy the connection via an explicit call to [Srf#endSession](/docs/api#Srf+endSession).  Typically, an application will call this method when all SIP dialogs or transactions associated with or emanating from the initial SIP request have been destroyed.  

In a simple example of a UAS app connecting an incoming call, when the BYE that terminates the call is sent or received it would be appropriate to call [Srf#endSession](/docs/api#Srf+endSession).

> This method call is a 'no-op' (does nothing) when called on an inbound connection, so it is safe to call in code that may be dealing with an outbound or inbound connection.

### When to use outbound connections

There are two primary scenarios in which to use outbound connections:

1. When a single drachtio server is going to handle calls controlled by multiple different types of applications.  In this scenario, it can be useful to have a web callback examine the incoming calls and distribute them appropriately to the different drachtio applications based on per-call information (e.g. based on DID, we might associate calls to specific customers and then invoke customer-specific drachtio applications)
2. When drachtio applications are going to run in a containerized cluster environment, such as Kubernetes.  In this environment, it can be useful to create a Kubernetes Service for the drachtio cluster, and then use outbound connections to route incoming calls to the public address of the Kubernetes Service.  In general, it can make it easier to independently scale drachtio servers and groups of drachtio applications using outbound connections.

For more information on configuring drachtio server for outbound connections refer to the [drachtio server configuration documentation](/docs/drachtio-server#request-handlers-section).

### How to write an application that can be configured for either inbound or outbound
