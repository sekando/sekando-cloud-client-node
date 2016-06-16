# Sekando Cloud APIs Node.js client

This is the official Node.js client library for Sekando Cloud Services APIs

## Setup

Before getting started, you will need a Sekando Account and a project. You can sign up for free at <https://sekando.com/register>. Once you have an account and project, you can install the Node.js client from NPM: `npm install sekando-cloud-client`


## Usage

For examples, see [this repository](https://github.com/sekando/cluster-manager-digitalocean-example)

### SekandoCloudClient

A `SekandoCloudClient` is initialized with your API key and project ID. Cluster Manager and other APIs will use this object's configuration to authenticate requests.

````
const SekandoCloudClient = require('sekando-cloud-client')
const client = new SekandoCloudClient({
  apiKey: SEKANDO_API_KEY, /* required */
  apiSecret: SEKANDO_API_SECRET, /* required */
  projectId: SEKANDO_PROJECT_ID, /* required */
  id: MACHINE_ID
})
````

`apiKey`, `apiSecret`, and `projectId` are required for making requests. `id` is used for making requests that are dependent on identifying each client. You should set this to a per-machine unique ID (such as `/etc/machine-id` found on most modern linux build) when using features such as Cluster Member update notifications.

### ClusterManager

A `ClusterManager` can be created using a `SekandoCloudClient` instnace.

````
const client = new SekandoCloudClient({/*my config*/})
const clusterManager = client.clusterManager()
````

#### Functions

##### getClusterWith(id)

Returns a `Cluster` object with the given ID.

Example:

````
const cluster = testClusterManager.clusterWithId(myClusterId)
cluster.get()
  .then(_ => {
    // do something with cluster info
  })
````

### Cluster

#### Functions

##### get()

Fetches cluster data. Returns promise. Resolves with modified and created dates. If the cluster does not exist, promise resolves with empty object

````
const cluster = testClusterManager.clusterWithId(myClusterId)
cluster.get()
  .then(_ => {
    console.log(new Date(cluster.created))
    console.log(new Date(cluster.modified))
  })
````

##### getMembers() 

Fetches cluster members. Returns promise. Resolves with array of `ClusterMember` objects.

````
const cluster = testClusterManager.clusterWithId(myClusterId)
cluster.getMembers()
  .then(members => {
    members.forEach(member => {
      // do something
    })
  })
````

##### getMembers() 

Fetches cluster members. Returns promise. Resolves with array of `ClusterMember` objects.

````
const cluster = testClusterManager.clusterWithId(myClusterId)
cluster.getMembers()
  .then(members => {
    members.forEach(member => {
      // do something
    })
  })
````

##### getMemberWithId(memberId) 

Fetches member with given ID. Returns promise. Resolves with `ClusterMember` objects. If the member doesn't exist, prperties of member are unset.

````
const cluster = testClusterManager.clusterWithId(myClusterId)
cluster.getMemberWithId('test-member')
  .then(member => {
    // do something
  })
````

### ClusterMember

A member of a cluster. Used to fetch/update member metadata. Emits `change` event when changes to the metadata are found using long polling to the API.

#### Properties

- `id` ID of member. Unique within cluster.
- `modified` Date last modified as milliseconds since epoch.
- `created` Date last modified as milliseconds since epoch.
- `metadata` The metadata uploaded to the Cluster Manager API.

#### Events

##### change

Emitted when updates are found. Automatically overwrites the `metdata` property

````
cluster.getMemberWithId('my-member')
  .then(member => {
    member.on('change', _ => {
      console.log('Member changed!', member.metadata)
    })
  })
````

#### Functions

##### setMetadata(metadata)

Updates cluster metadata. Returns promise.

````
cluster.getMemberWithId('my-member')
  .then(member => {
    member.setMetadata('all your base are belong to us')
  })
````
