
const copydir = require('copy-dir');
const pack = require('./package.json');

Object.keys(pack.dependencies)
  .forEach(dep => copydir.sync('./node_modules/' + dep, './node-assets/' + dep, {}));
