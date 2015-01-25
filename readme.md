# manifold

[<img alt="build" src="http://img.shields.io/travis/stringparser/manifold/master.svg?style=flat-square" align="left"/>](https://travis-ci.org/stringparser/manifold/builds)
[<img alt="NPM version" src="http://img.shields.io/npm/v/manifold.svg?style=flat-square" align="right"/>](http://www.npmjs.org/package/manifold)
<p align="center">
  <a href="#install">install</a> -
  <a href="#documentation">documentation</a> -
  <a href="#examples">examples</a> -
  <a href="#todo">todo</a> -
  <a href="#why">not a real horse</a>
</p>

<p align="center">Object manifolds</p>
</p>
<p align="center">
  <a href="http://en.wikipedia.org/wiki/Lie_group">
    <img height=350 src="http://upload.wikimedia.org/wikipedia/commons/thumb/1/14/E8Petrie.svg/270px-E8Petrie.svg.png"/>
  </a>
  <p align="center">map strings via regular expressions to objects<p>
</p>

## usage

```js
var app = new require('manifold')({name: 'whatever'});

app
  .set('go /:place order.:beberage(\\d+\\w+)', function handleIt(){})
  .get('go /haveFun/#hash?query=here order.10beers now');
// =>
{
  notFound: false,
  url: '/haveFun/#hash?query=here',
  path: 'go /haveFun order.10beers now',
  argv: [ 'go', '/haveFun', 'order.', '10beers' ],
  depth: 4,
  match: 'go /haveFun order.10beers',
  params:
  { _: [ 'place', 'beberage' ],
  place: 'haveFun',
  beberage: '10beers' },
  stem: 'go /:place order.:beberage(\\d+\\w+)',
  parent: 'go /:place order.',
  handle: [Function: handleIt]
}
```

## documentation

````js
var Manifold = require('manifold'); // constructor
var manifold = new Manifold({name: 'stuff'});
````

arguments
 - `opt` type `object` optional object with properties below

`opt` properties
 - `name`: `string` label for the `rootNode` object

> In all the following `node` refers to the `object` mapping to a path.

### manifold.set([path,] opt)

Set object properties string paths with or without parameters

_arguments_
- `path` type `string` optional
- `opt` type `function` or `plainObject`

_return_
- `this` the manifold instance

<br>
when _path_ is:
 - `string`: represents a path in the format below
 - `undefined`: all `opt` properties go to the `rootNode`
  ```js
  :param-label(possible\\regexp(?:here))
  ```
  strings matching the `regex` below qualify as a parameter

  ````js
  util.paramRE = /(^|\W)\:([^()?#\.\/ ]+)(\(+[^ ]*\)+)?/g;
  ````
  [Go to regexr](http://regexr.com/) and test it out.

when _opt_ is:
 - a `function`: turns into the `node.handle` for the matching `node`
 - a `plainObject`: turns into properties of the matching `node`

Properties can be parse before being assigned with [`manifold.parse('property')`](##manifoldparsepath o).

> Characters should be escaped i.e. `\\` <br>
> For now, only one group per parameter is allowed

### manifold.get([path, opt])

Obtain an object set previously for the matching path

_arguments_
- `path` type `string`
- `opt` type `plainObject`

_return_
 - `clone` of the `node`, or `reference` if `opt.ref` given, to that object node

If `path` is not a string `get` will return the `rootNode` instead.

Note: the returned `node` has no `children` property (to avoid deep cloning) and has some extra properties:
 - params: parsed params for the path
 - url: the url contained within the path including hash and query

> All matches are partial i.e. /^regex baby/i. Not being strict is useful for `notFound` paths

## Manifold instance properties

- manifold.parth: a [parth](https://github.com/stringparser/parth) instance
- manifold.store: where object nodes are saved in memory

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
  rootNode
    ✓ should have property name  
    ✓ should have rootHandle
    ✓ should have completion
    ✓ should have aliases
  path
    ✓ should have proper pathname
  depth
    ✓ should have proper depth
    ✓ should have proper depth when using :params
  parent
    ✓ should have its parent
    ✓ should have its parent
  handle
    ✓ handle for the rootNode
    ✓ handle for a command
    ✓ only last element should have handle
  aliases
    ✓ should redirect to node for each alias
    ✓ should have its parent via aliases
    ✓ should work with params
  children
    ✓ should create nested structures
    ✓ should be able to create nested using :params structure
  boil
    ✓ should change how stems are boiled
  parse
    ✓ should change how output gets parsed

19 passing (42ms)
```

### Glossary

 Names for things that are long to write

#### rootNode

 `manifold.store` property

### todo

- [ ] add support to regexp paths

### license

[<img alt="LICENSE" src="http://img.shields.io/npm/l/manifold.svg?style=flat-square"/>](http://opensource.org/licenses/MIT)
