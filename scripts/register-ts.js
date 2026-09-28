const { register } = require('node:module');
const { pathToFileURL } = require('node:url');
const path = require('node:path');

register(pathToFileURL(path.join(__dirname, 'ts-resolver.mjs')));
