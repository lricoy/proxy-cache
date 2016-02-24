let singletonInstance = null;

/**
 * Represents a Bucket.
 * A Bucket can hold multiple proxies in a similar way to a cache
 * The main purpose of the Bucket is to be a simple way to access proxies
 * shared throught the application
 */
class Bucket {

  constructor(){
    this.proxies = {};
    this.count = 0;
  }

  /**
   * Gets the reference to a given proxy
   * @param  {String} key The key to find the Proxy. Usually the endpoint address. e.g: 'job'
   * @return {Proxy} The proxy instance
   */
  getProxy (key) {
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
  hasProxy (key) {
    return this.getProxy(key) !== null;
  }

  /**
   * Add a proxy instance to the hash.
   * @param  {String} key The key to use in the hash
   * @param  {Proxy} proxy The proxy instance
   * @return {void}
   */
  addProxy (key, proxy) {
    if(this.getProxy(key) === null){
      this.proxies[key] = proxy;
      this.count += 1;
    }
    else {
      console.warn('Proxy instance already exists. No action taken.');
    }
  }

  /**
   * Gets a *singleton* Bucket Instance for commodity
   * @returns {Bucket}
   * @static
   */
  static getSingleton() {
    if(!singletonInstance) {
      singletonInstance = new Bucket();
    }
    return singletonInstance;
  }

}

export default Bucket;
