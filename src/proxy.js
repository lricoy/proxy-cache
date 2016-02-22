import {Cache} from './cache';
import * as when from 'when';

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
function Proxy(resourceService, options){
    if ('undefined' === typeof options) {
        options = {};
    }

    if (!(this instanceof Proxy)) {
        return new Proxy(resourceService, options);
    }

    let self = this;
    this.cache = new Cache();
    this.resourceFetcher = resourceService;
    this.proxyId = proxyCount++;

    if('undefined' !== typeof options.socket) {
        this.socket = options.socket.socket;
        this.socket.on(`${options.socket.modelName}:save`, obj => { this.cache.syncObj(obj) });
        this.socket.on(`${options.socket.modelName}:remove`, obj => { this.cache.removeObj(obj) });
    }

    this.query = (options) => {

        return when.promise((resolve, reject) => {

            this.resourceFetcher.query(options).$promise.then(objs => {
                self.cache.syncMultipleObjs(objs);
                resolve(self.cache);
            });

        });

    };

    this.findOneById = (id) => {
        let objFound = this.cache.getObj(id);

        return when.promise((resolve, reject) => {

            if('undefined' === typeof objFound) {
                this.resourceFetcher.get({id : id}).$promise.then(_obj => {
                    self.cache.syncObj(_obj);
                    resolve(_obj);
                });
            }
            else {
                resolve(objFound);
            }

        });


    };

    // TO-DO: Add socket synchronization, filter options and onSync() exports

}

export {Proxy};