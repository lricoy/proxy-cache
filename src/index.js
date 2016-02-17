"use strict";
let proxyCount = 0;
let proxies = {};

// Import the external files
import {Cache} from './cache';
import {Proxy} from './proxy';

module.exports = {Proxy:Proxy, Cache: Cache};

