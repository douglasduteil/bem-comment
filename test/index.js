'use strict';

var assert = require("assert");
var File = require('vinyl');
var bemComment = require('../index');

it('should comment basic classes', function(cb) {
    var stream = bemComment();

    stream.on('data', function(file) {
        assert.equal(file.contents.toString(), '// foo\n.foo{}');
        cb();
    });

    stream.write(new File({
        contents: new Buffer('.foo{}')
    }));
});

it('should ignore over selectors', function(cb) {
    var stream = bemComment();
    var dummy = [
        // basics http://www.w3.org/TR/CSS21/selector.html#pattern-matching
        '*',
        'E',
        'E F',
        'E > F',
        'E:first-child',
        'E:lang(c)',
        'E + F',
        'E[foo]',
        'E[foo="warning"',
        'DIV.warning',
        'E#myid',

        // not classes only
        '.E.F',
        '.E > .F',
        '.E:first-child',
        '.E[foo]',
        '.E#id'
    ].join('{}\n');

    stream.on('data', function(file) {
        assert.equal(file.contents.toString(), dummy);
        cb();
    });

    stream.write(new File({
        contents: new Buffer(dummy)
    }));
});

it('should not comment commented classes', function(cb) {
    var stream = bemComment();

    stream.on('data', function(file) {
        assert.equal(file.contents.toString(), '// bar\n.foo{}');
        cb();
    });

    stream.write(new File({
        contents: new Buffer('// bar\n.foo{}')
    }));
});

it('when in forced mode should re-comment commented classes', function(cb) {
  var stream = bemComment({ force: true });

  stream.on('data', function(file) {
    assert.equal(file.contents.toString(), '// foo\n.foo{}');
    cb();
  });

  stream.write(new File({
    contents: new Buffer('// bar\n.foo{}')
  }));
});

it('should not break the space indentation', function(cb) {
    var stream = bemComment();

    stream.on('data', function(file) {
        assert.equal(file.contents.toString(), '  // foo\n  .foo{}');
        cb();
    });

    stream.write(new File({
        contents: new Buffer('  .foo{}')
    }));
});

it('should be able to comment multiple classes', function(cb) {
    var stream = bemComment();

    stream.on('data', function(file) {
        assert.equal(file.contents.toString(),
            '// foo\n.foo{}\n// bar\n.bar{}'
        );
        cb();
    });

    stream.write(new File({
        contents: new Buffer('.foo{}\n.bar{}')
    }));
});

it('should ignore multiple definition on the same line', function(cb) {
    var stream = bemComment();

    stream.on('data', function(file) {
        assert.equal(file.contents.toString(), '.foo{}.bar{}');
        cb();
    });

    stream.write(new File({
        contents: new Buffer('.foo{}.bar{}')
    }));
});

it('should ignore multiple definition on the same line', function(cb) {
    var stream = bemComment();

    stream.on('data', function(file) {
        assert.equal(file.contents.toString(),
            '// foo\n.foo{\n// bar\n.bar{}}\n// buz\n.buz{}'
        );
        cb();
    });

    stream.write(new File({
        contents: new Buffer('.foo{\n.bar{}}\n.buz{}')
    }));
});

////

it('should trace BEM element notation', function(cb) {
    var stream = bemComment();

    stream.on('data', function(file) {
        assert.equal(file.contents.toString(),
            '// foo\n.foo{\n  // foo__bar\n  &__bar{}\n}'
        );
        cb();
    });

    stream.write(new File({
        contents: new Buffer('.foo{\n  &__bar{}\n}')
    }));
});

it('should trace BEM modifier notation', function(cb) {
    var stream = bemComment();

    stream.on('data', function(file) {
        assert.equal(file.contents.toString(),
            '// foo\n.foo{\n  // foo--bar\n  &--bar{}\n}'
        );
        cb();
    });

    stream.write(new File({
        contents: new Buffer('.foo{\n  &--bar{}\n}')
    }));
});


it('should trace BEM notation only on direct parent', function(cb) {
    var stream = bemComment();

    stream.on('data', function(file) {
        assert.equal(file.contents.toString(),
            '// buz\n.buz{\n// foo\n.foo{\n  // foo--bar\n  &--bar{}\n}\n}'
        );
        cb();
    });

    stream.write(new File({
        contents: new Buffer('.buz{\n.foo{\n  &--bar{}\n}\n}')
    }));
});

it('should trace BEM notation even if the parent is already commented', function(cb) {
  var stream = bemComment();

  stream.on('data', function(file) {
    assert.equal(file.contents.toString(),
      '// buz\n.buz{\n// foo\n.foo{\n  // foo--bar\n  &--bar{}\n}\n}'
    );
    cb();
  });

  stream.write(new File({
    contents: new Buffer('.buz{\n// foo\n.foo{\n  &--bar{}\n}\n}')
  }));
});
