# manifold [<img alt="progressed.io" src="http://progressed.io/bar/99" align="right"/>](https://github.com/fehmicansaglam/progressed.io)

[<img alt="build" src="http://img.shields.io/travis/stringparser/manifold/master.svg?style=flat-square" align="left"/>](https://travis-ci.org/stringparser/manifold/builds)
[<img alt="NPM version" src="http://img.shields.io/npm/v/manifold.svg?style=flat-square" align="right"/>](http://www.npmjs.org/package/manifold)
<p align="center">
  <a href="#install">install</a> |
  <a href="#documentation">documentation</a> |
  <a href="#why">why</a> |
  <a href="#tests">tests</a>  
</p>

<p align="center">
  Object manifolds for node and the browser
</p>
<h3 align="center" style="border-bottom:0;">
  <a href="#documentation">documentation</a>
</h3>
<p align="center">
  <a href="http://en.wikipedia.org/wiki/Lie_group">
    <img height=350 src="http://upload.wikimedia.org/wikipedia/commons/thumb/1/14/E8Petrie.svg/270px-E8Petrie.svg.png"/>
  </a>
</p>

## usage

```js
var manifold = new require('manifold')();
```
#### object path

```js
manifold
  .set('hello.:there(\\w+).:you')
  .get('hello.awesome.human');
// =>
{ input: 'hello.awesome.human',
  path: 'hello.:there(\\w+).:you',
  regexp: /^hello\.(\w+)\.([^\. ]+)\.?/i,
  argv: 'hello awesome human',
  depth: 3,
  params: { there: 'awesome', you: 'human' } }
```

#### unix/url paths

```js
manifold
  .set('/hello/:there/:you(\\w+)')
  .get('/hello/awesome/human/?you=matter');
// =>
{ input: '/hello/awesome/human/?you=matter',
  path: '/hello/:there/:you',
  query: 'you=matter',
  regexp: /^\/hello\/([^\/ ]+)\/([^\/ ]+)\/?/i,
  argv: 'hello awesome human',
  depth: 3,
  params: { there: 'awesome', you: 'human' } }

```

#### fallbacks

````js
manifold
  .get('/hello/there/you/awesome', { fallback : true });
 // =>
{ input: '/hello/there/you/awesome',
  path: '/hello/:there/:you',
  regexp: /^\/hello\/([^\/ ]+)\/([^\/ ]+)\/?/i,
  argv: 'hello there you awesome',
  depth: 4,
  fallback: true,
  params: { there: 'there', you: 'you' } }
````

#### mixing them up

```js
manifold
  .set(':method(get|put|delete|post) :model.data /hello/:one/:two?something')
  .get('get page.data /hello/there/awesome.json?page=10');
// =>
{ input: 'get page.data /hello/there/awesome.json?page=10',
  path: ':method(get|put|delete|post) :model.data /hello/:one/:two',
  query: 'page=10',
  regexp: /^(get|put|delete|post)[ ]+([^\. ]+)\.data[ ]+\/hello\/([^\/ ]+)\/([^\/ ]+)\/?/i,
  argv: 'get page data hello there awesome.json',
  depth: 6,
  params:
   { method: 'get',
     model: 'page',
     one: 'there',
     two: 'awesome.json' } }

```

## documentation

````js
var manifold = require('manifold');
var manifold = new manifold(/* your cache */)
````

### var manifold = manifold([cache])

Constructor of `manifolds`.

Takes one optional argument. The `manifold` instance `cache` that will be created.

### manifold(path, opts)

Same as **path.set**.

### manifold.set(path, opts)

Set a new path. Chainable method.

- `path`: string or array with the path to be set.
- `opts`: object that will override internal regexes for `sep` or `params`.

Any **word** statring with a colon, i.e. `:myParameter`, qualifies as parameter. After it a regular expression can be given to match a parameter. The regular expression **must start and end with parenthesis**.

Examples of input
```js
manifold.set('myObject.:method.:property(\\w+)');
manifold.set(':method:get|post|put|delete :page(\\w+?).data /page/:view(\\d)/some');
manifold.set(
  'Come to :here:Granada|Berlin|NY, ' +
  'we have :something:paella|beer|awesomeness '+
  'for :you(\\w+|everyone)');
```

### manifold.get(path, opts)

Obtain a path previously saved with `manifold.set`

- `path`: string or array with the path to be get.
- `opts`: object that will override property defaults for internal `sep` and `params` regexes.

Returns an object with the following properties

- `input`: the input
- `path`: the path that matches the imput
- `query`: if path contains an url, will hold the query without '?'
- `regexp`: the regexp used to match a path with `manifold.get`
- `params`: the previously set `:paramaters` on the path
- `argv`: an array of with all the non token strings of the input
- `depth` : `argv.length`
- `fallback`: whether or not the path has fallen back from another

if the `path` is not defined, or doesn't match, `null` is returned

```js
manifold
  .set(':number(\\d+) paths on fire')
  .get('my paths on fire')
// => null
```

### manifold.cache

The `manifold` instance cache. Has 3 properties

 - `masterRE` : array containing a regular expression for each depth.
 - `regexps`: a matrix of one column and one row for each path depth set.
 - `paths`: same as `regexps` but for the paths set.

### note mixed manifolds

Mixed paths are based on space being the "separator" of them. As long as space is used as a separator alls good.

## why

I need it for [runtime](https://github.com/stringparser/runtime) module.

## install

    $ npm install --save manifold

### test

    $ npm test

### todo

 - [ ] admit a regexp as input

### license

[<img alt="LICENSE" src="http://img.shields.io/npm/l/manifold.svg?style=flat-square"/>](http://opensource.org/licenses/MIT)
