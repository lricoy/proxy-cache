exports.Cache = Cache;

/**
 * Builds an object cache to hold a collection
 * @return {Cache}
 */
function Cache () {

    if (!(this instanceof Cache)) {
        return new Cache();
    }

    let self = this;
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
    this.preSync = (func) => {
        this._pres.push(func);
    };

    this._posts = [];

    /**
     * Add a postSync function to be called after the object is synchronized
     * @param func
     */
    this.postSync = (func) => {
        this._posts.push(func);
    };


    /**
     * Sync a given job object to the list and hash
     *
     * @param {Object} objToSync The job Object to sync. Must have an _id.
     * @returns void
     */
    this.syncObj = function syncObj(objToSync) {

        // Apply the preSync middlewares
        this._pres.map((f) => { objToSync = f(objToSync); });

        // Check if the object already exists on the list
        if(typeof this._objs.hash[objToSync._id] !== 'undefined') {
            // Sanity check to maintain the __index. TO-DO: Find the index if undefined
            objToSync.__index = this._objs.hash[objToSync._id].__index;
            this._objs.list[this._objs.hash[objToSync._id].__index] = objToSync;
        }
        else {
            objToSync.__index = this._objs.list.length;
            this._objs.list.push(objToSync);
        }

        // Add/Overwrite the object to the hash
        this._objs.hash[objToSync._id] = objToSync;

        // Apply the postSync middlewares
        this._posts.map((f) => { f(objToSync); });
    };

    /**
     * Removes a given job from the collections
     *
     * @param jobToRemove The job Object to remove. Must have an _id.
     * @returns void
     */
    this.removeObj = function removeObj(objToRemove){
        if(typeof this._objs.hash[objToRemove._id] !== 'undefined') {
            this._objs.list.splice(this._objs.hash[objToRemove.index], 1);
        }
        delete this._objs.hash[objToRemove._id];
    };

    /**
     * Sync multiple objs
     *
     * @param {Array} objsToSync Array of job Objects. Each must have an _id field.
     * @returns void
     */
    this.syncMultipleObjs = function syncMultipleObjs(objsToSync) {
        objsToSync.map((x) => {
            self.syncObj(x);
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
    this.getObjList = function getObjList(){
        return this._objs.list;
    };

    /**
     * Get the resource hash
     */
    this.getObjHash = function getObjHash(){
        return this._objs.hash;
    };

    // return this;
}

