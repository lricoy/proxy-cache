'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _cache = require('./cache');

var _when = require('when');

var when = _interopRequireWildcard(_when);

var _whenFunction = require('when/function');

var fn = _interopRequireWildcard(_whenFunction);

var proxyCount = 0;
/**
 * Builds an generic Proxy that has an internal caching mechanism
 * @param  {Resource} resourceService The angular $resource or equivalent to fetch the external data
 * @param  {Object} options Options that describe how to build the proxy
 * Current options:
 * {Object} socket: {
 *   modelName: {String},
 *   socket: {Object} Socket event emitter/receiver
 * }
 */
function Proxy(resourceService, options) {
    var _this = this;

    if ('undefined' === typeof options) {
        options = {};
    }

    if (!(this instanceof Proxy)) {
        return new Proxy(resourceService, options);
    }

    var self = this;
    this.cache = new _cache.Cache();
    this.resourceFetcher = resourceService;
    this.proxyId = proxyCount++;

    if ('undefined' !== typeof options.socket) {
        this.socket = options.socket.socket;
        this.socket.on(options.socket.modelName + ':save', function (obj) {
            _this.cache.syncObj(obj);
        });
        this.socket.on(options.socket.modelName + ':remove', function (obj) {
            _this.cache.removeObj(obj);
        });
    }

    this.query = function (options) {

        return when.promise(function (resolve, reject) {

            _this.resourceFetcher.query(options).$promise.then(function (objs) {
                self.cache.syncMultipleObjs(objs);
                resolve(self.cache);
            });
        });
    };

    this.findOneById = function (id) {
        if (null === id || 'undefined' === typeof id) {
            return fn.call(function () {
                return null;
            });
        }

        var objFound = _this.cache.getObj(id);

        return when.promise(function (resolve, reject) {

            if ('undefined' === typeof objFound) {
                _this.resourceFetcher.get({ id: id }).$promise.then(function (_obj) {
                    self.cache.syncObj(_obj);
                    resolve(_obj);
                });
            } else {
                resolve(objFound);
            }
        });
    };

    // TO-DO: Add socket synchronization, filter options and onSync() exports
}

exports.Proxy = Proxy;