/**
 * Bem-comment
 * https://github.com/dpellier/bem-comment
 *
 * Copyright (c) 2014 Damien Pellier
 * Licensed under the MIT license.
 */

'use strict';

var through2 = require('through2');

module.exports = function bemComment() {

    var commentBuff;

    return through2.obj(function transform(file, enc, callback) {
        commentBuff = [];

        var lines = file.contents.toString().split(/(?:\n|\r\n|\r)/g);
        file.contents = Buffer(lines.map(processLine).join('\n'));

        callback(null, file);
    });


    /**
     * Process a line adding the comment if supported
     * @param {string} line The current line
     * @param {number} index The current line number
     * @param {string[]} lines All the lines
     * @returns {string} the processed line.
     */
    function processLine(line, index, lines) {
        var isClassLine = /^\s*[\.&][^\s]+/gi.test(line);

        if (!isClassLine || isUnsupportedSelector(line, index, lines)) {
            return line;
        }

        var indentation = '';
        var name = '';
        var isReferencingParentSelectors= 0;
        line.replace(/(\s*)(\.|&)([^\s{]+)/,
            function(match, selectorIndentation, selectorStartingCharacter, selectorName) {
                isReferencingParentSelectors |= selectorStartingCharacter === '&';
                indentation = selectorIndentation;
                name = selectorName;
            }
        );

        if (isReferencingParentSelectors){
            commentBuff.push(name);
        }else{
            commentBuff = [name];
        }

        // The last line is a comment
        if (index > 0 && /^\s*\/\//.test(lines[index - 1])){
          return line;
        }

        line = indentation + '\/\/ ' + commentBuff.join('') + '\n' + line;

        commentBuff.splice(commentBuff.length - (line.match(/}/g) || []).length, 1);

        return line;
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
