# SIP Dialogs

Conceptually, a SIP dialog is defined in [RFC 3261](https://tools.ietf.org/html/rfc3261) as a relationship between two SIP endpoints that persists for a period time.  Generally speaking, we are referring most often to a multimedia call initiated by a SIP INVITE transaction during which audio and/or video is exchanged. (Later we will discuss an alternative type of dialog created by a SUBSCRIBE transaction).

Within drachtio, A SIP dialog is an object that is created to represent a multimedia session and to allow a developer to manage such sessions: to create them, modify them, and tear them down.  

The examples we have shown till now have illustrated how to manage SIP interactions at the SIP message level. However, in most cases the drachtio SIP Dialog API provides a higher-level abstraction that makes it easier for developers to manage sessions.

## User Roles in a Dialog
Some basic terminology is going to be helpful before diving into the API and some examples.

A drachtio application can:
* initiate an INVITE transaction -- in which case we say it is acting as a 'User Agent Client', or UAC,
* respond to an incoming INVITE transaction -- in which case we call it a 'User Agent Server', or UAS, and/or
* *both* receive *and* send an INVITE transaction -- in which case we call it a 'back to back User Agent', or B2BUA

By the way, these are not the only types of applications we can build with drachtio. We can also build:
* a registar -- which is an application that responds to REGISTER requests
* a presence server -- which is an application that responds to SUBSCRIBE requests
* an instant messaging server -- which responds to MESSAGE requests ([see here](https://github.com/davehorton/drachtio-simple-server) for an example of a presence and messaging server)
* a sip proxy -- which is an application that routes and forwards SIP requests

Quite frequently, though, we will find ourselves wanting to build some form of SIP User Agent application, and that is what we will cover in this section.

The dialog API consists of the methods
* [Srf#createUAS](/docs/api#Srf+createUAC), 
* [Srf#createUAC](/docs/api#Srf+createUAC), and 
* [Srf#createB2BUA](/docs/api#Srf+createB2BUA).  

Each of these methods produces a [Dialog](/docs/api/#Dialog) object when a session is successfully established, which is returned via a callback (if provided) and resolves the Promise returned by each of the above methods.

Before we review the above three methods, let's examine the [Dialog](/docs/api/#Dialog) class itself, and how to work with it.

### Dialog

The Dialog class is an event emitter, and has the following properties, methods, and events.

#### properties
* `sip`: an object containing properties that identify the SIP dialog
* `sip.callId`: the SIP Call-Id associated with this dialog
* `sip.remoteTag`: the remote tag associated with the dialog
* `sip.localTag`: the local tag associated with the dialog
* `local`: an object containing properties associated with the local end of the dialog
* `local.sdp`: the local session description protocol
* `local.uri`: the local sip uri 
* `local.contact`: the local contact
* `remote`: an object containing properties associated with the remote end of the dialog
* `remote.sdp`: the remote session description protocol
* `remote.uri`: the remote sip uri 
* `remote.contact`: the local contact
* `id`: a unique identifier for the dialog with the drachtio framework 

#### methods
* [destroy(opts, callback)](/docs/api#Dialog+destroy): terminates a dialog, by sending a BYE (in the case of an INVITE dialog), or a NOTIFY with Subscription-State: terminated (in the case of a SUBSCRIBE dialog)

### UAS

When we receive an incoming call and connect it to an IVR, or to a conference bridge, our application is acting as a UAS.  


