"use strict";
Object.defineProperty(exports, '__esModule', {
  value: true
});

var _cache = require('./cache');

var _proxy = require('./proxy');

var proxyCount = 0;
var proxies = {};

exports.Proxy = _proxy.Proxy;
exports.Cache = _cache.Cache;