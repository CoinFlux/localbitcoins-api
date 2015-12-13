var request = require('request')
var crypto		= require('crypto');
var querystring	= require('querystring');
var nonce = (new Date).getTime();


function LBCClient(key, secret, otp) {
	var self = this;

	var config = {
		url: 'https://localbitcoins.com/api',
		key: key,
		secret: secret,
		otp: otp,
		timeoutMS: 5000
	};

	/**
	 * This method makes a public or private API request.
	 * @param  {String}   method   The API method (public or private)
	 * @param  {Object}   params   Arguments to pass to the api call
	 * @param  {Function} callback A callback function to be executed when the request is complete
	 * @return {Object}            The request object
	 */
	function api(method, ad_id, params, callback) {
		var methods = {
			onlineAds: ['buy-bitcoins-online'],
			public: ['countrycodes'],
			private: ['ad-get', 'ad-get/ad_id', 'myself', 'ads',
			'dashboard', 'dashboard/released', 'dashboard/canceled', 'dashboard/closed',
			'dashboard/released/buyer', 'dashboard/canceled/buyer', 'dashboard/closed/buyer',
			'dashboard/released/seller', 'dashboard/canceled/seller', 'dashboard/closed/seller',
			'wallet-send', 'wallet'
			]
		};
		if(methods.public.indexOf(method) !== -1) {
			return publicMethod(method, params, ad_id, callback);
		}
		else if(methods.private.indexOf(method) !== -1) {
			return privateMethod(method, params, ad_id, callback);
		}
		else {
			throw new Error(method + ' is not a valid API method.');
		}
	}

	/**
	 * This method makes a public API request.
	 * @param  {String}   method   The API method (public or private)
	 * @param  {Object}   params   Arguments to pass to the api call
	 * @param  {Function} callback A callback function to be executed when the request is complete
	 * @return {Object}            The request object
	 */
	function publicMethod(method, params, ad_id, callback) {
		params = params || {};

		var path;
		if (ad_id) {
			path	= '/' + method + '/' + ad_id;
		} else {
			path	= '/' + method;
		}

		var url		= config.url + path;

		return rawRequest(url, {}, params, callback);
	}

	/**
	 * This method makes a private API request.
	 * @param  {String}   method   The API method (public or private)
	 * @param  {Object}   params   Arguments to pass to the api call
	 * @param  {Function} callback A callback function to be executed when the request is complete
	 * @return {Object}            The request object
	 */
	function privateMethod(method, params, ad_id, callback) {
		params = params || {};

		var path;

		if (ad_id) {
			path	= '/' + method + '/' + ad_id;
		} else {
			path	= '/' + method;
		}

		var url		= config.url + path;

		var signature = getMessageSignature(path, params, nonce);

		var headers = {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Apiauth-Key': config.key,
			'Apiauth-Nonce': nonce,
			'Apiauth-Signature': signature
		};

		return rawRequest(url, headers, params, method, callback);
	}

	/**
	 * This method returns a signature for a request as a Base64-encoded string
	 * @param  {String}  path    The relative URL path for the request
	 * @param  {Object}  request The POST body
	 * @param  {Integer} nonce   A unique, incrementing integer
	 * @return {String}          The request signature
	 */
	function getMessageSignature(path, params, nonce) {
		var postParameters	= querystring.stringify(params);
		var path = '/api' + path + '/';
		var message = nonce + config.key + path + postParameters;
		var auth_hash = crypto.createHmac("sha256", config.secret).update(message).digest('hex').toUpperCase();
		return auth_hash;
	}

	/**
	 * This method sends the actual HTTP request
	 * @param  {String}   url      The URL to make the request
	 * @param  {Object}   headers  Request headers
	 * @param  {Object}   params   POST body
	 * @param  {Function} callback A callback function to call when the request is complete
	 * @return {Object}            The request object
	 */
	function rawRequest(url, headers, params, method, callback) {

    var gets = ['ad-get', 'dashboard', 'dashboard/released', 'dashboard/canceled',
    'dashboard/closed', 'dashboard/released/buyer', 'dashboard/canceled/buyer',
    'dashboard/closed/buyer', 'dashboard/released/seller', 'dashboard/canceled/seller',
    'dashboard/closed/seller', 'wallet'];
    var posts = [ 'ad-get/ad_id', 'myself', 'ads',
    'wallet-send', 'wallet-balance', 'wallet-addr'];

    if (posts.indexOf(method) !== -1) {

			var options = {
				url: url + '/',
				headers: headers,
				form: params,
			};

		var req = request.post(options, function(error, response, body) {
			if(typeof callback === 'function') {
				var data;

				if(error) {
					callback.call(self, new Error('Error in server response: ' + JSON.stringify(error)), null);
					return;
				}

				try {
					data = JSON.parse(body);
				}
				catch(e) {
					callback.call(self, new Error('Could not understand response from server: ' + body), null);
					return;
				}

				if(data.error && data.error.length) {
					callback.call(self, data.error, null);
				}
				else {
					callback.call(self, null, data);
				}
			}
		});

		return req;

	 } else {

		var options = {
			url: url + '/',
			headers: headers,
		};

		var req = request.get(options, function(error, response, body) {
			if(typeof callback === 'function') {
				var data;

				if(error) {
					callback.call(self, new Error('Error in server response: ' + JSON.stringify(error)), null);
					return;
				}

				try {
					data = JSON.parse(body);
				}
				catch(e) {
					callback.call(self, new Error('Could not understand response from server: ' + body), null);
					return;
				}

				if(data.error && data.error.length) {
					callback.call(self, data.error, null);
				}
				else {
					callback.call(self, null, data);
				}
			}
		});

		return req;
	}
	}

	self.api			= api;
	self.publicMethod	= publicMethod;
	self.privateMethod	= privateMethod;
}

module.exports = LBCClient;
