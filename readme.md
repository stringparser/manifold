<p align="center">
  <a href="http://en.wikipedia.org/wiki/Lie_group">
    <img alt="manifold" height=300 src="http://upload.wikimedia.org/wikipedia/commons/thumb/1/14/E8Petrie.svg/400px-E8Petrie.svg.png"/>
  </a>
</p>

## Manifold [![build][badge-build]][x-travis][![NPM version][badge-version]][x-npm]

[documentation](#documentation) -
[examples](#examples) -
[install](#install) -
[todo](#todo) -
[not a real horse](#why)

## sample

```js
var Manifold = require('mainfold');
var app = new Manifold();

app.set('get /user/:page(\\d+)', {
  parent: 'get /user',
  handle: function getUserPage(){};
});

app.set('get /user', {
  picture: function getPicture(){
    // fetch that thing
  },
  render: function markup(){
    // you know, some markup
  }
});

app.get('get /user/10'); // =>
{
  notFound: false,
  path: 'get /user/10',
  url: '/user/10',
  match: 'get /user/10',
  params: { _: [ 'page' ], page: '10' },
  handle: [Function: getUserPage],
  picture: [Function: getPicture],
  render: [Function: markup]
}
```

## documentation

The `module.exports` a constructor
````js
var Manifold = require('manifold');
````

that takes no arguments

```js
var manifold = new Manifold();
```
In all the following `node` refers to the `object` mapping path to object.

### manifold.parse(prop[, parser])
> parse `node` properties _before_ they are set

The method sets a parser for latter usage in [`manifold.set([path, options]`](#manifoldsetpath-options). The parser function will be invoked when  `options` of that #set method has a property named `prop`.

_arguments_
 - `prop`, type string or object with one function per key
 - `parser`, optional, type `function`

_returns_
 - `parser` for less than two arguments
 - `this` for two arguments

_sample_
```js
manifold.parse({
  number: function(node, value, key, opt){
    node.number = value + 2;
  },
  string: function(node, value, key, opt){
    node.string = value.trim();
  }
});

manifold
   .set({number: 0, string: '  hello'})
   .get(); // =>

{ notFound: true, number: 2, string: 'hello' }

```

### `parser` arguments

Arguments, passed from [manifold.set](#manifoldsetpath-props) to the parser are:
 - `node`, type object, the current `node` being set
 - `value`, type unkown, `options[prop]` of
 - `key`, type string, property `name` being parsed (equal to `prop` at the moment)
 - `opt`, the `options` object of `manifold.set`


#### built-in: `parent` and `children` property parsers

There are [default property parsers defined](./lib/defaultParsers.js). One for `options.parent` and another one for `options.children`. Both work together to help and define inheritance when using [`manifold.get`](#manifoldgetpath-options-mod) _only_ if so specified.

## manifold.set([path, props])
> set a path to regex mapping for an object

_arguments_
- `path` type string

- `props` type function or plainObject
 - when is a function it will be assigned to the `props.handle`
 - when is a plainObject, all option properties are passed first to a `parser` if there is one and if not, that property is cloned and assigned to the node props

_returns_ this

The path is taken as a regular expression using the  [parth](http://github.com/stringparser/parth) module, which uses the usual conventions on for path to regexp parsing. So you know... interesting things can happen.

_samples_
```js
manifold.set('get /user/:page(\\d+)', function getUserPage(){
  // do stuff
});

manifold.get('get /user/10');
// =>
{
  notFound: false,
  path: 'get /user/10',
  url: '/user/10',
  match: 'get /user/10',
  params: { _: [ 'page' ], page: '10' },
  handle: [Function: getUserPage]
}

```

_a use case for a parser_
```js
var myLib = require('myLib');
manifold.parse('handle', function(node, value, key, opt){
  var handle = value;
  node.handle = function (/* arguments*/){
    return handle.apply(myLib, arguments);
  }
});
```

## manifold.get([path, options, mod])
> get an object matching the given path, clone it if necessary

_arguments_
 - `path`, optional, type string
 - `options`, optional, type object with all extra information
 - `mod`, type object. If is a:
   - plainObject with property ref, the node found will not be cloned
   - regular expression, are the props to skip while cloning

_returns_ the object (cloned/by reference) `node` found

In addition, if the node has a parent it will inherit its properties while cloning.

_sample_
```js
manifold.set('get /user/:page', {
  parent: 'get /user',
  handle: function getUserPage(){};
});

manifold.set('get /user', {
  picture: function getPicture(){
    // fetch that thing
  },
  render: function markup(){
    // you know, some markup
  }
});

manifold.get('get /user/10'); // =>
{
  notFound: false,
  path: 'get /user/10',
  url: '/user/10',
  match: 'get /user/10',
  params: { _: [ 'page' ], page: '10' },
  handle: [Function: getUserPage],
  picture: [Function: getPicture],
  render: [Function: markup]
}
```

## instance properties

- `manifold.parses`: property parsers are stored here
- `manifold.store`: key value store with all of the nodes stored
- `manifold.regex`: regexes are stored here

## why

I Need it for the [runtime](https://github.com/stringparser/runtime) module ;)

The project name is an homage to the concept of  [manifold](http://en.wikipedia.org/wiki/Manifold). Beautiful creature of Math and Physics thought. BUT, this can't be considered the real thing. That is: this is not a manifold. I'd wish!

## install

With [npm](https://npmjs.org)

    npm install manifold --save

### examples
Run the [`example.js`](example.js) file.

### test

$ npm test

```
➜  manifold (master) ✓ npm test
manifold
  sample
    ✓ data creation should not fail
    ✓ sample data should be random
  parse
    ✓ add test data
    ✓ should parse properties when one sets them
    ✓ should support objects for setting parsers
  rootNode
    ✓ add test data
    ✓ should have properties ({ref: true})
    ✓ should have properties ({ref: true})
    ✓ should not have properties ({ref: true})
    ✓ should have properties ({ref: true})
  parent
    ✓ add test data
    ✓ should have children added after parent is set
    ✓ should have the same parent by reference
    ✓ property should not be enumerable after overwrite
  children
    ✓ add test data
    ✓ should support single object as input
    ✓ should support array as input
    ✓ should have parent added after children were set
    ✓ should not be enumerable after overwrite
    ✓ should inherit from parent when


20 passing (35ms)
```

### license

[<img alt="LICENSE" src="http://img.shields.io/npm/l/manifold.svg?style=flat-square"/>](http://opensource.org/licenses/MIT)


[x-npm]: https://npmjs.org/package/manifold
[x-travis]: https://travis-ci.org/stringparser/manifold/builds
[badge-build]: http://img.shields.io/travis/stringparser/manifold/master.svg?style=flat-square
[badge-version]: http://img.shields.io/npm/v/manifold.svg?style=flat-square
