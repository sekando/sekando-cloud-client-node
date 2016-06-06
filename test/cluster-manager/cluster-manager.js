var assert = require('assert')
var sinon = require('sinon')

const SekandoCloudClient = require(process.cwd())
console.log('foo',SekandoCloudClient)
const testClient = new SekandoCloudClient({
  apiKey: process.env.SEKANDO_API_KEY,
  apiSecret: process.env.SEKANDO_API_SECRET,
  projectId: process.env.SEKANDO_PROJECT_ID,
  id: 'test'
})
const testClusterManager = testClient.clusterManager()
const testClusterId = process.env.SEKANDO_TEST_CLUSTER_ID

const ClusterMember = require(process.cwd()+'/lib/cluster-manager/cluster-member')

describe('ClusterManager',function(){
  describe('Cluster',function(){
    describe('get',function(){
      it('should get existing cluster',function(){
        const cluster = testClusterManager.clusterWithId(testClusterId)
        return cluster.get()
          .then(function(){
            assert(!!cluster.created)
            assert(!!cluster.modified)
            assert(!!cluster.id)
          })
      })
      it('should work for cluster that does not exist',function(){
        const cluster = testClusterManager.clusterWithId('cluster'+Math.floor(Math.random()*10000000))
        return cluster.get()
          .then(function(){
            assert(!cluster.created)
          })
      })
    })
    describe('getMembers',function(){
      it('should get the cluster members',function(){
        const cluster = testClusterManager.clusterWithId(testClusterId)
        return cluster.getMembers()
          .then(function(members){
            assert(members.length > 0)
            assert(members[0] instanceof ClusterMember)
          })
      })
    })
  })
  describe('ClusterMember',function(){
    describe('get',function(){
      it('should work',function(){
        const cluster = testClusterManager.clusterWithId(testClusterId)
        return cluster.getMembers()
          .then(function(members){
            const member = members[0]
            delete member.created
            return member.get()
          }).then(function(member){
            assert(!!member.created)
          })
      })
    })
    describe('change event',function(){
      it('should be emitted when change happens',function(done){
        const cluster = testClusterManager.clusterWithId(testClusterId)
        cluster.getMembers()
          .then(function(members){
            const member = members[0]
            const newMetadata = String(Math.random()*1000000)
            member.once('change',function(){
              assert.equal(newMetadata,member.metadata)
              member.once('change',function(){
                assert.equal('yaay',member.metadata)
                done()
              })
              member.setMetadata('yaay').then(function(){
                console.log('ヽ(ﾟ∀ﾟ)ﾉ')
              })
            })
            member.setMetadata(newMetadata).then(function(){
              console.log('ヽ(ﾟ∀ﾟ)ﾉ')
            })
          })
      })
    })
  })
})