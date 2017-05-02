# Dropit Shopping : Instalation guide
Auther: shimi bar.

Folder contain three microservices based on Koa.js v2.0. All system rely on Elasticsearch DB, RabbitMQ as queue manager.

  - App server : web app server listen for web app requests
  - Tracking server: create/update bag tracking status
  - Logs server : create logs from two resources: RabbitMQ queue, and http requests


### Version
1.0.0

### Tech


* [React.js] - HTML Render viewer for web apps!
* [Redux.js] - Global state manager for web apps.
* [node.js] - evented I/O for the backend
* [Koa.js] - fast node.js network app framework
* [Webpack] - the streaming build system


### Installation

Dropit requires [Node.js](https://nodejs.org/) v5+ to run.

You need Hombrew installed:
```sh
$ ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```
You need nvm installed:
```sh
$ brew update
$ brew install nvm
$ nvm install 5.6.0
$ nvm use 5.6.0
```

You need Elasticsearch installed:

```sh
$ brew install elasticsearch
```
You need RabbitMQ installed:
```sh
$ brew install rabbitmq
$ PATH=$PATH:/usr/local/sbin
```

### Start project
Run Elasticsearch
```sh
$ elasticsearch
```
add indexes mapping from elasticsearch_mapping folder, create the clusters from mapping files.
Run RabbitMQ
```sh
$ rabbitmq-server
```
Setup Node environment:
```sh
$ cd to/dropit/folder
$ npm install
$ npm run log:server
$ npm run tracking:server
$ npm run app:server
```

### NGINX: Api gateaway

More details coming soon.

#### Webpack builder

More details coming soon.


### Todos

 - add web application framework
 - Write Tests
 - Add socket.io as middleware to koa-v2
 - Add socket.io to redux store as middleware
 - run pm2 manager under babel-node

License
----

MIT

   [React.js]: <https://facebook.github.io/react/>
   [Redux.js]: <https://github.com/reactjs/redux>
   [node.js]: <https://nodejs.org/en/>
   [Koa.js]: <http://koajs.com/>
   [Webpack]: <https://webpack.github.io/>

