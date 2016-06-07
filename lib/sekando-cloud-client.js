'use strict';

const fetch = require('node-fetch')
const uuid = require('node-uuid')
const request = require('request')

const ClusterManager = require('./cluster-manager/cluster-manager')

const apiRoot = process.env.SEKANDO_API_ROOT
  || 'https://api.sekando.com/api/v1'

class SekandoCloudClient {
  constructor(_options){
    const options = _options
    
    this.apiKey = options.apiKey
    this.apiSecret = options.apiSecret
    this.projectId = options.projectId
    this.id = options.id || uuid.v4()
    
    this.request = request.defaults({
      baseUrl: apiRoot + '/projects/' + this.projectId,
      headers: {
        'x-api-key': this.apiKey,
        'x-api-secret': this.apiSecret
      }
    })
  }
  
  fetch () {
    return fetch.apply(null,arguments)
  }
  
  fetchApi(path,_options){
    const url = apiRoot + '/projects/' + this.projectId + path
    const options = _options || {}
    options.headers = options.headers || {}
    options.headers['x-api-key'] = this.apiKey
    options.headers['x-api-secret'] = this.apiSecret
    return this.fetch(url,options).then(function(response){
      if(response.status != '200'){
        return this.rejectResponse(response)
      }
      return Promise.resolve(response)
    }.bind(this))
  }
  
  fetchApiJson(path,options){
    return this.fetchApi(path,options)
      .then(function(response){
        return response.json()
      })
  }
  
  clusterManager() {
    if(!this._clusterManager){
      this._clusterManager = new ClusterManager({
        client: this
      })
    }
    return this._clusterManager
  }
  rejectResponse(response) {
    const err = new Error()
    err.response = response
    err.status = response.status
    return response.json()
      .then(function(data){
        err.responseBody = data
        return Promise.reject(err)
      })
  }
}

module.exports = SekandoCloudClient