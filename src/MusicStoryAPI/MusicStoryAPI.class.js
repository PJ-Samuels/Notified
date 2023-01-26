// comment these lines if crypto library is already included
var CryptoJS;
init_crypto();

/**
 * MusicStory API Pseudo-Class
 * @param string oauth_consumer_key Your consumer key
 * @param string oauth_consumer_secret Your consumer secret
 * @param string token Your token, facultative
 * @param string oauth_token_secret Your token secret, facultative
 */
function MusicStoryApi(oauth_consumer_key, oauth_consumer_secret, token, token_secret, version) {

	var _this = this;

	// Attributes
	this.consumer_key = oauth_consumer_key;
	this.consumer_secret = oauth_consumer_secret;
	this.token = token;
	this.token_secret = token_secret;
	this._version = version;
	this._base_url = 'http://api.music-story.com';
	this.resp = null;

	/**
	 * Run function when condition is ok
	 * @param condition
	 * @param callback
	 */
	this._checker = function(condition, callback) {
		var int_id = setInterval(function() {
			if (condition()) {
				clearInterval(int_id);
				callback();
			}
		}, 10);
	};

	/**
	 * RFC3986 Url encode
	 * @param string input
	 * @return string
	 */
	this._rawurlencode_rfc3986 = function(input) {
		return encodeURIComponent(input).replace('+', ' ').replace('%7E', '~');
	};


	/**
	 * Load an api result using jsonp
	 * @param string url The url page
	 * @param Object options
	 * @param function callback
	 */
	this._load = function(url, options, callback) {
		var script = document.createElement('script');
		var head = document.getElementsByTagName('head')[0];
		script.type = 'text/javascript';
		var params = '';
		for (prop in options.data) {
			if (params)
				params += '&';
			else
				params = '?';
			params += prop + '=' + encodeURIComponent(options.data[prop]);
		}
		url = url + params;
		script.src = url;
		script.onload = function() {
			_this.resp = json;
			head.removeChild(script);
			if (typeof callback !== 'undefined')
				callback();
		};
		head.appendChild(script);
	};

	/**
	 * Make an api request (get by id)
	 * @param string object Requested object name
	 * @param string id Requested object id
	 * @param string facultative fields, facultative
	 * @param function callback
	 */
	this.get = function(object, id, fields, callback) {
		if (typeof fields === 'undefined')
			fields = null;
		if (!id)
			return;
		object = object.toLowerCase();
		var type = 'getObject';
		_this._request(object, id, null, null, type, null, null, function() {
			_this.constructResult(object, type, callback);
		});
	};

	/**
	 * Make an api request (search by filters)
	 * @param string object Requested object name
	 * @param string filter Request filters
	 * @param string callback function
	 * @param string page
	 * @param string count
	 */
	this.search = function(object, filter, callback, page, count) {
		object = object.toLowerCase();
		var type = 'searchObject';
		if (!filter)
			return;
		_this._request(object, null, null, filter, type, page, count, function() {
			_this.constructResult(object, type, callback);
		});
	};

	/**
	 * Sign a request
	 * @param string url The request url
	 * @param Object params The request parameters
	 */
	this._sign = function(url, params) {
		var normalized_params = '', base_signature = '', encrypt_key = '', signature = '', prop, props, i, val, hash;
		if (!url)
			return;
		if (!params)
			params = {};
		props = new Array();
		for (prop in params)
			props.push(prop);
		props.sort();
		for (i = 0; i < props.length; i++) {
			prop = _this._rawurlencode_rfc3986(props[i]);
			val = _this._rawurlencode_rfc3986(params[props[i]]);
			if (normalized_params)
				normalized_params += '&';
			normalized_params += prop + '=' + val;
		}
		base_signature = 'GET&' + _this._rawurlencode_rfc3986(url.toLowerCase()) + '&' + _this._rawurlencode_rfc3986(normalized_params);
		encrypt_key = _this._rawurlencode_rfc3986(_this.consumer_secret) + '&' + _this._rawurlencode_rfc3986(_this.token_secret);
		hash = CryptoJS.HmacSHA1(base_signature, encrypt_key);
		signature = hash.toString(CryptoJS.enc.Base64);
		return signature;
	};

	/**
	 * Chech tokens, then call an object 
	 * @param string object The object
	 * @param string id The object's id
	 * @param string connector The connector
	 * @param Object filter The request filters
	 * @param string type The request type
	 * @param string page Page number
	 * @param string count Number of results per page
	 * @param function callback
	 */
	this._request = function(object, id, connector, filter, type, page, count, callback) {
		if ((!object && type !== 'getConnector') || (type === 'searchObject' && (!filter)) || !type)
			return;
		if (!_this.token || !_this.token_secret) {
			_this.getToken(function() {
				_this._requestsuite(object, id, connector, filter, type, page, count, callback);
			});
		}
		else {
			_this._requestsuite(object, id, connector, filter, type, page, count, callback);
		}
	};

	/**
	 * Call an object
	 * @param string object The object
	 * @param string id The object's id
	 * @param string connector The connector
	 * @param Object filter The request filters
	 * @param string type The request type
	 * @param string page Page number
	 * @param string count Number of results per page
	 * @param function callback
	 */
	this._requestsuite = function(object, id, connector, filter, type, page, count, callback) {
		var url, params, attr, oauth_signature;
		url = _this._base_url + '/' + object;
		if (id)
			url += '/' + id;
		if (type === 'searchObject') {
			url += '/search';
		}
		if (type === 'getConnector')
			url = url + '/' + connector;
		url += '.json';
		params = {'oauth_token': _this.token, _callback: 'var json='};
		if (page) {
			if (!filter['page'])
				filter['page'] = page;
		}
		if (count) {
			if (!filter['pageCount'])
				filter['pageCount'] = count;
		}
		for (attr in filter)
			params[attr] = filter[attr];
		oauth_signature = _this._sign(url, params);
		url += '?oauth_signature=' + encodeURIComponent(oauth_signature);
		for (attr in params)
			url += '&' + encodeURIComponent(attr) + '=' + encodeURIComponent(params[attr]);
		_this._load(url, {}, callback);
	};

	/**
	 * Get a token
	 * @param function callback
	 */
	this.getToken = function(callback) {
		_this.token = '';
		_this.token_secret = '';
		var url, oauth_signature;
		if (!oauth_consumer_key)
			return;
		url = _this._base_url + '/';
		if (_this._version)
			url += _this._version + '/';
		url += 'oauth/request_token.json';
		oauth_signature = _this._sign(url, {oauth_consumer_key: _this.consumer_key, _callback: 'var json='});
		this._load(url, {data: {oauth_consumer_key: _this.consumer_key, oauth_signature: oauth_signature, _callback: 'var json='}, async: false}, function() {
			_this.token = _this.resp.data.token;
			_this.token_secret = _this.resp.data.token_secret;
			callback();
		});
	};

	/**
	 * Set the token and/or the token secret
	 * @param string oauth_token The token, if null will be not set
	 * @param string oauth_token_secret The token secret, if null will be not set
	 */
	this.setToken = function(oauth_token, oauth_token_secret) {
		if (oauth_token)
			_this.token = oauth_token;
		if (oauth_token_secret)
			_this._token_secret = oauth_token_secret;
	};

	/**
	 * Transform parsed result into an object or a MusicStoryObjects iterator
	 * @param string object name
	 * @param string type Result type (list or not)
	 * @param function callback
	 * @param Object current object as parameter of callback
	 */
	this.constructResult = function(name, type, callback, return_obj) {
		_this._checker(function() {
			return (typeof _this.resp !== 'undefined' && _this.resp !== null);
		}, function() {
			var items = [];
			var keys = {'ConsumerKey': _this.consumer_key, 'ConsumerSecret': _this.consumer_secret, 'AccessToken': _this.token, 'TokenSecret': _this.token_secret};
			if (type === 'getConnector' || type === 'searchObject') {
				if (_this.resp.data) {
					// Params for list browsing
					var count = (_this.resp.count);
					var currentPage = (_this.resp.currentPage);
					var pageCount = (_this.resp.pageCount);
					var data = (_this.resp.data);
					data.forEach(function(entry) {
						items.push(new MusicStoryObject(entry, name, keys));
					});
					var res = new MusicStoryObjects(items, pageCount, count, currentPage);
					if (typeof callback !== 'undefined')
						callback(res, return_obj);
				} else if (typeof callback !== 'undefined')
					callback([], return_obj);
			} else {
				var res = new MusicStoryObject(_this.resp, name, keys);
				if (typeof callback !== 'undefined')
					callback(res, return_obj);
			}
		});
	};
}

/**
 * MusicStoryObject function
 * @param Object item object containing properties
 * @param string name object name
 * @param array keys tokens & keys
 */
function MusicStoryObject(item, name, keys) {
	MusicStoryApi.call(this);
	for (var field in item) {
		this[field] = item[field];
	}
	var msobj = this;
	this.object_name = name;
	this.token = keys['AccessToken'];
	this.token_secret = keys['TokenSecret'];
	this.consumer_key = keys['ConsumerKey'];
	this.consumer_secret = keys['ConsumerSecret'];
	this.getConnector = function(connector, filter, page, count, callback) {
		var type = 'getConnector';
		connector = connector.toLowerCase();
		var object = this.object_name;
		if (!filter)
			filter = {};
		this._request(object, msobj.id, connector, filter, type, page, count, function() {
			if (connector === 'biographies')
				connector = 'biography';
			else
				connector = connector.substr(0, connector.length - 1);
			msobj.constructResult(connector, type, callback, msobj);
		});
	};
}

/**
 * MusicStoryObjects Iterator function
 * @param array items array of MusicStoryObject 
 * @param string pageCount
 * @param string count
 * @param string currentPage
 */
function MusicStoryObjects(items, pageCount, count, currentPage) {

	//Attributes
	this._position = 0;
	this._pageCount = pageCount;
	this._count = count;
	this._currentPage = currentPage;
	this.data = items;

	/**
	 * Get the result count
	 * @return integer
	 */
	this.size = function() {
		return this._count;
	};

	/**
	 * Check existence of next page
	 * @return boolean
	 */
	this.hasNextPage = function() {
		return this._currentPage < this._pageCount;
	};

	/**
	 * Check existence of previous page
	 * @return boolean
	 */
	this.hasPrevPage = function() {
		return this._currentPage > 1;
	};

	/**
	 * Rewind iterator
	 */
	this.rewind = function() {
		this._position = 0;
	};

	/**
	 * Get current object
	 * @return object
	 */
	this.current = function() {
		if (this.data[this._position]) {
			return(this.data[this._position]);
		} else {
			return null;
		}
	};

	/**
	 * Get current object key
	 * @return int
	 */
	this.key = function() {
		return this._position;
	};

	/**
	 * Increment iterator position
	 */
	this.next = function() {
		++this._position;
		return this.current();
	};

	/**
	 * Decrement iterator position
	 */
	this.prev = function() {
		--this._position;
		return this.current();
	};

	/**
	 * Check existence of current Object
	 * @return boolean
	 */
	this.valid = function() {
		if (this.data) {
			return true;
		} else {
			return false;
		}
	};

	/**
	 * Check existence of next Object
	 * @return boolean
	 */
	this.hasNext = function() {
		if (this.data[this._position + 1]) {
			return true;
		} else {
			return false;
		}
	};
	;

	/**
	 * Check existence of previous Object
	 * @return boolean
	 */
	this.hasPrev = function() {
		if (this.data[this._position - 1]) {
			return true;
		} else {
			return false;
		}
	};
}

/*
 CryptoJS v3.1.2
 code.google.com/p/crypto-js
 (c) 2009-2013 by Jeff Mott. All rights reserved.
 code.google.com/p/crypto-js/wiki/License
 */
function init_crypto() {

	CryptoJS = CryptoJS || function(h, r) {
		var k = {}, l = k.lib = {}, n = function() {
		}, f = l.Base = {extend: function(a) {
				n.prototype = this;
				var b = new n;
				a && b.mixIn(a);
				b.hasOwnProperty("init") || (b.init = function() {
					b.$super.init.apply(this, arguments)
				});
				b.init.prototype = b;
				b.$super = this;
				return b
			}, create: function() {
				var a = this.extend();
				a.init.apply(a, arguments);
				return a
			}, init: function() {
			}, mixIn: function(a) {
				for (var b in a)
					a.hasOwnProperty(b) && (this[b] = a[b]);
				a.hasOwnProperty("toString") && (this.toString = a.toString)
			}, clone: function() {
				return this.init.prototype.extend(this)
			}},
		j = l.WordArray = f.extend({init: function(a, b) {
				a = this.words = a || [];
				this.sigBytes = b != r ? b : 4 * a.length
			}, toString: function(a) {
				return(a || s).stringify(this)
			}, concat: function(a) {
				var b = this.words, d = a.words, c = this.sigBytes;
				a = a.sigBytes;
				this.clamp();
				if (c % 4)
					for (var e = 0; e < a; e++)
						b[c + e >>> 2] |= (d[e >>> 2] >>> 24 - 8 * (e % 4) & 255) << 24 - 8 * ((c + e) % 4);
				else if (65535 < d.length)
					for (e = 0; e < a; e += 4)
						b[c + e >>> 2] = d[e >>> 2];
				else
					b.push.apply(b, d);
				this.sigBytes += a;
				return this
			}, clamp: function() {
				var a = this.words, b = this.sigBytes;
				a[b >>> 2] &= 4294967295 <<
						32 - 8 * (b % 4);
				a.length = h.ceil(b / 4)
			}, clone: function() {
				var a = f.clone.call(this);
				a.words = this.words.slice(0);
				return a
			}, random: function(a) {
				for (var b = [], d = 0; d < a; d += 4)
					b.push(4294967296 * h.random() | 0);
				return new j.init(b, a)
			}}), m = k.enc = {}, s = m.Hex = {stringify: function(a) {
				var b = a.words;
				a = a.sigBytes;
				for (var d = [], c = 0; c < a; c++) {
					var e = b[c >>> 2] >>> 24 - 8 * (c % 4) & 255;
					d.push((e >>> 4).toString(16));
					d.push((e & 15).toString(16))
				}
				return d.join("")
			}, parse: function(a) {
				for (var b = a.length, d = [], c = 0; c < b; c += 2)
					d[c >>> 3] |= parseInt(a.substr(c,
							2), 16) << 24 - 4 * (c % 8);
				return new j.init(d, b / 2)
			}}, p = m.Latin1 = {stringify: function(a) {
				var b = a.words;
				a = a.sigBytes;
				for (var d = [], c = 0; c < a; c++)
					d.push(String.fromCharCode(b[c >>> 2] >>> 24 - 8 * (c % 4) & 255));
				return d.join("")
			}, parse: function(a) {
				for (var b = a.length, d = [], c = 0; c < b; c++)
					d[c >>> 2] |= (a.charCodeAt(c) & 255) << 24 - 8 * (c % 4);
				return new j.init(d, b)
			}}, t = m.Utf8 = {stringify: function(a) {
				try {
					return decodeURIComponent(escape(p.stringify(a)))
				} catch (b) {
					throw Error("Malformed UTF-8 data");
				}
			}, parse: function(a) {
				return p.parse(unescape(encodeURIComponent(a)))
			}},
		q = l.BufferedBlockAlgorithm = f.extend({reset: function() {
				this._data = new j.init;
				this._nDataBytes = 0
			}, _append: function(a) {
				"string" == typeof a && (a = t.parse(a));
				this._data.concat(a);
				this._nDataBytes += a.sigBytes
			}, _process: function(a) {
				var b = this._data, d = b.words, c = b.sigBytes, e = this.blockSize, f = c / (4 * e), f = a ? h.ceil(f) : h.max((f | 0) - this._minBufferSize, 0);
				a = f * e;
				c = h.min(4 * a, c);
				if (a) {
					for (var g = 0; g < a; g += e)
						this._doProcessBlock(d, g);
					g = d.splice(0, a);
					b.sigBytes -= c
				}
				return new j.init(g, c)
			}, clone: function() {
				var a = f.clone.call(this);
				a._data = this._data.clone();
				return a
			}, _minBufferSize: 0});
		l.Hasher = q.extend({cfg: f.extend(), init: function(a) {
				this.cfg = this.cfg.extend(a);
				this.reset()
			}, reset: function() {
				q.reset.call(this);
				this._doReset()
			}, update: function(a) {
				this._append(a);
				this._process();
				return this
			}, finalize: function(a) {
				a && this._append(a);
				return this._doFinalize()
			}, blockSize: 16, _createHelper: function(a) {
				return function(b, d) {
					return(new a.init(d)).finalize(b)
				}
			}, _createHmacHelper: function(a) {
				return function(b, d) {
					return(new u.HMAC.init(a,
							d)).finalize(b)
				}
			}});
		var u = k.algo = {};
		return k
	}(Math);

	(function() {
		var c = CryptoJS, k = c.enc.Utf8;
		c.algo.HMAC = c.lib.Base.extend({init: function(a, b) {
				a = this._hasher = new a.init;
				"string" == typeof b && (b = k.parse(b));
				var c = a.blockSize, e = 4 * c;
				b.sigBytes > e && (b = a.finalize(b));
				b.clamp();
				for (var f = this._oKey = b.clone(), g = this._iKey = b.clone(), h = f.words, j = g.words, d = 0; d < c; d++)
					h[d] ^= 1549556828, j[d] ^= 909522486;
				f.sigBytes = g.sigBytes = e;
				this.reset()
			}, reset: function() {
				var a = this._hasher;
				a.reset();
				a.update(this._iKey)
			}, update: function(a) {
				this._hasher.update(a);
				return this
			}, finalize: function(a) {
				var b =
						this._hasher;
				a = b.finalize(a);
				b.reset();
				return b.finalize(this._oKey.clone().concat(a))
			}})
	})();

	(function() {
		var h = CryptoJS, j = h.lib.WordArray;
		h.enc.Base64 = {stringify: function(b) {
				var e = b.words, f = b.sigBytes, c = this._map;
				b.clamp();
				b = [];
				for (var a = 0; a < f; a += 3)
					for (var d = (e[a >>> 2] >>> 24 - 8 * (a % 4) & 255) << 16 | (e[a + 1 >>> 2] >>> 24 - 8 * ((a + 1) % 4) & 255) << 8 | e[a + 2 >>> 2] >>> 24 - 8 * ((a + 2) % 4) & 255, g = 0; 4 > g && a + 0.75 * g < f; g++)
						b.push(c.charAt(d >>> 6 * (3 - g) & 63));
				if (e = c.charAt(64))
					for (; b.length % 4; )
						b.push(e);
				return b.join("")
			}, parse: function(b) {
				var e = b.length, f = this._map, c = f.charAt(64);
				c && (c = b.indexOf(c), -1 != c && (e = c));
				for (var c = [], a = 0, d = 0; d <
						e; d++)
					if (d % 4) {
						var g = f.indexOf(b.charAt(d - 1)) << 2 * (d % 4), h = f.indexOf(b.charAt(d)) >>> 6 - 2 * (d % 4);
						c[a >>> 2] |= (g | h) << 24 - 8 * (a % 4);
						a++
					}
				return j.create(c, a)
			}, _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="}
	})();

	(function() {
		var k = CryptoJS, b = k.lib, m = b.WordArray, l = b.Hasher, d = [], b = k.algo.SHA1 = l.extend({_doReset: function() {
				this._hash = new m.init([1732584193, 4023233417, 2562383102, 271733878, 3285377520])
			}, _doProcessBlock: function(n, p) {
				for (var a = this._hash.words, e = a[0], f = a[1], h = a[2], j = a[3], b = a[4], c = 0; 80 > c; c++) {
					if (16 > c)
						d[c] = n[p + c] | 0;
					else {
						var g = d[c - 3] ^ d[c - 8] ^ d[c - 14] ^ d[c - 16];
						d[c] = g << 1 | g >>> 31
					}
					g = (e << 5 | e >>> 27) + b + d[c];
					g = 20 > c ? g + ((f & h | ~f & j) + 1518500249) : 40 > c ? g + ((f ^ h ^ j) + 1859775393) : 60 > c ? g + ((f & h | f & j | h & j) - 1894007588) : g + ((f ^ h ^
							j) - 899497514);
					b = j;
					j = h;
					h = f << 30 | f >>> 2;
					f = e;
					e = g
				}
				a[0] = a[0] + e | 0;
				a[1] = a[1] + f | 0;
				a[2] = a[2] + h | 0;
				a[3] = a[3] + j | 0;
				a[4] = a[4] + b | 0
			}, _doFinalize: function() {
				var b = this._data, d = b.words, a = 8 * this._nDataBytes, e = 8 * b.sigBytes;
				d[e >>> 5] |= 128 << 24 - e % 32;
				d[(e + 64 >>> 9 << 4) + 14] = Math.floor(a / 4294967296);
				d[(e + 64 >>> 9 << 4) + 15] = a;
				b.sigBytes = 4 * d.length;
				this._process();
				return this._hash
			}, clone: function() {
				var b = l.clone.call(this);
				b._hash = this._hash.clone();
				return b
			}});
		k.SHA1 = l._createHelper(b);
		k.HmacSHA1 = l._createHmacHelper(b)
	})();
}