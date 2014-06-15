# Homepage of Club Forum e.V.

> Project to create a responsive webpage for the Club Forum e.V.. The website contains simple content and user management features as well as a dedicated booking service based on Angluar JS, Node JS and Mongo DB. 

## Getting Started  

####Prereqs to run the web app:
- Node JS ~v0.10.*
- Grunt ~v0.4.*
- mongoDB ~v2.* 

####Setup for development:

First step is to install Node JS and mongoDB. See the following links for details:
- [Building and installing Node.js] (https://github.com/joyent/node/wiki/installation)
- [Install MongoDB] (http://docs.mongodb.org/manual/installation/)

After this stel is done switch on the command line to the root of the project and use the following command to install all dependencies:

```shell
npm install
```

>TODO
- Setup grunt
- Create certificates for SSL
- Configure node-gyp
- Update the config file

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may use the predefined task for development:

```shell
grunt dev
```

Afterwards if you want to develop use:
grunt dev

####Setup for build:

Or if you want to build the project use:
grunt build

&copy; Sven Sterbling