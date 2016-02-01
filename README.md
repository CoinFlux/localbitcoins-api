LocalBitcoins Node API
===========

NodeJS Client Library for the LocalBitcoins API

This is an asynchronous node js client for the localbitcoins.com API.

It exposes all the API methods found here: https://localbitcoins.com/api-docs/ through the 'api' method:

Example Usage:

`npm install localbitcoins-api`

```javascript
var LBCClient = require('localbitcoins-api');
var lbc = new LBCClient(api_key, api_secret);

var ad_id; //set to value when applicable
var params = {};


// Display user's info
lbc.api('myself', ad_id, params, function(error, data) {
    if(error) {
        console.log(error);
    }
    else {
        console.log(data);
    }
});

```

To-Do:
- Get all methods working

CHANGELOG:
0.0.3 - Add /contact_info/ and /contact_info/{contact_id} routes

Credit:

Initially inspired by:
https://github.com/nothingisdead/npm-kraken-api.
With contributions from:
https://github.com/mrmayfield/localbitcoins-node.
https://github.com/vnistor/localbitcoins-node.
