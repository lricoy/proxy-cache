/**
 * Builds an object cache to hold a collection
 * @return {Cache}
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
function Cache() {
    var _this = this;

    if (!(this instanceof Cache)) {
        return new Cache();
    }

    var self = this;
    this._objs = {
        list: [],
        hash: {}
    };

    /**
     * Middlewares to handle pre and post sync operations
     */

    this._pres = [];
    /**
     * Add a preSync function to be applied on the objects
     * @param func Function that receives and return a single object
     */
    this.preSync = function (func) {
        _this._pres.push(func);
    };

    this._posts = [];

    /**
     * Add a postSync function to be called after the object is synchronized
     * @param func
     */
    this.postSync = function (func) {
        return _this._posts.push(func);
    };

    /**
     * Sync a given job object to the list and hash
     *
     * @param {Object} objToSync The job Object to sync. Must have an _id.
     * @param {Object} middlewareOptions An object containing the middleware options (pre,post)
     * @returns void
     */
    this.syncObj = function syncObj(objToSync, middlewareOptions) {
        if ('undefined' === typeof middlewareOptions) middlewareOptions = {};
        if ('undefined' === typeof middlewareOptions.usePre) middlewareOptions.usePre = true;
        if ('undefined' === typeof middlewareOptions.usePost) middlewareOptions.usePost = true;

        // Apply the preSync middlewares
        if (middlewareOptions.usePre) this._pres.map(function (f) {
            objToSync = f(objToSync);
        });

        // Check if the object already exists on the list
        if (typeof this._objs.hash[objToSync._id] !== 'undefined') {
            // Sanity check to maintain the __index. TO-DO: Find the index if undefined
            objToSync.__index = this._objs.hash[objToSync._id].__index;
            this._objs.list[this._objs.hash[objToSync._id].__index] = objToSync;
        } else {
            objToSync.__index = this._objs.list.length;
            this._objs.list.push(objToSync);
        }

        // Add/Overwrite the object to the hash
        this._objs.hash[objToSync._id] = objToSync;

        // Apply the postSync middlewares
        if (middlewareOptions.usePost) this._posts.map(function (f) {
            f(objToSync);
        });
    };

    /**
     * Removes a given job from the collections
     *
     * @param jobToRemove The job Object to remove. Must have an _id.
     * @returns void
     */
    this.removeObj = function removeObj(objToRemove) {
        if ('undefined' === typeof objToRemove) return;

        var existingObj = this.getObj(objToRemove._id);
        if (typeof existingObj !== 'undefined') {
            this._objs.list.splice(this._objs.hash[existingObj._id].__index, 1);
            delete this._objs.hash[existingObj._id];
        }
    };

    /**
     * Sync multiple objs
     *
     * @param {Array} objsToSync Array of job Objects. Each must have an _id field.
     * @param {Object} middlewareOptions An object containing the middleware options (pre,post)
     * @returns void
     */
    this.syncMultipleObjs = function syncMultipleObjs(objsToSync, middlewareOptions) {
        if ('undefined' === typeof middlewareOptions) middlewareOptions = {};
        if ('undefined' === typeof middlewareOptions.usePre) middlewareOptions.usePre = true;
        if ('undefined' === typeof middlewareOptions.usePost) middlewareOptions.usePost = true;

        objsToSync.map(function (x) {
            self.syncObj(x, middlewareOptions);
        });
    };

    /**
     * Gets a single job
     * @param  {String} objId The underlying _id of the object to get
     */
    this.getObj = function getObj(objId) {
        // console.log(jobId);
        // console.log(this._objs.hash);
        return this._objs.hash[objId];
    };

    /**
     * Get the resource list of objs
     */
    this.getObjList = function getObjList() {
        return this._objs.list;
    };

    /**
     * Get the resource hash
     */
    this.getObjHash = function getObjHash() {
        return this._objs.hash;
    };

    /**
     * Clears the entire cache
     *
     * @returns void
     */
    this.clear = function removeObj() {
        this._objs.list = [];
        this._objs.hash = {};
    };

    // return this;
}

exports.Cache = Cache;