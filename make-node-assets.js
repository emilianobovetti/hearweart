
const copydir = require('copy-dir');
const package = require('./package.json');

Object.keys(package.dependencies)
    .forEach(dep => copydir.sync('./node_modules/' + dep, './node-assets/' + dep));
