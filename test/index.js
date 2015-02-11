'use strict';

var assert = require("assert");
var File = require('vinyl');
var bemComment = require('../index');

it('should comment basic classes', function (cb) {
  var stream = bemComment();

  stream.on('data', function (file) {
    assert.equal(file.contents.toString(), '// foo\n.foo{}');
    cb();
  });

  stream.write(new File({
    contents: new Buffer('.foo{}')
  }));
});

it('should ignore over selectors', function (cb) {
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

  stream.on('data', function (file) {
    assert.equal(file.contents.toString(), dummy);
    cb();
  });

  stream.write(new File({
    contents: new Buffer(dummy)
  }));
});

it('should not comment commented classes', function (cb) {
  var stream = bemComment();

  stream.on('data', function (file) {
    assert.equal(file.contents.toString(), '// bar\n.foo{}');
    cb();
  });

  stream.write(new File({
    contents: new Buffer('// bar\n.foo{}')
  }));
});

it('when in forced mode should re-comment commented classes', function (cb) {
  var stream = bemComment({force: true});

  stream.on('data', function (file) {
    assert.equal(file.contents.toString(), '// foo\n.foo{}');
    cb();
  });

  stream.write(new File({
    contents: new Buffer('// bar\n.foo{}')
  }));
});

it('should not break the space indentation', function (cb) {
  var stream = bemComment();

  stream.on('data', function (file) {
    assert.equal(file.contents.toString(), '  // foo\n  .foo{}');
    cb();
  });

  stream.write(new File({
    contents: new Buffer('  .foo{}')
  }));
});

it('should be able to comment multiple classes', function (cb) {
  var stream = bemComment();

  stream.on('data', function (file) {
    assert.equal(file.contents.toString(),
      '// foo\n.foo{}\n// bar\n.bar{}'
    );
    cb();
  });

  stream.write(new File({
    contents: new Buffer('.foo{}\n.bar{}')
  }));
});

it('should ignore multiple definition on the same line', function (cb) {
  var stream = bemComment();

  stream.on('data', function (file) {
    assert.equal(file.contents.toString(), '.foo{}.bar{}');
    cb();
  });

  stream.write(new File({
    contents: new Buffer('.foo{}.bar{}')
  }));
});

it('should comment nested classes', function (cb) {
  var stream = bemComment();

  stream.on('data', function (file) {
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

it('should trace BEM element notation', function (cb) {
  var stream = bemComment();

  stream.on('data', function (file) {
    assert.equal(file.contents.toString(),
      '// foo\n.foo{\n  // foo__bar\n  &__bar{}\n}'
    );
    cb();
  });

  stream.write(new File({
    contents: new Buffer('.foo{\n  &__bar{}\n}')
  }));
});


it('should unstack BEM when the class end on the start line', function (cb) {
  var stream = bemComment();

  stream.on('data', function (file) {
    assert.equal(file.contents.toString(),
      '// foo\n.foo{\n  // foo__bar\n  &__bar{}\n  // foo__qux\n  &__qux{}\n}'
    );
    cb();
  });

  stream.write(new File({
    contents: new Buffer('.foo{\n  &__bar{}\n  &__qux{}\n}')
  }));
});

it('should unstack BEM when the class end on next line', function (cb) {
  var stream = bemComment();

  stream.on('data', function (file) {
    assert.equal(file.contents.toString(),
      '// foo\n.foo{\n  // foo__bar\n  &__bar{\n  }\n  // foo__qux\n  &__qux{}\n}'
    );
    cb();
  });

  stream.write(new File({
    contents: new Buffer('.foo{\n  &__bar{\n  }\n  &__qux{}\n}')
  }));
});

it('should unstack BEM when the inner class end on next line', function (cb) {
  var stream = bemComment();

  stream.on('data', function (file) {
    assert.equal(file.contents.toString(),
      '// foo\n.foo{\n  // foo__bar\n  &__bar{\n    // foo__bar__off\n    &__off{}\n  }\n  // foo__qux\n  &__qux{}\n}'
    );
    cb();
  });

  stream.write(new File({
    contents: new Buffer('.foo{\n  &__bar{\n    &__off{}\n  }\n  &__qux{}\n}')
  }));
});

it('should unstack BEM when the inner class and the class end on the same line', function (cb) {
  var stream = bemComment();

  stream.on('data', function (file) {
    assert.equal(file.contents.toString(),
      '// foo\n.foo{\n  // foo__bar\n  &__bar{\n    // foo__bar__off\n    &__off{}}\n  // foo__qux\n  &__qux{}\n}'
    );
    cb();
  });

  stream.write(new File({
    contents: new Buffer('.foo{\n  &__bar{\n    &__off{}}\n  &__qux{}\n}')
  }));
});

it('should not unstack BEM when meeting', function (cb) {
  var stream = bemComment();

  stream.on('data', function (file) {
    assert.equal(file.contents.toString(),
      '// foo\n.foo{\n  // foo__bar\n  &__bar{\n    // foo__bar__off\n    &__off{}}\n  // foo__qux\n  &__qux{}\n}'
    );
    cb();
  });

  stream.write(new File({
    contents: new Buffer('.foo{\n  &__bar{\n    &__off{}}\n  &__qux{}\n}')
  }));
});

it('should trace BEM modifier notation', function (cb) {
  var stream = bemComment();

  stream.on('data', function (file) {
    assert.equal(file.contents.toString(),
      '// foo\n.foo{\n  // foo--bar\n  &--bar{}\n}'
    );
    cb();
  });

  stream.write(new File({
    contents: new Buffer('.foo{\n  &--bar{}\n}')
  }));
});


it('should trace BEM notation only on direct parent', function (cb) {
  var stream = bemComment();

  stream.on('data', function (file) {
    assert.equal(file.contents.toString(),
      '// buz\n.buz{\n// foo\n.foo{\n  // foo--bar\n  &--bar{}\n}\n}'
    );
    cb();
  });

  stream.write(new File({
    contents: new Buffer('.buz{\n.foo{\n  &--bar{}\n}\n}')
  }));
});

it('should trace BEM notation even if the parent is already commented', function (cb) {
  var stream = bemComment();

  stream.on('data', function (file) {
    assert.equal(file.contents.toString(),
      '// buz\n.buz{\n// foo\n.foo{\n  // foo--bar\n  &--bar{}\n}\n}'
    );
    cb();
  });

  stream.write(new File({
    contents: new Buffer('.buz{\n// foo\n.foo{\n  &--bar{}\n}\n}')
  }));
});
