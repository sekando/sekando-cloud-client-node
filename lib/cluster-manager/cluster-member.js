'use strict';

const EventEmitter = require('events')

const ClusterMemberUpdateSubscriber = require('./cluster-member-update-subscriber')

class ClusterMember extends EventEmitter {
  constructor(_options) {
    super()
    const options = _options || {}
    this.id = options.id
    this.created = options.created
    this.modified = options.modified
    this.metadata = options.metadata
    this.cluster = options.cluster
  }
  
  on(eventName,callback) {
    if(eventName == 'change'){
      if(!this.subscriber){
        this.subscriber = ClusterMemberUpdateSubscriber.getSubscriber(
          this.cluster.manager.client,
          this.cluster.id,
          this.id
        )
        this.subscriber.on('change',function(){
          this.get()
          .then(function(){
            setImmediate(function(){
              this.emit('change')
            }.bind(this))
          }.bind(this))
        }.bind(this))
        this.startPolling()
      }
    }
    return super.on.apply(this,arguments)
  }
  
  get() {
    const path = '/clusters/'
      + this.cluster.id
      + '/members/'
      + this.id
    return this.cluster.manager.client.fetchApiJson(path)
      .then(function(data){
        this.created = data.created
        this.modified = data.modified
        this.metadata = data.metadata
        return Promise.resolve(this)
      }.bind(this))
  }
  
  startPolling() {
    const oldModified = this.modified
    return this.get()
      .then(function(){
        if(oldModified != this.modified){
          this.emit('change')
          return this.startPolling()
        }
        return this.subscriber.startPolling()
      }.bind(this))
  }
  
  setMetadata(metadata) {
    const path = '/clusters/'
      + this.cluster.id
      + '/members/'
      + this.id
      + '/set_metadata'
    const fetchOptions = {
      method: 'post',
      body: metadata,
      headers: {
        'content-type': 'text/plain'
      }
    }
    return this.cluster.manager.client.fetchApiJson(path,fetchOptions)
      .then(function(){
        return Promise.resolve(this)
      }.bind(this))
  }
}

module.exports = ClusterMember