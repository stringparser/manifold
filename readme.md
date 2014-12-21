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
  .set('get /:page/baby order.:beberage(\\d+\\w+) :when', function handle(){})
  .get('get /this/baby order.10beers now');
// =>
{
  path: 'get /:page/baby order.:beberage(\\d+\\w+) :when',
  depth: 6,
  parent: 'get /:page/baby order.:beberage(\\d+\\w+)',
  handle: [Function: handle],
  url: '/this/baby',
  params: {
    _: [ 'this', '10beers', 'now' ],
    page: 'this',
    beberage: '10beers',
    when: 'now'
  },
  notFound: false
}
```

## documentation

````js
var Manifold = require('manifold');
````
The `Manifold` constructor

In all the following `node` refers to the `object` mapping to a path.

```js
var manifold = new Manifold(opt);
```

arguments <br>
`opt`: optional object with properties below
  - `name`: `string` label for the `rootNode` object.

### manifold.set([path,] opt)

Set object properties via a string path that may or may not contain parameters.

_arguments_
- `path` type `string`, `array`, `plainObject` or `function`
- `opt` type `function` or `plainObject`

_return_
- `this`, the manifold instance

when `path` is:
 - a `string` it can contain any number of parameters(regexes) in the form
  ```js
  :param-label(\\regexp(?:here))
  ```
  Any string matching the regular expression below qualifies as a parameter

  ````js
  util.paramRE = /(^|\W)\:([^()?#\.\/ ]+)(\(+[^ ]*\)+)?/g;
  ````
  [Go to regexpr](http://regexr.com/) and test it out.

 - an `array`

  The first element is treated as a `string` the rest as its aliases.

 - a `function`

   Turns into the `node.handle` for the `rootNode`

 - an `object`

   Turns into properties of the [`rootNode`](#rootNode)

when `opt` is:
 - a `function`

   It turns into the `node.handle` for that object's path

 - an `object`

   Turns into the properties of the corresponding `node` for that `path`


Properties to be attached to the `node` object of that `path` can be parsed with [`manifold.parse('property')`](##manifoldparsepath o).

> Characters should be escaped i.e. `\\`w+ <br>
> For now, only one group per parameter is allowed

### manifold.get(path[, o])

Obtain an object matching a path set previously

_arguments_
- `path` type `string` or `array`
- `o` type `object`

_return_
 - `clone` of the `node` matching the path with extra properties.

The returned `node` has no `children` property (to avoid deep cloning)
and has extra properties:
 - url: if present, the url contained within the path including hash and query
 - params: parsed params for the path

> When `path` is `string` or `array` the corresponding node for that path is found taking into account, if previously set, its aliases.

> All matches are partial i.e. /^regex baby/i. Not being strict is useful for `notFound` paths

### manifold.store

The `manifold` instance `store`. Has these properties
- `name`: the `name` set on instantiation via `opt.name`
- `cache`: all previously set paths live here
- `regex`: object with one key per `depth`, each being an array.
- `masterRE` : array aggregating a regular expression for each `depth`.

> When paths are set they are classified according to their `depth`

## why

I need it for the [runtime](https://github.com/stringparser/runtime) module.

The project name is an homage to the concept of  [manifold](http://en.wikipedia.org/wiki/Manifold). Beautiful creature of Math and Physics thought. BUT, this can't be considered the real thing. That is: this is not a manifold. I'd wish!

## install

$ npm install --save manifold

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

- [ ] add support for regexp input on the [parth](https://github.com/stringparser/parth)

### license

[<img alt="LICENSE" src="http://img.shields.io/npm/l/manifold.svg?style=flat-square"/>](http://opensource.org/licenses/MIT)
