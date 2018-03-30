<a name="SipError"></a>

## SipError
**Extends:** <code>Error</code>  
Class representing a SIP non-success response to a transaction

<a name="new_SipError_new"></a>

### new SipError(status, [reason])

| Param | Type | Description |
| --- | --- | --- |
| status | <code>number</code> | SIP final status |
| [reason] | <code>string</code> | reason for failure; if not provided the standard reason associated with the provided SIP status is used |

Create a SipError object

