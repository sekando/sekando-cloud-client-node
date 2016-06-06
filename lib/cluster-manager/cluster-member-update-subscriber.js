'use strict';
const EventEmitter = require('events')
const  FormData = require('form-data');

class ClusterMemberUpdateSubscriber extends EventEmitter {
  constructor(options) {
    super()
    this.clusterId = options.clusterId
    this.memberId = options.memberId
    this.client = options.client
  }
  
  startPolling() {
    if(this.started){
      return;
    }
    this.started = true
    this.pollingStartDate = Date.now() - 600000
    this.poll()
  }
  
  poll() {
    const self = this
    const path = '/clusters/'
      + self.clusterId
      + '/members/'
      + self.memberId
      + '/changes'
      + '?after_date='+self.pollingStartDate
      + '&subscriber_id='+self.client.id
    const pollStart = Date.now()
    console.log(path)
    const fetchOptions = {
      headers: {
        'x-no-compression': '1'
      }
    }
    self.client.fetchApiJson(path,fetchOptions)
      .then(function(json){
        const diff = Date.now() - pollStart
        console.log(diff)
        if(json.date){
          console.log(json)
          self.emit('change')
          return self.ackMessage(json.ackId)
        }
        return Promise.resolve()
      })
      .then(function(){
        return self.poll()
      })
      .catch(function(err){
        console.log(err)
        setTimeout(function(){
          self.poll()
        },1000)
      })
  }
  
  ackMessage(ackId) {
    const path = '/clusters/'
      + this.clusterId
      + '/members/'
      + this.memberId
      + '/ack_change_message'
      
    const fetchOptions = {
      method: 'post',
      headers:  {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ackId: ackId,
        subscriberId: this.client.id
      })
    }
    return this.client.fetchApiJson(path,fetchOptions)
  }
}

const clientClusters = {}

ClusterMemberUpdateSubscriber.getSubscriber = function(client,clusterId,memberId) {
  return getClientClusterMemberSubscriber(client,clusterId,memberId)
}

function getClientCluster(client,clusterId) {
  if(!clientClusters[client.id]){
    clientClusters[client.id] = {}
  }
  return clientClusters[client.id]
}

function getClientClusterMemberSubscribers(client,clusterId){
  const clientCluster = getClientCluster(client,clusterId)
  if(!clientCluster.memberSubscribers){
    clientCluster.memberSubscribers = {}
  }
  return clientCluster.memberSubscribers
}

function getClientClusterMemberSubscriber(client,clusterId,memberId){
  const memberSubscribers = getClientClusterMemberSubscribers(client,clusterId)
  if(!memberSubscribers[memberId]){
    memberSubscribers[memberId] = new ClusterMemberUpdateSubscriber({
      client: client,
      clusterId: clusterId,
      memberId: memberId
    })
  }
  return memberSubscribers[memberId]
}

module.exports = ClusterMemberUpdateSubscriber