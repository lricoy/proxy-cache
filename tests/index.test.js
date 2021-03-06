'use strict';

import * as chai from 'chai';
import {Promise} from 'when';
import {Cache} from './../src/cache';
import {Proxy} from './../src/proxy';
import Bucket from './../src/bucket';

// Define expect
let expect = chai.expect;

// Tell chai to use sionChai
let sinon = require('sinon');
let sinonChai = require('sinon-chai');
chai.use(sinonChai);

describe('Cache', function () {
    let cache;

    beforeEach(function() {
        // runs before each test in this block
        cache = new Cache();
        expect(cache.getObjList().length).to.equal(0);
    });

    it('should be an object', () => {
        expect(cache).to.be.a('object');
    });

    it('should instantiate without the need to use `new`', () => {
        expect(Cache()).to.be.instanceOf(Cache);
    });

    it('should start with a empty list', () => {
        expect(cache.getObjList()).to.be.a('array');
        expect(cache.getObjList().length).to.equal(0);
    });

    it('should start with a empty hash', () => {
        expect(cache.getObjHash()).to.be.a('object');
        expect(Object.keys(cache.getObjHash()).length).to.equal(0);
    });

    describe('.getObjList', () => {
        it('should return an array', () => {
            expect(cache.getObjList()).to.be.instanceOf(Array);
            expect(cache.getObjList().length).to.equal(0);
        });
    });

    describe('.syncObj', () => {

        it('should cache a new object to the list and hash', () => {
            cache.syncObj({_id: 1});
            expect(cache.getObjList().length).to.equal(1);
            expect(cache.getObj(1)._id).to.equal(1);
            expect(Object.keys(cache.getObjHash()).length).to.equal(1);
        });

        it('should not append the same object to the list and hash', () => {
            cache.syncObj({_id: 1});
            expect(cache.getObjList().length).to.equal(1);
            expect(cache.getObj(1)._id).to.equal(1);

            cache.syncObj({_id: 1, name:'Lucas'});
            expect(cache.getObjList().length).to.equal(1);
            expect(cache.getObj(1)._id).to.equal(1);
            expect(cache.getObj(1).name).to.equal('Lucas');
            expect(Object.keys(cache.getObjHash()).length).to.equal(1);
        });

    });

    describe('.removeObj', () => {
        it('should remove an object from the list and hash', () => {
            cache.syncObj({_id: 1});
            cache.removeObj({_id: 1});
            expect(cache.getObjList().length).to.equal(0);
            expect(Object.keys(cache.getObjHash()).length).to.equal(0);
        });

        it('should do nothing if removing an unexisting object', () => {
            cache.removeObj({_id: 1});
            cache.removeObj();
            expect(cache.getObjList().length).to.equal(0);
            expect(Object.keys(cache.getObjHash()).length).to.equal(0);
        });

        it('should remove the item at the correct index', () => {
            cache.syncMultipleObjs([{_id: 1}, {_id: 2}, {_id: 3}]);
            cache.removeObj({_id: 2});
            expect(cache.getObjList().length).to.equal(2);
            expect(Object.keys(cache.getObjHash()).length).to.equal(2);
            expect(cache.getObj(1)._id).to.equal(1);
            expect(cache.getObj(2)).to.equal(undefined);
            expect(cache.getObj(3)._id).to.equal(3);
        });
    });

    describe('.syncMultipleObjs', () => {

        it('should sync multiple objects', () => {
            cache.syncMultipleObjs([{_id: 1}, {_id: 2}, {_id: 3}]);

            expect(cache.getObjList().length).to.equal(3);
            expect(Object.keys(cache.getObjHash()).length).to.equal(3);
        });

        it('should not append the same object in a array', () => {
            cache.syncMultipleObjs([{_id: 1}, {_id: 2}, {_id: 3}, {_id: 1}]);

            expect(cache.getObjList().length).to.equal(3);
            expect(Object.keys(cache.getObjHash()).length).to.equal(3);
        });

        it('should use the pre and post middlewares', () => {
            cache.preSync(x => { x.customState = 'custom'; return x; });
            cache.postSync(x => expect(x.customState).to.equal('custom'));

            cache.syncMultipleObjs([{_id: 1}, {_id: 2}, {_id: 3}, {_id: 1}]);

            expect(cache.getObjList().length).to.equal(3);
            expect(Object.keys(cache.getObjHash()).length).to.equal(3);
        });

        it('should NOT use the pre middleware', () => {
            cache.preSync(x => { x.customState = 'custom'; return x; });
            cache.postSync(x => expect(x.customState).to.equal(undefined));

            cache.syncMultipleObjs([{_id: 1}, {_id: 2}, {_id: 3}, {_id: 1}], {usePre: false, usePost: true});

            expect(cache.getObjList().length).to.equal(3);
            expect(Object.keys(cache.getObjHash()).length).to.equal(3);
        });

        it('should NOT use the pre and post middlewares', () => {
            cache.preSync(x => { x.customState = 'custom'; return x; }); // Wont hit
            cache.postSync(x => expect(x.customState).to.equal('custom')); // Wont hit

            cache.syncMultipleObjs([{_id: 1}, {_id: 2}, {_id: 3}, {_id: 1}], {usePre: false, usePost: false});

            expect(cache.getObjList().length).to.equal(3);
            expect(Object.keys(cache.getObjHash()).length).to.equal(3);
        });

    });

    describe('.clear', () => {

        it('should clear the whole cache', () => {
            cache.syncMultipleObjs([{_id: 1}, {_id: 2}, {_id: 3}]);

            expect(cache.getObjList().length).to.equal(3);
            expect(Object.keys(cache.getObjHash()).length).to.equal(3);

            cache.clear();

            expect(cache.getObjList().length).to.equal(0);
            expect(Object.keys(cache.getObjHash()).length).to.equal(0);
        });


    });

    describe('.preSync', () => {
        it('should modify the object on a preSync middleware',() => {
            cache.preSync(function(obj) {
                obj.state = 'custom';
                return obj;
            });
            cache.syncObj({_id: 1});

            expect(cache.getObj(1).state).to.equal('custom');
        });

        it('should modify the object on multiple preSync middlewares', () => {
            cache.preSync(function(obj) {
                obj.state = 'custom';
                return obj;
            });
            cache.preSync(function(obj) {
                obj.currentDate = new Date();
                return obj;
            });
            cache.syncObj({_id: 1});

            expect(cache.getObj(1).state).to.equal('custom');
            expect(cache.getObj(1).currentDate).to.be.a('Date');
        });
    });

    describe('.postSync', () => {
        it('should notify a postSync event', () => {
            cache.postSync((obj) => {
                expect(obj._id).to.equal(1);
            });
            cache.syncObj({_id: 1});
        });

        it('should notify a postSync event after a preSync modifier', () => {
            cache.preSync(function(obj) {
                obj.state = 'custom';
                return obj;
            });

            cache.postSync((obj) => {
                expect(obj._id).to.equal(1);
                expect(obj.state).to.equal('custom');
            });
            cache.syncObj({_id: 1});
        });
    });

});

describe('Proxy', () => {
    let proxy, resourceFetcher, socket;

    beforeEach(function() {
        // runs before each test in this block

        // Mocks the resource Fetcher
        resourceFetcher = {
          query: (options) => {
              return {
                  $promise: {
                      then: function (cb) {
                          cb([{_id: 1}, {_id:2}]);
                      }
                  }
              }
          },
            get: (options) => {
                return {
                    $promise: {
                        then: function (cb) {
                            cb({_id: 1});
                        }
                    }
                }
            }
        };

        // Mocks the socket
        socket = {
            cbs: [],
            on: function(evName, cb){ this.cbs.push({ evName: evName, cb:cb}); },
            emit: function(evName, obj) { this.cbs.map(f => { if(evName === f.evName) f.cb(obj) }); }
        };

        // Creates a brand-new proxy
        proxy = new Proxy(resourceFetcher);
    });

    it('should instantiate a object of type Proxy', () => {
       expect(proxy).to.be.a('object');
        expect(proxy).to.be.an.instanceOf(Proxy);
    });

    it('should instantiate without the need to use `new`', function(){
        expect(Proxy()).to.be.instanceOf(Proxy);
    });

    it('should have a cache', () => {
        expect(proxy.cache).to.be.a('object');
        expect(proxy.cache).to.be.an.instanceOf(Cache);
    });

    describe('#options socket', () => {
        it('should assign a socket with the modelName if one is passed', () => {
            let newProxy = new Proxy(resourceFetcher, {
                socket: {
                    modelName: 'test',
                    socket: socket
                }
            });
            expect(newProxy.socket).to.be.a('object');
        });

        it('should sync a object to the cache after a socket.emit()', () => {
            let newProxy = new Proxy(resourceFetcher, {
                socket: {
                    modelName: 'test',
                    socket: socket
                }
            });
            socket.emit('test:save', {_id: 1});
            expect(newProxy.cache.getObjList().length).to.equal(1);
        });

        it('should not push the same _id even from the socket', () => {
            let newProxy = new Proxy(resourceFetcher, {
                socket: {
                    modelName: 'test',
                    socket: socket
                }
            });
            socket.emit('test:save', {_id: 1});
            socket.emit('test:save', {_id: 2});
            socket.emit('test:save', {_id: 3});
            socket.emit('test:save', {_id: 1});
            expect(newProxy.cache.getObjList().length).to.equal(3);
        });

        it('should remove the object if socket:remove', () => {
            let newProxy = new Proxy(resourceFetcher, {
                socket: {
                    modelName: 'test',
                    socket: socket
                }
            });
            socket.emit('test:save', {_id: 1});
            socket.emit('test:remove', {_id: 1});
            expect(newProxy.cache.getObjList().length).to.equal(0);
        });

    });


    describe('.query', () => {

        // This will only be a mock. The resource Fetcher is the one responsbile for the tests.
        it('should query using the assigned resource fetcher', () => {
            return proxy.query().then((objs) => {
                expect(proxy.cache.getObjList().length).to.equal(2);
            });
        });

        it('should return a promise', () => {
            expect(proxy.query()).to.be.instanceOf(Promise);
        });


    });

    describe('.findOneById', () => {

        // This will only be a mock. The resource Fetcher is the one responsbile for the tests.
        it('should query a single item if new', () => {
            return proxy.findOneById(1).then((obj) => {
                expect(obj._id).to.equal(1);
            });
        });

        it('should not query undefined items', () => {
            return proxy.findOneById().then((obj) => {
                expect(obj).to.equal(null);
            });
        });

        it('should not query null items', () => {
            return proxy.findOneById(null).then((obj) => {
                expect(obj).to.equal(null);
            });
        });

        it('Should not query for a existing item', () => {
            var mock = sinon.spy(proxy.resourceFetcher.get);

            proxy.cache.syncObj({_id:1});
            return proxy.findOneById(1).then((obj) => {
                expect(obj._id).to.equal(1);
                expect(mock).to.have.callCount(0);
            });

        });

        it('should return a promise', () => {
            expect(proxy.findOneById()).to.be.instanceOf(Promise);
        });


    });

});
describe('Bucket', () => {

  let bucket;

  beforeEach(function() {
    bucket = new Bucket();
  });

  it('should add a new proxy to the Bucket', () =>{
    let proxy = new Proxy();
    bucket.addProxy('myProxy', proxy);

    expect(bucket.hasProxy('myProxy')).to.equal(true);
  });

  it('should not overwrite an existing proxyt', () =>{
    let proxy = new Proxy();
    bucket.addProxy('myProxy', proxy);
    bucket.addProxy('myProxy', proxy);

    expect(bucket.hasProxy('myProxy')).to.equal(true);
    expect(bucket.count).to.equal(1);
  });

  it('should return the proxy by reference', () =>{
    let proxy = new Proxy();
    bucket.addProxy('myProxy', proxy);

    expect(bucket.hasProxy('myProxy')).to.equal(true);
    expect(bucket.getProxy('myProxy')).to.equal(proxy);
  });

  it('should not share proxies between buckets instances', () =>{
    let proxy, proxy2, bucket2;
    proxy = new Proxy();
    proxy2 = new Proxy();
    bucket2 = new Bucket();

    bucket.addProxy('myProxy', proxy);
    bucket2.addProxy('myProxy', proxy);
    bucket2.addProxy('myProxy2', proxy2);

    expect(bucket.hasProxy('myProxy')).to.equal(true);
    expect(bucket.getProxy('myProxy')).to.equal(proxy);
    expect(bucket.hasProxy('myProxy2')).to.equal(false);
    expect(bucket.count).to.equal(1);

    expect(bucket2.hasProxy('myProxy')).to.equal(true);
    expect(bucket2.getProxy('myProxy')).to.equal(proxy);
    expect(bucket2.hasProxy('myProxy2')).to.equal(true);
    expect(bucket2.getProxy('myProxy2')).to.equal(proxy2);
    expect(bucket2.count).to.equal(2);
  });

  it('should export a singleton instance from a static method', () => {
    let bucket1, bucket2, proxy;

    proxy = new Proxy();
    bucket1 = Bucket.getSingleton();
    bucket2 = Bucket.getSingleton();
    bucket1.addProxy('myProxy', proxy);

    expect(bucket1).to.equal(bucket2);
    expect(bucket1.count).to.equal(1);
    expect(bucket2.count).to.equal(1);
  });

});
