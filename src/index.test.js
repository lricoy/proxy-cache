'use strict';

import {expect} from  'chai';
import {Cache} from './index';

describe('proxy-cache', function () {

    var cache;

    describe('Cache', function () {

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
    });

});
