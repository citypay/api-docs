---
title: CityPay Payment API
version: 6.6.25
language_tabs:
  - json
  - xml
toc_footers:
  - <a href='mailto:support@citypay.com'>Any Integration Questions?</a>
  - V6.6.25 2024-01-16
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

Version: 6.6.25
Last Updated: 2024-01-16


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


