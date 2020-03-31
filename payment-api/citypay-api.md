---
title: CityPay Payment API
version: 6.0.0.BETA
language_tabs:
  - json
  - xml
toc_footers:
  - <a href='mailto:support@citypay.com'>Any Integration Questions?</a>
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


# PaymentProcessing

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
   <CaptureRequest>
      <merchantid>123456</merchantid>
      <identifier>318f2bc5-d9e0-4ddf-9df1-1ea9e4890ca9</identifier>
   </CaptureRequest>
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
   <CaptureRequest>
      <merchantid>123456</merchantid>
      <transno>11275</transno>
      <amount>6795</amount>
   </CaptureRequest>
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
`airline-data` | object | false | [AirlineAdvice](#airlineadvice) |
`amount` | integer *int32* | false | The completion amount provided in the lowest unit of currency for the specific currency of the merchant,<br/>with a variable length to a maximum of 12 digits. No decimal points to be included. For example with<br/>GBP 75.45 use the value 7545. Please check that you do not supply divisional characters such as 1,024 in the<br/>request which may be caused by some number formatters.<br/>If no amount is supplied, the original processing amount is used.<br/><br/>minLength: 1<br/>maxLength: 12 |
`identifier` | string  | false | The identifier of the transaction to capture. If an empty value is supplied then a `trans_no` value must be supplied.<br/>minLength: 4<br/>maxLength: 50 |
`merchantid` | integer *int32* | true | Identifies the merchant account to perform the capture for. |
`transno` | integer *int32* | false | The transaction number of the transaction to look up and capture. If an empty value is supplied then an identifier value must be supplied. |



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
   <VoidRequest>
      <merchantid>123456</merchantid>
      <identifier>318f2bc5-d9e0-4ddf-9df1-1ea9e4890ca9</identifier>
   </VoidRequest>
</VoidRequest>
```


> Basic capture call for a merchant with a transno and final amount

```json
{
  "VoidRequest":{
    "merchantid":123456,
    "transno":11275,
    "amount":6795
  }
}
```

```xml
<VoidRequest>
   <VoidRequest>
      <merchantid>123456</merchantid>
      <transno>11275</transno>
      <amount>6795</amount>
   </VoidRequest>
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
`transno` | integer *int32* | false | The transaction number of the transaction to look up and void. If an empty value is supplied then an identifier value must be supplied. |




# API Model



## Acknowledgement

```json
{
   "code": "0",
   "context": "aspiu352908ns47n343598bads",
   "message": "Approved 044332"
}
```

```xml
<Acknowledgement>
 <code>0</code> 
 <context>aspiu352908ns47n343598bads</context> 
 <message>Approved 044332</message> 
</Acknowledgement>
```

 Field | Type | Required | Description |
-------|------|------|----------|
`code` | string  | false | A response code providing a result of the process.<br/>minLength: 3<br/>maxLength: 4 |
`context` | string  | false | A context id of the process used for referencing transactions through support. |
`message` | string  | false | A response message providing a description of the result of the process. |



## AirlineAdvice

```json
{
   "carrier-name": "EXample Air",
   "conjunction-ticket-indicator": false,
   "eticket-indicator": true,
   "no-air-segments": 2,
   "number-in-party": 2,
   "original-ticket-no": "",
   "passenger-name": "NE Person",
   "segment1": { ... },
   "segment2": { ... },
   "segment3": { ... },
   "segment4": { ... },
   "ticket-issue-city": "London",
   "ticket-issue-date": "2020-08-01",
   "ticket-issue-name": "Issue Name",
   "ticketno": "A112233",
   "transaction-type": "TKT"
}
```

```xml
<AirlineAdvice>
 <carrier-name>EXample Air</carrier-name> 
 <conjunction-ticket-indicator>false</conjunction-ticket-indicator> 
 <eticket-indicator>true</eticket-indicator> 
 <no-air-segments>2</no-air-segments> 
 <number-in-party>2</number-in-party> 
 <original-ticket-no></original-ticket-no> 
 <passenger-name>NE Person</passenger-name> 
 <segment1><>...</></segment1> 
 <segment2><>...</></segment2> 
 <segment3><>...</></segment3> 
 <segment4><>...</></segment4> 
 <ticket-issue-city>London</ticket-issue-city> 
 <ticket-issue-date>2020-08-01</ticket-issue-date> 
 <ticket-issue-name>Issue Name</ticket-issue-name> 
 <ticketno>A112233</ticketno> 
 <transaction-type>TKT</transaction-type> 
</AirlineAdvice>
```

 Field | Type | Required | Description |
-------|------|------|----------|
`carrier-name` | string  | true | The name of the airline carrier that generated the tickets for airline travel.<br/>maxLength: 25 |
`conjunction-ticket-indicator` | boolean  | false | true if a conjunction ticket (with additional coupons) was issued for an itinerary<br/>with more than four segments. Defaults to false. |
`eticket-indicator` | boolean  | false | The Electronic Ticket Indicator, a code that indicates if an electronic ticket was issued.  Defaults to true. |
`no-air-segments` | integer *int32* | false | A value that indicates the number of air travel segments included on this ticket.<br/>Valid entries include the numerals “0” through “4”. Required only if the transaction type is TKT or EXC.<br/><br/>minimum: 0<br/>maximum: 4 |
`number-in-party` | integer *int32* | true | The number of people in the party. |
`original-ticket-no` | string  | false | Required if transaction type is EXC.<br/>maxLength: 14 |
`passenger-name` | string  | false | The name of the passenger when the traveller is not the card member that purchased the ticket. Required only if the transaction type is TKT or EXC.<br/>maxLength: 25 |
`segment1` | object | true | [AirlineSegment](#airlinesegment) |
`segment2` | object | false | [AirlineSegment](#airlinesegment) |
`segment3` | object | false | [AirlineSegment](#airlinesegment) |
`segment4` | object | false | [AirlineSegment](#airlinesegment) |
`ticket-issue-city` | string  | true | The name of the city town or village where the transaction took place.<br/>maxLength: 18 |
`ticket-issue-date` | string *date* | true | The date the ticket was issued in ISO Date format (yyyy-MM-dd).<br/>maxLength: 10 |
`ticket-issue-name` | string  | true | The name of the agency generating the ticket.<br/>maxLength: 26 |
`ticketno` | string  | true | This must be a valid ticket number, i.e. numeric (the first 3 digits must represent the valid IATA plate carrier code).<br/>The final check digit should be validated prior to submission. On credit charges, this field should contain the<br/>number of the original ticket, and not of a replacement.<br/><br/>maxLength: 14 |
`transaction-type` | string  | true | This field contains the Transaction Type code assigned to this transaction. Valid codes include:<br/><br/> - `TKT` = Ticket Purchase<br/> - `REF` = Refund<br/> - `EXC` = Exchange Ticket<br/> - `MSC` = Miscellaneous (non-Ticket Purchase- and non-Exchange Ticket-related transactions only).<br/><br/>minLength: 3<br/>maxLength: 3 |



## AirlineSegment

```json
{
   "arrival-location-code": "SOU",
   "carrier-code": "ZZ",
   "class-service-code": "CC",
   "departure-date": "2020-08-01",
   "departure-location-code": "JER",
   "flight-number": "772",
   "segment-fare": 7500,
   "stop-over-indicator": "1"
}
```

```xml
<AirlineSegment>
 <arrival-location-code>SOU</arrival-location-code> 
 <carrier-code>ZZ</carrier-code> 
 <class-service-code>CC</class-service-code> 
 <departure-date>2020-08-01</departure-date> 
 <departure-location-code>JER</departure-location-code> 
 <flight-number>772</flight-number> 
 <segment-fare>7500</segment-fare> 
 <stop-over-indicator>1</stop-over-indicator> 
</AirlineSegment>
```

 Field | Type | Required | Description |
-------|------|------|----------|
`arrival-location-code` | string  | true | A standard airline routing code (airport code or location identifier) applicable to the<br/>arrival portion of this segment.<br/><br/>maxLength: 3 |
`carrier-code` | string  | true | This field contains the two character airline designator code (air carrier code or airline code) that<br/>corresponds to the airline carrier applicable for up to four flight segments of this trip itinerary.<br/><br/>maxLength: 2 |
`class-service-code` | string  | true | This field contains a code that corresponds to the fare class (A, B, C, D, Premium, Discounted, etc.)<br/>within the overall class of service (e.g., First Class, Business, Economy) applicable to this travel segment,<br/>as specified in the IATA Standard Code allocation table.<br/><br/>maxLength: 2 |
`departure-date` | string *date* | true | The Departure Date for the travel segment in ISO Date Format (yyyy-MM-dd). |
`departure-location-code` | string  | false | A standard airline routing code (airport code or location identifier) applicable to the<br/>departure portion of this segment.<br/><br/>maxLength: 3 |
`flight-number` | string  | true | This field contains the carrier-assigned Flight Number for this travel segment.<br/>maxLength: 4 |
`segment-fare` | integer *int32* | false | This field contains the total Fare for this travel segment. |
`stop-over-indicator` | string  | false | O = Stopover allowed, X = Stopover not allowed.<br/>maxLength: 1 |



## CaptureRequest

```json
{
   "airline-data": { ... },
   "amount": 3600,
   "identifier": "95b857a1-5955-4b86-963c-5a6dbfc4fb95",
   "merchantid": 11223344,
   "transno": 78416
}
```

```xml
<CaptureRequest>
 <airline-data><>...</></airline-data> 
 <amount>3600</amount> 
 <identifier>95b857a1-5955-4b86-963c-5a6dbfc4fb95</identifier> 
 <merchantid>11223344</merchantid> 
 <transno>78416</transno> 
</CaptureRequest>
```

 Field | Type | Required | Description |
-------|------|------|----------|
`airline-data` | object | false | [AirlineAdvice](#airlineadvice) |
`amount` | integer *int32* | false | The completion amount provided in the lowest unit of currency for the specific currency of the merchant,<br/>with a variable length to a maximum of 12 digits. No decimal points to be included. For example with<br/>GBP 75.45 use the value 7545. Please check that you do not supply divisional characters such as 1,024 in the<br/>request which may be caused by some number formatters.<br/>If no amount is supplied, the original processing amount is used.<br/><br/>minLength: 1<br/>maxLength: 12 |
`identifier` | string  | false | The identifier of the transaction to capture. If an empty value is supplied then a `trans_no` value must be supplied.<br/>minLength: 4<br/>maxLength: 50 |
`merchantid` | integer *int32* | true | Identifies the merchant account to perform the capture for. |
`transno` | integer *int32* | false | The transaction number of the transaction to look up and capture. If an empty value is supplied then an identifier value must be supplied. |



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

 Field | Type | Required | Description |
-------|------|------|----------|
`identifier` | string  | false | The identifier of the transaction to void. If an empty value is supplied then a `trans_no` value must be supplied.<br/>minLength: 4<br/>maxLength: 50 |
`merchantid` | integer *int32* | true | Identifies the merchant account to perform the void for. |
`transno` | integer *int32* | false | The transaction number of the transaction to look up and void. If an empty value is supplied then an identifier value must be supplied. |



