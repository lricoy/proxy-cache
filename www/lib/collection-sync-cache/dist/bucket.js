'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var singletonInstance = null;

/**
 * Represents a Bucket.
 * A Bucket can hold multiple proxies in a similar way to a cache
 * The main purpose of the Bucket is to be a simple way to access proxies
 * shared throught the application
 */

var Bucket = (function () {
  function Bucket() {
    _classCallCheck(this, Bucket);

    this.proxies = {};
    this.count = 0;
  }

  /**
   * Gets the reference to a given proxy
   * @param  {String} key The key to find the Proxy. Usually the endpoint address. e.g: 'job'
   * @return {Proxy} The proxy instance
   */

  _createClass(Bucket, [{
    key: 'getProxy',
    value: function getProxy(key) {
      if (typeof this.proxies[key] !== 'undefined') {
        return this.proxies[key];
      }
      return null; // Not found
    }

    /**
     * Returns a boolean that is true if the bucket contains a proxy with the given key
     * @param key The key to check
     * @returns {boolean}
     */
  }, {
    key: 'hasProxy',
    value: function hasProxy(key) {
      return this.getProxy(key) !== null;
    }

    /**
     * Add a proxy instance to the hash.
     * @param  {String} key The key to use in the hash
     * @param  {Proxy} proxy The proxy instance
     * @return {void}
     */
  }, {
    key: 'addProxy',
    value: function addProxy(key, proxy) {
      if (this.getProxy(key) === null) {
        this.proxies[key] = proxy;
        this.count += 1;
      } else {
        console.warn('Proxy instance already exists. No action taken.');
      }
    }

    /**
     * Gets a *singleton* Bucket Instance for commodity
     * @returns {Bucket}
     * @static
     */
  }], [{
    key: 'getSingleton',
    value: function getSingleton() {
      if (!singletonInstance) {
        singletonInstance = new Bucket();
      }
      return singletonInstance;
    }
  }]);

  return Bucket;
})();

exports['default'] = Bucket;
module.exports = exports['default'];