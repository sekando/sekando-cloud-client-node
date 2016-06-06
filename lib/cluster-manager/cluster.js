'use strict';

const ClusterMember = require('./cluster-member')

class Cluster {
  constructor(_options){
    const options = _options || {}
    
    this.id = options.id
    this.manager = options.manager
  }
  
  get() {
    const path = '/clusters/'+this.id
    return this.manager.client.fetchApiJson(path)
      .then(function(data){
        if(data){
          this.created = data.created
          this.modified = data.modified
        }
        return Promise.resolve(this)
      }.bind(this))
  }
  
  getMembers() {
    const path = '/clusters/'+this.id+'/members'
    return this.manager.client.fetchApiJson(path)
      .then(function(membersData){
        const retval = []
        membersData.forEach(function(memberData){
          memberData.cluster = this
          const member = new ClusterMember(memberData)
          member.cluster = this
          retval.push(member)
        }.bind(this))
        return Promise.resolve(retval)
      }.bind(this))
  }
}

module.exports = Cluster
  