---
title: CityPay Payment API
version: 6.2.21-SNAPSHOT
language_tabs:
  - json
  - xml
toc_footers:
  - <a href='mailto:support@citypay.com'>Any Integration Questions?</a>
  - V6.2.21-SNAPSHOT 2022-08-25
includes:
  - errorcodes
  - authresultcodes
  - avscodes
  - csccodes
  - ciphers
  - timeout_handling
  - testing_best_practice
search: true

---


# CityPay Payment API

Version: 6.2.21-SNAPSHOT
Last Updated: 2022-08-25


This CityPay API is a HTTP RESTful payment API used for direct server to server transactional processing. It
provides a number of payment mechanisms including: Internet, MOTO, Continuous Authority transaction processing,
3-D Secure decision handling using RFA Secure, Authorisation, Refunding, Pre-Authorisation, Cancellation/Voids and
Completion processing. The API is also capable of tokinsed payments using Card Holder Accounts.

## Compliance and Security
Your application will need to adhere to PCI-DSS standards to operate safely and to meet requirements set out by 
Visa and MasterCard and the PCI Security Standards Council. These include

* Data must be collected using TLS version 1.2 using [strong cryptography](#enabled-tls-ciphers). We will not accept calls to our API at
  lower grade encryption levels. We regularly scan our TLS endpoints for vulnerabilities and perform TLS assessments
  as part of our compliance program.
* The application must not store sensitive card holder data (CHD) such as the card security code (CSC) or
  primary access number (PAN)
* The application must not display the full card number on receipts, it is recommended to mask the PAN
  and show the last 4 digits. The API will return this for you for ease of receipt creation
* If you are developing a website, you will be required to perform regular scans on the network where you host the
  application to meet your compliance obligations
* You will be required to be PCI Compliant and the application must adhere to the security standard. Further information
  is available from [https://www.pcisecuritystandards.org/](https://www.pcisecuritystandards.org/)
* The API verifies that the request is for a valid account and originates from a trusted source using the remote IP
  address. Our application firewalls analyse data that may be an attempt to break a large number of security common
  security vulnerabilities.


## Base URLs

<table>
<tr><td> Production processing endpoint </td><td><code>https://api.citypay.com</code></td></tr> 
<tr><td> Testing service returning test results for all transactions </td><td><code>https://sandbox.citypay.com</code></td></tr> 

</table>

## Contact Details

Please contact CityPay Support

 - At our online <a href="https://citypay.atlassian.net/servicedesk/customer/portal/1">CityPay Service Desk</a>
 - Or via our website at <a href="https://citypay.com/customer-centre/technical-support.html">https://citypay.com/customer-centre/technical-support.html</a>

For any transaction investigations or integration support, please provide your

 - merchant id
 - a context id or identifier
 - a date and time of the request



## Authentication
### API Key

**cp-api-key**

header `cp-api-key`

The `cp-api-key` authentication header is required for all payment processing access.
All calls using this key will be validated against an acceptance list of IP addresses
and calls are scrutinised by the CityPay application firewall for security protection
and attack mitigation.

A key has been designed to:
- be temporal and time based. The key rotates frequently to protect against replay attacks and to ensure a
  computation derives your client details from the request
- to remain secret, the key value is your access permission to process transactions and
  although we have preventative measures to protect the key, undue exposure is not desirable
- to allow processing against multiple merchant accounts that belong to your CityPay account.
- to use a HTTP header value to protect undue logging mechanisms from logging data packet values and
  logically seperates authentication concerns from the body of data.
- keys typically have a TTL of 5 minutes in production and 20 minutes in Sandbox.
- keys should be rotated often and is recommended on each API call


A valid key is programmatically generated using

* your client id
* your client key

The algorithm for generating a key is

1. create a 256 bit `nonce` value such i.e. `ACB875AEF083DE292299BD69FCDEB5C5`
2. create a `dt` value which is the current date and time in the format `yyyyMMddHHmm` convert to bytes from a hex representation
3. generate a HmacSHA256 `hash` for the client licence key using a concatenation of clientid, nonce, dt
4. create a packet value of `clientId`, `nonce`, and `hash` delimited by `\u003A`
5. Base64 encode the packet

> The following example uses JavaScript and CryptoJS

```javascript
export function generateApiKey(clientId, licenceKey, nonce, dt = new Date()) {
  if (!nonce) {
    nonce = CryptoJS.lib.WordArray.random(128 / 8);
  } else if (typeof nonce === 'string') {
    nonce = Hex.parse(nonce);
  } else {
    throw new Error("Unsupported nonce type");
  }
  const msg = Utf8.parse(clientId)
  .concat(nonce)
  .concat(CryptoJS.lib.WordArray.create(dtToBuffer(dt)));
  const hash = HmacSHA256(msg, Utf8.parse(licenceKey));
  const packet = Utf8.parse(clientId + '\u003A' + nonce.toString(Hex).toUpperCase() + '\u003A').concat(hash);
  return Base64.stringify(packet);
}
```

> Example values for unit testing:

```JavaScript
  let exampleNonce = "ACB875AEF083DE292299BD69FCDEB5C5";
  let exampleDate = new Date(2020, 0, 1, 9, 23, 0, 0);
  let apiKey = generateApiKey("Dummy", "7G79TG62BAJTK669", exampleNonce, exampleDate);
  expect(apiKey).toBe('RHVtbXk6QUNCODc1QUVGMDgzREUyOTIyOTlCRDY5RkNERUI1QzU6tleiG2iztdBCGz64E3/HUhfKIdGWr3VnEtu2IkcmFjA=');
```

<aside class="notice">
We have example code in varying languages, please consult with your account and integration point of contact for details.
</aside>
### API Key

**cp-domain-key**

path `cp-domain-key`

The `cp-domain-key` authentication is required for host based authentication where integrations
are over direct HTTPS calls.
Calls using this key will be validated against a prefixed list of host addresses and the `Origin` or `Referer`
header of the HTTP call checked.
All calls are scrutinised by the CityPay application firewall for security protection
and attack mitigation.

A key has been designed to:
- be added to a HTML Form as an authentication token for a pre-registered domain.
- Allow for the registration of multiple domains
- Only calls which are host based may use a domain key

* your merchant id
* your access/licence key



# Authorisation and Payment API

.


## Authorisation

<div class="route-spec">
<div class="route-path">
 <span class="http-method http-method-post">POST</span>
 <span class="path">/v6/authorise</span>
</div>
<div class="security-methods"><span class="key sec-cp-api-key">cp-api-key</span> </div>
</div>

An authorisation process performs a standard transaction authorisation based on the provided parameters of its request.
The CityPay gateway will route your transaction via an Acquiring bank for subsequent authorisation to the appropriate card 
schemes such as Visa or MasterCard.

The authorisation API should be used for server environments to process transactions on demand and in realtime. 

The authorisation API can be used for multiple types of transactions including E-commerce, mail order, telephone order,
customer present (keyed), continuous authority, pre-authorisation and others. CityPay will configure your account for 
the appropriate coding and this will perform transparently by the gateway. 

Data properties that are required, may depend on the environment you are conducting payment for. Our API aims to be
 flexible enough to cater for these structures. Our integration team will aid you in providing the necessary data to 
 transact. 
 
 
## E-commerce workflows
 
For E-commerce transactions requiring 3DS, the API contains a fully accredited in built mechanism to handle authentication.

The Api and gateway has been accredited extensively with both Acquirers and Card Schemes to simplify the nature of these calls
into a simple structure for authentication, preventing integrators from performing lengthy and a costly accreditations with
Visa and MasterCard.

3D-secure has been around for a number of years and aims to shift the liability of a transaction away from a merchant back
to the card holder. A *liability shift* determines whether a card holder can charge back a transaction as unknown. Effectively
the process asks for a card holder to authenticate the transaction prior to authorisation producing a Cardholder 
verification value (CAVV) and ecommerce indicator (ECI) as evidence of authorisation.

3DS version 1 has now been replaced by 3DS version 2 to provide secure customer authentication (SCA) in line with EU regulation.
3DSv2 is being phased out and any accounts using version 1 of the protocol is expected to be migrated by March 2022. 

Any new integrations should only consider 3DSv2 flows. 

### 3DSv2

```json
{ 
  "RequestChallenged": {
    "acsurl": "https://bank.com/3DS/ACS",
    "creq": "SXQgd2FzIHRoZSBiZXN0IG9mIHRpbWVzLCBpdCB3YXMgdGhlIHdvcnN00...",
    "merchantid": 12345,
    "transno": 1,
    "threedserver_trans_id": "d652d8d2-d74a-4264-a051-a7862b10d5d6"
  }               
}
```

```xml
<RequestChallenged>
  <acsurl>https://bank.com/3DS/ACS</acsurl>
  <creq>SXQgd2FzIHRoZSBiZXN0IG9mIHRpbWVzLCBpdCB3YXMgdGhlIHdvcnN00...</creq>
  <merchantid>12345</merchantid>
  <transno>1</transno>
  <threedserver_trans_id>d652d8d2-d74a-4264-a051-a7862b10d5d6</threedserver_trans_id>
</RequestChallenged>
```

CityPay support 3DS version 2.1 for Verified by Visa, MasterCard Identity Check and American Express SafeKey 2.1. Version
2.2 is currently in development however this will be a seamless upgrade for all integrations.

#### 3-D Secure - None

![3DSv2 Frctionless Flow](/images/3dsv2-no3d.png)

A basic flow may involve no 3-D secure processing. This could happen if there is no ability to perform authentication.
An enrollment check may apply an "attempted" resolution to processing. In this instance a transaction may not meet any
liability shift. A transaction may result in a decline due to this. We are also able to prevent from transactions being
presented for authorisation if this occurs. 

#### 3-D Secure - Frictionless

![3DSv2 Frctionless Flow](/images/3dsv2-frictionless.png)

E-commerce transactions supporting 3DSv2 can benefit from seamlessly authenticated transactions which may perform a 
"frictionless" flow. This method will authenticate low risk transactions with minimal impact to a 
standard authorisation flow. Our API simply performs this on behalf of you the developer, the merchant and cardholder.

No redirection occurs and hence the flow is called frictionless and will appear as though a simple transaction 
authorisation has occurred.

#### 3-D Secure - Challenge

![3DSv2 Frctionless Flow](/images/3dsv2-challenge.png)

A transaction that is deemed as higher risk my be "challenged". In this instance, the API will return a
[request challenge](#requestchallenged) which will require your integration to forward the cardholder's browser to the 
given [ACS url](#acsurl). This should be performed by posting the [creq](#creq) value (the challenge request value). 

Once complete, the ACS will have already been in touch with our servers by sending us a result of the authentication
known as `RReq`.

To maintain session state, a parameter `threeDSSessionData` can be posted to the ACS url and will be returned alongside 
the `CRes` value. This will ensure that any controller code will be able to isolate state between calls. This field
is to be used by your own systems rather than ours and may be any value which can uniquely identify your cardholder's
session. As an option, we do provide a `threedserver_trans_id` value in the `RequestChallenged` packet which can be used
for the `threeDSSessionData` value as it is used to uniquely identify the 3D-Secure session. 

A common method of maintaining state is to provide a session related query string value in the `merchant_termurl` value
(also known as the `notificationUrl`). For example providing a url of `https://mystore.com/checkout?token=asny2348w4561..`
could return the user directly back to their session with your environment.

Once you have received a `cres` post from the ACS authentication service, this should be POSTed to the [cres](#cres) 
endpoint to perform full authorisation processing. 

Please note that the CRes returned to us is purely a mechanism of acknowledging that transactions should be committed for
authorisation. The ACS by this point will have sent us the verification value (CAVV) to perform a liability shift. The CRes
value will be validated for receipt of the CAVV and subsequently may return response codes illustrating this. 

To forward the user to the ACS, we recommend a simple auto submit HTML form.

> Simple auto submit HTML form

```html
<html lang="en">
	<head>
        <title>Forward to ACS</title>
		<script type="text/javascript">
        function onLoadEvent() { 
            document.acs.submit(); 
        }
        </script>
        <noscript>You will require JavaScript to be enabled to complete this transaction</noscript>
    </head>
    <body onload="onLoadEvent();">
        <form name="acs" action="{{ACSURL from Response}}" method="POST">
            <input type="hidden" name="creq" value="{{CReq Packet from Response}}" />
            <input type="hidden" name="threeDSSessionData" value="{{session-identifier}}" />
        </form>
    </body>
</html>
```

A full ACS test suite is available for 3DSv2 testing.
        
### Testing 3DSv2 Integrations

The API provides a mock 3dsV2 handler which performs a number of scenarios based on the value of the CSC in the request.

 CSC Value | Behaviour |
-----------|-----------|
 731       | Frictionless processing - Not authenticated |
 732       | Frictionless processing - Account verification count not be performed |        
 733       | Frictionless processing - Verification Rejected |        
 741       | Frictionless processing - Attempts Processing |        
 750       | Frictionless processing - Authenticated  |        
 761       | Triggers an error message |  
 Any       | Challenge Request |       


#### 3DSv1

**Please note that 3DSv1 should now be considered as deprecated.**

```json
{ 
  "AuthenticationRequired": {
    "acsurl": "https://bank.com/3DS/ACS",
    "pareq": "SXQgd2FzIHRoZSBiZXN0IG9mIHRpbWVzLCBpdCB3YXMgdGhlIHdvcnN00...",
    "md": "WQgZXZlcnl0aGluZyBiZW"
  }               
}
```

```xml
<AuthenticationRequired>
 <acsurl>https://bank.com/3DS/ACS</acsurl>
 <pareq>SXQgd2FzIHRoZSBiZXN0IG9mIHRpbWVzLCBpdCB3YXMgdGhlIHdvcnN00...</pareq>
 <md>WQgZXZlcnl0aGluZyBiZW</md>
</AuthenticationRequired>
```

For E-commerce transactions requiring 3DSv1, the API contains a built in MPI which will be called to check whether the
card is participating in 3DSv1 with Verified by Visa or MasterCard SecureCode. We only support Amex SafeKey with 3DSv2. Should the card be enrolled, a payer
request (PAReq) value will be created and returned back as an [authentication required](#authenticationrequired) response object.

Your system will need to process this authentication packet and forward the user's browser to an authentication server (ACS)
to gain the user's authentication. Once complete, the ACS will produce a HTTP `POST` call back to the URL supplied in
the authentication request as `merchant_termurl`. This URL should behave as a controller and handle the post data from the
ACS and on a forked server to server HTTP request, forward this data to the [pares authentication url](#pares) for
subsequent authorisation processing. You may prefer to provide a processing page whilst this is being processed.
Processing with our systems should be relatively quick and be between 500ms - 3000ms however it is desirable to let
the user see that something is happening rather than a pending browser.

The main reason for ensuring that this controller is two fold:

1. We are never in control of the user's browser in a server API call
2. The controller is actioned on your site to ensure that any post actions from authorisation can be executed in real time

To forward the user to the ACS, we recommend a simple auto submit HTML form.

> Simple auto submit HTML form

```html
<html lang="en">
	<head>
        <title>Forward to ACS</title>
		<script type="text/javascript">
        function onLoadEvent() { 
            document.acs.submit(); 
        }
        </script>
        <noscript>You will require JavaScript to be enabled to complete this transaction</noscript>
    </head>
    <body onload="onLoadEvent();">
        <form name="acs" action="{{ACSURL from Response}}" method="POST">
            <input type="hidden" name="PaReq" value="{{PaReq Packet from Response}}" />
            <input type="hidden" name="TermUrl" value="{{Your Controller}}" />
            <input type="hidden" name="MD" value="{{MD From Response}}" />
        </form>
    </body>
</html>
```

Please note that 3DSv1 is being phased out due to changes to strong customer authentication mechanisms. 3DSv2 addresses
this and will solidify the authorisation and confirmation process.

We provide a Test ACS for full 3DSv1 integration testing that simulates an ACS.


<div class="model-links">
 <a href="#requestModel-AuthorisationRequest">Request Model</a>
 <a href="#responseModel-AuthorisationRequest">Response Model</a>
</div>





> Basic capture call for a merchant with a given identifier

```json
{
  "AuthRequest":{
    "amount":"<integer>",
    "cardnumber":"<string>",
    "expmonth":"<integer>",
    "identifier":"<string>",
    "merchantid":"<integer>",
    "bill_to":{
      "address1":"<string>",
      "address2":"<string>",
      "address3":"<string>",
      "area":"<string>",
      "company":"<string>",
      "country":"<string>",
      "email":"<string>",
      "firstname":"<string>",
      "lastname":"<string>",
      "mobile_no":"<string>",
      "postcode":"<string>",
      "telephone_no":"<string>",
      "title":"<string>"
    },
    "expyear":"<integer>",
    "merchant_termurl":"<string>"
  }
}
```

```xml
<AuthRequest>
   <amount>&lt;integer&gt;</amount>
   <cardnumber>&lt;string&gt;</cardnumber>
   <expmonth>&lt;integer&gt;</expmonth>
   <identifier>&lt;string&gt;</identifier>
   <merchantid>&lt;integer&gt;</merchantid>
   <bill_to>
      <address1>&lt;string&gt;</address1>
      <address2>&lt;string&gt;</address2>
      <address3>&lt;string&gt;</address3>
      <area>&lt;string&gt;</area>
      <company>&lt;string&gt;</company>
      <country>&lt;string&gt;</country>
      <email>&lt;string&gt;</email>
      <firstname>&lt;string&gt;</firstname>
      <lastname>&lt;string&gt;</lastname>
      <mobile_no>&lt;string&gt;</mobile_no>
      <postcode>&lt;string&gt;</postcode>
      <telephone_no>&lt;string&gt;</telephone_no>
      <title>&lt;string&gt;</title>
   </bill_to>
   <expyear>&lt;integer&gt;</expyear>
   <merchant_termurl>&lt;string&gt;</merchant_termurl>
</AuthRequest>
```

<a id="requestModel-AuthorisationRequest"></a>
### Model AuthRequest

Request body for the AuthorisationRequest operation contains the following properties

<div class="requestModel"></div>

Field  | Type | Usage | Description |
---------|------|------|-------------|
 `amount` | integer *int32* | Required | The amount to authorise in the lowest unit of currency with a variable length to a maximum of 12 digits.<br/><br/>No decimal points are to be included and no divisional characters such as 1,024.<br/><br/>The amount should be the total amount required for the transaction.<br/><br/>For example with GBP £1,021.95 the amount value is 102195.<br/><br/> minLength: 1<br/>maxLength: 12 | 
 `cardnumber` | string  | Required | The card number (PAN) with a variable length to a maximum of 21 digits in numerical form. Any non numeric characters will be stripped out of the card number, this includes whitespace or separators internal of the provided value.<br/><br/>The card number must be treated as sensitive data. We only provide an obfuscated value in logging and reporting.  The plaintext value is encrypted in our database using AES 256 GMC bit encryption for settlement or refund purposes.<br/><br/>When providing the card number to our gateway through the authorisation API you will be handling the card data on your application. This will require further PCI controls to be in place and this value must never be stored.<br/><br/> minLength: 12<br/>maxLength: 22 | 
 `expmonth` | integer *int32* | Required | The month of expiry of the card. The month value should be a numerical value between 1 and 12.<br/><br/> minimum: 1<br/>maximum: 12 | 
 `expyear` | integer *int32* | Required | The year of expiry of the card.<br/><br/> minimum: 2000<br/>maximum: 2100 | 
 `identifier` | string  | Required | The identifier of the transaction to process. The value should be a valid reference and may be used to perform  post processing actions and to aid in reconciliation of transactions.<br/><br/>The value should be a valid printable string with ASCII character ranges from 0x32 to 0x127.<br/><br/>The identifier is recommended to be distinct for each transaction such as a [random unique identifier](https://en.wikipedia.org/wiki/Universally_unique_identifier) this will aid in ensuring each transaction is identifiable.<br/><br/>When transactions are processed they are also checked for duplicate requests. Changing the identifier on a subsequent request will ensure that a transaction is considered as different.<br/><br/> minLength: 4<br/>maxLength: 50 | 
 `merchantid` | integer *int32* | Required | Identifies the merchant account to perform processing for. | 
 `avs_postcode_policy` | string  | Optional | A policy value which determines whether an AVS postcode policy is enforced or bypassed.<br/><br/>Values are  `0` for the default policy (default value if not supplied). Your default values are determined by your account manager on setup of the account.<br/><br/> `1` for an enforced policy. Transactions that are enforced will be rejected if the AVS postcode numeric value does not match.<br/><br/> `2` to bypass. Transactions that are bypassed will be allowed through even if the postcode did not match.<br/><br/> `3` to ignore. Transactions that are ignored will bypass the result and not send postcode details for authorisation. | 
 `bill_to` | object | Optional | [ContactDetails](#contactdetails) Billing details of the card holder making the payment. These details may be used for AVS fraud analysis, 3DS and for future referencing of the transaction.<br/><br/>For AVS to work correctly, the billing details should be the registered address of the card holder as it appears on the statement with their card issuer. The numeric details will be passed through for analysis and may result in a decline if incorrectly provided. | 
 `csc` | string  | Optional | The Card Security Code (CSC) (also known as CV2/CVV2) is normally found on the back of the card (American Express has it on the front). The value helps to identify posession of the card as it is not available within the chip or magnetic swipe.<br/><br/>When forwarding the CSC, please ensure the value is a string as some values start with 0 and this will be stripped out by any integer parsing.<br/><br/>The CSC number aids fraud prevention in Mail Order and Internet payments.<br/><br/>Business rules are available on your account to identify whether to accept or decline transactions based on mismatched results of the CSC.<br/><br/>The Payment Card Industry (PCI) requires that at no stage of a transaction should the CSC be stored.<br/><br/>This applies to all entities handling card data.<br/><br/>It should also not be used in any hashing process.<br/><br/>CityPay do not store the value and have no method of retrieving the value once the transaction has been processed. For this reason, duplicate checking is unable to determine the CSC in its duplication check algorithm.<br/><br/> minLength: 3<br/>maxLength: 4 | 
 `csc_policy` | string  | Optional | A policy value which determines whether a CSC policy is enforced or bypassed.<br/><br/>Values are  `0` for the default policy (default value if not supplied). Your default values are determined by your account manager on setup of the account.<br/><br/> `1` for an enforced policy. Transactions that are enforced will be rejected if the CSC value does not match.<br/><br/> `2` to bypass. Transactions that are bypassed will be allowed through even if the CSC did not match.<br/><br/> `3` to ignore. Transactions that are ignored will bypass the result and not send the CSC details for authorisation. | 
 `currency` | string  | Optional | The processing currency for the transaction. Will default to the merchant account currency.<br/><br/>minLength: 3<br/>maxLength: 3 | 
 `duplicate_policy` | string  | Optional | A policy value which determines whether a duplication policy is enforced or bypassed. A duplication check has a window of time set against your account within which it can action. If a previous transaction with matching values occurred within the window, any subsequent transaction will result in a T001 result.<br/><br/>Values are  `0` for the default policy (default value if not supplied). Your default values are determined by your account manager on setup of the account.<br/><br/> `1` for an enforced policy. Transactions that are enforced will be checked for duplication within the duplication window.<br/><br/> `2` to bypass. Transactions that are bypassed will not be checked for duplication within the duplication window.<br/><br/> `3` to ignore. Transactions that are ignored will have the same affect as bypass. | 
 `match_avsa` | string  | Optional | A policy value which determines whether an AVS address policy is enforced, bypassed or ignored.<br/><br/>Values are  `0` for the default policy (default value if not supplied). Your default values are determined by your account manager on setup of the account.<br/><br/> `1` for an enforced policy. Transactions that are enforced will be rejected if the AVS address numeric value does not match.<br/><br/> `2` to bypass. Transactions that are bypassed will be allowed through even if the address did not match.<br/><br/> `3` to ignore. Transactions that are ignored will bypass the result and not send address numeric details for authorisation. | 
 `name_on_card` | string  | Optional | The card holder name as appears on the card such as MR N E BODY. Required for some acquirers.<br/><br/> minLength: 2<br/>maxLength: 45 | 
 `ship_to` | object | Optional | [ContactDetails](#contactdetails) Shipping details of the card holder making the payment. These details may be used for 3DS and for future referencing of the transaction. | 
 `threedsecure` | object | Optional | [ThreeDSecure](#threedsecure) ThreeDSecure element, providing values to enable full 3DS processing flows. | 
 `trans_info` | string  | Optional | Further information that can be added to the transaction will display in reporting. Can be used for flexible values such as operator id.<br/><br/>maxLength: 50 | 
 `trans_type` | string  | Optional | The type of transaction being submitted. Normally this value is not required and your account manager may request that you set this field.<br/><br/>maxLength: 1 | 


### Business Extension: MCC6012

Supports the mcc6012 business extension by adding the following parameters to the request.

Field	| Type| Description |
-----|------|-------------|
`mcc6012` | object | [MCC6012](#mcc6012) If the merchant is MCC coded as 6012, additional values are required for authorisation. | 



### Business Extension: 3DSv1 MPI

Supports the 3dsv1 mpi business extension by adding the following parameters to the request.

Field	| Type| Description |
-----|------|-------------|
`external_mpi` | object | [ExternalMPI](#externalmpi) If an external 3DSv1 MPI is used for authentication, values provided can be supplied in this element. | 



### Business Extension: Airline

Supports the airline business extension by adding the following parameters to the request.

Field	| Type| Description |
-----|------|-------------|
`airline_data` | object | [AirlineAdvice](#airlineadvice) Additional advice for airline integration that can be applied on an authorisation request.<br/><br/>As tickets are normally not allocated until successful payment it is normal for a transaction to be pre-authorised  and the airline advice supplied on a capture request instead. Should the data already exist and an auth and  capture is preferred. This data may be supplied. | 




<a id="responseModel-AuthorisationRequest"></a>
### Response

Responses for the AuthorisationRequest operation are

<div class="responseModel"></div>

 StatusCode | Description | Content-Type | Model |
------------|-------------|--------------|-------|
 `200` | A decision made by the result of processing. | `application/json` <br/>`text/xml` | [Decision](#decision) |  
 `400` | Bad Request. Should the incoming data not be validly determined. |  |  
 `401` | Unauthorized. No api key has been provided and is required for this operation. |  |  
 `403` | Forbidden. The api key was provided and understood but is either incorrect or does not have permission to access the account provided on the request. |  |  
 `422` | Unprocessable Entity. Should a failure occur that prevents processing of the API call. | `application/json` <br/>`text/xml` | [Error](#error) |  





## Bin Lookup

<div class="route-spec">
<div class="route-path">
 <span class="http-method http-method-post">POST</span>
 <span class="path">/v6/bin</span>
</div>
<div class="security-methods"><span class="key sec-cp-api-key">cp-api-key</span> </div>
</div>

A bin range lookup service can be used to check what a card is, as seen by the gateway. Each card number's 
leading digits help to identify who

0. the card scheme is such as Visa, MasterCard or American Express 
1. the issuer of the card, such as the bank
2. it's country of origin
3. it's currency of origin

Our gateway has 450 thousand possible bin ranges and uses a number of algorithms to determine the likelihood of the bin
data. The request requires a bin value of between 6 and 12 digits. The more digits provided may ensure a more accurate
result.


<div class="model-links">
 <a href="#requestModel-BinRangeLookupRequest">Request Model</a>
 <a href="#responseModel-BinRangeLookupRequest">Response Model</a>
</div>





<a id="requestModel-BinRangeLookupRequest"></a>
### Model BinLookup

Request body for the BinRangeLookupRequest operation contains the following properties

<div class="requestModel"></div>

Field  | Type | Usage | Description |
---------|------|------|-------------|
 `bin` | integer *int32* | Required | A bin value to use for lookup.<br/><br/>minLength: 6<br/>maxLength: 12 | 




<a id="responseModel-BinRangeLookupRequest"></a>
### Response

Responses for the BinRangeLookupRequest operation are

<div class="responseModel"></div>

 StatusCode | Description | Content-Type | Model |
------------|-------------|--------------|-------|
 `200` | A result of the bin lookup request returning a bin object determined by the gateway service. | `application/json` <br/>`text/xml` | [Bin](#bin) |  
 `400` | Bad Request. Should the incoming data not be validly determined. |  |  
 `401` | Unauthorized. No api key has been provided and is required for this operation. |  |  
 `403` | Forbidden. The api key was provided and understood but is either incorrect or does not have permission to access the account provided on the request. |  |  
 `422` | Unprocessable Entity. Should a failure occur that prevents processing of the API call. | `application/json` <br/>`text/xml` | [Error](#error) |  





## Capture

<div class="route-spec">
<div class="route-path">
 <span class="http-method http-method-post">POST</span>
 <span class="path">/v6/capture</span>
</div>
<div class="security-methods"><span class="key sec-cp-api-key">cp-api-key</span> </div>
</div>

_The capture process only applies to transactions which have been pre-authorised only._ 

The capture process will ensure
that a transaction will now settle. It is expected that a capture call will be provided within 3 days or
a maximum of 7 days.

A capture request is provided to confirm that you wish the transaction to be settled. This request can
contain a final amount for the transaction which is different to the original authorisation amount. This
may be useful in a delayed system process such as waiting for stock to be ordered, confirmed, or services
provided before the final cost is known.

When a transaction is completed, a new authorisation code may be created and a new confirmation
can be sent online to the acquiring bank.

Once the transaction has been processed. A standard [`Acknowledgement`](#acknowledgement) will be returned,
outlining the result of the transaction. On a successful completion process, the transaction will
be available for the settlement and completed at the end of the day.


<div class="model-links">
 <a href="#requestModel-CaptureRequest">Request Model</a>
 <a href="#responseModel-CaptureRequest">Response Model</a>
</div>





> Basic capture call for a merchant with a given identifier

```json
{
  "CaptureRequest":{
    "merchantid":123456,
    "identifier":"318f2bc5-d9e0-4ddf-9df1-1ea9e4890ca9"
  }
}
```

```xml
<CaptureRequest>
   <merchantid>123456</merchantid>
   <identifier>318f2bc5-d9e0-4ddf-9df1-1ea9e4890ca9</identifier>
</CaptureRequest>
```


> Basic capture call for a merchant with a transno and final amount

```json
{
  "CaptureRequest":{
    "merchantid":123456,
    "transno":11275,
    "amount":6795
  }
}
```

```xml
<CaptureRequest>
   <merchantid>123456</merchantid>
   <transno>11275</transno>
   <amount>6795</amount>
</CaptureRequest>
```


> Capture call for a merchant with identifier and airline data once a ticket has been issued

```json
{
  "CaptureRequest":{
    "merchantid":123456,
    "identifier":"318f2bc5-d9e0-4ddf-9df1-1ea9e4890ca9",
    "airline-data":{
      "carrier-name":"Acme Air",
      "transaction-type":"TKT",
      "ticketno":"114477822",
      "segment1":{
        "flight-number":"724",
        "carrier-code":"ZZ",
        "arrival-location-code":"LGW",
        "departure-date":"2020-01-23"
      }
    }
  }
}
```

```xml
<CaptureRequest>
   <merchantid>123456</merchantid>
   <identifier>318f2bc5-d9e0-4ddf-9df1-1ea9e4890ca9</identifier>
   <airline-data>
      <carrier-name>Acme Air</carrier-name>
      <transaction-type>TKT</transaction-type>
      <ticketno>114477822</ticketno>
      <segment1>
         <flight-number>724</flight-number>
         <carrier-code>ZZ</carrier-code>
         <arrival-location-code>LGW</arrival-location-code>
         <departure-date>2020-01-23</departure-date>
      </segment1>
   </airline-data>
</CaptureRequest>
```

<a id="requestModel-CaptureRequest"></a>
### Model CaptureRequest

Request body for the CaptureRequest operation contains the following properties

<div class="requestModel"></div>

Field  | Type | Usage | Description |
---------|------|------|-------------|
 `merchantid` | integer *int32* | Required | Identifies the merchant account to perform the capture for. | 
 `amount` | integer *int32* | Optional | The completion amount provided in the lowest unit of currency for the specific currency of the merchant, with a variable length to a maximum of 12 digits. No decimal points to be included. For example with GBP 75.45 use the value 7545. Please check that you do not supply divisional characters such as 1,024 in the request which may be caused by some number formatters.<br/><br/>If no amount is supplied, the original processing amount is used.<br/><br/> minLength: 1<br/>maxLength: 12 | 
 `identifier` | string  | Optional | The identifier of the transaction to capture. If an empty value is supplied then a `trans_no` value must be supplied.<br/><br/>minLength: 4<br/>maxLength: 50 | 
 `transno` | integer *int32* | Optional | The transaction number of the transaction to look up and capture. If an empty value is supplied then an identifier value must be supplied. | 


### Business Extension: Airline

Supports the airline business extension by adding the following parameters to the request.

Field	| Type| Description |
-----|------|-------------|
`airline_data` | object | [AirlineAdvice](#airlineadvice) Additional advice to be applied for the capture request. | 




<a id="responseModel-CaptureRequest"></a>
### Response

Responses for the CaptureRequest operation are

<div class="responseModel"></div>

 StatusCode | Description | Content-Type | Model |
------------|-------------|--------------|-------|
 `200` | A result and acknowledgement of the capture request. The response will return a `000/001` response on a successful capture otherwise an error code response explaining the error. | `application/json` <br/>`text/xml` | [Acknowledgement](#acknowledgement) |  
 `400` | Bad Request. Should the incoming data not be validly determined. |  |  
 `401` | Unauthorized. No api key has been provided and is required for this operation. |  |  
 `403` | Forbidden. The api key was provided and understood but is either incorrect or does not have permission to access the account provided on the request. |  |  
 `422` | Unprocessable Entity. Should a failure occur that prevents processing of the API call. | `application/json` <br/>`text/xml` | [Error](#error) |  





## CRes

<div class="route-spec">
<div class="route-path">
 <span class="http-method http-method-post">POST</span>
 <span class="path">/v6/cres</span>
</div>
<div class="security-methods"><span class="key sec-cp-api-key">cp-api-key</span> </div>
</div>

The CRes request performs authorisation processing once a challenge request has been completed
with an Authentication Server (ACS). This challenge response contains confirmation that will
allow the API systems to return an authorisation response based on the result. Our systems will 
know out of band via an `RReq` call by the ACS to notify us if the liability shift has been issued.

Any call to the CRes operation will require a previous authorisation request and cannot be called 
on its own without a previous [request challenge](#requestchallenged) being obtained.


<div class="model-links">
 <a href="#requestModel-CResRequest">Request Model</a>
 <a href="#responseModel-CResRequest">Response Model</a>
</div>





> PaRes example request

```json
{
  "CResAuthRequest":{
    "cres":"<base64>"
  }
}
```

```xml
<CResAuthRequest>
   <cres>&lt;base64&gt;</cres>
</CResAuthRequest>
```

<a id="requestModel-CResRequest"></a>
### Model CResAuthRequest

Request body for the CResRequest operation contains the following properties

<div class="requestModel"></div>

Field  | Type | Usage | Description |
---------|------|------|-------------|
 `cres` | string *base64* | Optional | The challenge response data forwarded by the ACS in 3D-Secure V2 processing. Data should be forwarded to CityPay unchanged for subsequent authorisation and processing. | 




<a id="responseModel-CResRequest"></a>
### Response

Responses for the CResRequest operation are

<div class="responseModel"></div>

 StatusCode | Description | Content-Type | Model |
------------|-------------|--------------|-------|
 `200` | A result of processing the 3DSv2 authorisation data. | `application/json` <br/>`text/xml` | [AuthResponse](#authresponse) |  
 `400` | Bad Request. Should the incoming data not be validly determined. |  |  
 `401` | Unauthorized. No api key has been provided and is required for this operation. |  |  
 `403` | Forbidden. The api key was provided and understood but is either incorrect or does not have permission to access the account provided on the request. |  |  
 `422` | Unprocessable Entity. Should a failure occur that prevents processing of the API call. | `application/json` <br/>`text/xml` | [Error](#error) |  





## PaRes

<div class="route-spec">
<div class="route-path">
 <span class="http-method http-method-post">POST</span>
 <span class="path">/v6/pares</span>
</div>
<div class="security-methods"><span class="key sec-cp-api-key">cp-api-key</span> </div>
</div>

The Payer Authentication Response (PaRes) is an operation after the result of authentication 
 being performed. The request uses an encoded packet of authentication data to 
notify us of the completion of the liability shift. Once this value has been unpacked and its
signature is checked, our systems will proceed to authorisation processing.  

Any call to the PaRes operation will require a previous authorisation request and cannot be called 
on its own without a previous [authentication required](#authenticationrequired)  being obtained.


<div class="model-links">
 <a href="#requestModel-PaResRequest">Request Model</a>
 <a href="#responseModel-PaResRequest">Response Model</a>
</div>





> PaRes example request

```json
{
  "PaResAuthRequest":{
    "md":"<string>",
    "pares":"<base64>"
  }
}
```

```xml
<PaResAuthRequest>
   <md>&lt;string&gt;</md>
   <pares>&lt;base64&gt;</pares>
</PaResAuthRequest>
```

<a id="requestModel-PaResRequest"></a>
### Model PaResAuthRequest

Request body for the PaResRequest operation contains the following properties

<div class="requestModel"></div>

Field  | Type | Usage | Description |
---------|------|------|-------------|
 `md` | string  | Required | The Merchant Data (MD) which is a unique ID to reference the authentication session.<br/><br/>This value will be created by CityPay when required. When responding from the ACS, this value will be returned by the ACS. | 
 `pares` | string *base64* | Required | The Payer Authentication Response packet which is returned by the ACS containing the  response of the authentication session including verification values. The response  is a base64 encoded packet and should be forwarded to CityPay untouched. | 




<a id="responseModel-PaResRequest"></a>
### Response

Responses for the PaResRequest operation are

<div class="responseModel"></div>

 StatusCode | Description | Content-Type | Model |
------------|-------------|--------------|-------|
 `200` | A result of processing the 3DSv1 authorisation data. | `application/json` <br/>`text/xml` | [AuthResponse](#authresponse) |  
 `400` | Bad Request. Should the incoming data not be validly determined. |  |  
 `401` | Unauthorized. No api key has been provided and is required for this operation. |  |  
 `403` | Forbidden. The api key was provided and understood but is either incorrect or does not have permission to access the account provided on the request. |  |  
 `422` | Unprocessable Entity. Should a failure occur that prevents processing of the API call. | `application/json` <br/>`text/xml` | [Error](#error) |  





## Refund

<div class="route-spec">
<div class="route-path">
 <span class="http-method http-method-post">POST</span>
 <span class="path">/v6/refund</span>
</div>
<div class="security-methods"><span class="key sec-cp-api-key">cp-api-key</span> </div>
</div>

A refund request which allows for the refunding of a previous transaction up 
and to the amount of the original sale. A refund will be performed against the 
original card used to process the transaction.


<div class="model-links">
 <a href="#requestModel-RefundRequest">Request Model</a>
 <a href="#responseModel-RefundRequest">Response Model</a>
</div>





<a id="requestModel-RefundRequest"></a>
### Model RefundRequest

Request body for the RefundRequest operation contains the following properties

<div class="requestModel"></div>

Field  | Type | Usage | Description |
---------|------|------|-------------|
 `amount` | integer *int32* | Required | The amount to refund in the lowest unit of currency with a variable length to a maximum of 12 digits.<br/><br/>The amount should be the total amount required to refund for the transaction up to the original processed amount.<br/><br/>No decimal points are to be included and no divisional characters such as 1,024.<br/><br/>For example with GBP £1,021.95 the amount value is 102195.<br/><br/> minLength: 1<br/>maxLength: 12 | 
 `identifier` | string  | Required | The identifier of the refund to process. The value should be a valid reference and may be used to perform  post processing actions and to aid in reconciliation of transactions.<br/><br/>The value should be a valid printable string with ASCII character ranges from 0x32 to 0x127.<br/><br/>The identifier is recommended to be distinct for each transaction such as a [random unique identifier](https://en.wikipedia.org/wiki/Universally_unique_identifier) this will aid in ensuring each transaction is identifiable.<br/><br/>When transactions are processed they are also checked for duplicate requests. Changing the identifier on a subsequent request will ensure that a transaction is considered as different.<br/><br/> minLength: 4<br/>maxLength: 50 | 
 `merchantid` | integer *int32* | Required | Identifies the merchant account to perform the refund for. | 
 `refund_ref` | integer *int32* | Required | A reference to the original transaction number that is wanting to be refunded. The original  transaction must be on the same merchant id, previously authorised. | 
 `trans_info` | string  | Optional | Further information that can be added to the transaction will display in reporting. Can be used for flexible values such as operator id.<br/><br/>maxLength: 50 | 




<a id="responseModel-RefundRequest"></a>
### Response

Responses for the RefundRequest operation are

<div class="responseModel"></div>

 StatusCode | Description | Content-Type | Model |
------------|-------------|--------------|-------|
 `200` | A result of the refund of sale processing. | `application/json` <br/>`text/xml` | [AuthResponse](#authresponse) |  
 `400` | Bad Request. Should the incoming data not be validly determined. |  |  
 `401` | Unauthorized. No api key has been provided and is required for this operation. |  |  
 `403` | Forbidden. The api key was provided and understood but is either incorrect or does not have permission to access the account provided on the request. |  |  
 `422` | Unprocessable Entity. Should a failure occur that prevents processing of the API call. | `application/json` <br/>`text/xml` | [Error](#error) |  





## Retrieval

<div class="route-spec">
<div class="route-path">
 <span class="http-method http-method-post">POST</span>
 <span class="path">/v6/retrieve</span>
</div>
<div class="security-methods"><span class="key sec-cp-api-key">cp-api-key</span> </div>
</div>

A retrieval request which allows an integration to obtain the result of a transaction processed
in the last 90 days. The request allows for retrieval based on the identifier or transaction 
number. 

The process may return multiple results in particular where a transaction was processed multiple
times against the same identifier. This can happen if errors were first received. The API therefore
returns up to the first 5 transactions in the latest date time order.

It is not intended for this operation to be a replacement for reporting and only allows for base transaction
information to be returned.


<div class="model-links">
 <a href="#requestModel-RetrievalRequest">Request Model</a>
 <a href="#responseModel-RetrievalRequest">Response Model</a>
</div>





> Basic retrieval call for a merchant with a given identifier

```json
{
  "RetrieveRequest":{
    "merchantid":123456,
    "identifier":"318f2bc5-d9e0-4ddf-9df1-1ea9e4890ca9"
  }
}
```

```xml
<RetrieveRequest>
   <merchantid>123456</merchantid>
   <identifier>318f2bc5-d9e0-4ddf-9df1-1ea9e4890ca9</identifier>
</RetrieveRequest>
```

<a id="requestModel-RetrievalRequest"></a>
### Model RetrieveRequest

Request body for the RetrievalRequest operation contains the following properties

<div class="requestModel"></div>

Field  | Type | Usage | Description |
---------|------|------|-------------|
 `merchantid` | integer *int32* | Required | The merchant account to retrieve data for. | 
 `identifier` | string  | Optional | The identifier of the transaction to retrieve. Optional if a transaction number is provided.<br/><br/>minLength: 4<br/>maxLength: 50 | 
 `transno` | integer *int32* | Optional | The transaction number of a transaction to retrieve. Optional if an identifier is supplied. | 




<a id="responseModel-RetrievalRequest"></a>
### Response

Responses for the RetrievalRequest operation are

<div class="responseModel"></div>

 StatusCode | Description | Content-Type | Model |
------------|-------------|--------------|-------|
 `200` | A result of the retrieval request. | `application/json` <br/>`text/xml` | [AuthReferences](#authreferences) |  
 `400` | Bad Request. Should the incoming data not be validly determined. |  |  
 `401` | Unauthorized. No api key has been provided and is required for this operation. |  |  
 `403` | Forbidden. The api key was provided and understood but is either incorrect or does not have permission to access the account provided on the request. |  |  
 `422` | Unprocessable Entity. Should a failure occur that prevents processing of the API call. | `application/json` <br/>`text/xml` | [Error](#error) |  





## Void

<div class="route-spec">
<div class="route-path">
 <span class="http-method http-method-post">POST</span>
 <span class="path">/v6/void</span>
</div>
<div class="security-methods"><span class="key sec-cp-api-key">cp-api-key</span> </div>
</div>

_The void process generally applies to transactions which have been pre-authorised only however voids can occur 
on the same day if performed before batching and settlement._ 

The void process will ensure that a transaction will now settle. It is expected that a void call will be 
provided on the same day before batching and settlement or within 3 days or within a maximum of 7 days.

Once the transaction has been processed as a void, an [`Acknowledgement`](#acknowledgement) will be returned,
outlining the result of the transaction.


<div class="model-links">
 <a href="#requestModel-VoidRequest">Request Model</a>
 <a href="#responseModel-VoidRequest">Response Model</a>
</div>





> Basic capture call for a merchant with a given identifier

```json
{
  "VoidRequest":{
    "merchantid":123456,
    "identifier":"318f2bc5-d9e0-4ddf-9df1-1ea9e4890ca9"
  }
}
```

```xml
<VoidRequest>
   <merchantid>123456</merchantid>
   <identifier>318f2bc5-d9e0-4ddf-9df1-1ea9e4890ca9</identifier>
</VoidRequest>
```


> Basic capture call for a merchant with a transno and final amount

```json
{
  "VoidRequest":{
    "merchantid":123456,
    "transno":11275
  }
}
```

```xml
<VoidRequest>
   <merchantid>123456</merchantid>
   <transno>11275</transno>
</VoidRequest>
```

<a id="requestModel-VoidRequest"></a>
### Model VoidRequest

Request body for the VoidRequest operation contains the following properties

<div class="requestModel"></div>

Field  | Type | Usage | Description |
---------|------|------|-------------|
 `merchantid` | integer *int32* | Required | Identifies the merchant account to perform the void for. | 
 `identifier` | string  | Optional | The identifier of the transaction to void. If an empty value is supplied then a `trans_no` value must be supplied.<br/><br/>minLength: 4<br/>maxLength: 50 | 
 `transno` | integer *int32* | Optional | The transaction number of the transaction to look up and void. If an empty value is supplied then an identifier value must be supplied. | 




<a id="responseModel-VoidRequest"></a>
### Response

Responses for the VoidRequest operation are

<div class="responseModel"></div>

 StatusCode | Description | Content-Type | Model |
------------|-------------|--------------|-------|
 `200` | </br>A result and acknowledgement of the void request, returning an `080/003` response code on successful void/cancellation of the transaction.</br></br>If an error occurs an error code will be returned explaining the failure. | `application/json` <br/>`text/xml` | [Acknowledgement](#acknowledgement) |  
 `400` | Bad Request. Should the incoming data not be validly determined. |  |  
 `401` | Unauthorized. No api key has been provided and is required for this operation. |  |  
 `403` | Forbidden. The api key was provided and understood but is either incorrect or does not have permission to access the account provided on the request. |  |  
 `422` | Unprocessable Entity. Should a failure occur that prevents processing of the API call. | `application/json` <br/>`text/xml` | [Error](#error) |  





# Batch Processing API

Batch processing uses the Batch and Instalment Service (BIS) which allows for transaction processing against cardholder 
accounts using a dynamic batch file. For merchants who process on schedules and dynamic amounts, the service allows for 
the presentation of cardholder account references and transaction requirements to run as a scheduled batch.



## Batch Process Request

<div class="route-spec">
<div class="route-path">
 <span class="http-method http-method-post">POST</span>
 <span class="path">/v6/batch/process</span>
</div>
<div class="security-methods"><span class="key sec-cp-api-key">cp-api-key</span> </div>
</div>

A batch process request is used to start the batch process workflow by uploading batch
data and initialising a new batch for processing. Once validated the batch will be queued
for processing and further updates can be received by a subsequent call to retrieve the batch
status.


<div class="model-links">
 <a href="#requestModel-BatchProcessRequest">Request Model</a>
 <a href="#responseModel-BatchProcessRequest">Response Model</a>
</div>





<a id="requestModel-BatchProcessRequest"></a>
### Model ProcessBatchRequest

Request body for the BatchProcessRequest operation contains the following properties

<div class="requestModel"></div>

Field  | Type | Usage | Description |
---------|------|------|-------------|
 `batch_date` | string *date* | Required | The date and time that the file was created in ISO-8601 format. | 
 `batch_id` | integer *int32* | Required | The id is a referencable id for the batch that should be generated by your integration. Its recommended to use an incremental id to help determine if a batch has been skipped or missed. The id is used by reporting systems to reference the unique batch alongside your client id.<br/><br/> maxLength: 8<br/>minimum: 1 | 
 `transactions` | array | Required | Transactions requested for processing. There is a logical limit of 10,000 transactions that can be processed in a single batch. The sandbox will accept up to 100 transactions.<br/><br/>[BatchTransaction](#batchtransaction) | 
 `client_account_id` | string  | Optional | The batch account id to process the batch for. Defaults to your client id if not provided.<br/><br/>minLength: 3<br/>maxLength: 20 | 




<a id="responseModel-BatchProcessRequest"></a>
### Response

Responses for the BatchProcessRequest operation are

<div class="responseModel"></div>

 StatusCode | Description | Content-Type | Model |
------------|-------------|--------------|-------|
 `200` | Request to process a batch provided in the request. | `application/json` <br/>`text/xml` | [ProcessBatchResponse](#processbatchresponse) |  
 `400` | Bad Request. Should the incoming data not be validly determined. |  |  
 `401` | Unauthorized. No api key has been provided and is required for this operation. |  |  
 `403` | Forbidden. The api key was provided and understood but is either incorrect or does not have permission to access the account provided on the request. |  |  
 `422` | Unprocessable Entity. Should a failure occur that prevents processing of the API call. | `application/json` <br/>`text/xml` | [Error](#error) |  





## BatchReportRequest

<div class="route-spec">
<div class="route-path">
 <span class="http-method http-method-post">POST</span>
 <span class="path">/v6/batch/retrieve</span>
</div>
<div class="security-methods"><span class="key sec-cp-api-key">cp-api-key</span> </div>
</div>

The operation is used to retrieve a report of the result of a batch process.

<div class="model-links">
 <a href="#requestModel-BatchReportRequest">Request Model</a>
 <a href="#responseModel-BatchReportRequest">Response Model</a>
</div>





<a id="requestModel-BatchReportRequest"></a>
### Model BatchReportRequest

Request body for the BatchReportRequest operation contains the following properties

<div class="requestModel"></div>

Field  | Type | Usage | Description |
---------|------|------|-------------|
 `batch_id` | integer *int32* | Required | The batch id specified in the batch processing request.<br/><br/>maxLength: 8<br/>minimum: 1 | 
 `client_account_id` | string  | Optional | The batch account id that the batch was processed for. Defaults to your client id if not provided.<br/><br/>minLength: 3<br/>maxLength: 20 | 




<a id="responseModel-BatchReportRequest"></a>
### Response

Responses for the BatchReportRequest operation are

<div class="responseModel"></div>

 StatusCode | Description | Content-Type | Model |
------------|-------------|--------------|-------|
 `200` | The report for a given batch. | `application/json` <br/>`text/xml` | [BatchReportResponseModel](#batchreportresponsemodel) |  
 `400` | Bad Request. Should the incoming data not be validly determined. |  |  
 `401` | Unauthorized. No api key has been provided and is required for this operation. |  |  
 `403` | Forbidden. The api key was provided and understood but is either incorrect or does not have permission to access the account provided on the request. |  |  
 `422` | Unprocessable Entity. Should a failure occur that prevents processing of the API call. | `application/json` <br/>`text/xml` | [Error](#error) |  





## CheckBatchStatus

<div class="route-spec">
<div class="route-path">
 <span class="http-method http-method-post">POST</span>
 <span class="path">/v6/batch/status</span>
</div>
<div class="security-methods"><span class="key sec-cp-api-key">cp-api-key</span> </div>
</div>

The operation is used to retrieve the status of a batch process.

<div class="model-links">
 <a href="#requestModel-CheckBatchStatusRequest">Request Model</a>
 <a href="#responseModel-CheckBatchStatusRequest">Response Model</a>
</div>





<a id="requestModel-CheckBatchStatusRequest"></a>
### Model CheckBatchStatus

Request body for the CheckBatchStatusRequest operation contains the following properties

<div class="requestModel"></div>

Field  | Type | Usage | Description |
---------|------|------|-------------|
 `batch_id` | array | Required | type: integer | 
 `client_account_id` | string  | Optional | The batch account id to obtain the batch for. Defaults to your client id if not provided.<br/><br/>minLength: 3<br/>maxLength: 20 | 




<a id="responseModel-CheckBatchStatusRequest"></a>
### Response

Responses for the CheckBatchStatusRequest operation are

<div class="responseModel"></div>

 StatusCode | Description | Content-Type | Model |
------------|-------------|--------------|-------|
 `200` | The status of batches provided in the request. | `application/json` <br/>`text/xml` | [CheckBatchStatusResponse](#checkbatchstatusresponse) |  
 `400` | Bad Request. Should the incoming data not be validly determined. |  |  
 `401` | Unauthorized. No api key has been provided and is required for this operation. |  |  
 `403` | Forbidden. The api key was provided and understood but is either incorrect or does not have permission to access the account provided on the request. |  |  
 `422` | Unprocessable Entity. Should a failure occur that prevents processing of the API call. | `application/json` <br/>`text/xml` | [Error](#error) |  





# Card Holder Account API

A cardholder account models a cardholder and can register 1 or more cards for tokenised charging. 

The account offers a credential on file option to the CityPay gateway allowing for both cardholder initiated and 
merchant initiated transaction processing.

This can include unscheduled or scheduled transactions that can be requested through this API and include batch 
processing options.



## Account Exists

<div class="route-spec">
<div class="route-path">
 <span class="http-method http-method-get">GET</span>
 <span class="path">/v6/account-exists/{accountid}</span>
</div>
<div class="security-methods"><span class="key sec-cp-api-key">cp-api-key</span> </div>
</div>

Checks that an account exists and is active by providing the account id as a url parameter.


<div class="model-links">
 <a href="#requestModel-AccountExistsRequest">Request Model</a>
 <a href="#responseModel-AccountExistsRequest">Response Model</a>
</div>


### Path Parameters

Name | Type | Required | Description |
-----|------|----------|-------------|
 `accountid` | string | true | The account id that refers to the customer's account no. This value will have been provided when setting up the card holder account. | 





<a id="responseModel-AccountExistsRequest"></a>
### Response

Responses for the AccountExistsRequest operation are

<div class="responseModel"></div>

 StatusCode | Description | Content-Type | Model |
------------|-------------|--------------|-------|
 `200` | A response model determining whether the account exists, if exists is true, a last modified date of the account is also provided. | `application/json` <br/>`text/xml` | [Exists](#exists) |  
 `400` | Bad Request. Should the incoming data not be validly determined. |  |  
 `401` | Unauthorized. No api key has been provided and is required for this operation. |  |  
 `403` | Forbidden. The api key was provided and understood but is either incorrect or does not have permission to access the account provided on the request. |  |  
 `422` | Unprocessable Entity. Should a failure occur that prevents processing of the API call. | `application/json` <br/>`text/xml` | [Error](#error) |  





## Account Create

<div class="route-spec">
<div class="route-path">
 <span class="http-method http-method-post">POST</span>
 <span class="path">/v6/account/create</span>
</div>
<div class="security-methods"><span class="key sec-cp-api-key">cp-api-key</span> </div>
</div>

Creates a new card holder account and initialises the account ready for adding cards.

<div class="model-links">
 <a href="#requestModel-AccountCreate">Request Model</a>
 <a href="#responseModel-AccountCreate">Response Model</a>
</div>





<a id="requestModel-AccountCreate"></a>
### Model AccountCreate

Request body for the AccountCreate operation contains the following properties

<div class="requestModel"></div>

Field  | Type | Usage | Description |
---------|------|------|-------------|
 `account_id` | string  | Required | A card holder account id used for uniquely identifying the account. This value will be used for future referencing of the account oand to link your system to this API. This value is immutable and never changes.<br/><br/> minLength: 5<br/>maxLength: 50 | 
 `contact` | object | Optional | [ContactDetails](#contactdetails) Contact details for a card holder account. | 




<a id="responseModel-AccountCreate"></a>
### Response

Responses for the AccountCreate operation are

<div class="responseModel"></div>

 StatusCode | Description | Content-Type | Model |
------------|-------------|--------------|-------|
 `200` | Provides an initialised account. | `application/json` <br/>`text/xml` | [CardHolderAccount](#cardholderaccount) |  
 `400` | Bad Request. Should the incoming data not be validly determined. |  |  
 `401` | Unauthorized. No api key has been provided and is required for this operation. |  |  
 `403` | Forbidden. The api key was provided and understood but is either incorrect or does not have permission to access the account provided on the request. |  |  
 `422` | Unprocessable Entity. Should a failure occur that prevents processing of the API call. | `application/json` <br/>`text/xml` | [Error](#error) |  





## Account Retrieval

<div class="route-spec">
<div class="route-path">
 <span class="http-method http-method-get">GET</span>
 <span class="path">/v6/account/{accountid}</span>
</div>
<div class="security-methods"><span class="key sec-cp-api-key">cp-api-key</span> </div>
</div>

Allows for the retrieval of a card holder account for the given `id`. Should duplicate accounts exist
for the same `id`, the first account created with that `id` will be returned.

The account can be used for tokenisation processing by listing all cards assigned to the account.
The returned cards will include all `active`, `inactive` and `expired` cards. This can be used to 
enable a card holder to view their wallet and make constructive choices on which card to use.


<div class="model-links">
 <a href="#requestModel-AccountRetrieveRequest">Request Model</a>
 <a href="#responseModel-AccountRetrieveRequest">Response Model</a>
</div>


### Path Parameters

Name | Type | Required | Description |
-----|------|----------|-------------|
 `accountid` | string | true | The account id that refers to the customer's account no. This value will have been provided when setting up the card holder account. | 





<a id="responseModel-AccountRetrieveRequest"></a>
### Response

Responses for the AccountRetrieveRequest operation are

<div class="responseModel"></div>

 StatusCode | Description | Content-Type | Model |
------------|-------------|--------------|-------|
 `200` | A card holder account that matches the account id provided in the request. | `application/json` <br/>`text/xml` | [CardHolderAccount](#cardholderaccount) |  
 `400` | Bad Request. Should the incoming data not be validly determined. |  |  
 `401` | Unauthorized. No api key has been provided and is required for this operation. |  |  
 `403` | Forbidden. The api key was provided and understood but is either incorrect or does not have permission to access the account provided on the request. |  |  
 `422` | Unprocessable Entity. Should a failure occur that prevents processing of the API call. | `application/json` <br/>`text/xml` | [Error](#error) |  





## Account Deletion

<div class="route-spec">
<div class="route-path">
 <span class="http-method http-method-delete">DELETE</span>
 <span class="path">/v6/account/{accountid}</span>
</div>
<div class="security-methods"><span class="key sec-cp-api-key">cp-api-key</span> </div>
</div>

Allows for the deletion of an account. The account will marked for deletion and subsequent purging. No further
transactions will be alowed to be processed or actioned against this account.


<div class="model-links">
 <a href="#requestModel-AccountDeleteRequest">Request Model</a>
 <a href="#responseModel-AccountDeleteRequest">Response Model</a>
</div>


### Path Parameters

Name | Type | Required | Description |
-----|------|----------|-------------|
 `accountid` | string | true | The account id that refers to the customer's account no. This value will have been provided when setting up the card holder account. | 





<a id="responseModel-AccountDeleteRequest"></a>
### Response

Responses for the AccountDeleteRequest operation are

<div class="responseModel"></div>

 StatusCode | Description | Content-Type | Model |
------------|-------------|--------------|-------|
 `200` | An acknowledgment code of `001` that the card holder account has been marked for deletion. | `application/json` <br/>`text/xml` | [Acknowledgement](#acknowledgement) |  
 `400` | Bad Request. Should the incoming data not be validly determined. |  |  
 `401` | Unauthorized. No api key has been provided and is required for this operation. |  |  
 `403` | Forbidden. The api key was provided and understood but is either incorrect or does not have permission to access the account provided on the request. |  |  
 `422` | Unprocessable Entity. Should a failure occur that prevents processing of the API call. | `application/json` <br/>`text/xml` | [Error](#error) |  





## Card Deletion

<div class="route-spec">
<div class="route-path">
 <span class="http-method http-method-delete">DELETE</span>
 <span class="path">/v6/account/{accountid}/card/{cardId}</span>
</div>
<div class="security-methods"><span class="key sec-cp-api-key">cp-api-key</span> </div>
</div>

Deletes a card from the account. The card will be marked for deletion before a subsequent
purge will clear the card permanently.


<div class="model-links">
 <a href="#requestModel-AccountCardDeleteRequest">Request Model</a>
 <a href="#responseModel-AccountCardDeleteRequest">Response Model</a>
</div>


### Path Parameters

Name | Type | Required | Description |
-----|------|----------|-------------|
 `accountid` | string | true | The account id that refers to the customer's account no. This value will have been provided when setting up the card holder account. | 
 `cardId` | string | true | The id of the card that is presented by a call to retrieve a card holder account. | 





<a id="responseModel-AccountCardDeleteRequest"></a>
### Response

Responses for the AccountCardDeleteRequest operation are

<div class="responseModel"></div>

 StatusCode | Description | Content-Type | Model |
------------|-------------|--------------|-------|
 `200` | Acknowledges the card has been requested for deletion. A response code of `001` is returned if the account is available for deletion otherwise an error code is returned. | `application/json` <br/>`text/xml` | [Acknowledgement](#acknowledgement) |  
 `400` | Bad Request. Should the incoming data not be validly determined. |  |  
 `401` | Unauthorized. No api key has been provided and is required for this operation. |  |  
 `403` | Forbidden. The api key was provided and understood but is either incorrect or does not have permission to access the account provided on the request. |  |  
 `422` | Unprocessable Entity. Should a failure occur that prevents processing of the API call. | `application/json` <br/>`text/xml` | [Error](#error) |  





## Card Status

<div class="route-spec">
<div class="route-path">
 <span class="http-method http-method-post">POST</span>
 <span class="path">/v6/account/{accountid}/card/{cardId}/status</span>
</div>
<div class="security-methods"><span class="key sec-cp-api-key">cp-api-key</span> </div>
</div>

Updates the status of a card for processing. The following values are available

 Status | Description | 
--------|-------------|
 Active | The card is active for processing and can be used for charging against with a valid token |
 Inactive | The card is inactive for processing and cannot be used for processing, it will require reactivation before being used to charge |
 Expired | The card has expired either due to the expiry date no longer being valid or due to a replacement card being issued |


<div class="model-links">
 <a href="#requestModel-AccountCardStatusRequest">Request Model</a>
 <a href="#responseModel-AccountCardStatusRequest">Response Model</a>
</div>


### Path Parameters

Name | Type | Required | Description |
-----|------|----------|-------------|
 `accountid` | string | true | The account id that refers to the customer's account no. This value will have been provided when setting up the card holder account. | 
 `cardId` | string | true | The id of the card that is presented by a call to retrieve a card holder account. | 






<a id="requestModel-AccountCardStatusRequest"></a>
### Model CardStatus

Request body for the AccountCardStatusRequest operation contains the following properties

<div class="requestModel"></div>

Field  | Type | Usage | Description |
---------|------|------|-------------|
 `card_status` | string  | Optional | The status of the card to set, valid values are ACTIVE or INACTIVE. | 
 `default` | boolean  | Optional | Defines if the card is set as the default. | 




<a id="responseModel-AccountCardStatusRequest"></a>
### Response

Responses for the AccountCardStatusRequest operation are

<div class="responseModel"></div>

 StatusCode | Description | Content-Type | Model |
------------|-------------|--------------|-------|
 `200` | Acknowledges the card status has changed, returning a response code of `001` for a valid change or `000` for a non valid change. | `application/json` <br/>`text/xml` | [Acknowledgement](#acknowledgement) |  
 `400` | Bad Request. Should the incoming data not be validly determined. |  |  
 `401` | Unauthorized. No api key has been provided and is required for this operation. |  |  
 `403` | Forbidden. The api key was provided and understood but is either incorrect or does not have permission to access the account provided on the request. |  |  
 `422` | Unprocessable Entity. Should a failure occur that prevents processing of the API call. | `application/json` <br/>`text/xml` | [Error](#error) |  





## Contact Details Update

<div class="route-spec">
<div class="route-path">
 <span class="http-method http-method-post">POST</span>
 <span class="path">/v6/account/{accountid}/contact</span>
</div>
<div class="security-methods"><span class="key sec-cp-api-key">cp-api-key</span> </div>
</div>

Allows for the ability to change the contact details for an account.

<div class="model-links">
 <a href="#requestModel-AccountChangeContactRequest">Request Model</a>
 <a href="#responseModel-AccountChangeContactRequest">Response Model</a>
</div>


### Path Parameters

Name | Type | Required | Description |
-----|------|----------|-------------|
 `accountid` | string | true | The account id that refers to the customer's account no. This value will have been provided when setting up the card holder account. | 






<a id="requestModel-AccountChangeContactRequest"></a>
### Model ContactDetails

Request body for the AccountChangeContactRequest operation contains the following properties

<div class="requestModel"></div>

Field  | Type | Usage | Description |
---------|------|------|-------------|
 `address1` | string  | Optional | The first line of the address for the shipping contact.<br/><br/>maxLength: 50 | 
 `address2` | string  | Optional | The second line of the address for the shipping contact.<br/><br/>maxLength: 50 | 
 `address3` | string  | Optional | The third line of the address for the shipping contact.<br/><br/>maxLength: 50 | 
 `area` | string  | Optional | The area such as city, department, parish for the shipping contact.<br/><br/>maxLength: 50 | 
 `company` | string  | Optional | The company name for the shipping contact if the contact is a corporate contact.<br/><br/>maxLength: 50 | 
 `country` | string  | Optional | The country code in ISO 3166 format. The country value may be used for fraud analysis and for   acceptance of the transaction.<br/><br/> minLength: 2<br/>maxLength: 2 | 
 `email` | string  | Optional | An email address for the shipping contact which may be used for correspondence.<br/><br/>maxLength: 254 | 
 `firstname` | string  | Optional | The first name  of the shipping contact. | 
 `lastname` | string  | Optional | The last name or surname of the shipping contact. | 
 `mobile_no` | string  | Optional | A mobile number for the shipping contact the mobile number is often required by delivery companies to ensure they are able to be in contact when required.<br/><br/>maxLength: 20 | 
 `postcode` | string  | Optional | The postcode or zip code of the address which may be used for fraud analysis.<br/><br/>maxLength: 16 | 
 `telephone_no` | string  | Optional | A telephone number for the shipping contact.<br/><br/>maxLength: 20 | 
 `title` | string  | Optional | A title for the shipping contact such as Mr, Mrs, Ms, M. Mme. etc. | 




<a id="responseModel-AccountChangeContactRequest"></a>
### Response

Responses for the AccountChangeContactRequest operation are

<div class="responseModel"></div>

 StatusCode | Description | Content-Type | Model |
------------|-------------|--------------|-------|
 `200` | A revised account with the new details set. | `application/json` <br/>`text/xml` | [CardHolderAccount](#cardholderaccount) |  
 `400` | Bad Request. Should the incoming data not be validly determined. |  |  
 `401` | Unauthorized. No api key has been provided and is required for this operation. |  |  
 `403` | Forbidden. The api key was provided and understood but is either incorrect or does not have permission to access the account provided on the request. |  |  
 `422` | Unprocessable Entity. Should a failure occur that prevents processing of the API call. | `application/json` <br/>`text/xml` | [Error](#error) |  





## Card Registration

<div class="route-spec">
<div class="route-path">
 <span class="http-method http-method-post">POST</span>
 <span class="path">/v6/account/{accountid}/register</span>
</div>
<div class="security-methods"><span class="key sec-cp-api-key">cp-api-key</span> </div>
</div>

Allows for a card to be registered for the account. The card will be added for future 
processing and will be available as a tokenised value for future processing.

The card will be validated for

0. Being a valid card number (luhn check)
0. Having a valid expiry date
0. Being a valid bin value.


<div class="model-links">
 <a href="#requestModel-AccountCardRegisterRequest">Request Model</a>
 <a href="#responseModel-AccountCardRegisterRequest">Response Model</a>
</div>


### Path Parameters

Name | Type | Required | Description |
-----|------|----------|-------------|
 `accountid` | string | true | The account id that refers to the customer's account no. This value will have been provided when setting up the card holder account. | 






<a id="requestModel-AccountCardRegisterRequest"></a>
### Model RegisterCard

Request body for the AccountCardRegisterRequest operation contains the following properties

<div class="requestModel"></div>

Field  | Type | Usage | Description |
---------|------|------|-------------|
 `cardnumber` | string  | Required | The primary number of the card.<br/><br/>minLength: 12<br/>maxLength: 22 | 
 `expmonth` | integer *int32* | Required | The expiry month of the card.<br/><br/>minimum: 1<br/>maximum: 12 | 
 `expyear` | integer *int32* | Required | The expiry year of the card.<br/><br/>minimum: 2000<br/>maximum: 2100 | 
 `default` | boolean  | Optional | Determines whether the card should be the new default card. | 
 `name_on_card` | string  | Optional | The card holder name as it appears on the card. The value is required if the account is to be used for 3dsv2 processing, otherwise it is optional.<br/><br/>minLength: 2<br/>maxLength: 45 | 




<a id="responseModel-AccountCardRegisterRequest"></a>
### Response

Responses for the AccountCardRegisterRequest operation are

<div class="responseModel"></div>

 StatusCode | Description | Content-Type | Model |
------------|-------------|--------------|-------|
 `200` | A successfully registered card provides a reload of the account including the new card. | `application/json` <br/>`text/xml` | [CardHolderAccount](#cardholderaccount) |  
 `400` | Bad Request. Should the incoming data not be validly determined. |  |  
 `401` | Unauthorized. No api key has been provided and is required for this operation. |  |  
 `403` | Forbidden. The api key was provided and understood but is either incorrect or does not have permission to access the account provided on the request. |  |  
 `422` | Unprocessable Entity. Should a failure occur that prevents processing of the API call. | `application/json` <br/>`text/xml` | [Error](#error) |  





## Account Status

<div class="route-spec">
<div class="route-path">
 <span class="http-method http-method-post">POST</span>
 <span class="path">/v6/account/{accountid}/status</span>
</div>
<div class="security-methods"><span class="key sec-cp-api-key">cp-api-key</span> </div>
</div>

Updates the status of an account. An account can have the following statuses applied

 Status | Description |
--------|-------------|
 Active | The account is active for processing |
 Disabled | The account has been disabled and cannot be used for processing. The account will require reactivation to continue procesing |


<div class="model-links">
 <a href="#requestModel-AccountStatusRequest">Request Model</a>
 <a href="#responseModel-AccountStatusRequest">Response Model</a>
</div>


### Path Parameters

Name | Type | Required | Description |
-----|------|----------|-------------|
 `accountid` | string | true | The account id that refers to the customer's account no. This value will have been provided when setting up the card holder account. | 






<a id="requestModel-AccountStatusRequest"></a>
### Model AccountStatus

Request body for the AccountStatusRequest operation contains the following properties

<div class="requestModel"></div>

Field  | Type | Usage | Description |
---------|------|------|-------------|
 `status` | string  | Optional | The status of the account to set, valid values are ACTIVE or DISABLED. | 




<a id="responseModel-AccountStatusRequest"></a>
### Response

Responses for the AccountStatusRequest operation are

<div class="responseModel"></div>

 StatusCode | Description | Content-Type | Model |
------------|-------------|--------------|-------|
 `200` | An acknowledgment that the card holder account status has been updated.</br></br>A response code of `001` is returned if the request was accepted or no change required.</br></br>A response code of `000` is returned if the request contains invalid data. | `application/json` <br/>`text/xml` | [Acknowledgement](#acknowledgement) |  
 `400` | Bad Request. Should the incoming data not be validly determined. |  |  
 `401` | Unauthorized. No api key has been provided and is required for this operation. |  |  
 `403` | Forbidden. The api key was provided and understood but is either incorrect or does not have permission to access the account provided on the request. |  |  
 `422` | Unprocessable Entity. Should a failure occur that prevents processing of the API call. | `application/json` <br/>`text/xml` | [Error](#error) |  





## Charge

<div class="route-spec">
<div class="route-path">
 <span class="http-method http-method-post">POST</span>
 <span class="path">/v6/charge</span>
</div>
<div class="security-methods"><span class="key sec-cp-api-key">cp-api-key</span> </div>
</div>

A charge process obtains an authorisation using a tokenised value which represents a stored card 
on a card holder account. 
A card must previously be registered by calling `/account-register-card` with the card details 
or retrieved using `/account-retrieve`

Tokens are generated whenever a previously registered list of cards are retrieved. Each token has, by design a 
relatively short time to live of 30 minutes. This is both to safe guard the merchant and card holder from 
replay attacks. Tokens are also restricted to your account, preventing malicious actors from stealing details
for use elsewhere.  

If a token is reused after it has expired it will be rejected and a new token will be required.
 
Tokenisation can be used for
 
- repeat authorisations on a previously stored card
- easy authorisations just requiring CSC values to be entered
- can be used for credential on file style payments
- can require full 3-D Secure authentication to retain the liability shift
- wallet style usage
 

_Should an account be used with 3DSv2, the card holder name should also be stored alongside the card as this is a
required field with both Visa and MasterCard for risk analysis._.


<div class="model-links">
 <a href="#requestModel-ChargeRequest">Request Model</a>
 <a href="#responseModel-ChargeRequest">Response Model</a>
</div>





<a id="requestModel-ChargeRequest"></a>
### Model ChargeRequest

Request body for the ChargeRequest operation contains the following properties

<div class="requestModel"></div>

Field  | Type | Usage | Description |
---------|------|------|-------------|
 `amount` | integer *int32* | Required | The amount to authorise in the lowest unit of currency with a variable length to a maximum of 12 digits.<br/><br/>No decimal points are to be included and no divisional characters such as 1,024.<br/><br/>The amount should be the total amount required for the transaction.<br/><br/>For example with GBP £1,021.95 the amount value is 102195.<br/><br/> minLength: 1<br/>maxLength: 12 | 
 `identifier` | string  | Required | The identifier of the transaction to process. The value should be a valid reference and may be used to perform  post processing actions and to aid in reconciliation of transactions.<br/><br/>The value should be a valid printable string with ASCII character ranges from 0x32 to 0x127.<br/><br/>The identifier is recommended to be distinct for each transaction such as a [random unique identifier](https://en.wikipedia.org/wiki/Universally_unique_identifier) this will aid in ensuring each transaction is identifiable.<br/><br/>When transactions are processed they are also checked for duplicate requests. Changing the identifier on a subsequent request will ensure that a transaction is considered as different.<br/><br/> minLength: 4<br/>maxLength: 50 | 
 `merchantid` | integer *int32* | Required | Identifies the merchant account to perform processing for. | 
 `token` | string *base58* | Required | A tokenised form of a card that belongs to a card holder's account and that has been previously registered. The token is time based and will only be active for a short duration. The value is therefore designed not to be stored remotely for future use.<br/><br/> Tokens will start with ct and are resiliently tamper proof using HMacSHA-256. No sensitive card data is stored internally within the token.<br/><br/> Each card will contain a different token and the value may be different on any retrieval call.<br/><br/> The value can be presented for payment as a selection value to an end user in a web application. | 
 `avs_postcode_policy` | string  | Optional | A policy value which determines whether an AVS postcode policy is enforced or bypassed.<br/><br/>Values are  `0` for the default policy (default value if not supplied). Your default values are determined by your account manager on setup of the account.<br/><br/> `1` for an enforced policy. Transactions that are enforced will be rejected if the AVS postcode numeric value does not match.<br/><br/> `2` to bypass. Transactions that are bypassed will be allowed through even if the postcode did not match.<br/><br/> `3` to ignore. Transactions that are ignored will bypass the result and not send postcode details for authorisation. | 
 `cardholder_agreement` | string  | Optional | Merchant-initiated transactions (MITs) are payments you trigger, where the cardholder has previously consented to you carrying out such payments. These may be scheduled (such as recurring payments and installments) or unscheduled (like account top-ups triggered by balance thresholds and no-show charges).<br/><br/>Scheduled --- These are regular payments using stored card details, like installments or a monthly subscription fee.<br/><br/>- `I` Instalment - A single purchase of goods or services billed to a cardholder in multiple transactions, over a period of time agreed by the cardholder and you.<br/><br/>- `R` Recurring - Transactions processed at fixed, regular intervals not to exceed one year between transactions, representing an agreement between a cardholder and you to purchase goods or services provided over a period of time.<br/><br/>Unscheduled --- These are payments using stored card details that do not occur on a regular schedule, like top-ups for a digital wallet triggered by the balance falling below a certain threshold.<br/><br/>- `A` Reauthorisation - a purchase made after the original purchase. A common scenario is delayed/split shipments.<br/><br/>- `C` Unscheduled Payment - A transaction using a stored credential for a fixed or variable amount that does not occur on a scheduled or regularly occurring transaction date. This includes account top-ups triggered by balance thresholds.<br/><br/>- `D` Delayed Charge - A delayed charge is typically used in hotel, cruise lines and vehicle rental environments to perform a supplemental account charge after original services are rendered.<br/><br/>- `L` Incremental - An incremental authorisation is typically found in hotel and car rental environments, where the cardholder has agreed to pay for any service incurred during the duration of the contract. An incremental authorisation is where you need to seek authorisation of further funds in addition to what you have originally requested. A common scenario is additional services charged to the contract, such as extending a stay in a hotel.<br/><br/>- `S` Resubmission - When the original purchase occurred, but you were not able to get authorisation at the time the goods or services were provided. It should be only used where the goods or services have already been provided, but the authorisation request is declined for insufficient funds.<br/><br/>- `X` No-show - A no-show is a transaction where you are enabled to charge for services which the cardholder entered into an agreement to purchase, but the cardholder did not meet the terms of the agreement.<br/><br/> maxLength: 1 | 
 `csc` | string  | Optional | The Card Security Code (CSC) (also known as CV2/CVV2) is normally found on the back of the card (American Express has it on the front). The value helps to identify posession of the card as it is not available within the chip or magnetic swipe.<br/><br/>When forwarding the CSC, please ensure the value is a string as some values start with 0 and this will be stripped out by any integer parsing.<br/><br/>The CSC number aids fraud prevention in Mail Order and Internet payments.<br/><br/>Business rules are available on your account to identify whether to accept or decline transactions based on mismatched results of the CSC.<br/><br/>The Payment Card Industry (PCI) requires that at no stage of a transaction should the CSC be stored.<br/><br/>This applies to all entities handling card data.<br/><br/>It should also not be used in any hashing process.<br/><br/>CityPay do not store the value and have no method of retrieving the value once the transaction has been processed. For this reason, duplicate checking is unable to determine the CSC in its duplication check algorithm.<br/><br/> minLength: 3<br/>maxLength: 4 | 
 `csc_policy` | string  | Optional | A policy value which determines whether a CSC policy is enforced or bypassed.<br/><br/>Values are  `0` for the default policy (default value if not supplied). Your default values are determined by your account manager on setup of the account.<br/><br/> `1` for an enforced policy. Transactions that are enforced will be rejected if the CSC value does not match.<br/><br/> `2` to bypass. Transactions that are bypassed will be allowed through even if the CSC did not match.<br/><br/> `3` to ignore. Transactions that are ignored will bypass the result and not send the CSC details for authorisation. | 
 `currency` | string  | Optional | The processing currency for the transaction. Will default to the merchant account currency.<br/><br/>minLength: 3<br/>maxLength: 3 | 
 `duplicate_policy` | string  | Optional | A policy value which determines whether a duplication policy is enforced or bypassed. A duplication check has a window of time set against your account within which it can action. If a previous transaction with matching values occurred within the window, any subsequent transaction will result in a T001 result.<br/><br/>Values are  `0` for the default policy (default value if not supplied). Your default values are determined by your account manager on setup of the account.<br/><br/> `1` for an enforced policy. Transactions that are enforced will be checked for duplication within the duplication window.<br/><br/> `2` to bypass. Transactions that are bypassed will not be checked for duplication within the duplication window.<br/><br/> `3` to ignore. Transactions that are ignored will have the same affect as bypass. | 
 `initiation` | string  | Optional | Transactions charged using the API are defined as:<br/><br/>**Cardholder Initiated**: A _cardholder initiated transaction_ (CIT) is where the cardholder selects the card for use for a purchase using previously stored details. An example would be a customer buying an item from your website after being present with their saved card details at checkout.<br/><br/>**Merchant Intiated**: A _merchant initiated transaction_ (MIT) is an authorisation initiated where you as the  merchant submit a cardholders previously stored details without the cardholder's participation. An example would  be a subscription to a membership scheme to debit their card monthly.<br/><br/>MITs have different reasons such as reauthorisation, delayed, unscheduled, incremental, recurring, instalment, no-show or resubmission.<br/><br/>The following values apply<br/><br/> - `M` - specifies that the transaction is initiated by the merchant<br/><br/> - `C` - specifies that the transaction is initiated by the cardholder<br/><br/>Where transactions are merchant initiated, a valid cardholder agreement must be defined.<br/><br/> maxLength: 1 | 
 `match_avsa` | string  | Optional | A policy value which determines whether an AVS address policy is enforced, bypassed or ignored.<br/><br/>Values are  `0` for the default policy (default value if not supplied). Your default values are determined by your account manager on setup of the account.<br/><br/> `1` for an enforced policy. Transactions that are enforced will be rejected if the AVS address numeric value does not match.<br/><br/> `2` to bypass. Transactions that are bypassed will be allowed through even if the address did not match.<br/><br/> `3` to ignore. Transactions that are ignored will bypass the result and not send address numeric details for authorisation. | 
 `threedsecure` | object | Optional | [ThreeDSecure](#threedsecure) ThreeDSecure element, providing values to enable full 3DS processing flows. | 
 `trans_info` | string  | Optional | Further information that can be added to the transaction will display in reporting. Can be used for flexible values such as operator id.<br/><br/>maxLength: 50 | 
 `trans_type` | string  | Optional | The type of transaction being submitted. Normally this value is not required and your account manager may request that you set this field.<br/><br/>maxLength: 1 | 




<a id="responseModel-ChargeRequest"></a>
### Response

Responses for the ChargeRequest operation are

<div class="responseModel"></div>

 StatusCode | Description | Content-Type | Model |
------------|-------------|--------------|-------|
 `200` | A decision met by the result of the charge. | `application/json` <br/>`text/xml` | [Decision](#decision) |  
 `400` | Bad Request. Should the incoming data not be validly determined. |  |  
 `401` | Unauthorized. No api key has been provided and is required for this operation. |  |  
 `403` | Forbidden. The api key was provided and understood but is either incorrect or does not have permission to access the account provided on the request. |  |  
 `422` | Unprocessable Entity. Should a failure occur that prevents processing of the API call. | `application/json` <br/>`text/xml` | [Error](#error) |  





# Direct Post API

The Direct Post Method for e-commerce payment is generally used by merchants that require more control over their
payment form “look and feel” and can understand and implement the extra PCI DSS security controls that are required to
protect their systems.

The Direct Post Method uses the merchant’s website to generate the shopping cart and payment web pages. The merchant’s
payment form, loaded in the customer’s browser, sends the cardholder data directly to CityPay’s API, ensuring cardholder
data is not stored, processed, or transmitted via the merchant systems. The payment form, however, is provided by the
merchant. The merchant’s systems are therefore in scope for additional PCI DSS controls, which are necessary to protect
the merchant website against malicious individuals changing the form and capturing cardholder data.

### Direct Post Flow

#### Simple Authorisation Flow

The merchant’s website creates the payment page.

1. The customer’s browser displays the payment page and posts the cardholder data directly to CityPay as a url-encoded
   payment form.
2. CityPay receives the cardholder data and sends it for online authorisation, handling any ThreeDSecure authorisation
   challenges
3. The merchant receives a HTTP 303 redirect, containing the result of the transaction as query parameters

<img src="../../images/direct-post-flow.png" width="600" />

#### Tokenisation Authorisation Flow

The merchant’s website creates the payment page.

1. The customer’s browser displays the payment page and posts the cardholder data directly to CityPay as a url-encoded
   payment form.
2. CityPay receives the cardholder data and processes any ThreeDSecure authorisation and challenges.
3. The merchant receives a HTTP `303` redirect containing the card details tokenised for consequential processing
4. Once final confirmation is agreed at checkout, the generated token is forward to CityPay for realtime authorisation.
   This may by using HTTP redirects in a direct manner, or via an api level call

#### Handling Redirects

The direct post method uses HTTP `303` redirects to return data to your system. A `303` redirect differs to conventional 301
or `302` redirects by telling the browser to not resend data if refresh is pressed.

Payments should be developed to cater for failure. Transactions may not complete authorisation at the challenge stage or
decline either due to insufficient funds or transient network conditions. To ensure correct payment flow, the direct
post API requires

1. a `redirectSuccess` url. This is used to forward the result of authorisation.
2. a `redirectFailure` url. This is used to forward any errors that are due to invalid requests or payment failures.

#### Domain Keys

To allow for processing of transactions in a direct manner, CityPay provide domain keys. This value is provided on the
initial direct post call and must be run on a pre-registered host. Our validation processes will check the `Origin` or
`Referer`   HTTP headers to ensure that the domain keys are valid. A domain key can be registered for 1 or more domains.



## Direct Post Request

<div class="route-spec">
<div class="route-path">
 <span class="http-method http-method-post">POST</span>
 <span class="path">/direct</span>
</div>
<div class="security-methods"><span class="key sec-cp-domain-key">cp-domain-key</span> <span class="key sec-cp-api-key">cp-api-key</span> </div>
</div>

Used to initiate a direct post request transaction flow.

<pre class="inline-code language-bash">
<code>
curl https://api.citypay.com/v6/direct?cp-domain-key=n834ytqp84y... \
 -d "amount=7500&identifier=example_trans&cardnumber=4000000000000002&expmonth=9&expyear=2028&bill_to_postcode=L1+7ZW
</code>
</pre>.


<div class="model-links">
 <a href="#requestModel-DirectPostRequest">Request Model</a>
 <a href="#responseModel-DirectPostRequest">Response Model</a>
</div>





<a id="requestModel-DirectPostRequest"></a>
### Model DirectPostRequest

Request body for the DirectPostRequest operation contains the following properties

<div class="requestModel"></div>

Field  | Type | Usage | Description |
---------|------|------|-------------|
 `amount` | integer *int32* | Required | The amount to authorise in the lowest unit of currency with a variable length to a maximum of 12 digits.<br/><br/>No decimal points are to be included and no divisional characters such as 1,024.<br/><br/>The amount should be the total amount required for the transaction.<br/><br/>For example with GBP £1,021.95 the amount value is 102195.<br/><br/> minLength: 1<br/>maxLength: 12 | 
 `cardnumber` | string  | Required | The card number (PAN) with a variable length to a maximum of 21 digits in numerical form. Any non numeric characters will be stripped out of the card number, this includes whitespace or separators internal of the provided value.<br/><br/>The card number must be treated as sensitive data. We only provide an obfuscated value in logging and reporting.  The plaintext value is encrypted in our database using AES 256 GMC bit encryption for settlement or refund purposes.<br/><br/>When providing the card number to our gateway through the authorisation API you will be handling the card data on your application. This will require further PCI controls to be in place and this value must never be stored.<br/><br/> minLength: 12<br/>maxLength: 22 | 
 `expmonth` | integer *int32* | Required | The month of expiry of the card. The month value should be a numerical value between 1 and 12.<br/><br/> minimum: 1<br/>maximum: 12 | 
 `expyear` | integer *int32* | Required | The year of expiry of the card.<br/><br/> minimum: 2000<br/>maximum: 2100 | 
 `identifier` | string  | Required | The identifier of the transaction to process. The value should be a valid reference and may be used to perform  post processing actions and to aid in reconciliation of transactions.<br/><br/>The value should be a valid printable string with ASCII character ranges from 0x32 to 0x127.<br/><br/>The identifier is recommended to be distinct for each transaction such as a [random unique identifier](https://en.wikipedia.org/wiki/Universally_unique_identifier) this will aid in ensuring each transaction is identifiable.<br/><br/>When transactions are processed they are also checked for duplicate requests. Changing the identifier on a subsequent request will ensure that a transaction is considered as different.<br/><br/> minLength: 4<br/>maxLength: 50 | 
 `avs_postcode_policy` | string  | Optional | A policy value which determines whether an AVS postcode policy is enforced or bypassed.<br/><br/>Values are  `0` for the default policy (default value if not supplied). Your default values are determined by your account manager on setup of the account.<br/><br/> `1` for an enforced policy. Transactions that are enforced will be rejected if the AVS postcode numeric value does not match.<br/><br/> `2` to bypass. Transactions that are bypassed will be allowed through even if the postcode did not match.<br/><br/> `3` to ignore. Transactions that are ignored will bypass the result and not send postcode details for authorisation. | 
 `bill_to` | object | Optional | [ContactDetails](#contactdetails) Billing details of the card holder making the payment. These details may be used for AVS fraud analysis, 3DS and for future referencing of the transaction.<br/><br/>For AVS to work correctly, the billing details should be the registered address of the card holder as it appears on the statement with their card issuer. The numeric details will be passed through for analysis and may result in a decline if incorrectly provided.<br/><br/>If using url-encoded format requests properties should be prefixed with `bill_to_` for example a postcode  value should be `bill_to_postcode`. | 
 `csc` | string  | Optional | The Card Security Code (CSC) (also known as CV2/CVV2) is normally found on the back of the card (American Express has it on the front). The value helps to identify posession of the card as it is not available within the chip or magnetic swipe.<br/><br/>When forwarding the CSC, please ensure the value is a string as some values start with 0 and this will be stripped out by any integer parsing.<br/><br/>The CSC number aids fraud prevention in Mail Order and Internet payments.<br/><br/>Business rules are available on your account to identify whether to accept or decline transactions based on mismatched results of the CSC.<br/><br/>The Payment Card Industry (PCI) requires that at no stage of a transaction should the CSC be stored.<br/><br/>This applies to all entities handling card data.<br/><br/>It should also not be used in any hashing process.<br/><br/>CityPay do not store the value and have no method of retrieving the value once the transaction has been processed. For this reason, duplicate checking is unable to determine the CSC in its duplication check algorithm.<br/><br/> minLength: 3<br/>maxLength: 4 | 
 `csc_policy` | string  | Optional | A policy value which determines whether a CSC policy is enforced or bypassed.<br/><br/>Values are  `0` for the default policy (default value if not supplied). Your default values are determined by your account manager on setup of the account.<br/><br/> `1` for an enforced policy. Transactions that are enforced will be rejected if the CSC value does not match.<br/><br/> `2` to bypass. Transactions that are bypassed will be allowed through even if the CSC did not match.<br/><br/> `3` to ignore. Transactions that are ignored will bypass the result and not send the CSC details for authorisation. | 
 `currency` | string  | Optional | The processing currency for the transaction. Will default to the merchant account currency.<br/><br/>minLength: 3<br/>maxLength: 3 | 
 `duplicate_policy` | string  | Optional | A policy value which determines whether a duplication policy is enforced or bypassed. A duplication check has a window of time set against your account within which it can action. If a previous transaction with matching values occurred within the window, any subsequent transaction will result in a T001 result.<br/><br/>Values are  `0` for the default policy (default value if not supplied). Your default values are determined by your account manager on setup of the account.<br/><br/> `1` for an enforced policy. Transactions that are enforced will be checked for duplication within the duplication window.<br/><br/> `2` to bypass. Transactions that are bypassed will not be checked for duplication within the duplication window.<br/><br/> `3` to ignore. Transactions that are ignored will have the same affect as bypass. | 
 `match_avsa` | string  | Optional | A policy value which determines whether an AVS address policy is enforced, bypassed or ignored.<br/><br/>Values are  `0` for the default policy (default value if not supplied). Your default values are determined by your account manager on setup of the account.<br/><br/> `1` for an enforced policy. Transactions that are enforced will be rejected if the AVS address numeric value does not match.<br/><br/> `2` to bypass. Transactions that are bypassed will be allowed through even if the address did not match.<br/><br/> `3` to ignore. Transactions that are ignored will bypass the result and not send address numeric details for authorisation. | 
 `name_on_card` | string  | Optional | The card holder name as appears on the card such as MR N E BODY. Required for some acquirers.<br/><br/> minLength: 2<br/>maxLength: 45 | 
 `nonce` | string  | Optional | A random value string which is provided to the API to perform a digest. The value will be used by its UTF-8 byte representation of any digest function. | 
 `redirect_failure` | string *url* | Optional | The URL used to redirect back to your site when a transaction has been rejected or declined. Required if a url-encoded request. | 
 `redirect_success` | string *url* | Optional | The URL used to redirect back to your site when a transaction has been tokenised or authorised. Required if a url-encoded request. | 
 `ship_to` | object | Optional | [ContactDetails](#contactdetails) Shipping details of the card holder making the payment. These details may be used for 3DS and for future referencing of the transaction. | 
 `threedsecure` | object | Optional | [ThreeDSecure](#threedsecure) ThreeDSecure element, providing values to enable full 3DS processing flows. | 
 `tokenise` | boolean  | Optional | Boolean flag which defines whether the response data is tokenised for further presentation at a later authorisation stage. A value of false will effectively turn off tokenisation and present the transaction immediately upstream to the acquirer. | 
 `trans_info` | string  | Optional | Further information that can be added to the transaction will display in reporting. Can be used for flexible values such as operator id.<br/><br/>maxLength: 50 | 
 `trans_type` | string  | Optional | The type of transaction being submitted. Normally this value is not required and your account manager may request that you set this field.<br/><br/>maxLength: 1 | 




<a id="responseModel-DirectPostRequest"></a>
### Response

Responses for the DirectPostRequest operation are

<div class="responseModel"></div>

 StatusCode | Description | Content-Type | Model |
------------|-------------|--------------|-------|
 `200` | A result of a successful tokenisation or authorisation process if called via an XHR method. | `application/json` <br/>`application/xml` | One of: <br/>[TokenisationResponseModel](#tokenisationresponsemodel)<br/>[AuthResponse](#authresponse) |  
 `303` | Redirect. A result of a successful tokenisation or authorisation process, redirecting to the success URL. | `application/x-www-form-urlencoded` | One of: <br/>[TokenisationResponseModel](#tokenisationresponsemodel)<br/>[AuthResponse](#authresponse) |  
 `307` | Redirect. A result of a non-successful tokenisation or authorisation process, redirecting to the failure URL. | `application/x-www-form-urlencoded` | [Error](#error) |  
 `401` | Unauthorized. No domain key has been provided and is required for this operation. |  |  
 `403` | Forbidden. The domain key was provided and understood but is either incorrect or does not have permission to access the account provided on the request. |  |  
 `406` | Not Acceptable. Should the incoming data not be validly determined. |  |  
 `412` | Bad Request. Should the incoming data not be validly determined and an error code results. | `application/x-www-form-urlencoded` <br/>`application/json` <br/>`text/xml` | [Error](#error) |  





## Direct Post Token Request

<div class="route-spec">
<div class="route-path">
 <span class="http-method http-method-post">POST</span>
 <span class="path">/direct/auth</span>
</div>
<div class="security-methods"><span class="key sec-cp-domain-key">cp-domain-key</span> <span class="key sec-cp-api-key">cp-api-key</span> </div>
</div>

Perform a request for authorisation for a previously generated token. This flow will return an authorisation
response stating that the transaction was approved or declined.


<div class="model-links">
 <a href="#requestModel-TokenRequest">Request Model</a>
 <a href="#responseModel-TokenRequest">Response Model</a>
</div>





<a id="requestModel-TokenRequest"></a>
### Model DirectTokenAuthRequest

Request body for the TokenRequest operation contains the following properties

<div class="requestModel"></div>

Field  | Type | Usage | Description |
---------|------|------|-------------|
 `nonce` | string  | Optional | A random value string which is provided to the API to perform a digest. The value will be used by its UTF-8 byte representation of any digest function. | 
 `redirect_failure` | string *url* | Optional | The URL used to redirect back to your site when a transaction has been rejected or declined. Required if a url-encoded request. | 
 `redirect_success` | string *url* | Optional | The URL used to redirect back to your site when a transaction has been authorised. Required if a url-encoded request. | 
 `token` | string *base58* | Optional | The token required to process the transaction as presented by the direct post methodology. | 




<a id="responseModel-TokenRequest"></a>
### Response

Responses for the TokenRequest operation are

<div class="responseModel"></div>

 StatusCode | Description | Content-Type | Model |
------------|-------------|--------------|-------|
 `200` | A result of an authorisation process if called via an XHR method. | `application/json` <br/>`application/xml` | [AuthResponse](#authresponse) |  
 `303` | Redirect. A result of a successful tokenisation or authorisation process, redirecting to the success URL. | `application/x-www-form-urlencoded` | [AuthResponse](#authresponse) |  
 `307` | Redirect. A result of a non-successful tokenisation or authorisation process, redirecting to the failure URL. | `application/x-www-form-urlencoded` | [Error](#error) |  
 `401` | Unauthorized. No domain key has been provided and is required for this operation. |  |  
 `403` | Forbidden. The domain key was provided and understood but is either incorrect or does not have permission to access the account provided on the request. |  |  
 `406` | Not Acceptable. Should the incoming data not be validly determined. |  |  
 `412` | Bad Request. Should the incoming data not be validly determined and an error code results. | `application/x-www-form-urlencoded` <br/>`application/json` <br/>`text/xml` | [Error](#error) |  





## CRes response from ACS

<div class="route-spec">
<div class="route-path">
 <span class="http-method http-method-post">POST</span>
 <span class="path">/direct/cres</span>
</div>
<div class="security-methods"></div>
</div>

Used to post from an ACS during a ThreeDSecure direct flow process. The endpoint requires a valid `threeDSSessionData`
value which defines the unique transaction through its workflow. This endpoint may be used by merchants wishing to 
perform a `Direct Post` integration who wish to handle the challenge flow themselves.


<div class="model-links">
 <a href="#requestModel-DirectCResRequest">Request Model</a>
 <a href="#responseModel-DirectCResRequest">Response Model</a>
</div>





<a id="requestModel-DirectCResRequest"></a>
### Model CRes Direct

Request body for the DirectCResRequest operation contains the following properties

<div class="requestModel"></div>

Field  | Type | Usage | Description |
---------|------|------|-------------|
 `cres` | string *base64* | Optional | The CRES from the ACS. | 
 `threeDSSessionData` | string  | Optional | The session data from the ACS. | 




<a id="responseModel-DirectCResRequest"></a>
### Response

Responses for the DirectCResRequest operation are

<div class="responseModel"></div>

 StatusCode | Description | Content-Type | Model |
------------|-------------|--------------|-------|
 `200` | A result of a successful tokenisation or authorisation process if called via an XHR method. | `application/json` <br/>`application/xml` | One of: <br/>[TokenisationResponseModel](#tokenisationresponsemodel)<br/>[AuthResponse](#authresponse) |  
 `303` | Redirect. A result of a successful tokenisation or authorisation process, redirecting to the success URL. | `application/x-www-form-urlencoded` | One of: <br/>[TokenisationResponseModel](#tokenisationresponsemodel)<br/>[AuthResponse](#authresponse) |  
 `307` | Redirect. A result of a non-successful tokenisation or authorisation process, redirecting to the failure URL. | `application/x-www-form-urlencoded` | [Error](#error) |  
 `401` | Unauthorized. No domain key has been provided and is required for this operation. |  |  
 `403` | Forbidden. The domain key was provided and understood but is either incorrect or does not have permission to access the account provided on the request. |  |  
 `406` | Not Acceptable. Should the incoming data not be validly determined. |  |  
 `412` | Bad Request. Should the incoming data not be validly determined and an error code results. | `application/x-www-form-urlencoded` | [Error](#error) |  





# Operational API Functions

Operations that are for operational purposes only such as checking connectivity to the API.


## Domain Key Check Request

<div class="route-spec">
<div class="route-path">
 <span class="http-method http-method-post">POST</span>
 <span class="path">/dk/check</span>
</div>
<div class="security-methods"><span class="key sec-cp-api-key">cp-api-key</span> </div>
</div>

Checks the contents of a `domain key`. Can be used for operational processes to ensure that the properties of a 
domain key meet their expectations.


<div class="model-links">
 <a href="#requestModel-DomainKeyCheckRequest">Request Model</a>
 <a href="#responseModel-DomainKeyCheckRequest">Response Model</a>
</div>





<a id="requestModel-DomainKeyCheckRequest"></a>
### Model DomainKeyCheckRequest

Request body for the DomainKeyCheckRequest operation contains the following properties

<div class="requestModel"></div>

Field  | Type | Usage | Description |
---------|------|------|-------------|
 `domainKey` | string  | Required | The domain key to check.<br/><br/> minLength: 64<br/>maxLength: 512 | 




<a id="responseModel-DomainKeyCheckRequest"></a>
### Response

Responses for the DomainKeyCheckRequest operation are

<div class="responseModel"></div>

 StatusCode | Description | Content-Type | Model |
------------|-------------|--------------|-------|
 `200` | A checked domain key. | `application/json` <br/>`text/xml` | [DomainKeyResponse](#domainkeyresponse) |  
 `400` | Bad Request. Should the incoming data not be validly determined. |  |  
 `401` | Unauthorized. No api key has been provided and is required for this operation. |  |  
 `403` | Forbidden. The api key was provided and understood but is either incorrect or does not have permission to access the account provided on the request. |  |  
 `422` | Unprocessable Entity. Should a failure occur that prevents processing of the API call. | `application/json` <br/>`text/xml` | [Error](#error) |  





## Domain Key Generation Request

<div class="route-spec">
<div class="route-path">
 <span class="http-method http-method-post">POST</span>
 <span class="path">/dk/gen</span>
</div>
<div class="security-methods"><span class="key sec-cp-api-key">cp-api-key</span> </div>
</div>

Generates a domain key based on the permissions of the calling `api-key`. Domain keys can be used in _Direct Post_ and
`XHR` calls to the API services.


<div class="model-links">
 <a href="#requestModel-DomainKeyGenRequest">Request Model</a>
 <a href="#responseModel-DomainKeyGenRequest">Response Model</a>
</div>





<a id="requestModel-DomainKeyGenRequest"></a>
### Model DomainKeyRequest

Request body for the DomainKeyGenRequest operation contains the following properties

<div class="requestModel"></div>

Field  | Type | Usage | Description |
---------|------|------|-------------|
 `domain` | array | Required | The domains the domain key is registered for. you should only provide the host and no ports.<br/><br/>[String](#string) | 
 `merchantid` | integer *int32* | Required | The merchant id the domain key is to be used for. | 
 `live` | boolean  | Optional | Specifies if the key is to be used for production. Defaults to false. | 




<a id="responseModel-DomainKeyGenRequest"></a>
### Response

Responses for the DomainKeyGenRequest operation are

<div class="responseModel"></div>

 StatusCode | Description | Content-Type | Model |
------------|-------------|--------------|-------|
 `200` | A generated domain key. | `application/json` <br/>`text/xml` | [DomainKeyResponse](#domainkeyresponse) |  
 `400` | Bad Request. Should the incoming data not be validly determined. |  |  
 `401` | Unauthorized. No api key has been provided and is required for this operation. |  |  
 `403` | Forbidden. The api key was provided and understood but is either incorrect or does not have permission to access the account provided on the request. |  |  
 `422` | Unprocessable Entity. Should a failure occur that prevents processing of the API call. | `application/json` <br/>`text/xml` | [Error](#error) |  





## ACL Check Request

<div class="route-spec">
<div class="route-path">
 <span class="http-method http-method-post">POST</span>
 <span class="path">/v6/acl/check</span>
</div>
<div class="security-methods"><span class="key sec-cp-api-key">cp-api-key</span> </div>
</div>

Allows the checking of IP addresses against configured ACLs. Requests can perform a lookup of addresses in subnets and
services such as AWS or Azure to check that those addresses are listed in the ACLs.


<div class="model-links">
 <a href="#requestModel-AclCheckRequest">Request Model</a>
 <a href="#responseModel-AclCheckRequest">Response Model</a>
</div>





<a id="requestModel-AclCheckRequest"></a>
### Model AclCheckRequest

Request body for the AclCheckRequest operation contains the following properties

<div class="requestModel"></div>

Field  | Type | Usage | Description |
---------|------|------|-------------|
 `ip` | string *ipv4* | Optional | An ip address to check for an ACL against. The address should be a publicly routable IPv4 address. | 




<a id="responseModel-AclCheckRequest"></a>
### Response

Responses for the AclCheckRequest operation are

<div class="responseModel"></div>

 StatusCode | Description | Content-Type | Model |
------------|-------------|--------------|-------|
 `200` | Response to the ACL Check request. | `application/json` <br/>`text/xml` | [AclCheckResponseModel](#aclcheckresponsemodel) |  
 `400` | Bad Request. Should the incoming data not be validly determined. |  |  
 `401` | Unauthorized. No api key has been provided and is required for this operation. |  |  
 `403` | Forbidden. The api key was provided and understood but is either incorrect or does not have permission to access the account provided on the request. |  |  
 `422` | Unprocessable Entity. Should a failure occur that prevents processing of the API call. | `application/json` <br/>`text/xml` | [Error](#error) |  





## List Merchants Request

<div class="route-spec">
<div class="route-path">
 <span class="http-method http-method-get">GET</span>
 <span class="path">/v6/merchants/{clientid}</span>
</div>
<div class="security-methods"><span class="key sec-cp-api-key">cp-api-key</span> </div>
</div>

An operational request to list current merchants for a client.

### Sorting

Sorting can be performed by include a query parameter i.e. `/merchants/?sort=merchantid`

Fields that can be sorted are `merchantid` or `name`.


<div class="model-links">
 <a href="#requestModel-ListMerchantsRequest">Request Model</a>
 <a href="#responseModel-ListMerchantsRequest">Response Model</a>
</div>


### Path Parameters

Name | Type | Required | Description |
-----|------|----------|-------------|
 `clientid` | string | true | The client id to return merchants for, specifying "default" will use the value in your api key. | 





<a id="responseModel-ListMerchantsRequest"></a>
### Response

Responses for the ListMerchantsRequest operation are

<div class="responseModel"></div>

 StatusCode | Description | Content-Type | Model |
------------|-------------|--------------|-------|
 `200` | A list of merchants that are configured against the client id. | `application/json` <br/>`text/xml` | [ListMerchantsResponse](#listmerchantsresponse) |  
 `400` | Bad Request. Should the incoming data not be validly determined. |  |  
 `401` | Unauthorized. No api key has been provided and is required for this operation. |  |  
 `403` | Forbidden. The api key was provided and understood but is either incorrect or does not have permission to access the account provided on the request. |  |  
 `422` | Unprocessable Entity. Should a failure occur that prevents processing of the API call. | `application/json` <br/>`text/xml` | [Error](#error) |  





## Ping Request

<div class="route-spec">
<div class="route-path">
 <span class="http-method http-method-post">POST</span>
 <span class="path">/v6/ping</span>
</div>
<div class="security-methods"><span class="key sec-cp-domain-key">cp-domain-key</span> <span class="key sec-cp-api-key">cp-api-key</span> </div>
</div>

A ping request which performs a connection and authentication test to the CityPay API server. The request
will return a standard Acknowledgement with a response code `044` to signify a successful
ping.

The ping call is useful to confirm that you will be able to access 
the API from behind any firewalls and that the permission
model is granting access from your source.


<div class="model-links">
 <a href="#requestModel-PingRequest">Request Model</a>
 <a href="#responseModel-PingRequest">Response Model</a>
</div>





<a id="requestModel-PingRequest"></a>
### Model Ping

Request body for the PingRequest operation contains the following properties

<div class="requestModel"></div>

Field  | Type | Usage | Description |
---------|------|------|-------------|
 `identifier` | string  | Optional | An identifier of the ping request which will be returned in the response.<br/><br/>minLength: 4<br/>maxLength: 50 | 




<a id="responseModel-PingRequest"></a>
### Response

Responses for the PingRequest operation are

<div class="responseModel"></div>

 StatusCode | Description | Content-Type | Model |
------------|-------------|--------------|-------|
 `200` | A result of the ping request, returning on 044 response code on successful receipt of the ping request. | `application/x-www-form-urlencoded` <br/>`application/json` <br/>`text/xml` | [Acknowledgement](#acknowledgement) |  
 `400` | Bad Request. Should the incoming data not be validly determined. |  |  
 `401` | Unauthorized. No api key has been provided and is required for this operation. |  |  
 `403` | Forbidden. The api key was provided and understood but is either incorrect or does not have permission to access the account provided on the request. |  |  
 `422` | Unprocessable Entity. Should a failure occur that prevents processing of the API call. | `application/x-www-form-urlencoded` <br/>`application/json` <br/>`text/xml` | [Error](#error) |  






# API Model



## AccountCreate

```json
{
   "account_id": "aaabbb-cccddd-eee",
   "contact": { ... }
}
```

```xml
<AccountCreate>
 <account_id>aaabbb-cccddd-eee</account_id> 
 <contact><>...</></contact> 
</AccountCreate>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `account_id` | string  | true | A card holder account id used for uniquely identifying the account. This value will be used for future referencing of the account oand to link your system to this API. This value is immutable and never changes.<br/><br/> minLength: 5<br/>maxLength: 50 | 
| `contact` | object | false | [ContactDetails](#contactdetails) Contact details for a card holder account. | 





## AccountStatus

```json
{
   "status": ""
}
```

```xml
<AccountStatus>
 <status></status> 
</AccountStatus>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | string  | false | The status of the account to set, valid values are ACTIVE or DISABLED. | 





## Acknowledgement

```json
{
   "code": "0",
   "context": "aspiu352908ns47n343598bads",
   "identifier": "95b857a1-5955-4b86-963c-5a6dbfc4fb95",
   "message": "Approved 044332"
}
```

```xml
<Acknowledgement>
 <code>0</code> 
 <context>aspiu352908ns47n343598bads</context> 
 <identifier>95b857a1-5955-4b86-963c-5a6dbfc4fb95</identifier> 
 <message>Approved 044332</message> 
</Acknowledgement>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `code` | string  | false | A response code providing a result of the process.<br/><br/>minLength: 3<br/>maxLength: 4 | 
| `context` | string  | false | A context id of the process used for referencing transactions through support. | 
| `identifier` | string  | false | An identifier if presented in the original request.<br/><br/>minLength: 4<br/>maxLength: 50 | 
| `message` | string  | false | A response message providing a description of the result of the process. | 





## AclCheckRequest

```json
{
   "ip": "8.8.8.8"
}
```

```xml
<AclCheckRequest>
 <ip>8.8.8.8</ip> 
</AclCheckRequest>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `ip` | string *ipv4* | false | An ip address to check for an ACL against. The address should be a publicly routable IPv4 address. | 





## AclCheckResponseModel

```json
{
   "acl": "",
   "cache": false,
   "ip": "8.8.8.8",
   "provider": ""
}
```

```xml
<AclCheckResponseModel>
 <acl></acl> 
 <cache></cache> 
 <ip>8.8.8.8</ip> 
 <provider></provider> 
</AclCheckResponseModel>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `acl` | string  | false | The name or value of the acl which was found to match the ip address. | 
| `cache` | boolean  | false | Whether the ACL was returned via a cached instance. | 
| `ip` | string *ipv4* | false | The IP address used in the lookup. | 
| `provider` | string  | false | The source provider of the ACL. | 





## AirlineAdvice

```json
{
   "carrier_name": "EG Air",
   "conjunction_ticket_indicator": false,
   "eticket_indicator": true,
   "no_air_segments": 2,
   "number_in_party": 2,
   "original_ticket_no": "",
   "passenger_name": "NE Person",
   "segment1": { ... },
   "segment2": { ... },
   "segment3": { ... },
   "segment4": { ... },
   "ticket_issue_city": "London",
   "ticket_issue_date": "2020-08-01",
   "ticket_issue_name": "Issue Name",
   "ticket_no": "A112233",
   "transaction_type": "TKT"
}
```

```xml
<AirlineAdvice>
 <carrier_name>EG Air</carrier_name> 
 <conjunction_ticket_indicator>false</conjunction_ticket_indicator> 
 <eticket_indicator>true</eticket_indicator> 
 <no_air_segments>2</no_air_segments> 
 <number_in_party>2</number_in_party> 
 <original_ticket_no></original_ticket_no> 
 <passenger_name>NE Person</passenger_name> 
 <segment1><>...</></segment1> 
 <segment2><>...</></segment2> 
 <segment3><>...</></segment3> 
 <segment4><>...</></segment4> 
 <ticket_issue_city>London</ticket_issue_city> 
 <ticket_issue_date>2020-08-01</ticket_issue_date> 
 <ticket_issue_name>Issue Name</ticket_issue_name> 
 <ticket_no>A112233</ticket_no> 
 <transaction_type>TKT</transaction_type> 
</AirlineAdvice>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `carrier_name` | string  | true | The name of the airline carrier that generated the tickets for airline travel.<br/><br/>maxLength: 25 | 
| `conjunction_ticket_indicator` | boolean  | false | true if a conjunction ticket (with additional coupons) was issued for an itinerary with more than four segments. Defaults to false. | 
| `eticket_indicator` | boolean  | false | The Electronic Ticket Indicator, a code that indicates if an electronic ticket was issued.  Defaults to true. | 
| `no_air_segments` | integer *int32* | false | A value that indicates the number of air travel segments included on this ticket.<br/><br/>Valid entries include the numerals “0” through “4”. Required only if the transaction type is TKT or EXC.<br/><br/> minimum: 0<br/>maximum: 4 | 
| `number_in_party` | integer *int32* | true | The number of people in the party. | 
| `original_ticket_no` | string  | false | Required if transaction type is EXC.<br/><br/>maxLength: 14 | 
| `passenger_name` | string  | false | The name of the passenger when the traveller is not the card member that purchased the ticket. Required only if the transaction type is TKT or EXC.<br/><br/>maxLength: 25 | 
| `segment1` | object | true | [AirlineSegment](#airlinesegment) Segment 1 of airline data defining the outward leg. | 
| `segment2` | object | false | [AirlineSegment](#airlinesegment) Segment 2 of airline data. If a return flight or stop-over the segment will be populated. | 
| `segment3` | object | false | [AirlineSegment](#airlinesegment) Segment 3 of airline data if defined. | 
| `segment4` | object | false | [AirlineSegment](#airlinesegment) Segment 4 of airline data if defined. | 
| `ticket_issue_city` | string  | true | The name of the city town or village where the transaction took place.<br/><br/>maxLength: 18 | 
| `ticket_issue_date` | string *date* | true | The date the ticket was issued in ISO Date format (yyyy-MM-dd).<br/><br/>maxLength: 10 | 
| `ticket_issue_name` | string  | true | The name of the agency generating the ticket.<br/><br/>maxLength: 26 | 
| `ticket_no` | string  | true | This must be a valid ticket number, i.e. numeric (the first 3 digits must represent the valid IATA plate carrier code). The final check digit should be validated prior to submission. On credit charges, this field should contain the number of the original ticket, and not of a replacement.<br/><br/> maxLength: 14 | 
| `transaction_type` | string  | true | This field contains the Transaction Type code assigned to this transaction. Valid codes include:<br/><br/> - `TKT` = Ticket Purchase<br/><br/> - `REF` = Refund<br/><br/> - `EXC` = Exchange Ticket<br/><br/> - `MSC` = Miscellaneous (non-Ticket Purchase- and non-Exchange Ticket-related transactions only).<br/><br/> minLength: 3<br/>maxLength: 3 | 





## AirlineSegment

```json
{
   "arrival_location_code": "SOU",
   "carrier_code": "ZZ",
   "class_service_code": "CC",
   "departure_date": "2020-08-01",
   "departure_location_code": "JER",
   "flight_number": "772",
   "segment_fare": 7500,
   "stop_over_indicator": "1"
}
```

```xml
<AirlineSegment>
 <arrival_location_code>SOU</arrival_location_code> 
 <carrier_code>ZZ</carrier_code> 
 <class_service_code>CC</class_service_code> 
 <departure_date>2020-08-01</departure_date> 
 <departure_location_code>JER</departure_location_code> 
 <flight_number>772</flight_number> 
 <segment_fare>7500</segment_fare> 
 <stop_over_indicator>1</stop_over_indicator> 
</AirlineSegment>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `arrival_location_code` | string  | true | A standard airline routing code (airport code or location identifier) applicable to the arrival portion of this segment.<br/><br/> maxLength: 3 | 
| `carrier_code` | string  | true | This field contains the two character airline designator code (air carrier code or airline code) that corresponds to the airline carrier applicable for up to four flight segments of this trip itinerary.<br/><br/> maxLength: 2 | 
| `class_service_code` | string  | true | This field contains a code that corresponds to the fare class (A, B, C, D, Premium, Discounted, etc.) within the overall class of service (e.g., First Class, Business, Economy) applicable to this travel segment, as specified in the IATA Standard Code allocation table.<br/><br/> maxLength: 2 | 
| `departure_date` | string *date* | true | The Departure Date for the travel segment in ISO Date Format (yyyy-MM-dd). | 
| `departure_location_code` | string  | false | A standard airline routing code (airport code or location identifier) applicable to the departure portion of this segment.<br/><br/> maxLength: 3 | 
| `flight_number` | string  | true | This field contains the carrier-assigned Flight Number for this travel segment.<br/><br/>maxLength: 4 | 
| `segment_fare` | integer *int32* | false | This field contains the total Fare for this travel segment. | 
| `stop_over_indicator` | string  | false | O = Stopover allowed, X = Stopover not allowed.<br/><br/>maxLength: 1 | 





## AuthReference

```json
{
   "amount": "20.0",
   "amount_value": 3600,
   "atrn": "",
   "authcode": "001245A",
   "batchno": "",
   "currency": "GBP",
   "datetime": "2020-01-02",
   "identifier": "95b857a1-5955-4b86-963c-5a6dbfc4fb95",
   "maskedpan": "4***********0002",
   "merchantid": 11223344,
   "result": "",
   "trans_status": "",
   "trans_type": "",
   "transno": 78416
}
```

```xml
<AuthReference>
 <amount>20.0</amount> 
 <amount_value>3600</amount_value> 
 <atrn></atrn> 
 <authcode>001245A</authcode> 
 <batchno></batchno> 
 <currency>GBP</currency> 
 <datetime>2020-01-02</datetime> 
 <identifier>95b857a1-5955-4b86-963c-5a6dbfc4fb95</identifier> 
 <maskedpan>4***********0002</maskedpan> 
 <merchantid>11223344</merchantid> 
 <result></result> 
 <trans_status></trans_status> 
 <trans_type></trans_type> 
 <transno>78416</transno> 
</AuthReference>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount` | string  | false | The amount of the transaction in decimal currency format.<br/><br/>maxLength: 12 | 
| `amount_value` | integer *int32* | false | The amount of the transaction in integer/request format.<br/><br/>minLength: 1<br/>maxLength: 12 | 
| `atrn` | string  | false | A reference number provided by the acquiring services. | 
| `authcode` | string  | false | The authorisation code of the transaction returned by the acquirer or card issuer. | 
| `batchno` | string  | false | A batch number which the transaction has been end of day batched towards. | 
| `currency` | string  | false | The currency of the transaction in ISO 4217 code format.<br/><br/>minLength: 3<br/>maxLength: 3 | 
| `datetime` | string *date-time* | false | The date and time of the transaction. | 
| `identifier` | string  | false | The identifier of the transaction used to process the transaction.<br/><br/>minLength: 4<br/>maxLength: 50 | 
| `maskedpan` | string  | false | A masking of the card number which was used to process the tranasction. | 
| `merchantid` | integer *int32* | false | The merchant id of the transaction result. | 
| `result` | string  | false | The result of the transaction. | 
| `trans_status` | string  | false | The current status of the transaction through it's lifecycle. | 
| `trans_type` | string  | false | The type of transaction that was processed.<br/><br/>maxLength: 1 | 
| `transno` | integer *int32* | false | The transaction number of the transaction. | 





## AuthReferences

```json
{
   "auths": ""
}
```

```xml
<AuthReferences>
 <auths></auths> 
</AuthReferences>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `auths` | array | false | Authorisations which match the request. [AuthReference](#authreference) | 





## AuthRequest

```json
{
   "airline_data": { ... },
   "amount": 3600,
   "avs_postcode_policy": "",
   "bill_to": { ... },
   "cardnumber": "4000 0000 0000 0002",
   "csc": "10",
   "csc_policy": "",
   "currency": "GBP",
   "duplicate_policy": "",
   "expmonth": 9,
   "expyear": 2025,
   "external_mpi": { ... },
   "identifier": "95b857a1-5955-4b86-963c-5a6dbfc4fb95",
   "match_avsa": "",
   "mcc6012": { ... },
   "merchantid": 11223344,
   "name_on_card": "MR NE BODY",
   "ship_to": { ... },
   "threedsecure": { ... },
   "trans_info": "",
   "trans_type": ""
}
```

```xml
<AuthRequest>
 <airline_data><>...</></airline_data> 
 <amount>3600</amount> 
 <avs_postcode_policy></avs_postcode_policy> 
 <bill_to><>...</></bill_to> 
 <cardnumber>4000 0000 0000 0002</cardnumber> 
 <csc>10</csc> 
 <csc_policy></csc_policy> 
 <currency>GBP</currency> 
 <duplicate_policy></duplicate_policy> 
 <expmonth>9</expmonth> 
 <expyear>2025</expyear> 
 <external_mpi><>...</></external_mpi> 
 <identifier>95b857a1-5955-4b86-963c-5a6dbfc4fb95</identifier> 
 <match_avsa></match_avsa> 
 <mcc6012><>...</></mcc6012> 
 <merchantid>11223344</merchantid> 
 <name_on_card>MR NE BODY</name_on_card> 
 <ship_to><>...</></ship_to> 
 <threedsecure><>...</></threedsecure> 
 <trans_info></trans_info> 
 <trans_type></trans_type> 
</AuthRequest>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount` | integer *int32* | true | The amount to authorise in the lowest unit of currency with a variable length to a maximum of 12 digits.<br/><br/>No decimal points are to be included and no divisional characters such as 1,024.<br/><br/>The amount should be the total amount required for the transaction.<br/><br/>For example with GBP £1,021.95 the amount value is 102195.<br/><br/> minLength: 1<br/>maxLength: 12 | 
| `avs_postcode_policy` | string  | false | A policy value which determines whether an AVS postcode policy is enforced or bypassed.<br/><br/>Values are  `0` for the default policy (default value if not supplied). Your default values are determined by your account manager on setup of the account.<br/><br/> `1` for an enforced policy. Transactions that are enforced will be rejected if the AVS postcode numeric value does not match.<br/><br/> `2` to bypass. Transactions that are bypassed will be allowed through even if the postcode did not match.<br/><br/> `3` to ignore. Transactions that are ignored will bypass the result and not send postcode details for authorisation. | 
| `bill_to` | object | false | [ContactDetails](#contactdetails) Billing details of the card holder making the payment. These details may be used for AVS fraud analysis, 3DS and for future referencing of the transaction.<br/><br/>For AVS to work correctly, the billing details should be the registered address of the card holder as it appears on the statement with their card issuer. The numeric details will be passed through for analysis and may result in a decline if incorrectly provided. | 
| `cardnumber` | string  | true | The card number (PAN) with a variable length to a maximum of 21 digits in numerical form. Any non numeric characters will be stripped out of the card number, this includes whitespace or separators internal of the provided value.<br/><br/>The card number must be treated as sensitive data. We only provide an obfuscated value in logging and reporting.  The plaintext value is encrypted in our database using AES 256 GMC bit encryption for settlement or refund purposes.<br/><br/>When providing the card number to our gateway through the authorisation API you will be handling the card data on your application. This will require further PCI controls to be in place and this value must never be stored.<br/><br/> minLength: 12<br/>maxLength: 22 | 
| `csc` | string  | false | The Card Security Code (CSC) (also known as CV2/CVV2) is normally found on the back of the card (American Express has it on the front). The value helps to identify posession of the card as it is not available within the chip or magnetic swipe.<br/><br/>When forwarding the CSC, please ensure the value is a string as some values start with 0 and this will be stripped out by any integer parsing.<br/><br/>The CSC number aids fraud prevention in Mail Order and Internet payments.<br/><br/>Business rules are available on your account to identify whether to accept or decline transactions based on mismatched results of the CSC.<br/><br/>The Payment Card Industry (PCI) requires that at no stage of a transaction should the CSC be stored.<br/><br/>This applies to all entities handling card data.<br/><br/>It should also not be used in any hashing process.<br/><br/>CityPay do not store the value and have no method of retrieving the value once the transaction has been processed. For this reason, duplicate checking is unable to determine the CSC in its duplication check algorithm.<br/><br/> minLength: 3<br/>maxLength: 4 | 
| `csc_policy` | string  | false | A policy value which determines whether a CSC policy is enforced or bypassed.<br/><br/>Values are  `0` for the default policy (default value if not supplied). Your default values are determined by your account manager on setup of the account.<br/><br/> `1` for an enforced policy. Transactions that are enforced will be rejected if the CSC value does not match.<br/><br/> `2` to bypass. Transactions that are bypassed will be allowed through even if the CSC did not match.<br/><br/> `3` to ignore. Transactions that are ignored will bypass the result and not send the CSC details for authorisation. | 
| `currency` | string  | false | The processing currency for the transaction. Will default to the merchant account currency.<br/><br/>minLength: 3<br/>maxLength: 3 | 
| `duplicate_policy` | string  | false | A policy value which determines whether a duplication policy is enforced or bypassed. A duplication check has a window of time set against your account within which it can action. If a previous transaction with matching values occurred within the window, any subsequent transaction will result in a T001 result.<br/><br/>Values are  `0` for the default policy (default value if not supplied). Your default values are determined by your account manager on setup of the account.<br/><br/> `1` for an enforced policy. Transactions that are enforced will be checked for duplication within the duplication window.<br/><br/> `2` to bypass. Transactions that are bypassed will not be checked for duplication within the duplication window.<br/><br/> `3` to ignore. Transactions that are ignored will have the same affect as bypass. | 
| `expmonth` | integer *int32* | true | The month of expiry of the card. The month value should be a numerical value between 1 and 12.<br/><br/> minimum: 1<br/>maximum: 12 | 
| `expyear` | integer *int32* | true | The year of expiry of the card.<br/><br/> minimum: 2000<br/>maximum: 2100 | 
| `external_mpi` | object | false | [ExternalMPI](#externalmpi) If an external 3DSv1 MPI is used for authentication, values provided can be supplied in this element. | 
| `identifier` | string  | true | The identifier of the transaction to process. The value should be a valid reference and may be used to perform  post processing actions and to aid in reconciliation of transactions.<br/><br/>The value should be a valid printable string with ASCII character ranges from 0x32 to 0x127.<br/><br/>The identifier is recommended to be distinct for each transaction such as a [random unique identifier](https://en.wikipedia.org/wiki/Universally_unique_identifier) this will aid in ensuring each transaction is identifiable.<br/><br/>When transactions are processed they are also checked for duplicate requests. Changing the identifier on a subsequent request will ensure that a transaction is considered as different.<br/><br/> minLength: 4<br/>maxLength: 50 | 
| `match_avsa` | string  | false | A policy value which determines whether an AVS address policy is enforced, bypassed or ignored.<br/><br/>Values are  `0` for the default policy (default value if not supplied). Your default values are determined by your account manager on setup of the account.<br/><br/> `1` for an enforced policy. Transactions that are enforced will be rejected if the AVS address numeric value does not match.<br/><br/> `2` to bypass. Transactions that are bypassed will be allowed through even if the address did not match.<br/><br/> `3` to ignore. Transactions that are ignored will bypass the result and not send address numeric details for authorisation. | 
| `mcc6012` | object | false | [MCC6012](#mcc6012) If the merchant is MCC coded as 6012, additional values are required for authorisation. | 
| `merchantid` | integer *int32* | true | Identifies the merchant account to perform processing for. | 
| `name_on_card` | string  | false | The card holder name as appears on the card such as MR N E BODY. Required for some acquirers.<br/><br/> minLength: 2<br/>maxLength: 45 | 
| `ship_to` | object | false | [ContactDetails](#contactdetails) Shipping details of the card holder making the payment. These details may be used for 3DS and for future referencing of the transaction. | 
| `threedsecure` | object | false | [ThreeDSecure](#threedsecure) ThreeDSecure element, providing values to enable full 3DS processing flows. | 
| `trans_info` | string  | false | Further information that can be added to the transaction will display in reporting. Can be used for flexible values such as operator id.<br/><br/>maxLength: 50 | 
| `trans_type` | string  | false | The type of transaction being submitted. Normally this value is not required and your account manager may request that you set this field.<br/><br/>maxLength: 1 | 



| Extension | Field | Type | Required | Description |
|-----------|-------|------|----------|-------------|
Airline | `airline_data` | object | false | [AirlineAdvice](#airlineadvice) Additional advice for airline integration that can be applied on an authorisation request.<br/><br/>As tickets are normally not allocated until successful payment it is normal for a transaction to be pre-authorised  and the airline advice supplied on a capture request instead. Should the data already exist and an auth and  capture is preferred. This data may be supplied. |




## AuthResponse

```json
{
   "amount": 3600,
   "atrn": "",
   "atsd": "",
   "authcode": "001245A",
   "authen_result": "",
   "authorised": true,
   "avs_result": "",
   "bin_commercial": false,
   "bin_debit": false,
   "bin_description": "Platinum Card",
   "cavv": "",
   "context": "aspiu352908ns47n343598bads",
   "csc_result": "",
   "currency": "GBP",
   "datetime": "2020-01-02",
   "eci": "",
   "identifier": "95b857a1-5955-4b86-963c-5a6dbfc4fb95",
   "live": true,
   "maskedpan": "4***********0002",
   "merchantid": 11223344,
   "result": 1,
   "result_code": "0",
   "result_message": "Accepted Transaction",
   "scheme": "Visa",
   "sha256": "",
   "trans_status": "",
   "transno": 78416
}
```

```xml
<AuthResponse>
 <amount>3600</amount> 
 <atrn></atrn> 
 <atsd></atsd> 
 <authcode>001245A</authcode> 
 <authen_result></authen_result> 
 <authorised>true</authorised> 
 <avs_result></avs_result> 
 <bin_commercial></bin_commercial> 
 <bin_debit></bin_debit> 
 <bin_description>Platinum Card</bin_description> 
 <cavv></cavv> 
 <context>aspiu352908ns47n343598bads</context> 
 <csc_result></csc_result> 
 <currency>GBP</currency> 
 <datetime>2020-01-02</datetime> 
 <eci></eci> 
 <identifier>95b857a1-5955-4b86-963c-5a6dbfc4fb95</identifier> 
 <live>true</live> 
 <maskedpan>4***********0002</maskedpan> 
 <merchantid>11223344</merchantid> 
 <result>1</result> 
 <result_code>0</result_code> 
 <result_message>Accepted Transaction</result_message> 
 <scheme>Visa</scheme> 
 <sha256></sha256> 
 <trans_status></trans_status> 
 <transno>78416</transno> 
</AuthResponse>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount` | integer *int32* | false | The amount of the transaction processed. | 
| `atrn` | string  | false | A reference number provided by the acquirer for a transaction it can be used to cross reference transactions with an Acquirers reporting panel. | 
| `atsd` | string  | false | Additional Transaction Security Data used for ecommerce transactions to decipher security capabilities and attempts against a transaction. | 
| `authcode` | string  | false | The authorisation code as returned by the card issuer or acquiring bank when a transaction has successfully   been authorised. Authorisation codes contain alphanumeric values. Whilst the code confirms authorisation it   should not be used to determine whether a transaction was successfully processed. For instance an auth code   may be returned when a transaction has been subsequently declined due to a CSC mismatch. | 
| `authen_result` | string  | false | The result of any authentication using 3d_secure authorisation against ecommerce transactions. Values are:<br/><br/><table> <tr> <th>Value</th> <th>Description</th> </tr> <tr> <td>Y</td> <td>Authentication Successful. The Cardholder's password was successfully validated.</td> </tr> <tr> <td>N</td> <td>Authentication Failed. Customer failed or cancelled authentication, transaction denied.</td> </tr> <tr> <td>A</td> <td>Attempts Processing Performed Authentication could not be completed but a proof of authentication attempt (CAVV) was generated.</td> </tr> <tr> <td>U</td> <td>Authentication Could Not Be Performed Authentication could not be completed, due to technical or other problem.</td> </tr> </table> | 
| `authorised` | boolean  | false | A boolean definition that indicates that the transaction was authorised. It will return false if the transaction  was declined, rejected or cancelled due to CSC matching failures.<br/><br/>Attention should be referenced to the AuthResult and Response code for accurate determination of the result. | 
| `avs_result` | string  | false | The AVS result codes determine the result of checking the AVS values within the Address Verification fraud system. If a transaction is declined due to the AVS code not matching, this value can help determine the reason for the decline.<br/><br/><table> <tr> <th>Code</th> <th>Description</th> </tr> <tr><td>Y</td><td>Address and 5 digit post code match</td></tr> <tr><td>M</td><td>Street address and Postal codes match for international transaction</td></tr> <tr><td>U</td><td>No AVS data available from issuer auth system</td></tr> <tr><td>A</td><td>Addres matches, post code does not</td></tr> <tr><td>I</td><td>Address information verified for international transaction</td></tr> <tr><td>Z</td><td>5 digit post code matches, Address does not</td></tr> <tr><td>W</td><td>9 digit post code matches, Address does not</td></tr> <tr><td>X</td><td>Postcode and address match</td></tr> <tr><td>B</td><td>Postal code not verified due to incompatible formats</td></tr> <tr><td>P</td><td>Postal codes match. Street address not verified due to to incompatible formats</td></tr> <tr><td>E</td><td>AVS Error</td></tr> <tr><td>C</td><td>Street address and Postal code not verified due to incompatible formats</td></tr> <tr><td>D</td><td>Street address and postal codes match</td></tr> <tr><td> </td><td>No information</td></tr> <tr><td>N</td><td>Neither postcode nor address match</td></tr> <tr><td>R</td><td>Retry, System unavailble or Timed Out</td></tr> <tr><td>S</td><td>AVS Service not supported by issuer or processor</td></tr> <tr><td>G</td><td>Issuer does not participate in AVS</td></tr> </table> | 
| `bin_commercial` | boolean  | false | Determines whether the bin range was found to be a commercial or business card. | 
| `bin_debit` | boolean  | false | Determines whether the bin range was found to be a debit card. If false the card was considered as a credit card. | 
| `bin_description` | string  | false | A description of the bin range found for the card. | 
| `cavv` | string  | false | The cardholder authentication verification value which can be returned for verification purposes of the authenticated  transaction for dispute realisation. | 
| `context` | string  | false | The context which processed the transaction, can be used for support purposes to trace transactions. | 
| `csc_result` | string  | false | The CSC rseult codes determine the result of checking the provided CSC value within the Card Security Code fraud system. If a transaction is declined due to the CSC code not matching, this value can help determine the reason for the decline.<br/><br/><table> <tr> <th>Code</th> <th>Description</th> </tr> <tr><td> </td><td>No information</td></tr> <tr><td>M</td><td>Card verification data matches</td></tr> <tr><td>N</td><td>Card verification data was checked but did not match</td></tr> <tr><td>P</td><td>Card verification was not processed</td></tr> <tr><td>S</td><td>The card verification data should be on the card but the merchant indicates that it is not</td></tr> <tr><td>U</td><td>The card issuer is not certified</td></tr> </table> | 
| `currency` | string  | false | The currency the transaction was processed in. This is an `ISO4217` alpha currency value. | 
| `datetime` | string *date-time* | false | The UTC date time of the transaction in ISO data time format. | 
| `eci` | string  | false | An Electronic Commerce Indicator (ECI) used to identify the result of authentication using 3DSecure. | 
| `identifier` | string  | false | The identifier provided within the request. | 
| `live` | boolean  | false | Used to identify that a transaction was processed on a live authorisation platform. | 
| `maskedpan` | string  | false | A masked value of the card number used for processing displaying limited values that can be used on a receipt. | 
| `merchantid` | integer *int32* | true | The merchant id that processed this transaction. | 
| `result` | integer *int32* | true | An integer result that indicates the outcome of the transaction. The Code value below maps to the result value<br/><br/><table> <tr> <th>Code</th> <th>Abbrev</th> <th>Description</th> </tr> <tr><td>0</td><td>Declined</td><td>Declined</td></tr> <tr><td>1</td><td>Accepted</td><td>Accepted</td></tr> <tr><td>2</td><td>Rejected</td><td>Rejected</td></tr> <tr><td>3</td><td>Not Attempted</td><td>Not Attempted</td></tr> <tr><td>4</td><td>Referred</td><td>Referred</td></tr> <tr><td>5</td><td>PinRetry</td><td>Perform PIN Retry</td></tr> <tr><td>6</td><td>ForSigVer</td><td>Force Signature Verification</td></tr> <tr><td>7</td><td>Hold</td><td>Hold</td></tr> <tr><td>8</td><td>SecErr</td><td>Security Error</td></tr> <tr><td>9</td><td>CallAcq</td><td>Call Acquirer</td></tr> <tr><td>10</td><td>DNH</td><td>Do Not Honour</td></tr> <tr><td>11</td><td>RtnCrd</td><td>Retain Card</td></tr> <tr><td>12</td><td>ExprdCrd</td><td>Expired Card</td></tr> <tr><td>13</td><td>InvldCrd</td><td>Invalid Card No</td></tr> <tr><td>14</td><td>PinExcd</td><td>Pin Tries Exceeded</td></tr> <tr><td>15</td><td>PinInvld</td><td>Pin Invalid</td></tr> <tr><td>16</td><td>AuthReq</td><td>Authentication Required</td></tr> <tr><td>17</td><td>AuthenFail</td><td>Authentication Failed</td></tr> <tr><td>18</td><td>Verified</td><td>Card Verified</td></tr> <tr><td>19</td><td>Cancelled</td><td>Cancelled</td></tr> <tr><td>20</td><td>Un</td><td>Unknown</td></tr> <tr><td>21</td><td>Challenged</td><td>Challenged</td></tr> <tr><td>22</td><td>Decoupled</td><td>Decoupled</td></tr> <tr><td>23</td><td>Denied</td><td>Permission Denied</td></tr> </table> | 
| `result_code` | string  | true | The result code as defined in the Response Codes Reference for example 000 is an accepted live transaction whilst 001 is an accepted test transaction. Result codes identify the source of success and failure.<br/><br/>Codes may start with an alpha character i.e. C001 indicating a type of error such as a card validation error. | 
| `result_message` | string  | true | The message regarding the result which provides further narrative to the result code. | 
| `scheme` | string  | false | A name of the card scheme of the transaction that processed the transaction such as Visa or MasterCard. | 
| `sha256` | string  | false | A SHA256 digest value of the transaction used to validate the response data The digest is calculated by concatenating<br/><br/> * authcode<br/><br/> * amount<br/><br/> * response_code<br/><br/> * merchant_id<br/><br/> * trans_no<br/><br/> * identifier<br/><br/> * licence_key - which is not provided in the response. | 
| `trans_status` | string  | false | Used to identify the status of a transaction. The status is used to track a transaction through its life cycle.<br/><br/><table> <tr> <th>Id</th> <th>Description</th> </tr> <tr> <td>O</td> <td>Transaction is open for settlement</td> </tr> <tr> <td>A</td> <td>Transaction is assigned for settlement and can no longer be voided</td> </tr> <tr> <td>S</td> <td>Transaction has been settled</td> </tr> <tr> <td>D</td> <td>Transaction has been declined</td> </tr> <tr> <td>R</td> <td>Transaction has been rejected</td> </tr> <tr> <td>P</td> <td>Transaction has been authorised only and awaiting a capture. Used in pre-auth situations</td> </tr> <tr> <td>C</td> <td>Transaction has been cancelled</td> </tr> <tr> <td>E</td> <td>Transaction has expired</td> </tr> <tr> <td>I</td> <td>Transaction has been initialised but no action was able to be carried out</td> </tr> <tr> <td>H</td> <td>Transaction is awaiting authorisation</td> </tr> <tr> <td>.</td> <td>Transaction is on hold</td> </tr> <tr> <td>V</td> <td>Transaction has been verified</td> </tr> </table> | 
| `transno` | integer *int32* | false | The resulting transaction number, ordered incrementally from 1 for every merchant_id. The value will default to less than 1 for transactions that do not have a transaction number issued. | 





## AuthenRequired

```json
{
   "acs_url": "https://acs.cardissuer.com/3dsv1",
   "md": "",
   "pareq": "eNrNWdnOo0qSfpXSmUuf0+w2tFy/lOyYxYDZ79h3sAEbm6cfbFfV+bu6pqe7R2qNJeQkiIwlMyK+..."
}
```

```xml
<AuthenRequired>
 <acs_url>https://acs.cardissuer.com/3dsv1</acs_url> 
 <md></md> 
 <pareq>eNrNWdnOo0qSfpXSmUuf0+w2tFy/lOyYxYDZ79h3sAEbm6cfbFfV+bu6pqe7R2qNJeQkiIwlMyK+...</pareq> 
</AuthenRequired>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `acs_url` | string *url* | false | The url of the Access Control Server (ACS) to forward the user to. | 
| `md` | string  | false | Merchant Data (MD) which should be sent to the ACS to establish and reference the authentication session. | 
| `pareq` | string *base64* | false | The Payer Authentication Request packet which should be `POSTed` to the Url of the ACS to establish the authentication session. Data should be sent untouched. | 





## Batch

```json
{
   "batch_date": "2020-01-02",
   "batch_id": 35,
   "batch_status": "COMPLETE"
}
```

```xml
<Batch>
 <batch_date>2020-01-02</batch_date> 
 <batch_id>35</batch_id> 
 <batch_status>COMPLETE</batch_status> 
</Batch>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `batch_date` | string *date* | true | The date that the file was created in ISO-8601 format. | 
| `batch_id` | integer *int32* | false | The batch id requested.<br/><br/>maxLength: 8<br/>minimum: 1 | 
| `batch_status` | string  | true | The status of the batch. Possible values are - CANCELLED. The file has been cancelled by an administrator or server process.  - COMPLETE. The file has passed through the processing cycle and is determined as being complete further information should be obtained on the results of the processing - ERROR_IN_PROCESSING. Errors have occurred in the processing that has deemed that processing can not continue. - INITIALISED. The file has been initialised and no action has yet been performed - LOCKED. The file has been locked for processing - QUEUED. The file has been queued for processing yet no processing has yet been performed - UNKNOWN. The file is of an unknown status, that is the file can either not be determined by the information requested of the file has not yet been received. | 





## BatchReportRequest

```json
{
   "batch_id": 35,
   "client_account_id": "AC1"
}
```

```xml
<BatchReportRequest>
 <batch_id>35</batch_id> 
 <client_account_id>AC1</client_account_id> 
</BatchReportRequest>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `batch_id` | integer *int32* | true | The batch id specified in the batch processing request.<br/><br/>maxLength: 8<br/>minimum: 1 | 
| `client_account_id` | string  | false | The batch account id that the batch was processed for. Defaults to your client id if not provided.<br/><br/>minLength: 3<br/>maxLength: 20 | 





## BatchReportResponseModel

```json
{
   "amount": 3600,
   "batch_date": "2020-01-02",
   "batch_id": 35,
   "batch_status": "COMPLETE",
   "client_account_id": "AC1",
   "transactions": ""
}
```

```xml
<BatchReportResponseModel>
 <amount>3600</amount> 
 <batch_date>2020-01-02</batch_date> 
 <batch_id>35</batch_id> 
 <batch_status>COMPLETE</batch_status> 
 <client_account_id>AC1</client_account_id> 
 <transactions></transactions> 
</BatchReportResponseModel>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount` | integer *int32* | true | The total amount that the batch contains.<br/><br/>minLength: 1<br/>maxLength: 12 | 
| `batch_date` | string *date* | true | The date and time of the batch in ISO-8601 format. | 
| `batch_id` | integer *int32* | true | The batch id specified in the batch processing request.<br/><br/>maxLength: 8<br/>minimum: 1 | 
| `batch_status` | string  | true | The status of the batch. Possible values are - CANCELLED. The file has been cancelled by an administrator or server process.  - COMPLETE. The file has passed through the processing cycle and is determined as being complete further information should be obtained on the results of the processing - ERROR_IN_PROCESSING. Errors have occurred in the processing that has deemed that processing can not continue. - INITIALISED. The file has been initialised and no action has yet been performed - LOCKED. The file has been locked for processing - QUEUED. The file has been queued for processing yet no processing has yet been performed - UNKNOWN. The file is of an unknown status, that is the file can either not be determined by the information requested of the file has not yet been received. | 
| `client_account_id` | string  | true | The batch account id that the batch was processed with.<br/><br/>minLength: 3<br/>maxLength: 20 | 
| `transactions` | array | true | Transactions associated with the batch. [BatchTransactionResultModel](#batchtransactionresultmodel) | 





## BatchTransaction

```json
{
   "account_id": "aaabbb-cccddd-eee",
   "amount": 3600,
   "identifier": "95b857a1-5955-4b86-963c-5a6dbfc4fb95",
   "merchantid": 11223344
}
```

```xml
<BatchTransaction>
 <account_id>aaabbb-cccddd-eee</account_id> 
 <amount>3600</amount> 
 <identifier>95b857a1-5955-4b86-963c-5a6dbfc4fb95</identifier> 
 <merchantid>11223344</merchantid> 
</BatchTransaction>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `account_id` | string  | true | The card holder account id to process against.<br/><br/>minLength: 5<br/>maxLength: 50 | 
| `amount` | integer *int32* | true | The amount required to process in the lowest denomination.<br/><br/>minLength: 1<br/>maxLength: 12 | 
| `identifier` | string  | false | An identifier used to reference the transaction set by your integration. The value should be used to refer to the transaction in future calls.<br/><br/>minLength: 4<br/>maxLength: 50 | 
| `merchantid` | integer *int32* | false | The CityPay merchant id used to process the transaction. | 





## BatchTransactionResultModel

```json
{
   "account_id": "aaabbb-cccddd-eee",
   "amount": 3600,
   "authcode": "001245A",
   "datetime": "2020-01-02",
   "identifier": "95b857a1-5955-4b86-963c-5a6dbfc4fb95",
   "maskedpan": "4***********0002",
   "merchantid": 11223344,
   "message": "Approved 044332",
   "result": 1,
   "result_code": "0",
   "scheme": "Visa",
   "transno": 78416
}
```

```xml
<BatchTransactionResultModel>
 <account_id>aaabbb-cccddd-eee</account_id> 
 <amount>3600</amount> 
 <authcode>001245A</authcode> 
 <datetime>2020-01-02</datetime> 
 <identifier>95b857a1-5955-4b86-963c-5a6dbfc4fb95</identifier> 
 <maskedpan>4***********0002</maskedpan> 
 <merchantid>11223344</merchantid> 
 <message>Approved 044332</message> 
 <result>1</result> 
 <result_code>0</result_code> 
 <scheme>Visa</scheme> 
 <transno>78416</transno> 
</BatchTransactionResultModel>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `account_id` | string  | true | The card holder account id used for the transaction.<br/><br/>minLength: 5<br/>maxLength: 50 | 
| `amount` | integer *int32* | false | The amount of the transaction processed.<br/><br/>minLength: 1<br/>maxLength: 12 | 
| `authcode` | string  | false | The authorisation code of a successful transaction. | 
| `datetime` | string *date-time* | false | The datetime that the transaction was processed. | 
| `identifier` | string  | true | The identifier of the transaction.<br/><br/>minLength: 4<br/>maxLength: 50 | 
| `maskedpan` | string  | false | A masked value of the card number used for processing displaying limited values that can be used on a receipt. | 
| `merchantid` | integer *int32* | true | The merchant id of the transaction. | 
| `message` | string  | true | A response message pertaining to the transaction. | 
| `result` | integer *int32* | true | An integer result that indicates the outcome of the transaction. The Code value below maps to the result value<br/><br/><table> <tr> <th>Code</th> <th>Abbrev</th> <th>Description</th> </tr> <tr><td>0</td><td>Declined</td><td>Declined</td></tr> <tr><td>1</td><td>Accepted</td><td>Accepted</td></tr> <tr><td>2</td><td>Rejected</td><td>Rejected</td></tr> <tr><td>3</td><td>Not Attempted</td><td>Not Attempted</td></tr> <tr><td>4</td><td>Referred</td><td>Referred</td></tr> <tr><td>5</td><td>PinRetry</td><td>Perform PIN Retry</td></tr> <tr><td>6</td><td>ForSigVer</td><td>Force Signature Verification</td></tr> <tr><td>7</td><td>Hold</td><td>Hold</td></tr> <tr><td>8</td><td>SecErr</td><td>Security Error</td></tr> <tr><td>9</td><td>CallAcq</td><td>Call Acquirer</td></tr> <tr><td>10</td><td>DNH</td><td>Do Not Honour</td></tr> <tr><td>11</td><td>RtnCrd</td><td>Retain Card</td></tr> <tr><td>12</td><td>ExprdCrd</td><td>Expired Card</td></tr> <tr><td>13</td><td>InvldCrd</td><td>Invalid Card No</td></tr> <tr><td>14</td><td>PinExcd</td><td>Pin Tries Exceeded</td></tr> <tr><td>15</td><td>PinInvld</td><td>Pin Invalid</td></tr> <tr><td>16</td><td>AuthReq</td><td>Authentication Required</td></tr> <tr><td>17</td><td>AuthenFail</td><td>Authentication Failed</td></tr> <tr><td>18</td><td>Verified</td><td>Card Verified</td></tr> <tr><td>19</td><td>Cancelled</td><td>Cancelled</td></tr> <tr><td>20</td><td>Un</td><td>Unknown</td></tr> <tr><td>21</td><td>Challenged</td><td>Challenged</td></tr> <tr><td>22</td><td>Decoupled</td><td>Decoupled</td></tr> <tr><td>23</td><td>Denied</td><td>Permission Denied</td></tr> </table> | 
| `result_code` | string  | true | A result code of the transaction identifying the result of the transaction for success, rejection or decline. | 
| `scheme` | string  | false | A name of the card scheme of the transaction that processed the transaction such as Visa or MasterCard. | 
| `transno` | integer *int32* | false | The resulting transaction number, ordered incrementally from 1 for every merchant_id. The value will default to less than 1 for transactions that do not have a transaction number issued. | 





## Bin

```json
{
   "bin_commercial": false,
   "bin_corporate": false,
   "bin_country_issued": "",
   "bin_credit": false,
   "bin_currency": "",
   "bin_debit": false,
   "bin_description": "Platinum Card",
   "bin_eu": false,
   "scheme": "Visa"
}
```

```xml
<Bin>
 <bin_commercial></bin_commercial> 
 <bin_corporate></bin_corporate> 
 <bin_country_issued></bin_country_issued> 
 <bin_credit></bin_credit> 
 <bin_currency></bin_currency> 
 <bin_debit></bin_debit> 
 <bin_description>Platinum Card</bin_description> 
 <bin_eu></bin_eu> 
 <scheme>Visa</scheme> 
</Bin>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `bin_commercial` | boolean  | false | Defines whether the card is a commercial card. | 
| `bin_corporate` | boolean  | false | Defines whether the card is a corporate business card. | 
| `bin_country_issued` | string  | false | The determined country where the card was issued. | 
| `bin_credit` | boolean  | false | Defines whether the card is a credit card. | 
| `bin_currency` | string  | false | The default currency determined for the card. | 
| `bin_debit` | boolean  | false | Defines whether the card is a debit card. | 
| `bin_description` | string  | false | A description of the bin on the card to identify what type of product the card is. | 
| `bin_eu` | boolean  | false | Defines whether the card is regulated within the EU. | 
| `scheme` | string  | false | The scheme that issued the card. | 





## BinLookup

```json
{
   "bin": 543712
}
```

```xml
<BinLookup>
 <bin>543712</bin> 
</BinLookup>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `bin` | integer *int32* | true | A bin value to use for lookup.<br/><br/>minLength: 6<br/>maxLength: 12 | 





## CRes Direct

```json
{
   "cres": "x90+vZ/7Ll05Vid/jPfQn8adw+4D/vRDUGT19kndW97Hfirbv66ycfSp8jNlvy7PkHbx44NEt3vo...",
   "threeDSSessionData": ""
}
```

```xml
<CRes Direct>
 <cres>x90+vZ/7Ll05Vid/jPfQn8adw+4D/vRDUGT19kndW97Hfirbv66ycfSp8jNlvy7PkHbx44NEt3vo...</cres> 
 <threeDSSessionData></threeDSSessionData> 
</CRes Direct>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `cres` | string *base64* | false | The CRES from the ACS. | 
| `threeDSSessionData` | string  | false | The session data from the ACS. | 





## CResAuthRequest

```json
{
   "cres": "x90+vZ/7Ll05Vid/jPfQn8adw+4D/vRDUGT19kndW97Hfirbv66ycfSp8jNlvy7PkHbx44NEt3vo..."
}
```

```xml
<CResAuthRequest>
 <cres>x90+vZ/7Ll05Vid/jPfQn8adw+4D/vRDUGT19kndW97Hfirbv66ycfSp8jNlvy7PkHbx44NEt3vo...</cres> 
</CResAuthRequest>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `cres` | string *base64* | false | The challenge response data forwarded by the ACS in 3D-Secure V2 processing. Data should be forwarded to CityPay unchanged for subsequent authorisation and processing. | 





## CaptureRequest

```json
{
   "airline_data": { ... },
   "amount": 3600,
   "identifier": "95b857a1-5955-4b86-963c-5a6dbfc4fb95",
   "merchantid": 11223344,
   "transno": 78416
}
```

```xml
<CaptureRequest>
 <airline_data><>...</></airline_data> 
 <amount>3600</amount> 
 <identifier>95b857a1-5955-4b86-963c-5a6dbfc4fb95</identifier> 
 <merchantid>11223344</merchantid> 
 <transno>78416</transno> 
</CaptureRequest>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount` | integer *int32* | false | The completion amount provided in the lowest unit of currency for the specific currency of the merchant, with a variable length to a maximum of 12 digits. No decimal points to be included. For example with GBP 75.45 use the value 7545. Please check that you do not supply divisional characters such as 1,024 in the request which may be caused by some number formatters.<br/><br/>If no amount is supplied, the original processing amount is used.<br/><br/> minLength: 1<br/>maxLength: 12 | 
| `identifier` | string  | false | The identifier of the transaction to capture. If an empty value is supplied then a `trans_no` value must be supplied.<br/><br/>minLength: 4<br/>maxLength: 50 | 
| `merchantid` | integer *int32* | true | Identifies the merchant account to perform the capture for. | 
| `transno` | integer *int32* | false | The transaction number of the transaction to look up and capture. If an empty value is supplied then an identifier value must be supplied. | 



| Extension | Field | Type | Required | Description |
|-----------|-------|------|----------|-------------|
Airline | `airline_data` | object | false | [AirlineAdvice](#airlineadvice) Additional advice to be applied for the capture request. |




## Card

```json
{
   "bin_commercial": false,
   "bin_corporate": false,
   "bin_country_issued": "",
   "bin_credit": false,
   "bin_currency": "",
   "bin_debit": false,
   "bin_description": "Platinum Card",
   "bin_eu": false,
   "card_id": "",
   "card_status": "",
   "date_created": "2020-01-02",
   "default": false,
   "expmonth": 9,
   "expyear": 2025,
   "label": "Visa/0002",
   "label2": "Visa/0002,Exp:2304",
   "last4digits": "2",
   "name_on_card": "MR NE BODY",
   "scheme": "Visa",
   "token": "ctPCAPyNyCkx3Ry8wGyv8khC3ch2hUSB3Db..Qzr"
}
```

```xml
<Card>
 <bin_commercial></bin_commercial> 
 <bin_corporate></bin_corporate> 
 <bin_country_issued></bin_country_issued> 
 <bin_credit></bin_credit> 
 <bin_currency></bin_currency> 
 <bin_debit></bin_debit> 
 <bin_description>Platinum Card</bin_description> 
 <bin_eu></bin_eu> 
 <card_id></card_id> 
 <card_status></card_status> 
 <date_created>2020-01-02</date_created> 
 <default></default> 
 <expmonth>9</expmonth> 
 <expyear>2025</expyear> 
 <label>Visa/0002</label> 
 <label2>Visa/0002,Exp:2304</label2> 
 <last4digits>2</last4digits> 
 <name_on_card>MR NE BODY</name_on_card> 
 <scheme>Visa</scheme> 
 <token>ctPCAPyNyCkx3Ry8wGyv8khC3ch2hUSB3Db..Qzr</token> 
</Card>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `bin_commercial` | boolean  | false | Defines whether the card is a commercial card. | 
| `bin_corporate` | boolean  | false | Defines whether the card is a corporate business card. | 
| `bin_country_issued` | string  | false | The determined country where the card was issued. | 
| `bin_credit` | boolean  | false | Defines whether the card is a credit card. | 
| `bin_currency` | string  | false | The default currency determined for the card. | 
| `bin_debit` | boolean  | false | Defines whether the card is a debit card. | 
| `bin_description` | string  | false | A description of the bin on the card to identify what type of product the card is. | 
| `bin_eu` | boolean  | false | Defines whether the card is regulated within the EU. | 
| `card_id` | string  | false | The id of the card that is returned. Should be used for referencing the card when perform any changes. | 
| `card_status` | string  | false | The status of the card such, valid values are<br/><br/> - ACTIVE the card is active for processing<br/><br/> - INACTIVE the card is not active for processing<br/><br/> - EXPIRED for cards that have passed their expiry date. | 
| `date_created` | string *date-time* | false | The date time of when the card was created. | 
| `default` | boolean  | false | Determines if the card is the default card for the account and should be regarded as the first option to be used for processing. | 
| `expmonth` | integer *int32* | false | The expiry month of the card.<br/><br/>minimum: 1<br/>maximum: 12 | 
| `expyear` | integer *int32* | false | The expiry year of the card.<br/><br/>minimum: 2000<br/>maximum: 2100 | 
| `label` | string  | false | A label which identifies this card. | 
| `label2` | string  | false | A label which also provides the expiry date of the card. | 
| `last4digits` | string  | false | The last 4 digits of the card to aid in identification. | 
| `name_on_card` | string  | false | The name on the card.<br/><br/>minLength: 2<br/>maxLength: 45 | 
| `scheme` | string  | false | The scheme that issued the card. | 
| `token` | string *base58* | false | A token that can be used to process against the card. | 





## CardHolderAccount

```json
{
   "account_id": "aaabbb-cccddd-eee",
   "cards": "",
   "contact": { ... },
   "date_created": "2020-01-02",
   "default_card_id": "",
   "default_card_index": 0,
   "last_modified": "2020-01-02",
   "status": "",
   "unique_id": ""
}
```

```xml
<CardHolderAccount>
 <account_id>aaabbb-cccddd-eee</account_id> 
 <cards></cards> 
 <contact><>...</></contact> 
 <date_created>2020-01-02</date_created> 
 <default_card_id></default_card_id> 
 <default_card_index></default_card_index> 
 <last_modified>2020-01-02</last_modified> 
 <status></status> 
 <unique_id></unique_id> 
</CardHolderAccount>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `account_id` | string  | true | The account id of the card holder account provided by the merchant which uniquely identifies the account.<br/><br/> minLength: 5<br/>maxLength: 50 | 
| `cards` | array | false | [Card](#card) | 
| `contact` | object | true | [ContactDetails](#contactdetails) Contact details that refer to this account. | 
| `date_created` | string *date-time* | false | The date and time the account was created. | 
| `default_card_id` | string  | false | The id of the default card. | 
| `default_card_index` | integer *int32* | false | The index in the array of the default card. | 
| `last_modified` | date-time  | false | The date and time the account was last modified. | 
| `status` | string  | false | Defines the status of the account for processing valid values are<br/><br/> - ACTIVE for active accounts that are able to process<br/><br/> - DISABLED for accounts that are currently disabled for processing. | 
| `unique_id` | string  | false | A unique id of the card holder account which uniquely identifies the stored account. This value is not searchable. | 





## CardStatus

```json
{
   "card_status": "",
   "default": false
}
```

```xml
<CardStatus>
 <card_status></card_status> 
 <default></default> 
</CardStatus>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `card_status` | string  | false | The status of the card to set, valid values are ACTIVE or INACTIVE. | 
| `default` | boolean  | false | Defines if the card is set as the default. | 





## ChargeRequest

```json
{
   "amount": 3600,
   "avs_postcode_policy": "",
   "cardholder_agreement": "",
   "csc": "10",
   "csc_policy": "",
   "currency": "GBP",
   "duplicate_policy": "",
   "identifier": "95b857a1-5955-4b86-963c-5a6dbfc4fb95",
   "initiation": "",
   "match_avsa": "",
   "merchantid": 11223344,
   "threedsecure": { ... },
   "token": "ctPCAPyNyCkx3Ry8wGyv8khC3ch2hUSB3Db..Qzr",
   "trans_info": "",
   "trans_type": ""
}
```

```xml
<ChargeRequest>
 <amount>3600</amount> 
 <avs_postcode_policy></avs_postcode_policy> 
 <cardholder_agreement></cardholder_agreement> 
 <csc>10</csc> 
 <csc_policy></csc_policy> 
 <currency>GBP</currency> 
 <duplicate_policy></duplicate_policy> 
 <identifier>95b857a1-5955-4b86-963c-5a6dbfc4fb95</identifier> 
 <initiation></initiation> 
 <match_avsa></match_avsa> 
 <merchantid>11223344</merchantid> 
 <threedsecure><>...</></threedsecure> 
 <token>ctPCAPyNyCkx3Ry8wGyv8khC3ch2hUSB3Db..Qzr</token> 
 <trans_info></trans_info> 
 <trans_type></trans_type> 
</ChargeRequest>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount` | integer *int32* | true | The amount to authorise in the lowest unit of currency with a variable length to a maximum of 12 digits.<br/><br/>No decimal points are to be included and no divisional characters such as 1,024.<br/><br/>The amount should be the total amount required for the transaction.<br/><br/>For example with GBP £1,021.95 the amount value is 102195.<br/><br/> minLength: 1<br/>maxLength: 12 | 
| `avs_postcode_policy` | string  | false | A policy value which determines whether an AVS postcode policy is enforced or bypassed.<br/><br/>Values are  `0` for the default policy (default value if not supplied). Your default values are determined by your account manager on setup of the account.<br/><br/> `1` for an enforced policy. Transactions that are enforced will be rejected if the AVS postcode numeric value does not match.<br/><br/> `2` to bypass. Transactions that are bypassed will be allowed through even if the postcode did not match.<br/><br/> `3` to ignore. Transactions that are ignored will bypass the result and not send postcode details for authorisation. | 
| `cardholder_agreement` | string  | false | Merchant-initiated transactions (MITs) are payments you trigger, where the cardholder has previously consented to you carrying out such payments. These may be scheduled (such as recurring payments and installments) or unscheduled (like account top-ups triggered by balance thresholds and no-show charges).<br/><br/>Scheduled --- These are regular payments using stored card details, like installments or a monthly subscription fee.<br/><br/>- `I` Instalment - A single purchase of goods or services billed to a cardholder in multiple transactions, over a period of time agreed by the cardholder and you.<br/><br/>- `R` Recurring - Transactions processed at fixed, regular intervals not to exceed one year between transactions, representing an agreement between a cardholder and you to purchase goods or services provided over a period of time.<br/><br/>Unscheduled --- These are payments using stored card details that do not occur on a regular schedule, like top-ups for a digital wallet triggered by the balance falling below a certain threshold.<br/><br/>- `A` Reauthorisation - a purchase made after the original purchase. A common scenario is delayed/split shipments.<br/><br/>- `C` Unscheduled Payment - A transaction using a stored credential for a fixed or variable amount that does not occur on a scheduled or regularly occurring transaction date. This includes account top-ups triggered by balance thresholds.<br/><br/>- `D` Delayed Charge - A delayed charge is typically used in hotel, cruise lines and vehicle rental environments to perform a supplemental account charge after original services are rendered.<br/><br/>- `L` Incremental - An incremental authorisation is typically found in hotel and car rental environments, where the cardholder has agreed to pay for any service incurred during the duration of the contract. An incremental authorisation is where you need to seek authorisation of further funds in addition to what you have originally requested. A common scenario is additional services charged to the contract, such as extending a stay in a hotel.<br/><br/>- `S` Resubmission - When the original purchase occurred, but you were not able to get authorisation at the time the goods or services were provided. It should be only used where the goods or services have already been provided, but the authorisation request is declined for insufficient funds.<br/><br/>- `X` No-show - A no-show is a transaction where you are enabled to charge for services which the cardholder entered into an agreement to purchase, but the cardholder did not meet the terms of the agreement.<br/><br/> maxLength: 1 | 
| `csc` | string  | false | The Card Security Code (CSC) (also known as CV2/CVV2) is normally found on the back of the card (American Express has it on the front). The value helps to identify posession of the card as it is not available within the chip or magnetic swipe.<br/><br/>When forwarding the CSC, please ensure the value is a string as some values start with 0 and this will be stripped out by any integer parsing.<br/><br/>The CSC number aids fraud prevention in Mail Order and Internet payments.<br/><br/>Business rules are available on your account to identify whether to accept or decline transactions based on mismatched results of the CSC.<br/><br/>The Payment Card Industry (PCI) requires that at no stage of a transaction should the CSC be stored.<br/><br/>This applies to all entities handling card data.<br/><br/>It should also not be used in any hashing process.<br/><br/>CityPay do not store the value and have no method of retrieving the value once the transaction has been processed. For this reason, duplicate checking is unable to determine the CSC in its duplication check algorithm.<br/><br/> minLength: 3<br/>maxLength: 4 | 
| `csc_policy` | string  | false | A policy value which determines whether a CSC policy is enforced or bypassed.<br/><br/>Values are  `0` for the default policy (default value if not supplied). Your default values are determined by your account manager on setup of the account.<br/><br/> `1` for an enforced policy. Transactions that are enforced will be rejected if the CSC value does not match.<br/><br/> `2` to bypass. Transactions that are bypassed will be allowed through even if the CSC did not match.<br/><br/> `3` to ignore. Transactions that are ignored will bypass the result and not send the CSC details for authorisation. | 
| `currency` | string  | false | The processing currency for the transaction. Will default to the merchant account currency.<br/><br/>minLength: 3<br/>maxLength: 3 | 
| `duplicate_policy` | string  | false | A policy value which determines whether a duplication policy is enforced or bypassed. A duplication check has a window of time set against your account within which it can action. If a previous transaction with matching values occurred within the window, any subsequent transaction will result in a T001 result.<br/><br/>Values are  `0` for the default policy (default value if not supplied). Your default values are determined by your account manager on setup of the account.<br/><br/> `1` for an enforced policy. Transactions that are enforced will be checked for duplication within the duplication window.<br/><br/> `2` to bypass. Transactions that are bypassed will not be checked for duplication within the duplication window.<br/><br/> `3` to ignore. Transactions that are ignored will have the same affect as bypass. | 
| `identifier` | string  | true | The identifier of the transaction to process. The value should be a valid reference and may be used to perform  post processing actions and to aid in reconciliation of transactions.<br/><br/>The value should be a valid printable string with ASCII character ranges from 0x32 to 0x127.<br/><br/>The identifier is recommended to be distinct for each transaction such as a [random unique identifier](https://en.wikipedia.org/wiki/Universally_unique_identifier) this will aid in ensuring each transaction is identifiable.<br/><br/>When transactions are processed they are also checked for duplicate requests. Changing the identifier on a subsequent request will ensure that a transaction is considered as different.<br/><br/> minLength: 4<br/>maxLength: 50 | 
| `initiation` | string  | false | Transactions charged using the API are defined as:<br/><br/>**Cardholder Initiated**: A _cardholder initiated transaction_ (CIT) is where the cardholder selects the card for use for a purchase using previously stored details. An example would be a customer buying an item from your website after being present with their saved card details at checkout.<br/><br/>**Merchant Intiated**: A _merchant initiated transaction_ (MIT) is an authorisation initiated where you as the  merchant submit a cardholders previously stored details without the cardholder's participation. An example would  be a subscription to a membership scheme to debit their card monthly.<br/><br/>MITs have different reasons such as reauthorisation, delayed, unscheduled, incremental, recurring, instalment, no-show or resubmission.<br/><br/>The following values apply<br/><br/> - `M` - specifies that the transaction is initiated by the merchant<br/><br/> - `C` - specifies that the transaction is initiated by the cardholder<br/><br/>Where transactions are merchant initiated, a valid cardholder agreement must be defined.<br/><br/> maxLength: 1 | 
| `match_avsa` | string  | false | A policy value which determines whether an AVS address policy is enforced, bypassed or ignored.<br/><br/>Values are  `0` for the default policy (default value if not supplied). Your default values are determined by your account manager on setup of the account.<br/><br/> `1` for an enforced policy. Transactions that are enforced will be rejected if the AVS address numeric value does not match.<br/><br/> `2` to bypass. Transactions that are bypassed will be allowed through even if the address did not match.<br/><br/> `3` to ignore. Transactions that are ignored will bypass the result and not send address numeric details for authorisation. | 
| `merchantid` | integer *int32* | true | Identifies the merchant account to perform processing for. | 
| `threedsecure` | object | false | [ThreeDSecure](#threedsecure) ThreeDSecure element, providing values to enable full 3DS processing flows. | 
| `token` | string *base58* | true | A tokenised form of a card that belongs to a card holder's account and that has been previously registered. The token is time based and will only be active for a short duration. The value is therefore designed not to be stored remotely for future use.<br/><br/> Tokens will start with ct and are resiliently tamper proof using HMacSHA-256. No sensitive card data is stored internally within the token.<br/><br/> Each card will contain a different token and the value may be different on any retrieval call.<br/><br/> The value can be presented for payment as a selection value to an end user in a web application. | 
| `trans_info` | string  | false | Further information that can be added to the transaction will display in reporting. Can be used for flexible values such as operator id.<br/><br/>maxLength: 50 | 
| `trans_type` | string  | false | The type of transaction being submitted. Normally this value is not required and your account manager may request that you set this field.<br/><br/>maxLength: 1 | 





## CheckBatchStatus

```json
{
   "batch_id": "",
   "client_account_id": "AC1"
}
```

```xml
<CheckBatchStatus>
 <batch_id></batch_id> 
 <client_account_id>AC1</client_account_id> 
</CheckBatchStatus>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `batch_id` | array | true | type: integer | 
| `client_account_id` | string  | false | The batch account id to obtain the batch for. Defaults to your client id if not provided.<br/><br/>minLength: 3<br/>maxLength: 20 | 





## CheckBatchStatusResponse

```json
{
   "batches": ""
}
```

```xml
<CheckBatchStatusResponse>
 <batches></batches> 
</CheckBatchStatusResponse>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `batches` | array | false | [Batch](#batch) | 





## ContactDetails

```json
{
   "address1": "79 Parliament St",
   "address2": "Westminster",
   "address3": "",
   "area": "London",
   "company": "Acme Ltd",
   "country": "GB",
   "email": "card.holder@citypay.com",
   "firstname": "John",
   "lastname": "Smith",
   "mobile_no": "447790123456",
   "postcode": "L1 789",
   "telephone_no": "442030123456",
   "title": "Mr"
}
```

```xml
<ContactDetails>
 <address1>79 Parliament St</address1> 
 <address2>Westminster</address2> 
 <address3></address3> 
 <area>London</area> 
 <company>Acme Ltd</company> 
 <country>GB</country> 
 <email>card.holder@citypay.com</email> 
 <firstname>John</firstname> 
 <lastname>Smith</lastname> 
 <mobile_no>447790123456</mobile_no> 
 <postcode>L1 789</postcode> 
 <telephone_no>442030123456</telephone_no> 
 <title>Mr</title> 
</ContactDetails>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `address1` | string  | false | The first line of the address for the shipping contact.<br/><br/>maxLength: 50 | 
| `address2` | string  | false | The second line of the address for the shipping contact.<br/><br/>maxLength: 50 | 
| `address3` | string  | false | The third line of the address for the shipping contact.<br/><br/>maxLength: 50 | 
| `area` | string  | false | The area such as city, department, parish for the shipping contact.<br/><br/>maxLength: 50 | 
| `company` | string  | false | The company name for the shipping contact if the contact is a corporate contact.<br/><br/>maxLength: 50 | 
| `country` | string  | false | The country code in ISO 3166 format. The country value may be used for fraud analysis and for   acceptance of the transaction.<br/><br/> minLength: 2<br/>maxLength: 2 | 
| `email` | string  | false | An email address for the shipping contact which may be used for correspondence.<br/><br/>maxLength: 254 | 
| `firstname` | string  | false | The first name  of the shipping contact. | 
| `lastname` | string  | false | The last name or surname of the shipping contact. | 
| `mobile_no` | string  | false | A mobile number for the shipping contact the mobile number is often required by delivery companies to ensure they are able to be in contact when required.<br/><br/>maxLength: 20 | 
| `postcode` | string  | false | The postcode or zip code of the address which may be used for fraud analysis.<br/><br/>maxLength: 16 | 
| `telephone_no` | string  | false | A telephone number for the shipping contact.<br/><br/>maxLength: 20 | 
| `title` | string  | false | A title for the shipping contact such as Mr, Mrs, Ms, M. Mme. etc. | 





## Decision

```json
{
   "AuthResponse": { ... },
   "AuthenRequired": { ... },
   "RequestChallenged": { ... }
}
```

```xml
<Decision>
 <AuthResponse><>...</></AuthResponse> 
 <AuthenRequired><>...</></AuthenRequired> 
 <RequestChallenged><>...</></RequestChallenged> 
</Decision>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `AuthResponse` | object | false | [AuthResponse](#authresponse) A result has been obtained for this transaction either through authorisation or validation. | 
| `AuthenRequired` | object | false | [AuthenRequired](#authenrequired) The request resulted in the transaction participating in 3DSv1 and is required to be authenticated via the ACS. | 
| `RequestChallenged` | object | false | [RequestChallenged](#requestchallenged) The request resulted in the transaction participating in 3DSv2 and has been challenged for authentication by the ACS. | 





## DirectPostRequest

```json
{
   "amount": 3600,
   "avs_postcode_policy": "",
   "bill_to": { ... },
   "cardnumber": "4000 0000 0000 0002",
   "csc": "10",
   "csc_policy": "",
   "currency": "GBP",
   "duplicate_policy": "",
   "expmonth": 9,
   "expyear": 2025,
   "identifier": "95b857a1-5955-4b86-963c-5a6dbfc4fb95",
   "match_avsa": "",
   "name_on_card": "MR NE BODY",
   "nonce": "",
   "redirect_failure": "https://pay.mystore.com/continue_failure",
   "redirect_success": "https://pay.mystore.com/continue_success",
   "ship_to": { ... },
   "threedsecure": { ... },
   "tokenise": true,
   "trans_info": "",
   "trans_type": ""
}
```

```xml
<DirectPostRequest>
 <amount>3600</amount> 
 <avs_postcode_policy></avs_postcode_policy> 
 <bill_to><>...</></bill_to> 
 <cardnumber>4000 0000 0000 0002</cardnumber> 
 <csc>10</csc> 
 <csc_policy></csc_policy> 
 <currency>GBP</currency> 
 <duplicate_policy></duplicate_policy> 
 <expmonth>9</expmonth> 
 <expyear>2025</expyear> 
 <identifier>95b857a1-5955-4b86-963c-5a6dbfc4fb95</identifier> 
 <match_avsa></match_avsa> 
 <name_on_card>MR NE BODY</name_on_card> 
 <nonce></nonce> 
 <redirect_failure>https://pay.mystore.com/continue_failure</redirect_failure> 
 <redirect_success>https://pay.mystore.com/continue_success</redirect_success> 
 <ship_to><>...</></ship_to> 
 <threedsecure><>...</></threedsecure> 
 <tokenise>true</tokenise> 
 <trans_info></trans_info> 
 <trans_type></trans_type> 
</DirectPostRequest>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount` | integer *int32* | true | The amount to authorise in the lowest unit of currency with a variable length to a maximum of 12 digits.<br/><br/>No decimal points are to be included and no divisional characters such as 1,024.<br/><br/>The amount should be the total amount required for the transaction.<br/><br/>For example with GBP £1,021.95 the amount value is 102195.<br/><br/> minLength: 1<br/>maxLength: 12 | 
| `avs_postcode_policy` | string  | false | A policy value which determines whether an AVS postcode policy is enforced or bypassed.<br/><br/>Values are  `0` for the default policy (default value if not supplied). Your default values are determined by your account manager on setup of the account.<br/><br/> `1` for an enforced policy. Transactions that are enforced will be rejected if the AVS postcode numeric value does not match.<br/><br/> `2` to bypass. Transactions that are bypassed will be allowed through even if the postcode did not match.<br/><br/> `3` to ignore. Transactions that are ignored will bypass the result and not send postcode details for authorisation. | 
| `bill_to` | object | false | [ContactDetails](#contactdetails) Billing details of the card holder making the payment. These details may be used for AVS fraud analysis, 3DS and for future referencing of the transaction.<br/><br/>For AVS to work correctly, the billing details should be the registered address of the card holder as it appears on the statement with their card issuer. The numeric details will be passed through for analysis and may result in a decline if incorrectly provided.<br/><br/>If using url-encoded format requests properties should be prefixed with `bill_to_` for example a postcode  value should be `bill_to_postcode`. | 
| `cardnumber` | string  | true | The card number (PAN) with a variable length to a maximum of 21 digits in numerical form. Any non numeric characters will be stripped out of the card number, this includes whitespace or separators internal of the provided value.<br/><br/>The card number must be treated as sensitive data. We only provide an obfuscated value in logging and reporting.  The plaintext value is encrypted in our database using AES 256 GMC bit encryption for settlement or refund purposes.<br/><br/>When providing the card number to our gateway through the authorisation API you will be handling the card data on your application. This will require further PCI controls to be in place and this value must never be stored.<br/><br/> minLength: 12<br/>maxLength: 22 | 
| `csc` | string  | false | The Card Security Code (CSC) (also known as CV2/CVV2) is normally found on the back of the card (American Express has it on the front). The value helps to identify posession of the card as it is not available within the chip or magnetic swipe.<br/><br/>When forwarding the CSC, please ensure the value is a string as some values start with 0 and this will be stripped out by any integer parsing.<br/><br/>The CSC number aids fraud prevention in Mail Order and Internet payments.<br/><br/>Business rules are available on your account to identify whether to accept or decline transactions based on mismatched results of the CSC.<br/><br/>The Payment Card Industry (PCI) requires that at no stage of a transaction should the CSC be stored.<br/><br/>This applies to all entities handling card data.<br/><br/>It should also not be used in any hashing process.<br/><br/>CityPay do not store the value and have no method of retrieving the value once the transaction has been processed. For this reason, duplicate checking is unable to determine the CSC in its duplication check algorithm.<br/><br/> minLength: 3<br/>maxLength: 4 | 
| `csc_policy` | string  | false | A policy value which determines whether a CSC policy is enforced or bypassed.<br/><br/>Values are  `0` for the default policy (default value if not supplied). Your default values are determined by your account manager on setup of the account.<br/><br/> `1` for an enforced policy. Transactions that are enforced will be rejected if the CSC value does not match.<br/><br/> `2` to bypass. Transactions that are bypassed will be allowed through even if the CSC did not match.<br/><br/> `3` to ignore. Transactions that are ignored will bypass the result and not send the CSC details for authorisation. | 
| `currency` | string  | false | The processing currency for the transaction. Will default to the merchant account currency.<br/><br/>minLength: 3<br/>maxLength: 3 | 
| `duplicate_policy` | string  | false | A policy value which determines whether a duplication policy is enforced or bypassed. A duplication check has a window of time set against your account within which it can action. If a previous transaction with matching values occurred within the window, any subsequent transaction will result in a T001 result.<br/><br/>Values are  `0` for the default policy (default value if not supplied). Your default values are determined by your account manager on setup of the account.<br/><br/> `1` for an enforced policy. Transactions that are enforced will be checked for duplication within the duplication window.<br/><br/> `2` to bypass. Transactions that are bypassed will not be checked for duplication within the duplication window.<br/><br/> `3` to ignore. Transactions that are ignored will have the same affect as bypass. | 
| `expmonth` | integer *int32* | true | The month of expiry of the card. The month value should be a numerical value between 1 and 12.<br/><br/> minimum: 1<br/>maximum: 12 | 
| `expyear` | integer *int32* | true | The year of expiry of the card.<br/><br/> minimum: 2000<br/>maximum: 2100 | 
| `identifier` | string  | true | The identifier of the transaction to process. The value should be a valid reference and may be used to perform  post processing actions and to aid in reconciliation of transactions.<br/><br/>The value should be a valid printable string with ASCII character ranges from 0x32 to 0x127.<br/><br/>The identifier is recommended to be distinct for each transaction such as a [random unique identifier](https://en.wikipedia.org/wiki/Universally_unique_identifier) this will aid in ensuring each transaction is identifiable.<br/><br/>When transactions are processed they are also checked for duplicate requests. Changing the identifier on a subsequent request will ensure that a transaction is considered as different.<br/><br/> minLength: 4<br/>maxLength: 50 | 
| `match_avsa` | string  | false | A policy value which determines whether an AVS address policy is enforced, bypassed or ignored.<br/><br/>Values are  `0` for the default policy (default value if not supplied). Your default values are determined by your account manager on setup of the account.<br/><br/> `1` for an enforced policy. Transactions that are enforced will be rejected if the AVS address numeric value does not match.<br/><br/> `2` to bypass. Transactions that are bypassed will be allowed through even if the address did not match.<br/><br/> `3` to ignore. Transactions that are ignored will bypass the result and not send address numeric details for authorisation. | 
| `name_on_card` | string  | false | The card holder name as appears on the card such as MR N E BODY. Required for some acquirers.<br/><br/> minLength: 2<br/>maxLength: 45 | 
| `nonce` | string  | false | A random value string which is provided to the API to perform a digest. The value will be used by its UTF-8 byte representation of any digest function. | 
| `redirect_failure` | string *url* | false | The URL used to redirect back to your site when a transaction has been rejected or declined. Required if a url-encoded request. | 
| `redirect_success` | string *url* | false | The URL used to redirect back to your site when a transaction has been tokenised or authorised. Required if a url-encoded request. | 
| `ship_to` | object | false | [ContactDetails](#contactdetails) Shipping details of the card holder making the payment. These details may be used for 3DS and for future referencing of the transaction. | 
| `threedsecure` | object | false | [ThreeDSecure](#threedsecure) ThreeDSecure element, providing values to enable full 3DS processing flows. | 
| `tokenise` | boolean  | false | Boolean flag which defines whether the response data is tokenised for further presentation at a later authorisation stage. A value of false will effectively turn off tokenisation and present the transaction immediately upstream to the acquirer. | 
| `trans_info` | string  | false | Further information that can be added to the transaction will display in reporting. Can be used for flexible values such as operator id.<br/><br/>maxLength: 50 | 
| `trans_type` | string  | false | The type of transaction being submitted. Normally this value is not required and your account manager may request that you set this field.<br/><br/>maxLength: 1 | 





## DirectTokenAuthRequest

```json
{
   "nonce": "",
   "redirect_failure": "https://pay.mystore.com/continue_failure",
   "redirect_success": "https://pay.mystore.com/continue_success",
   "token": "ctPCAPyNyCkx3Ry8wGyv8khC3ch2hUSB3Db..Qzr"
}
```

```xml
<DirectTokenAuthRequest>
 <nonce></nonce> 
 <redirect_failure>https://pay.mystore.com/continue_failure</redirect_failure> 
 <redirect_success>https://pay.mystore.com/continue_success</redirect_success> 
 <token>ctPCAPyNyCkx3Ry8wGyv8khC3ch2hUSB3Db..Qzr</token> 
</DirectTokenAuthRequest>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `nonce` | string  | false | A random value string which is provided to the API to perform a digest. The value will be used by its UTF-8 byte representation of any digest function. | 
| `redirect_failure` | string *url* | false | The URL used to redirect back to your site when a transaction has been rejected or declined. Required if a url-encoded request. | 
| `redirect_success` | string *url* | false | The URL used to redirect back to your site when a transaction has been authorised. Required if a url-encoded request. | 
| `token` | string *base58* | false | The token required to process the transaction as presented by the direct post methodology. | 





## DomainKeyCheckRequest

```json
{
   "domainKey": "3MEcU8cEf...QMeebACxcQVejmT1Wi"
}
```

```xml
<DomainKeyCheckRequest>
 <domainKey>3MEcU8cEf...QMeebACxcQVejmT1Wi</domainKey> 
</DomainKeyCheckRequest>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `domainKey` | string  | true | The domain key to check.<br/><br/> minLength: 64<br/>maxLength: 512 | 





## DomainKeyRequest

```json
{
   "domain": "",
   "live": true,
   "merchantid": 11223344
}
```

```xml
<DomainKeyRequest>
 <domain></domain> 
 <live>true</live> 
 <merchantid>11223344</merchantid> 
</DomainKeyRequest>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `domain` | array | true | The domains the domain key is registered for. you should only provide the host and no ports.<br/><br/>[String](#string) | 
| `live` | boolean  | false | Specifies if the key is to be used for production. Defaults to false. | 
| `merchantid` | integer *int32* | true | The merchant id the domain key is to be used for. | 





## DomainKeyResponse

```json
{
   "date_created": "2020-01-02",
   "domain": "",
   "domainKey": "3MEcU8cEf...QMeebACxcQVejmT1Wi",
   "live": true,
   "merchantid": 11223344
}
```

```xml
<DomainKeyResponse>
 <date_created>2020-01-02</date_created> 
 <domain></domain> 
 <domainKey>3MEcU8cEf...QMeebACxcQVejmT1Wi</domainKey> 
 <live>true</live> 
 <merchantid>11223344</merchantid> 
</DomainKeyResponse>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `date_created` | string *date-time* | false | The date the domain key was generated. | 
| `domain` | array | true | The domains the domain key is registered for. you should only provide the host and no ports.<br/><br/>[String](#string) | 
| `domainKey` | string  | false | The domain key generated.<br/><br/> minLength: 64<br/>maxLength: 512 | 
| `live` | boolean  | false | true if this key is a production key. | 
| `merchantid` | integer *int32* | true | The merchant id the domain key is to be used for. | 





## Error

```json
{
   "code": "0",
   "context": "aspiu352908ns47n343598bads",
   "identifier": "95b857a1-5955-4b86-963c-5a6dbfc4fb95",
   "message": "Approved 044332"
}
```

```xml
<Error>
 <code>0</code> 
 <context>aspiu352908ns47n343598bads</context> 
 <identifier>95b857a1-5955-4b86-963c-5a6dbfc4fb95</identifier> 
 <message>Approved 044332</message> 
</Error>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `code` | string  | false | A response code providing a result of the process.<br/><br/>minLength: 3<br/>maxLength: 4 | 
| `context` | string  | false | A context id of the process used for referencing transactions through support. | 
| `identifier` | string  | false | An identifier if presented in the original request.<br/><br/>minLength: 4<br/>maxLength: 50 | 
| `message` | string  | false | A response message providing a description of the result of the process. | 





## Exists

```json
{
   "active": true,
   "exists": true,
   "last_modified": "2020-01-02"
}
```

```xml
<Exists>
 <active>true</active> 
 <exists>true</exists> 
 <last_modified>2020-01-02</last_modified> 
</Exists>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `active` | boolean  | false | Boolean value whether the entity is active. | 
| `exists` | boolean  | true | Boolean value whether the entity exists. | 
| `last_modified` | date-time  | false | The last modified date of the entity. | 





## ExternalMPI

```json
{
   "authen_result": "",
   "cavv": "",
   "eci": 0,
   "enrolled": "",
   "xid": ""
}
```

```xml
<ExternalMPI>
 <authen_result></authen_result> 
 <cavv></cavv> 
 <eci></eci> 
 <enrolled></enrolled> 
 <xid></xid> 
</ExternalMPI>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `authen_result` | string  | false | The authentication result available from the MPI.<br/><br/>maxLength: 1 | 
| `cavv` | string  | false | A value determining the cardholder verification value supplied by the card scheme.<br/><br/>maxLength: 20 | 
| `eci` | integer *int32* | false | The obtained e-commerce indicator from the MPI.<br/><br/>maxLength: 1 | 
| `enrolled` | string  | false | A value determining whether the card holder was enrolled.<br/><br/>maxLength: 1 | 
| `xid` | string  | false | The XID used for processing with the MPI.<br/><br/>maxLength: 20 | 





## ListMerchantsResponse

```json
{
   "client_name": "",
   "clientid": "PC12345",
   "merchants": ""
}
```

```xml
<ListMerchantsResponse>
 <client_name></client_name> 
 <clientid>PC12345</clientid> 
 <merchants></merchants> 
</ListMerchantsResponse>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `client_name` | string  | false | The client name that was requested. | 
| `clientid` | string  | false | The client id requested.<br/><br/>minLength: 3<br/>maxLength: 10 | 
| `merchants` | array | false | [Merchant](#merchant) | 





## MCC6012

```json
{
   "recipient_account": "",
   "recipient_dob": "",
   "recipient_lastname": "",
   "recipient_postcode": ""
}
```

```xml
<MCC6012>
 <recipient_account></recipient_account> 
 <recipient_dob></recipient_dob> 
 <recipient_lastname></recipient_lastname> 
 <recipient_postcode></recipient_postcode> 
</MCC6012>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `recipient_account` | string  | false | The account number of the recipient. | 
| `recipient_dob` | string  | false | The date of birth of the recipient. | 
| `recipient_lastname` | string  | false | The lastname of ther recepient. | 
| `recipient_postcode` | string  | false | The postcode of the recipient. | 





## Merchant

```json
{
   "currency": "GBP",
   "merchantid": 11223344,
   "name": "Merchant 1",
   "status": "A",
   "status_label": "Active"
}
```

```xml
<Merchant>
 <currency>GBP</currency> 
 <merchantid>11223344</merchantid> 
 <name>Merchant 1</name> 
 <status>A</status> 
 <status_label>Active</status_label> 
</Merchant>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `currency` | string  | false | The currency of the merchant. | 
| `merchantid` | integer *int32* | false | The merchant id which uniquely identifies the merchant account. | 
| `name` | string  | false | The name of the merchant. | 
| `status` | string  | false | The status of the account. | 
| `status_label` | string  | false | The status label of the account. | 





## PaResAuthRequest

```json
{
   "md": "",
   "pares": "v66ycfSp8jNlvy7PkHbx44NEt3vox90+vZ/7Ll05Vid/jPfQn8adw+4D/vRDUGT19kndW97Hfirb..."
}
```

```xml
<PaResAuthRequest>
 <md></md> 
 <pares>v66ycfSp8jNlvy7PkHbx44NEt3vox90+vZ/7Ll05Vid/jPfQn8adw+4D/vRDUGT19kndW97Hfirb...</pares> 
</PaResAuthRequest>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `md` | string  | true | The Merchant Data (MD) which is a unique ID to reference the authentication session.<br/><br/>This value will be created by CityPay when required. When responding from the ACS, this value will be returned by the ACS. | 
| `pares` | string *base64* | true | The Payer Authentication Response packet which is returned by the ACS containing the  response of the authentication session including verification values. The response  is a base64 encoded packet and should be forwarded to CityPay untouched. | 





## Ping

```json
{
   "identifier": "95b857a1-5955-4b86-963c-5a6dbfc4fb95"
}
```

```xml
<Ping>
 <identifier>95b857a1-5955-4b86-963c-5a6dbfc4fb95</identifier> 
</Ping>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `identifier` | string  | false | An identifier of the ping request which will be returned in the response.<br/><br/>minLength: 4<br/>maxLength: 50 | 





## ProcessBatchRequest

```json
{
   "batch_date": "2020-01-02",
   "batch_id": 35,
   "client_account_id": "AC1",
   "transactions": ""
}
```

```xml
<ProcessBatchRequest>
 <batch_date>2020-01-02</batch_date> 
 <batch_id>35</batch_id> 
 <client_account_id>AC1</client_account_id> 
 <transactions></transactions> 
</ProcessBatchRequest>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `batch_date` | string *date* | true | The date and time that the file was created in ISO-8601 format. | 
| `batch_id` | integer *int32* | true | The id is a referencable id for the batch that should be generated by your integration. Its recommended to use an incremental id to help determine if a batch has been skipped or missed. The id is used by reporting systems to reference the unique batch alongside your client id.<br/><br/> maxLength: 8<br/>minimum: 1 | 
| `client_account_id` | string  | false | The batch account id to process the batch for. Defaults to your client id if not provided.<br/><br/>minLength: 3<br/>maxLength: 20 | 
| `transactions` | array | true | Transactions requested for processing. There is a logical limit of 10,000 transactions that can be processed in a single batch. The sandbox will accept up to 100 transactions.<br/><br/>[BatchTransaction](#batchtransaction) | 





## ProcessBatchResponse

```json
{
   "message": "Approved 044332",
   "valid": true
}
```

```xml
<ProcessBatchResponse>
 <message>Approved 044332</message> 
 <valid>true</valid> 
</ProcessBatchResponse>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `message` | string  | false | Information regarding the processing request. | 
| `valid` | boolean  | true | true if the request has been accepted for processing and is valid. | 





## RefundRequest

```json
{
   "amount": 3600,
   "identifier": "95b857a1-5955-4b86-963c-5a6dbfc4fb95",
   "merchantid": 11223344,
   "refund_ref": 8322,
   "trans_info": ""
}
```

```xml
<RefundRequest>
 <amount>3600</amount> 
 <identifier>95b857a1-5955-4b86-963c-5a6dbfc4fb95</identifier> 
 <merchantid>11223344</merchantid> 
 <refund_ref>8322</refund_ref> 
 <trans_info></trans_info> 
</RefundRequest>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount` | integer *int32* | true | The amount to refund in the lowest unit of currency with a variable length to a maximum of 12 digits.<br/><br/>The amount should be the total amount required to refund for the transaction up to the original processed amount.<br/><br/>No decimal points are to be included and no divisional characters such as 1,024.<br/><br/>For example with GBP £1,021.95 the amount value is 102195.<br/><br/> minLength: 1<br/>maxLength: 12 | 
| `identifier` | string  | true | The identifier of the refund to process. The value should be a valid reference and may be used to perform  post processing actions and to aid in reconciliation of transactions.<br/><br/>The value should be a valid printable string with ASCII character ranges from 0x32 to 0x127.<br/><br/>The identifier is recommended to be distinct for each transaction such as a [random unique identifier](https://en.wikipedia.org/wiki/Universally_unique_identifier) this will aid in ensuring each transaction is identifiable.<br/><br/>When transactions are processed they are also checked for duplicate requests. Changing the identifier on a subsequent request will ensure that a transaction is considered as different.<br/><br/> minLength: 4<br/>maxLength: 50 | 
| `merchantid` | integer *int32* | true | Identifies the merchant account to perform the refund for. | 
| `refund_ref` | integer *int32* | true | A reference to the original transaction number that is wanting to be refunded. The original  transaction must be on the same merchant id, previously authorised. | 
| `trans_info` | string  | false | Further information that can be added to the transaction will display in reporting. Can be used for flexible values such as operator id.<br/><br/>maxLength: 50 | 





## RegisterCard

```json
{
   "cardnumber": "4000 0000 0000 0002",
   "default": false,
   "expmonth": 9,
   "expyear": 2025,
   "name_on_card": "MR NE BODY"
}
```

```xml
<RegisterCard>
 <cardnumber>4000 0000 0000 0002</cardnumber> 
 <default></default> 
 <expmonth>9</expmonth> 
 <expyear>2025</expyear> 
 <name_on_card>MR NE BODY</name_on_card> 
</RegisterCard>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `cardnumber` | string  | true | The primary number of the card.<br/><br/>minLength: 12<br/>maxLength: 22 | 
| `default` | boolean  | false | Determines whether the card should be the new default card. | 
| `expmonth` | integer *int32* | true | The expiry month of the card.<br/><br/>minimum: 1<br/>maximum: 12 | 
| `expyear` | integer *int32* | true | The expiry year of the card.<br/><br/>minimum: 2000<br/>maximum: 2100 | 
| `name_on_card` | string  | false | The card holder name as it appears on the card. The value is required if the account is to be used for 3dsv2 processing, otherwise it is optional.<br/><br/>minLength: 2<br/>maxLength: 45 | 





## RequestChallenged

```json
{
   "acs_url": "https://acs.cardissuer.com/3dsv1",
   "creq": "",
   "merchantid": 11223344,
   "threedserver_trans_id": "",
   "transno": 78416
}
```

```xml
<RequestChallenged>
 <acs_url>https://acs.cardissuer.com/3dsv1</acs_url> 
 <creq></creq> 
 <merchantid>11223344</merchantid> 
 <threedserver_trans_id></threedserver_trans_id> 
 <transno>78416</transno> 
</RequestChallenged>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `acs_url` | string *url* | false | The url of the Access Control Server (ACS) to forward the user to. | 
| `creq` | string  | false | The challenge request data which is encoded for usage by the ACS. | 
| `merchantid` | integer *int32* | false | The merchant id that processed this transaction. | 
| `threedserver_trans_id` | string  | false | The 3DSv2 trans id reference for the challenge process. May be used to create the ThreeDSSessionData value to send to the ACS. | 
| `transno` | integer *int32* | false | The transaction number for the challenge, ordered incrementally from 1 for every merchant_id. | 





## RetrieveRequest

```json
{
   "identifier": "95b857a1-5955-4b86-963c-5a6dbfc4fb95",
   "merchantid": 11223344,
   "transno": 78416
}
```

```xml
<RetrieveRequest>
 <identifier>95b857a1-5955-4b86-963c-5a6dbfc4fb95</identifier> 
 <merchantid>11223344</merchantid> 
 <transno>78416</transno> 
</RetrieveRequest>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `identifier` | string  | false | The identifier of the transaction to retrieve. Optional if a transaction number is provided.<br/><br/>minLength: 4<br/>maxLength: 50 | 
| `merchantid` | integer *int32* | true | The merchant account to retrieve data for. | 
| `transno` | integer *int32* | false | The transaction number of a transaction to retrieve. Optional if an identifier is supplied. | 





## String

```json
{
  
}
```

```xml
<String>

</String>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|






## ThreeDSecure

```json
{
   "accept_headers": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
   "browserColorDepth": "",
   "browserIP": "",
   "browserJavaEnabled": "",
   "browserLanguage": "",
   "browserScreenHeight": "",
   "browserScreenWidth": "",
   "browserTZ": "",
   "cp_bx": "FjaW50b3NoOyBJbnRlbCBNYWMgT1MgWCAx...",
   "downgrade1": false,
   "merchant_termurl": "https://mysite.com/acs/return",
   "tds_policy": "",
   "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36"
}
```

```xml
<ThreeDSecure>
 <accept_headers>text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9</accept_headers> 
 <browserColorDepth></browserColorDepth> 
 <browserIP></browserIP> 
 <browserJavaEnabled></browserJavaEnabled> 
 <browserLanguage></browserLanguage> 
 <browserScreenHeight></browserScreenHeight> 
 <browserScreenWidth></browserScreenWidth> 
 <browserTZ></browserTZ> 
 <cp_bx>FjaW50b3NoOyBJbnRlbCBNYWMgT1MgWCAx...</cp_bx> 
 <downgrade1></downgrade1> 
 <merchant_termurl>https://mysite.com/acs/return</merchant_termurl> 
 <tds_policy></tds_policy> 
 <user_agent>Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36</user_agent> 
</ThreeDSecure>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `accept_headers` | string  | false | Required for 3DSv1. Optional if the `cp_bx` value is provided otherwise required for 3Dv2 processing operating in browser authentication mode.<br/><br/>The `cp_bx` value will override any value supplied to this field.<br/><br/>The content of the HTTP accept header as sent to the merchant from the cardholder's user agent.<br/><br/>This value will be validated by the ACS when the card holder authenticates themselves to verify that no intermediary is performing this action. Required for 3DSv1. | 
| `browserColorDepth` | string  | false | BrowserColorDepth field used for 3DSv2 browser enablement. Recommendation is to use citypay.js and the `bx` function to gather this value. | 
| `browserIP` | string  | false | BrowserIP field used for 3DSv2 browser enablement. Recommendation is to use citypay.js and the `bx` function to gather this value. | 
| `browserJavaEnabled` | string  | false | BrowserJavaEnabled field used for 3DSv2 browser enablement. Recommendation is to use citypay.js and the `bx` function to gather this value. | 
| `browserLanguage` | string  | false | BrowserLanguage field used for 3DSv2 browser enablement. Recommendation is to use citypay.js and the `bx` function to gather this value. | 
| `browserScreenHeight` | string  | false | BrowserScreenHeight field used for 3DSv2 browser enablement. Recommendation is to use citypay.js and the `bx` function to gather this value. | 
| `browserScreenWidth` | string  | false | BrowserScreenWidth field used for 3DSv2 browser enablement. Recommendation is to use citypay.js and the `bx` function to gather this value. | 
| `browserTZ` | string  | false | BrowserTZ field used for 3DSv2 browser enablement. Recommendation is to use citypay.js and the `bx` function to gather this value. | 
| `cp_bx` | string  | false | Required for 3DSv2.<br/><br/>Browser extension value produced by the citypay.js `bx` function. See [https://sandbox.citypay.com/3dsv2/bx](https://sandbox.citypay.com/3dsv2/bx) for  details. | 
| `downgrade1` | boolean  | false | Where a merchant is configured for 3DSv2, setting this option will attempt to downgrade the transaction to  3DSv1. | 
| `merchant_termurl` | string  | false | A controller URL for 3D-Secure processing that any response from an authentication request or challenge request should be sent to.<br/><br/>The controller should forward on the response from the URL back via this API for subsequent processing. | 
| `tds_policy` | string  | false | A policy value which determines whether ThreeDSecure is enforced or bypassed. Note that this will only work for e-commerce transactions and accounts that have 3DSecure enabled and fully registered with Visa, MasterCard or American Express. It is useful when transactions may be wanted to bypass processing rules.<br/><br/>Note that this may affect the liability shift of transactions and may occur a higher fee with the acquiring bank.<br/><br/>Values are<br/><br/> `0` for the default policy (default value if not supplied). Your default values are determined by your account manager on setup of the account.<br/><br/> `1` for an enforced policy. Transactions will be enabled for 3DS processing<br/><br/> `2` to bypass. Transactions that are bypassed will switch off 3DS processing. | 
| `user_agent` | string  | false | Required for 3DSv1.<br/><br/>Optional if the `cp_bx` value is provided otherwise required 3Dv2 processing operating in browser authentication mode.<br/><br/>The `cp_bx` value will override any value supplied to this field.<br/><br/>The content of the HTTP user-agent header as sent to the merchant from the cardholder's user agent.<br/><br/>This value will be validated by the ACS when the card holder authenticates themselves to verify that no intermediary is performing this action. Required for 3DSv1. | 





## VoidRequest

```json
{
   "identifier": "95b857a1-5955-4b86-963c-5a6dbfc4fb95",
   "merchantid": 11223344,
   "transno": 78416
}
```

```xml
<VoidRequest>
 <identifier>95b857a1-5955-4b86-963c-5a6dbfc4fb95</identifier> 
 <merchantid>11223344</merchantid> 
 <transno>78416</transno> 
</VoidRequest>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `identifier` | string  | false | The identifier of the transaction to void. If an empty value is supplied then a `trans_no` value must be supplied.<br/><br/>minLength: 4<br/>maxLength: 50 | 
| `merchantid` | integer *int32* | true | Identifies the merchant account to perform the void for. | 
| `transno` | integer *int32* | false | The transaction number of the transaction to look up and void. If an empty value is supplied then an identifier value must be supplied. | 





## multi

```json
{
  
}
```

```xml
<multi>

</multi>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|






# API Client SDKs

CityPay provide the following Client SDKs which are publicly available on github.

| Language | URL |
|----------|-----|
| DotNet | [https://github.com/citypay/citypay-api-client-dotnet](https://github.com/citypay/citypay-api-client-dotnet) | 
| Java |   [https://github.com/citypay/citypay-api-client-java](https://github.com/citypay/citypay-api-client-java) | 
| JS |     [https://github.com/citypay/citypay-api-client-js](https://github.com/citypay/citypay-api-client-js) |
| PHP |    [https://github.com/citypay/citypay-api-client-php](https://github.com/citypay/citypay-api-client-php) |
| Python | [https://github.com/citypay/citypay-api-client-python](https://github.com/citypay/citypay-api-client-python) |
| Ruby |   [https://github.com/citypay/citypay-api-client-ruby](https://github.com/citypay/citypay-api-client-ruby) |


