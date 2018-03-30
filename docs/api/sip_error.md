<a name="SipError"></a>

## SipError ⇐ <code>Error</code>
Class representing a SIP non-success response to a transaction

**Kind**: global class  
**Extends:** <code>Error</code>  
<a name="new_SipError_new"></a>

### new SipError(status, [reason])
Create a SipError object


| Param | Type | Description |
| --- | --- | --- |
| status | <code>number</code> | SIP final status |
| [reason] | <code>string</code> | reason for failure; if not provided the standard reason associated with the provided SIP status is used |

