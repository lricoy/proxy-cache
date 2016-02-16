"use strict";
let proxyCount = 0;
let proxies = {};

import {Cache} from './cache';
import {Proxy} from './proxy';

module.exports = {Proxy:Proxy, Cache: Cache};

