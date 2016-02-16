"use strict";

var _cache = require('./cache');

var _proxy = require('./proxy');

var proxyCount = 0;
var proxies = {};

module.exports = { Proxy: _proxy.Proxy, Cache: _cache.Cache };