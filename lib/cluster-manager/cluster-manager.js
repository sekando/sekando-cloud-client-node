'use strict';

const fetch = require('node-fetch')
const Cluster = require('./cluster')

class ClusterManager {
  constructor(_options) {
    const options = _options || {}
    this.client = options.client
  }
  
  clusterWithId(id){
    const cluster = new Cluster({
      id: id,
      manager: this
    })
    return cluster
  }
}

module.exports = ClusterManager