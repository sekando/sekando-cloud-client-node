var assert = require('assert')
var sinon = require('sinon')
const SekandoCloudClient = require('../lib/sekando-cloud-client')

describe('SekandoCloudClient',function(){
  describe('constructor',function(){
    it('should work',function(){
      const client = new SekandoCloudClient({
        apiKey: 'key',
        apiSecret: 'secret',
        projectId: 'my-project'
      })
      assert.equal(client.apiKey,'key')
      assert.equal(client.apiSecret,'secret')
      assert.equal(client.projectId,'my-project')
    })
  })
  describe('clusterManager',function(){
    it('should work',function(){
      const client = new SekandoCloudClient({
        apiKey: 'key',
        apiSecret: 'secret',
        projectId: 'my-project'
      })
      const clusterManager = client.clusterManager()
      assert.equal(clusterManager.client,client)
    })
  })
})