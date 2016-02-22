'use strict';

import * as chai from 'chai';
import {Promise} from 'when';
import {Cache} from './../src/cache';
import {Proxy} from './../src/proxy';

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

    it('should be an object', function(){
        expect(cache).to.be.a('object');
    });

    it('should instantiate without the need to use `new`', function(){
        expect(Cache()).to.be.instanceOf(Cache);
    });

    it('should start with a empty list', function(){
        expect(cache.getObjList()).to.be.a('array');
        expect(cache.getObjList().length).to.equal(0);
    });

    it('should start with a empty hash', function(){
        expect(cache.getObjHash()).to.be.a('object');
        expect(Object.keys(cache.getObjHash()).length).to.equal(0);
    });

    it('should cache a new object to the list and hash', function(){
        cache.syncObj({_id: 1});
        expect(cache.getObjList().length).to.equal(1);
        expect(cache.getObj(1)._id).to.equal(1);
        expect(Object.keys(cache.getObjHash()).length).to.equal(1);
    });

    it('should not append the same object to the list and hash', function(){
        cache.syncObj({_id: 1});
        expect(cache.getObjList().length).to.equal(1);
        expect(cache.getObj(1)._id).to.equal(1);

        cache.syncObj({_id: 1, name:'Lucas'});
        expect(cache.getObjList().length).to.equal(1);
        expect(cache.getObj(1)._id).to.equal(1);
        expect(cache.getObj(1).name).to.equal('Lucas');
        expect(Object.keys(cache.getObjHash()).length).to.equal(1);
    });

    it('should remove an object from the list and hash', function(){
        cache.syncObj({_id: 1});
        cache.removeObj({_id: 1});
        expect(cache.getObjList().length).to.equal(0);
        expect(Object.keys(cache.getObjHash()).length).to.equal(0);
    });

    it('should do nothing if removing an unexisting object', function(){
        cache.removeObj({_id: 1});
        expect(cache.getObjList().length).to.equal(0);
        expect(Object.keys(cache.getObjHash()).length).to.equal(0);
    });

    it('should sync multiple objects', function(){
        cache.syncMultipleObjs([{_id: 1}, {_id: 2}, {_id: 3}]);

        expect(cache.getObjList().length).to.equal(3);
        expect(Object.keys(cache.getObjHash()).length).to.equal(3);
    });

    it('should not append the same object in a array', function(){
        cache.syncMultipleObjs([{_id: 1}, {_id: 2}, {_id: 3}, {_id: 1}]);

        expect(cache.getObjList().length).to.equal(3);
        expect(Object.keys(cache.getObjHash()).length).to.equal(3);
    });

    it('should modify the object on a preSync middleware', function(){
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


