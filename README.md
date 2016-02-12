# Proxy-Cache
A simple singleton and proxy pattern approach to maintain a single customizable collection in the whole app

[![Travis](https://img.shields.io/travis/lricoy/proxy-cache.svg?style=flat-square)](https://travis-ci.org/lricoy/proxy-cache)
[![Codecov](https://img.shields.io/codecov/c/github/lricoy/proxy-cache.svg?style=flat-square)](https://codecov.io/github/lricoy/proxy-cache)
[![npm](https://img.shields.io/npm/v/collection-sync-cache.svg?style=flat-square)](https://www.npmjs.com/package/collection-sync-cache)

## Installation

  ```npm install collection-sync-cache --save``` 

## Usage

  ```javascript
  import {Cache} from 'collection-sync-cache';
  let cache = new Cache();
  cache.syncObj({_id:1});
  ```
      
## Middlewares

#### Pre Sync
  ```javascript
  cache.preSync((obj) => {
     obj.customState = 'custom';
  });
  cache.syncObj({_id:1});
  ``` 
  > {_id: 1, customState: 'custom'}
  
#### Post Sync
  ```javascript
  cache.postSynch((obj) => {
     console.log(`Just synched obj with _id ${obj._id}`);
  });
  cache.syncObj({_id:1});
  ```
  > Output: 'Just synched obj with _id 1
      
      
## Tests

  ```npm run test``` 

## Contributing

Take care to maintain the existing coding style. (Unless is shitty, It may be. Please tell me so)
Add unit tests for any new or changed functionality. Lint and test your code. If I could do it, so can you.
Use commitzen to commit. aka ```npm run commit``` 
