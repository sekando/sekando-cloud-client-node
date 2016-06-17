'use strict';
const EventEmitter = require('events')

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
    try {
      this.poll()
    }
    catch(e){
      console.log(e)
    }
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
    const requestOptions = {
      uri: path,
      headers: {
        'x-no-compression': '1'
      }
    }
    const req = self.client.request(requestOptions)
    const buffers = []
    let reqTimeout = setTimeout(function(){
      req.abort()
      finish()
    },10000)
    req.on('response',function(res){
      res.on('data',function(data){
        if(data.toString() != ' '){
          buffers.push(data)
        }
        clearTimeout(reqTimeout)
        reqTimeout = setTimeout(function(){
          req.abort()
        },10000)
      })
      res.on('end',function(data){
        if(data){
          buffers.push(data)
        }
        const json = Buffer.concat(buffers)
        try {
          const data = JSON.parse(json)
          const diff = Date.now() - pollStart
          console.log(diff)
          console.log(data)
          if(data.date){
            self.emit('change')
            self.ackMessage(data.ackId)
              .then(function(){})
          }
        }
        catch(e){
        }
        finish()
      })
    })
    let finish = function(){
      finish = function(){}
      process.nextTick(function(){
        self.poll()
      })
    }
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