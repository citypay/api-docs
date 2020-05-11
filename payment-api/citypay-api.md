---
title: CityPay Payment API
version: 6.0.0.BETA
language_tabs:
  - json
  - xml
toc_footers:
  - <a href='mailto:support@citypay.com'>Any Integration Questions?</a>
  - V6.0.0.BETA 2020-05-11
includes:
  - errorcodes
  - authresultcodes
  - avscodes
  - csccodes
  - ciphers
  - timeout_handling
search: true

---


# CityPay Payment API

Version: 6.0.0.BETA
Last Updated: 2020-05-11


This CityPay API is a HTTP RESTful payment API used for direct server to server transactional processing. It
provides a number of payment mechanisms including: Internet, MOTO, Continuous Authority transaction processing,
3-D Secure decision handling using RFA Secure, Authorisation, Refunding, Pre-Authorisation, Cancellation/Voids and
Completion processing. The API is also capable of tokinsed payments using Card Holder Accounts.

## Compliance and Security
<aside class="notice">
  Before we begin a reminder that your application will need to adhere to PCI-DSS standards to operate safely
  and to meet requirements set out by Visa and MasterCard and the PCI Security Standards Council including:
</aside>

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

 - Online at <a href="https://citypay.com/customer-centre/technical-support.html">https://citypay.com/customer-centre/technical-support.html</a>
 - Email at <a href="mailto:support@citypay.com">support@citypay.com</a>



# Authentication

> Example authentication header as used in curl

```json
curl -X POST \
 -H "cp-api-key: UY26xWxKe3ZwK5RnF3FnVdTgWCtCenY2" \
 -H "Accept: application/json" \
 -H "Content-Type: application/json" \
 --data "{ \"merchantid\": 12345 ... }"
 https://api.citypay.com/resource

```

```xml
curl -X POST \
 -H "cp-api-key: UY26xWxKe3ZwK5RnF3FnVdTgWCtCenY2" \
 -H "Accept: text/xml" \
 -H "Content-Type: text/xml" \
 --data "{ ..<merchantid>12345</merchantid> }"
 https://api.citypay.com/resource

```


### API Key

**CityPay API Authentication**

header `cp-api-key`

The `cp-api-key` authentication header is required for all payment processing access.
 All calls using this key will be validated against white list IP addressing based
 and calls are scrutinised by the CityPay application firewall for security protection
 and attack mitigation. The key should remain secret and may allow processing against multiple
 merchant accounts that belong to your client account.

 A header key is used to protect undue logging mechanisms from logging data packet values and
 logically seperates authentication concerns from the body of data.


<aside class="notice">
If you do not have an API key please quote your Client ID and Merchant ID to <a href="https://citypay.com/customer-centre/technical-support.html">CityPay Support</a> to obtain one.
</aside>


# Card Holder Account





## Account Contact Details API



`HTTP POST /account/{accountid}/contact`

Allows for the ability to change the contact details for an account.

### Model ContactDetails

Name | Type | Required | Description |
-----|------|----------|-------------|
`address1` | string  | false | The first line of the address for the card holder.<br/>maxLength: 20 |
`address2` | string  | false | The second line of the address for the card holder.<br/>maxLength: 20 |
`address3` | string  | false | The third line of the address for the card holder.<br/>maxLength: 20 |
`area` | string  | false | The area such as city, department, parish for the card holder.<br/>maxLength: 20 |
`company` | string  | false | The company name for the card holder if the contact is a corporate contact. |
`country` | string  | false | The country code in ISO 3166 format. The country value may be used for fraud analysis and for<br/>  acceptance of the transaction.<br/><br/>maxLength: 2 |
`email` | string  | false | An email address for the card holder which may be used for correspondence. |
`firstname` | string  | false | The first name  of the card holder. |
`lastname` | string  | false | The last name or surname of the card holder. |
`mobile_no` | string  | false | A mobile number for the card holder the mobile number is often required by delivery companies to ensure they are able to be in contact when required. |
`postcode` | string  | false | The postcode or zip code of the address which may be used for fraud analysis.<br/>maxLength: 10 |
`telephone_no` | string  | false | A telephone number for the card holder. |
`title` | string  | false | A title for the card holder such as Mr, Mrs, Ms, M. Mme. etc. |



## Account Card Registration API



`HTTP POST /account/{accountid}/register`

Allows for a card to be registered for the account. The card will be added for future 
processing and will be available as a tokenised value for future processing.

The card will be validated for

0. Being a valid card number (luhn check)
0. Having a valid expiry date
0. Being a valid bin value.


### Model RegisterCard

Name | Type | Required | Description |
-----|------|----------|-------------|
`account_id` | string  | false | The account to register the card against.<br/>minLength: 5<br/>maxLength: 50 |
`cardnumber` | string  | false | The primary number of the card.<br/>minLength: 12<br/>maxLength: 22 |
`defaultCard` | boolean  | false | Determines whether the card should be the new default card. |
`expmonth` | integer *int32* | false | The expiry month of the card.<br/>minimum: 1<br/>maximum: 12 |
`expyear` | integer *int32* | false | The expiry year of the card.<br/>minimum: 2000<br/>maximum: 2100 |




## Charge API



`HTTP POST /charge`

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
- wallet style usage.


### Model ChargeRequest

Name | Type | Required | Description |
-----|------|----------|-------------|
`amount` | integer *int32* | true | The amount to authorise in the lowest unit of currency with a variable length to a maximum of 12 digits.<br/>No decimal points are to be included and no divisional characters such as 1,024.<br/>The amount should be the total amount required for the transaction.<br/>For example with GBP £1,021.95 the amount value is 102195.<br/><br/>minLength: 1<br/>maxLength: 12 |
`csc` | string  | false | The Card Security Code (CSC) (also known as CV2/CVV2) is normally found on the back of the card<br/>(American Express has it on the front). The value helps to identify posession of the card as it is not<br/>available within the chip or magnetic swipe.<br/><br/>When forwarding the CSC, please ensure the value is a string as some values start with 0 and this will be stripped<br/>out by any integer parsing.<br/><br/>The CSC number aids fraud prevention in Mail Order and Internet payments.<br/><br/> Business rules are available on your account to identify whether to accept<br/>or decline transactions based on mismatched results of the CSC.<br/><br/>The Payment Card Industry (PCI) requires that at no stage of a transaction should the CSC be stored.<br/>This applies to all entities handling card data.<br/>It should also not be used in any hashing process.<br/>CityPay do not store the value and have no method of retrieving the value once the transaction has been processed.<br/>For this reason, duplicate checking is unable to determine the CSC in its duplication check algorithm.<br/><br/>minLength: 3<br/>maxLength: 4 |
`identifier` | string  | true | The identifier of the transaction to process. The value should be a valid reference and may be used to perform<br/> post processing actions and to aid in reconciliation of transactions.<br/><br/>The value should be a valid printable string with ASCII character ranges from 32 to 127.<br/><br/>The identifier is recommended to be distinct for each transaction such as a [random unique identifier](https://en.wikipedia.org/wiki/Universally_unique_identifier)<br/>this will aid in ensuring each transaction is identifiable.<br/><br/>When transactions are processed they are also checked for duplicate requests. Changing the identifier on a subsequent<br/>request will ensure that a transaction is considered as different.<br/><br/>minLength: 4<br/>maxLength: 50 |
`merchantid` | integer *int32* | true | Identifies the merchant account to perform processing for. |
`sdk` | string  | false | An optional reference value for the calling client such as a version number i.e. |
`token` | string *base58* | true | A tokenised form of a card that belongs to a card holder's account and that<br/>has been previously registered. The token is time based and will only be active for<br/>a short duration. The value is therefore designed not to be stored remotely for future<br/> use.<br/><br/>Tokens will start with ct and are resiliently tamper proof using HMacSHA-256.<br/>No sensitive card data is stored internally within the token.<br/><br/>Each card will contain a different token and the value may be different on any retrieval call.<br/><br/>The value can be presented for payment as a selection value to an end user in a web application. |
`trans_info` | string  | false | Further information that can be added to the transaction will display in reporting. Can be used for flexible values such as operator id.<br/>maxLength: 50 |
`trans_type` | string  | false | The type of transaction being submitted. Normally this value is not required and your account manager may request that you set this field.<br/>minLength: 1<br/>maxLength: 1 |



# Operational


## Ping Request



`HTTP POST /ping`

A ping request which performs a connection and authentication test to the CityPay API server. The request
will return a standard Acknowledgement with a response code `044` to signify a successful
ping.

The ping call is useful to confirm that you will be able to access 
the API from behind any firewalls and that the permission
model is granting access from your source.


### Model Ping

Name | Type | Required | Description |
-----|------|----------|-------------|
`identifier` | string  | false | An identifier of the ping request which will be returned in the response.<br/>minLength: 4<br/>maxLength: 50 |



# Payment Processing

## Authorisation API



`HTTP POST /authorise`

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
 
### E-commerce workflows
 
For E-commerce transactions requiring 3DSv1 and 3DSv2 transactions, the API contains a fully accredited in built mechanism
to handle authentication.

The gateway has been accredited extensively with both Acquirers and Card Schemes and simplifies the nature of these calls
into a simple structure for authentication, preventing integrators from performing lengthy and a costly accreditation with
Visa and MasterCard.

3D-secure has been around for a number of years and aims to shift the liability of a transaction away from a merchant back
to the card holder. A *liability shift* determines whether a card holder can charge back a transaction as unknown. Effectively
the process asks for a card holder to authenticate the transaction prior to authorisation producing a Cardholder 
verification value (CAVV) as evidence of authorisation.
 
#### 3DSv1

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
card is participating in 3DSv1 with Verified by Visa or MasterCard SecureCode. Should the card be enrolled, a payer 
request (PAReq) value will be created and forwarded back as [authentication required](#authenticationrequired) response. 

Your system will need to process this authentication 
requirement to forward the end user's browser to an authentication server (ACS) to gain the user's authentication. The
ACS will then perform a HTTP post back to your online site which should be forwarded back to this API for subsequent
authorisation. 

Please note that 3DSv1 is being phased out due to changes to strong customer authentication mechanisms. 3DSv2 addresses
this and will solidify the authorisation and confirmation process.

#### 3DSv2

```json
{ 
  "RequestChallenged": {
    "acsurl": "https://bank.com/3DS/ACS",
    "creq": "SXQgd2FzIHRoZSBiZXN0IG9mIHRpbWVzLCBpdCB3YXMgdGhlIHdvcnN00..."
  }               
}
```

```xml
<RequestChallenged>
 <acsurl>https://bank.com/3DS/ACS</acsurl>
 <creq>SXQgd2FzIHRoZSBiZXN0IG9mIHRpbWVzLCBpdCB3YXMgdGhlIHdvcnN00...</creq>
</RequestChallenged>
```

All merchants in the EEC will require to migrate their E-commerce transactions to a secure customer authentication 
model (SCA) throughout 2020. This has been adopted by the payments industry as a progressive move alongside the European 
Unions payments directive.

CityPay support 3DSv2 for Verified by Visa, MasterCard Identity Check and American Express SafeKey 2.0 and will be rolling
out acquirers on the new platform from Q2 2020. The new enhancement to 3DSv2 will allow for CityPay to seamlessly authenticate
transactions in a "frictionless" flowed method which will authenticate low risk transactions with minimal impact to a 
standard authorisation flow. Our API simply performs this on behalf of the merchant and cardholder.

Should a transaction however be "challenged" the API will return a [request challenge](#requestchallenged) which will 
require your integration to forward the cardholder's browser to the given [ACS url](#acsurl) by posting the [creq](#creq)
value. Once complete, the ACS will have already been in touch with our servers by sending us a result of the authentication.
Our servers however will be awaiting confirmation that the authorisation should continue and on receipt of a [cres](#cres)
value, the flow will perform a full authorisation. 

Please note that the CRes returned to us is purely a mechanism of acknowledging that transactions should be committed for
authorisation. The ACS by this point will have sent us the verification value (CAVV) to perform a liability shift. The CRes
value will be validated for receipt of this value and subsequently may return back response codes illustrating this.


### Model AuthRequest

Name | Type | Required | Description |
-----|------|----------|-------------|
`airline_data` | object | false | [AirlineAdvice](#airlineadvice) Additional advice for airline integration that can be applied on an authorisation request.
As tickets are normally not allocated until successful payment it is normal for a transaction to be pre-authorised
 and the airline advice supplied on a capture request instead. Should the data already exist and an auth and
 capture is preferred. This data may be supplied.

`amount` | integer *int32* | true | The amount to authorise in the lowest unit of currency with a variable length to a maximum of 12 digits.<br/>No decimal points are to be included and no divisional characters such as 1,024.<br/>The amount should be the total amount required for the transaction.<br/>For example with GBP £1,021.95 the amount value is 102195.<br/><br/>minLength: 1<br/>maxLength: 12 |
`bill_to` | object | false | [ContactDetails](#contactdetails) Billing details of the card holder making the payment.
These details may be used for AVS fraud analysis, 3DS and for future referencing of the transaction.

For AVS to work correctly, the billing details should be the registered address of the card holder
as it appears on the statement with their card issuer. The numeric details will be passed through
for analysis and may result in a decline if incorrectly provided.

`cardnumber` | string  | true | The card number (PAN) with a variable length to a maximum of 21 digits in numerical form.<br/>Any non numeric characters will be stripped out of the card number, this includes whitespace or separators internal of the<br/>provided value.<br/><br/>The card number must be treated as sensitive data. We only provide an obfuscated value in logging and reporting.<br/> The plaintext value is encrypted in our database using AES 256 GMC bit encryption for settlement or refund purposes.<br/><br/>When providing the card number to our gateway through the authorisation API you will be handling the card data on<br/>your application. This will require further PCI controls to be in place and this value must never be stored.<br/><br/>minLength: 12<br/>maxLength: 22 |
`csc` | string  | false | The Card Security Code (CSC) (also known as CV2/CVV2) is normally found on the back of the card<br/>(American Express has it on the front). The value helps to identify posession of the card as it is not<br/>available within the chip or magnetic swipe.<br/><br/>When forwarding the CSC, please ensure the value is a string as some values start with 0 and this will be stripped<br/>out by any integer parsing.<br/><br/>The CSC number aids fraud prevention in Mail Order and Internet payments.<br/><br/> Business rules are available on your account to identify whether to accept<br/>or decline transactions based on mismatched results of the CSC.<br/><br/>The Payment Card Industry (PCI) requires that at no stage of a transaction should the CSC be stored.<br/>This applies to all entities handling card data.<br/>It should also not be used in any hashing process.<br/>CityPay do not store the value and have no method of retrieving the value once the transaction has been processed.<br/>For this reason, duplicate checking is unable to determine the CSC in its duplication check algorithm.<br/><br/>minLength: 3<br/>maxLength: 4 |
`expmonth` | integer *int32* | true | The month of expiry of the card. The month value should be a numerical value between 1 and 12.<br/><br/>minimum: 1<br/>maximum: 12 |
`expyear` | integer *int32* | false | The year of expiry of the card.<br/><br/>minimum: 2000<br/>maximum: 2100 |
`external_mpi` | object | false | [ExternalMPI](#externalmpi) If an external 3DSv1 MPI is used for authentication, values provided can be supplied in this element. |
`identifier` | string  | true | The identifier of the transaction to process. The value should be a valid reference and may be used to perform<br/> post processing actions and to aid in reconciliation of transactions.<br/><br/>The value should be a valid printable string with ASCII character ranges from 32 to 127.<br/><br/>The identifier is recommended to be distinct for each transaction such as a [random unique identifier](https://en.wikipedia.org/wiki/Universally_unique_identifier)<br/>this will aid in ensuring each transaction is identifiable.<br/><br/>When transactions are processed they are also checked for duplicate requests. Changing the identifier on a subsequent<br/>request will ensure that a transaction is considered as different.<br/><br/>minLength: 4<br/>maxLength: 50 |
`merchantid` | integer *int32* | true | Identifies the merchant account to perform processing for. |
`sdk` | string  | false | An optional reference value for the calling client such as a version number i.e. |
`ship_to` | object | false | [ContactDetails](#contactdetails) Shipping details of the card holder making the payment. These details may be used for 3DS and for future referencing of the transaction. |
`trans_info` | string  | false | Further information that can be added to the transaction will display in reporting. Can be used for flexible values such as operator id.<br/>maxLength: 50 |
`trans_type` | string  | false | The type of transaction being submitted. Normally this value is not required and your account manager may request that you set this field.<br/>minLength: 1<br/>maxLength: 1 |



## Capture API


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


`HTTP POST /capture`

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


### Model CaptureRequest

Name | Type | Required | Description |
-----|------|----------|-------------|
`airline_data` | object | false | [AirlineAdvice](#airlineadvice) Additional advice to be applied for the capture request. |
`amount` | integer *int32* | false | The completion amount provided in the lowest unit of currency for the specific currency of the merchant,<br/>with a variable length to a maximum of 12 digits. No decimal points to be included. For example with<br/>GBP 75.45 use the value 7545. Please check that you do not supply divisional characters such as 1,024 in the<br/>request which may be caused by some number formatters.<br/>If no amount is supplied, the original processing amount is used.<br/><br/>minLength: 1<br/>maxLength: 12 |
`identifier` | string  | false | The identifier of the transaction to capture. If an empty value is supplied then a `trans_no` value must be supplied.<br/>minLength: 4<br/>maxLength: 50 |
`merchantid` | integer *int32* | true | Identifies the merchant account to perform the capture for. |
`sdk` | string  | false | An optional reference value for the calling client such as a version number i.e. |
`transno` | integer *int32* | false | The transaction number of the transaction to look up and capture. If an empty value is supplied then an identifier value must be supplied. |



## Retrieval API


> Basic retrieval call for a merchant with a given identifier

```json
{
  "RetrievalRequest":{
    "merchantid":123456,
    "identifier":"318f2bc5-d9e0-4ddf-9df1-1ea9e4890ca9"
  }
}
```

```xml
<RetrievalRequest>
   <merchantid>123456</merchantid>
   <identifier>318f2bc5-d9e0-4ddf-9df1-1ea9e4890ca9</identifier>
</RetrievalRequest>
```


`HTTP POST /retrieve`

A retrieval request which allows an integration to obtain the result of a transaction processed
in the last 90 days. The request allows for retrieval based on the identifier or transaction 
number. 

The process may return multiple results in particular where a transaction was processed multiple
times against the same identifier. This can happen if errors were first received. The API therefore
returns up to the first 5 transactions in the latest date time order.

It is not intended for this operation to be a replacement for reporting and only allows for base transaction
information to be returned.


### Model RetrieveRequest

Name | Type | Required | Description |
-----|------|----------|-------------|
`identifier` | string  | false | The identifier of the transaction to retrieve. Optional if a transaction number is provided.<br/>minLength: 4<br/>maxLength: 50 |
`merchantid` | integer *int32* | true | The merchant account to retrieve data for. |
`transno` | integer *int32* | false | The transaction number of a transaction to retrieve. Optional if an identifier is supplied. |



## Void API


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


`HTTP POST /void`

_The void process generally applies to transactions which have been pre-authorised only however voids can occur 
on the same day if performed before batching and settlement._ 

The void process will ensure that a transaction will now settle. It is expected that a void call will be 
provided on the same day before batching and settlement or within 3 days or within a maximum of 7 days.

Once the transaction has been processed as a void, an [`Acknowledgement`](#acknowledgement) will be returned,
outlining the result of the transaction.


### Model VoidRequest

Name | Type | Required | Description |
-----|------|----------|-------------|
`identifier` | string  | false | The identifier of the transaction to void. If an empty value is supplied then a `trans_no` value must be supplied.<br/>minLength: 4<br/>maxLength: 50 |
`merchantid` | integer *int32* | true | Identifies the merchant account to perform the void for. |
`sdk` | string  | false | An optional reference value for the calling client such as a version number i.e. |
`transno` | integer *int32* | false | The transaction number of the transaction to look up and void. If an empty value is supplied then an identifier value must be supplied. |




# API Model



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

 Field | Type | Required | Description |
-------|------|----------|-------------|
`code` | string  | false | A response code providing a result of the process.<br/>minLength: 3<br/>maxLength: 4 |
`context` | string  | false | A context id of the process used for referencing transactions through support. |
`identifier` | string  | false | An identifier if presented in the original request.<br/>minLength: 4<br/>maxLength: 50 |
`message` | string  | false | A response message providing a description of the result of the process. |





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

 Field | Type | Required | Description |
-------|------|----------|-------------|
`carrier_name` | string  | true | The name of the airline carrier that generated the tickets for airline travel.<br/>maxLength: 25 |
`conjunction_ticket_indicator` | boolean  | false | true if a conjunction ticket (with additional coupons) was issued for an itinerary<br/>with more than four segments. Defaults to false. |
`eticket_indicator` | boolean  | false | The Electronic Ticket Indicator, a code that indicates if an electronic ticket was issued.  Defaults to true. |
`no_air_segments` | integer *int32* | false | A value that indicates the number of air travel segments included on this ticket.<br/>Valid entries include the numerals “0” through “4”. Required only if the transaction type is TKT or EXC.<br/><br/>minimum: 0<br/>maximum: 4 |
`number_in_party` | integer *int32* | true | The number of people in the party. |
`original_ticket_no` | string  | false | Required if transaction type is EXC.<br/>maxLength: 14 |
`passenger_name` | string  | false | The name of the passenger when the traveller is not the card member that purchased the ticket. Required only if the transaction type is TKT or EXC.<br/>maxLength: 25 |
`segment1` | object | true | [AirlineSegment](#airlinesegment) Segment 1 of airline data defining the outward leg. |
`segment2` | object | false | [AirlineSegment](#airlinesegment) Segment 2 of airline data. If a return flight or stop-over the segment will be populated. |
`segment3` | object | false | [AirlineSegment](#airlinesegment) Segment 3 of airline data if defined. |
`segment4` | object | false | [AirlineSegment](#airlinesegment) Segment 4 of airline data if defined. |
`ticket_issue_city` | string  | true | The name of the city town or village where the transaction took place.<br/>maxLength: 18 |
`ticket_issue_date` | string *date* | true | The date the ticket was issued in ISO Date format (yyyy-MM-dd).<br/>maxLength: 10 |
`ticket_issue_name` | string  | true | The name of the agency generating the ticket.<br/>maxLength: 26 |
`ticket_no` | string  | true | This must be a valid ticket number, i.e. numeric (the first 3 digits must represent the valid IATA plate carrier code).<br/>The final check digit should be validated prior to submission. On credit charges, this field should contain the<br/>number of the original ticket, and not of a replacement.<br/><br/>maxLength: 14 |
`transaction_type` | string  | true | This field contains the Transaction Type code assigned to this transaction. Valid codes include:<br/><br/> - `TKT` = Ticket Purchase<br/> - `REF` = Refund<br/> - `EXC` = Exchange Ticket<br/> - `MSC` = Miscellaneous (non-Ticket Purchase- and non-Exchange Ticket-related transactions only).<br/><br/>minLength: 3<br/>maxLength: 3 |





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

 Field | Type | Required | Description |
-------|------|----------|-------------|
`arrival_location_code` | string  | true | A standard airline routing code (airport code or location identifier) applicable to the<br/>arrival portion of this segment.<br/><br/>maxLength: 3 |
`carrier_code` | string  | true | This field contains the two character airline designator code (air carrier code or airline code) that<br/>corresponds to the airline carrier applicable for up to four flight segments of this trip itinerary.<br/><br/>maxLength: 2 |
`class_service_code` | string  | true | This field contains a code that corresponds to the fare class (A, B, C, D, Premium, Discounted, etc.)<br/>within the overall class of service (e.g., First Class, Business, Economy) applicable to this travel segment,<br/>as specified in the IATA Standard Code allocation table.<br/><br/>maxLength: 2 |
`departure_date` | string *date* | true | The Departure Date for the travel segment in ISO Date Format (yyyy-MM-dd). |
`departure_location_code` | string  | false | A standard airline routing code (airport code or location identifier) applicable to the<br/>departure portion of this segment.<br/><br/>maxLength: 3 |
`flight_number` | string  | true | This field contains the carrier-assigned Flight Number for this travel segment.<br/>maxLength: 4 |
`segment_fare` | integer *int32* | false | This field contains the total Fare for this travel segment. |
`stop_over_indicator` | string  | false | O = Stopover allowed, X = Stopover not allowed.<br/>maxLength: 1 |





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

 Field | Type | Required | Description |
-------|------|----------|-------------|
`auths` | string  | false | Authorisations which match the request. |





## AuthRequest

```json
{
   "airline_data": { ... },
   "amount": 3600,
   "bill_to": { ... },
   "cardnumber": "4000 0000 0000 0002",
   "csc": "10",
   "expmonth": 9,
   "expyear": 2023,
   "external_mpi": { ... },
   "identifier": "95b857a1-5955-4b86-963c-5a6dbfc4fb95",
   "merchantid": 11223344,
   "sdk": "MyClient 1.3.0",
   "ship_to": { ... },
   "trans_info": "",
   "trans_type": ""
}
```

```xml
<AuthRequest>
 <airline_data><>...</></airline_data> 
 <amount>3600</amount> 
 <bill_to><>...</></bill_to> 
 <cardnumber>4000 0000 0000 0002</cardnumber> 
 <csc>10</csc> 
 <expmonth>9</expmonth> 
 <expyear>2023</expyear> 
 <external_mpi><>...</></external_mpi> 
 <identifier>95b857a1-5955-4b86-963c-5a6dbfc4fb95</identifier> 
 <merchantid>11223344</merchantid> 
 <sdk>MyClient 1.3.0</sdk> 
 <ship_to><>...</></ship_to> 
 <trans_info></trans_info> 
 <trans_type></trans_type> 
</AuthRequest>
```

 Field | Type | Required | Description |
-------|------|----------|-------------|
`amount` | integer *int32* | true | The amount to authorise in the lowest unit of currency with a variable length to a maximum of 12 digits.<br/>No decimal points are to be included and no divisional characters such as 1,024.<br/>The amount should be the total amount required for the transaction.<br/>For example with GBP £1,021.95 the amount value is 102195.<br/><br/>minLength: 1<br/>maxLength: 12 |
`bill_to` | object | false | [ContactDetails](#contactdetails) Billing details of the card holder making the payment.
These details may be used for AVS fraud analysis, 3DS and for future referencing of the transaction.

For AVS to work correctly, the billing details should be the registered address of the card holder
as it appears on the statement with their card issuer. The numeric details will be passed through
for analysis and may result in a decline if incorrectly provided.

`cardnumber` | string  | true | The card number (PAN) with a variable length to a maximum of 21 digits in numerical form.<br/>Any non numeric characters will be stripped out of the card number, this includes whitespace or separators internal of the<br/>provided value.<br/><br/>The card number must be treated as sensitive data. We only provide an obfuscated value in logging and reporting.<br/> The plaintext value is encrypted in our database using AES 256 GMC bit encryption for settlement or refund purposes.<br/><br/>When providing the card number to our gateway through the authorisation API you will be handling the card data on<br/>your application. This will require further PCI controls to be in place and this value must never be stored.<br/><br/>minLength: 12<br/>maxLength: 22 |
`csc` | string  | false | The Card Security Code (CSC) (also known as CV2/CVV2) is normally found on the back of the card<br/>(American Express has it on the front). The value helps to identify posession of the card as it is not<br/>available within the chip or magnetic swipe.<br/><br/>When forwarding the CSC, please ensure the value is a string as some values start with 0 and this will be stripped<br/>out by any integer parsing.<br/><br/>The CSC number aids fraud prevention in Mail Order and Internet payments.<br/><br/> Business rules are available on your account to identify whether to accept<br/>or decline transactions based on mismatched results of the CSC.<br/><br/>The Payment Card Industry (PCI) requires that at no stage of a transaction should the CSC be stored.<br/>This applies to all entities handling card data.<br/>It should also not be used in any hashing process.<br/>CityPay do not store the value and have no method of retrieving the value once the transaction has been processed.<br/>For this reason, duplicate checking is unable to determine the CSC in its duplication check algorithm.<br/><br/>minLength: 3<br/>maxLength: 4 |
`expmonth` | integer *int32* | true | The month of expiry of the card. The month value should be a numerical value between 1 and 12.<br/><br/>minimum: 1<br/>maximum: 12 |
`expyear` | integer *int32* | false | The year of expiry of the card.<br/><br/>minimum: 2000<br/>maximum: 2100 |
`external_mpi` | object | false | [ExternalMPI](#externalmpi) If an external 3DSv1 MPI is used for authentication, values provided can be supplied in this element. |
`identifier` | string  | true | The identifier of the transaction to process. The value should be a valid reference and may be used to perform<br/> post processing actions and to aid in reconciliation of transactions.<br/><br/>The value should be a valid printable string with ASCII character ranges from 32 to 127.<br/><br/>The identifier is recommended to be distinct for each transaction such as a [random unique identifier](https://en.wikipedia.org/wiki/Universally_unique_identifier)<br/>this will aid in ensuring each transaction is identifiable.<br/><br/>When transactions are processed they are also checked for duplicate requests. Changing the identifier on a subsequent<br/>request will ensure that a transaction is considered as different.<br/><br/>minLength: 4<br/>maxLength: 50 |
`merchantid` | integer *int32* | true | Identifies the merchant account to perform processing for. |
`sdk` | string  | false | An optional reference value for the calling client such as a version number i.e. |
`ship_to` | object | false | [ContactDetails](#contactdetails) Shipping details of the card holder making the payment. These details may be used for 3DS and for future referencing of the transaction. |
`trans_info` | string  | false | Further information that can be added to the transaction will display in reporting. Can be used for flexible values such as operator id.<br/>maxLength: 50 |
`trans_type` | string  | false | The type of transaction being submitted. Normally this value is not required and your account manager may request that you set this field.<br/>minLength: 1<br/>maxLength: 1 |



 Extension | Field | Type | Required | Description |
-----------|-------|------|----------|-------------|
Airline | `airline_data` | object | false | [AirlineAdvice](#airlineadvice) Additional advice for airline integration that can be applied on an authorisation request.
As tickets are normally not allocated until successful payment it is normal for a transaction to be pre-authorised
 and the airline advice supplied on a capture request instead. Should the data already exist and an auth and
 capture is preferred. This data may be supplied.





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
   "bin_description": "",
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
 <bin_description></bin_description> 
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

 Field | Type | Required | Description |
-------|------|----------|-------------|
`amount` | integer *int32* | false | The amount of the transaction processed.<br/>minLength: 1<br/>maxLength: 12 |
`atrn` | string  | false | A reference number provided by the acquirer for a transaction it can be used to cross reference transactions<br/>with an Acquirers reporting panel. |
`atsd` | string  | false | Additional Transaction Security Data used for ecommerce transactions to decipher security capabilities and attempts against a transaction. |
`authcode` | string  | false | The authorisation code as returned by the card issuer or acquiring bank when a transaction has successfully<br/>  been authorised. Authorisation codes contain alphanumeric values. Whilst the code confirms authorisation it<br/>  should not be used to determine whether a transaction was successfully processed. For instance an auth code<br/>  may be returned when a transaction has been subsequently declined due to a CSC mismatch. |
`authen_result` | string  | false | The result of any authentication using 3d_secure authorisation against ecommerce transactions. Values are<br/> Value | Description |<br/>-------|-------------|<br/> Y | Authentication Successful. The Cardholder's password was successfully validated. |<br/> N | Authentication Failed. Customer failed or cancelled authentication, transaction denied. |<br/> A | Attempts Processing Performed Authentication could not be completed but a proof of authentication attempt (CAVV) was generated |<br/> U | Authentication Could Not Be Performed Authentication could not be completed, due to technical or other problem | |
`authorised` | boolean  | false | A boolean definition that indicates that the transaction was authorised. It will return false if the transaction<br/> was declined, rejected or cancelled due to CSC matching failures.<br/>Attention should be referenced to the AuthResult and Response code for accurate determination of the result. |
`avs_result` | string  | false | The AVS result codes determine the result of checking the AVS values within the<br/>Address Verification fraud system. If a transaction is declined due to the AVS code not matching,<br/>this value can help determine the reason for the decline.<br/><br/> Code | Description |<br/>------|------------|<br/> Y | Address and 5 digit post code match |<br/> M | Street address and Postal codes match for international transaction |<br/> U | No AVS data available from issuer auth system |<br/> A | Addres matches, post code does not |<br/> I | Address information verified for international transaction |<br/> Z | 5 digit post code matches, Address does not |<br/> W | 9 digit post code matches, Address does not |<br/> X | Postcode and address match |<br/> B | Postal code not verified due to incompatible formats |<br/> P | Postal codes match. Street address not verified due to to incompatible formats |<br/> E | AVS Error |<br/> C | Street address and Postal code not verified due to incompatible formats |<br/> D | Street address and postal codes match |<br/>   | No information |<br/> N | Neither postcode nor address match |<br/> R | Retry, System unavailble or Timed Out |<br/> S | AVS Service not supported by issuer or processor |<br/> G | Issuer does not participate in AVS |<br/><br/>minLength: 1<br/>maxLength: 1 |
`bin_commercial` | boolean  | false | Determines whether the bin range was found to be a commercial or business card. |
`bin_debit` | boolean  | false | Determines whether the bin range was found to be a debit card. If false the card was considered as a credit card. |
`bin_description` | string  | false | A description of the bin range found for the card. |
`cavv` | string  | false | The cardholder authentication verification value which can be returned for verification purposes of the authenticated<br/> transaction for dispute realisation. |
`context` | string  | false | The context which processed the transaction, can be used for support purposes to trace transactions. |
`csc_result` | string  | false | The CSC rseult codes determine the result of checking the provided CSC value within the<br/>Card Security Code fraud system. If a transaction is declined due to the CSC code not matching,<br/>this value can help determine the reason for the decline.<br/><br/> Code | Description |<br/>------|------------|<br/>   | No information |<br/> M | Card verification data matches |<br/> N | Card verification data was checked but did not match |<br/> P | Card verification was not processed |<br/> S | The card verification data should be on the card but the merchant indicates that it is not |<br/> U | The card issuer is not certified |<br/><br/>minLength: 1<br/>maxLength: 1 |
`currency` | string  | false | The currency the transaction was processed in. This is an `ISO4217` alpha currency value.<br/>minLength: 3<br/>maxLength: 3 |
`datetime` | string *date-time* | false | The UTC date time of the transaction in ISO data time format. |
`eci` | string  | false | An Electronic Commerce Indicator (ECI) used to identify the result of authentication using 3DSecure. |
`identifier` | string  | false | The identifier provided within the request.<br/>minLength: 4<br/>maxLength: 50 |
`live` | boolean  | false | Used to identify that a tranasction was processed on a live authorisation platform. |
`maskedpan` | string  | false | A masked value of the card number used for processing displaying limited values that can be used on a receipt. |
`merchantid` | integer *int32* | false | The merchant id that processed this transaction. |
`result` | integer *int32* | false | An integer result that indicates the outcome of the transaction. The Code value below maps to the result value<br/><br/> Code | Abbrev | Description |<br/>------|-------|-------------|<br/> 0 | Declined | Declined |<br/> 1 | Accepted | Accepted |<br/> 2 | Rejected | Rejected |<br/> 3 | Not Attempted | Not Attempted |<br/> 4 | Referred | Referred |<br/> 5 | PinRetry | Perform PIN Retry |<br/> 6 | ForSigVer | Force Signature Verification |<br/> 7 | Hold | Hold |<br/> 8 | SecErr | Security Error |<br/> 9 | CallAcq | Call Acquirer |<br/> 10 | DNH | Do Not Honour |<br/> 11 | RtnCrd | Retain Card |<br/> 12 | ExprdCrd | Expired Card |<br/> 13 | InvldCrd | Invalid Card No |<br/> 14 | PinExcd | Pin Tries Exceeded |<br/> 15 | PinInvld | Pin Invalid |<br/> 16 | AuthReq | Authentication Required |<br/> 17 | AuthenFail | Authentication Failed |<br/> 18 | Verified | Card Verified |<br/> 19 | Cancelled | Cancelled |<br/> 20 | Un | Unknown | |
`result_code` | string  | false | The result code as defined in the Response Codes Reference for example 000 is an accepted live<br/>transaction whilst 001 is an accepted test transaction. Result codes identify the source of success and failure.<br/>Codes may start with an alpha character i.e. C001 indicating a type of error such as a card validation error. |
`result_message` | string  | false | The message regarding the result which provides further narrative to the result code. |
`scheme` | string  | false | A name of the card scheme of the transaction that processed the transaction such as Visa or MasterCard. |
`sha256` | string  | false | A SHA256 digest value of the transaction used to validate the response data<br/>The digest is calculated by concatenating<br/> * authcode<br/> * amount<br/> * response_code<br/> * merchant_id<br/> * trans_no<br/> * identifier<br/> * licence_key - which is not provided in the response. |
`trans_status` | string  | false | Used to identify the status of a transaction. The status is used to track a transaction through its life cycle.<br/><br/> Id | Description |<br/>----|-------------|<br/> O | Transaction is open for settlement |<br/> A | Transaction is assigned for settlement and can no longer be voided |<br/> S | Transaction has been settled   |<br/> D | Transaction has been declined |<br/> R | Transaction has been rejected |<br/> P | Transaction has been authorised only and awaiting a capture. Used in pre-auth situations |<br/> C | Transaction has been cancelled |<br/> E | Transaction has expired |<br/> I | Transaction has been initialised but no action was able to be carried out |<br/> H | Transaction is awaiting authorisation |<br/> . | Transaction is on hold |<br/> V | Transaction has been verified | |
`transno` | integer *int32* | false | The resulting transaction number, ordered incrementally from 1 for every merchant_id. The value will default to less than 1<br/>for transactions that do not have a transaction number issued. |





## AuthenRequired

```json
{
   "acs_url": "https://acs.cardissuer.com/3dsv1",
   "md": "",
   "pa_req": "eNrNWdnOo0qSfpXSmUuf0+w2tFy/lOyYxYDZ79h3sAEbm6cfbFfV+bu6pqe7R2qNJeQkiIwlMyK+..."
}
```

```xml
<AuthenRequired>
 <acs_url>https://acs.cardissuer.com/3dsv1</acs_url> 
 <md></md> 
 <pa_req>eNrNWdnOo0qSfpXSmUuf0+w2tFy/lOyYxYDZ79h3sAEbm6cfbFfV+bu6pqe7R2qNJeQkiIwlMyK+...</pa_req> 
</AuthenRequired>
```

 Field | Type | Required | Description |
-------|------|----------|-------------|
`acs_url` | string *url* | false | The url of the Access Control Server (ACS) to forward the user to. |
`md` | string  | false | Merchant Data (MD) which should be sent to the ACS to establish and reference<br/>the authentication session. |
`pa_req` | string *base64* | false | The Payer Authentication Request packet which should be `POSTed` to the Url of the ACS<br/>to establish the authentication session. Data should be sent untouched. |





## CaptureRequest

```json
{
   "airline_data": { ... },
   "amount": 3600,
   "identifier": "95b857a1-5955-4b86-963c-5a6dbfc4fb95",
   "merchantid": 11223344,
   "sdk": "MyClient 1.3.0",
   "transno": 78416
}
```

```xml
<CaptureRequest>
 <airline_data><>...</></airline_data> 
 <amount>3600</amount> 
 <identifier>95b857a1-5955-4b86-963c-5a6dbfc4fb95</identifier> 
 <merchantid>11223344</merchantid> 
 <sdk>MyClient 1.3.0</sdk> 
 <transno>78416</transno> 
</CaptureRequest>
```

 Field | Type | Required | Description |
-------|------|----------|-------------|
`amount` | integer *int32* | false | The completion amount provided in the lowest unit of currency for the specific currency of the merchant,<br/>with a variable length to a maximum of 12 digits. No decimal points to be included. For example with<br/>GBP 75.45 use the value 7545. Please check that you do not supply divisional characters such as 1,024 in the<br/>request which may be caused by some number formatters.<br/>If no amount is supplied, the original processing amount is used.<br/><br/>minLength: 1<br/>maxLength: 12 |
`identifier` | string  | false | The identifier of the transaction to capture. If an empty value is supplied then a `trans_no` value must be supplied.<br/>minLength: 4<br/>maxLength: 50 |
`merchantid` | integer *int32* | true | Identifies the merchant account to perform the capture for. |
`sdk` | string  | false | An optional reference value for the calling client such as a version number i.e. |
`transno` | integer *int32* | false | The transaction number of the transaction to look up and capture. If an empty value is supplied then an identifier value must be supplied. |



 Extension | Field | Type | Required | Description |
-----------|-------|------|----------|-------------|
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
   "bin_description": "",
   "bin_eu": false,
   "card_id": "",
   "card_status": "",
   "defaultCard": false,
   "expmonth": 9,
   "expyear": 2023,
   "label": "Visa/0002",
   "label2": "Visa/0002,Exp:2304",
   "last4digits": "2",
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
 <bin_description></bin_description> 
 <bin_eu></bin_eu> 
 <card_id></card_id> 
 <card_status></card_status> 
 <defaultCard></defaultCard> 
 <expmonth>9</expmonth> 
 <expyear>2023</expyear> 
 <label>Visa/0002</label> 
 <label2>Visa/0002,Exp:2304</label2> 
 <last4digits>2</last4digits> 
 <scheme>Visa</scheme> 
 <token>ctPCAPyNyCkx3Ry8wGyv8khC3ch2hUSB3Db..Qzr</token> 
</Card>
```

 Field | Type | Required | Description |
-------|------|----------|-------------|
`bin_commercial` | boolean  | false | Defines whether the card is a commercial card. |
`bin_corporate` | boolean  | false | Defines whether the card is a corporate business card. |
`bin_country_issued` | string  | false | The determined country where the card was issued. |
`bin_credit` | boolean  | false | Defines whether the card is a credit card. |
`bin_currency` | string  | false | The default currency determined for the card. |
`bin_debit` | boolean  | false | Defines whether the card is a debit card. |
`bin_description` | string  | false | A description of the bin on the card to identify what type of product the card is. |
`bin_eu` | boolean  | false | Defines whether the card is regulated within the EU. |
`card_id` | string  | false | The id of the card that is returned. Should be used for referencing the card when perform any changes. |
`card_status` | string  | false | The status of the card such, valid values are<br/> - ACTIVE the card is active for processing<br/> - INACTIVE the card is not active for processing<br/> - EXPIRED for cards that have passed their expiry date. |
`defaultCard` | boolean  | false | Determines if the card is the default card for the account and should be regarded as the first option to be used for processing. |
`expmonth` | integer *int32* | false | The expiry month of the card.<br/>minimum: 1<br/>maximum: 12 |
`expyear` | integer *int32* | false | The expiry year of the card.<br/>minimum: 2000<br/>maximum: 2100 |
`label` | string  | false | A label which identifies this card. |
`label2` | string  | false | A label which also provides the expiry date of the card. |
`last4digits` | string  | false | The last 4 digits of the card to aid in identification. |
`scheme` | string  | false | The scheme that issued the card. |
`token` | string *base58* | false | A token that can be used to process against the card. |





## CardHolderAccount

```json
{
   "account_id": "aaabbb-cccddd-eee",
   "cac_id": "acc_1",
   "cards": "",
   "contact": { ... },
   "date_created": "2020-01-02",
   "trans_status": ""
}
```

```xml
<CardHolderAccount>
 <account_id>aaabbb-cccddd-eee</account_id> 
 <cac_id>acc_1</cac_id> 
 <cards></cards> 
 <contact><>...</></contact> 
 <date_created>2020-01-02</date_created> 
 <trans_status></trans_status> 
</CardHolderAccount>
```

 Field | Type | Required | Description |
-------|------|----------|-------------|
`account_id` | string  | true | The account id of the card holder account which uniquely identifies the account.<br/><br/>minLength: 5<br/>maxLength: 50 |
`cac_id` | string  | false | The card holder control id which identifies the scheme that the account belongs to, ordinarily this is the same as your client id.<br/>minLength: 5<br/>maxLength: 20 |
`cards` | array  | false |  |
`contact` | object | true | [ContactDetails](#contactdetails) Contact details that refer to this account. |
`date_created` | string *date-time* | false | The date and time the account was created. |
`trans_status` | string  | false | Defines the status of the account for processing valid values are<br/><br/> - ACTIVE for active accounts that are able to process<br/> - DISABLED for accounts that are currently disabled for processing. |





## ChargeRequest

```json
{
   "amount": 3600,
   "csc": "10",
   "identifier": "95b857a1-5955-4b86-963c-5a6dbfc4fb95",
   "merchantid": 11223344,
   "sdk": "MyClient 1.3.0",
   "token": "ctPCAPyNyCkx3Ry8wGyv8khC3ch2hUSB3Db..Qzr",
   "trans_info": "",
   "trans_type": ""
}
```

```xml
<ChargeRequest>
 <amount>3600</amount> 
 <csc>10</csc> 
 <identifier>95b857a1-5955-4b86-963c-5a6dbfc4fb95</identifier> 
 <merchantid>11223344</merchantid> 
 <sdk>MyClient 1.3.0</sdk> 
 <token>ctPCAPyNyCkx3Ry8wGyv8khC3ch2hUSB3Db..Qzr</token> 
 <trans_info></trans_info> 
 <trans_type></trans_type> 
</ChargeRequest>
```

 Field | Type | Required | Description |
-------|------|----------|-------------|
`amount` | integer *int32* | true | The amount to authorise in the lowest unit of currency with a variable length to a maximum of 12 digits.<br/>No decimal points are to be included and no divisional characters such as 1,024.<br/>The amount should be the total amount required for the transaction.<br/>For example with GBP £1,021.95 the amount value is 102195.<br/><br/>minLength: 1<br/>maxLength: 12 |
`csc` | string  | false | The Card Security Code (CSC) (also known as CV2/CVV2) is normally found on the back of the card<br/>(American Express has it on the front). The value helps to identify posession of the card as it is not<br/>available within the chip or magnetic swipe.<br/><br/>When forwarding the CSC, please ensure the value is a string as some values start with 0 and this will be stripped<br/>out by any integer parsing.<br/><br/>The CSC number aids fraud prevention in Mail Order and Internet payments.<br/><br/> Business rules are available on your account to identify whether to accept<br/>or decline transactions based on mismatched results of the CSC.<br/><br/>The Payment Card Industry (PCI) requires that at no stage of a transaction should the CSC be stored.<br/>This applies to all entities handling card data.<br/>It should also not be used in any hashing process.<br/>CityPay do not store the value and have no method of retrieving the value once the transaction has been processed.<br/>For this reason, duplicate checking is unable to determine the CSC in its duplication check algorithm.<br/><br/>minLength: 3<br/>maxLength: 4 |
`identifier` | string  | true | The identifier of the transaction to process. The value should be a valid reference and may be used to perform<br/> post processing actions and to aid in reconciliation of transactions.<br/><br/>The value should be a valid printable string with ASCII character ranges from 32 to 127.<br/><br/>The identifier is recommended to be distinct for each transaction such as a [random unique identifier](https://en.wikipedia.org/wiki/Universally_unique_identifier)<br/>this will aid in ensuring each transaction is identifiable.<br/><br/>When transactions are processed they are also checked for duplicate requests. Changing the identifier on a subsequent<br/>request will ensure that a transaction is considered as different.<br/><br/>minLength: 4<br/>maxLength: 50 |
`merchantid` | integer *int32* | true | Identifies the merchant account to perform processing for. |
`sdk` | string  | false | An optional reference value for the calling client such as a version number i.e. |
`token` | string *base58* | true | A tokenised form of a card that belongs to a card holder's account and that<br/>has been previously registered. The token is time based and will only be active for<br/>a short duration. The value is therefore designed not to be stored remotely for future<br/> use.<br/><br/>Tokens will start with ct and are resiliently tamper proof using HMacSHA-256.<br/>No sensitive card data is stored internally within the token.<br/><br/>Each card will contain a different token and the value may be different on any retrieval call.<br/><br/>The value can be presented for payment as a selection value to an end user in a web application. |
`trans_info` | string  | false | Further information that can be added to the transaction will display in reporting. Can be used for flexible values such as operator id.<br/>maxLength: 50 |
`trans_type` | string  | false | The type of transaction being submitted. Normally this value is not required and your account manager may request that you set this field.<br/>minLength: 1<br/>maxLength: 1 |





## ContactDetails

```json
{
   "address1": "79 Parliamant St",
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
 <address1>79 Parliamant St</address1> 
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

 Field | Type | Required | Description |
-------|------|----------|-------------|
`address1` | string  | false | The first line of the address for the card holder.<br/>maxLength: 20 |
`address2` | string  | false | The second line of the address for the card holder.<br/>maxLength: 20 |
`address3` | string  | false | The third line of the address for the card holder.<br/>maxLength: 20 |
`area` | string  | false | The area such as city, department, parish for the card holder.<br/>maxLength: 20 |
`company` | string  | false | The company name for the card holder if the contact is a corporate contact. |
`country` | string  | false | The country code in ISO 3166 format. The country value may be used for fraud analysis and for<br/>  acceptance of the transaction.<br/><br/>maxLength: 2 |
`email` | string  | false | An email address for the card holder which may be used for correspondence. |
`firstname` | string  | false | The first name  of the card holder. |
`lastname` | string  | false | The last name or surname of the card holder. |
`mobile_no` | string  | false | A mobile number for the card holder the mobile number is often required by delivery companies to ensure they are able to be in contact when required. |
`postcode` | string  | false | The postcode or zip code of the address which may be used for fraud analysis.<br/>maxLength: 10 |
`telephone_no` | string  | false | A telephone number for the card holder. |
`title` | string  | false | A title for the card holder such as Mr, Mrs, Ms, M. Mme. etc. |





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

 Field | Type | Required | Description |
-------|------|----------|-------------|
`authen_result` | string  | false | The authentication result available from the MPI.<br/>maxLength: 1 |
`cavv` | string  | false | A value determining the cardholder verification value supplied by the card scheme.<br/>maxLength: 20 |
`eci` | integer *int32* | false | The obtained e-commerce indicator from the MPI.<br/>maxLength: 1 |
`enrolled` | string  | false | A value determining whether the card holder was enrolled.<br/>maxLength: 1 |
`xid` | string  | false | The XID used for processing with the MPI.<br/>maxLength: 20 |





## ListMerchantsResponse

```json
{
   "clientid": "PC12345",
   "merchants": "",
   "name": ""
}
```

```xml
<ListMerchantsResponse>
 <clientid>PC12345</clientid> 
 <merchants></merchants> 
 <name></name> 
</ListMerchantsResponse>
```

 Field | Type | Required | Description |
-------|------|----------|-------------|
`clientid` | string  | false | The client id requested.<br/>minLength: 3<br/>maxLength: 10 |
`merchants` | array  | false |  |
`name` | string  | false | The client name that was requested. |





## Merchant

```json
{
   "currency": "",
   "merchantid": 11223344,
   "name": "",
   "status": ""
}
```

```xml
<Merchant>
 <currency></currency> 
 <merchantid>11223344</merchantid> 
 <name></name> 
 <status></status> 
</Merchant>
```

 Field | Type | Required | Description |
-------|------|----------|-------------|
`currency` | string  | false | The currency of the merchant. |
`merchantid` | integer *int32* | false | The merchant id which uniquely identifies the merchant account. |
`name` | string  | false | The name of the merchant. |
`status` | string  | false | The status of the account. |





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

 Field | Type | Required | Description |
-------|------|----------|-------------|
`identifier` | string  | false | An identifier of the ping request which will be returned in the response.<br/>minLength: 4<br/>maxLength: 50 |





## RegisterCard

```json
{
   "account_id": "aaabbb-cccddd-eee",
   "cardnumber": "4000 0000 0000 0002",
   "defaultCard": false,
   "expmonth": 9,
   "expyear": 2023
}
```

```xml
<RegisterCard>
 <account_id>aaabbb-cccddd-eee</account_id> 
 <cardnumber>4000 0000 0000 0002</cardnumber> 
 <defaultCard></defaultCard> 
 <expmonth>9</expmonth> 
 <expyear>2023</expyear> 
</RegisterCard>
```

 Field | Type | Required | Description |
-------|------|----------|-------------|
`account_id` | string  | false | The account to register the card against.<br/>minLength: 5<br/>maxLength: 50 |
`cardnumber` | string  | false | The primary number of the card.<br/>minLength: 12<br/>maxLength: 22 |
`defaultCard` | boolean  | false | Determines whether the card should be the new default card. |
`expmonth` | integer *int32* | false | The expiry month of the card.<br/>minimum: 1<br/>maximum: 12 |
`expyear` | integer *int32* | false | The expiry year of the card.<br/>minimum: 2000<br/>maximum: 2100 |





## RequestChallenged

```json
{
   "ThreeDServerTransId": "",
   "acs_url": "https://acs.cardissuer.com/3dsv1",
   "creq": "",
   "merchantid": 11223344,
   "transno": 78416
}
```

```xml
<RequestChallenged>
 <ThreeDServerTransId></ThreeDServerTransId> 
 <acs_url>https://acs.cardissuer.com/3dsv1</acs_url> 
 <creq></creq> 
 <merchantid>11223344</merchantid> 
 <transno>78416</transno> 
</RequestChallenged>
```

 Field | Type | Required | Description |
-------|------|----------|-------------|
`ThreeDServerTransId` | string  | false | The 3DSv2 trans id reference for the challenge process. |
`acs_url` | string *url* | false | The url of the Access Control Server (ACS) to forward the user to. |
`creq` | string  | false | The challenge request data which is encoded for usage by the ACS. |
`merchantid` | integer *int32* | false | The merchant id that processed this transaction. |
`transno` | integer *int32* | false | The transaction number for the challenge, ordered incrementally from 1 for every merchant_id. |





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

 Field | Type | Required | Description |
-------|------|----------|-------------|
`identifier` | string  | false | The identifier of the transaction to retrieve. Optional if a transaction number is provided.<br/>minLength: 4<br/>maxLength: 50 |
`merchantid` | integer *int32* | true | The merchant account to retrieve data for. |
`transno` | integer *int32* | false | The transaction number of a transaction to retrieve. Optional if an identifier is supplied. |





## VoidRequest

```json
{
   "identifier": "95b857a1-5955-4b86-963c-5a6dbfc4fb95",
   "merchantid": 11223344,
   "sdk": "MyClient 1.3.0",
   "transno": 78416
}
```

```xml
<VoidRequest>
 <identifier>95b857a1-5955-4b86-963c-5a6dbfc4fb95</identifier> 
 <merchantid>11223344</merchantid> 
 <sdk>MyClient 1.3.0</sdk> 
 <transno>78416</transno> 
</VoidRequest>
```

 Field | Type | Required | Description |
-------|------|----------|-------------|
`identifier` | string  | false | The identifier of the transaction to void. If an empty value is supplied then a `trans_no` value must be supplied.<br/>minLength: 4<br/>maxLength: 50 |
`merchantid` | integer *int32* | true | Identifies the merchant account to perform the void for. |
`sdk` | string  | false | An optional reference value for the calling client such as a version number i.e. |
`transno` | integer *int32* | false | The transaction number of the transaction to look up and void. If an empty value is supplied then an identifier value must be supplied. |





