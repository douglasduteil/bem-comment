/**
 * Bem-comment
 * https://github.com/dpellier/bem-comment
 *
 * Copyright (c) 2014 Damien Pellier
 * Licensed under the MIT license.
 */

'use strict';

var through2 = require('through2');

module.exports = function bemComment(options) {

  var commentBuff;

  options = options || {};

  return through2.obj(function transform(file, enc, callback) {
    commentBuff = [];

    var lines = file.contents.toString().split(/(?:\n|\r\n|\r)/g);
    file.contents = Buffer(lines.reduce(processLine, []).join('\n'));

    callback(null, file);
  });


  /**
   * Process a line adding the comment if supported
   * @param {string[]} lines All the lines
   * @param {string} line The current line
   * @param {number} index The current line number
   * @returns {string} the processed line.
   */
  function processLine(lines, line, index) {
    var isClassLine = /^\s*[\.&][^\s]+/gi.test(line);
    var n;
    if (!isClassLine || isUnsupportedSelector(line, index, lines)) {

      // unstack if "}" found
      n = (line.match(/}/g) || []).length;
      commentBuff.splice( -n,n);
      lines.push(line);
      return lines;
    }

    var indentation = '';
    var name = '';
    var isReferencingParentSelectors = 0;
    line.replace(/(\s*)(\.|&)([^\s{]+)/,
      function (match, selectorIndentation, selectorStartingCharacter, selectorName) {
        isReferencingParentSelectors |= selectorStartingCharacter === '&';
        indentation = selectorIndentation;
        name = selectorName;
      }
    );

    if (isReferencingParentSelectors) {
      commentBuff.push(name);
    } else {
      commentBuff = [name];
    }


    //The last line is a comment
    var lenght = lines.length;

    if (index > 0 && /^\s*\/\//.test(lines[lenght - 1])) {
      if (options.force) {
        lines.splice(- 1, 1);
      } else {
        lines.push(line);
        return lines;
      }
    }

    lines.push(indentation + '\/\/ ' + commentBuff.join(''));
    n = (line.match(/}/g) || []).length;
    commentBuff.splice( -n,n);

    lines.push(line);
    return lines;
  }

  /**
   * Test is the selector in the line is unsupported
   * @param {string} line The current line
   * @param {number} index The current line number
   * @param {string[]} lines All the lines
   * @returns {number} 0 or 1 if the selector in the line is unsupported
   */
  function isUnsupportedSelector(line, index, lines) {

    var isUnsupported = 0;

    // Is not a isolated class
    isUnsupported |= !(/^\s*(?:\.|&)[^\s\.:\[]+\s*\{/.test(line));
    // More than one definition... too hard; don't do
    isUnsupported |= (line.match(/{/g) || []).length > 1;

    return isUnsupported;
  }
};
