#!/usr/bin/env node

'use strict';

var nomnom = require("nomnom");
var bemComment = require("../");
var fs = require('vinyl-fs');
var through2 = require('through2');
var pkg = require('../package.json');

var options = nomnom
  .script('bem-comment')
  .help(pkg.description)
  .options({
    path: {
      position: 0,
      help: 'BEM files to comment',
      required: true,
      list: true
    },
    version: {
      flag: true,
      help: 'Print version',
      callback: function () {
        return pkg.version;
      }
    },
    force: {
      flag: true,
      help: 'force rewrite all comments'
    }
  })
  .parse();

fs.src(options.path || [])
  .pipe(bemComment(options))
  .pipe(through2.obj(function (file, enc, callback) {
    //console.log(file.path);
    console.log(file.contents.toString());
    callback(null, file);
  }))
  //.pipe(fs.dest('./'))
;
