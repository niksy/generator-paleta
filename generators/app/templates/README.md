# <%= cleanModuleName %><% if ( automatedTests ) { %>

[![Build Status][ci-img]][ci]<% } %><% if ( (automatedTests && browserModule && !sassModule) || integrationTests ) { %> [![Browserstack][browserstack-img]][browserstack]<% } %><% if ( codeCoverageService ) { %> [![Coveralls][coveralls-img]][coveralls]<% } %>

<%= moduleDescription %>

## Install

```sh
npm install <%= moduleName %> --save
```

## Usage

```js
// Module usage
```<% if ( browserModule && styles || sassModule ) { %>

```<% if ( sassModule ) { %>scss<% } else { %>css<% } %>
/* Module style usage */
```<% } %>

More usage examples.

## API

### methodName(arg, [optionalArg])

Returns: `Mixed`

Method description.

#### arg

Type: `Mixed`

arg description.

#### optionalArg

Type: `Object`

optionalArg description.

##### prop1

Type: `String`  
Default: `'3'`

`prop1` description.

##### prop2

Type: `Number`  
Default: `3`

##### prop3

Type: `Number[]`  
Default: `[1, 2, 3]`

##### prop4

Type: `Number[]` `String[]`  
Default: `['1', '2', '3']`

`prop4` description.

##### prop5

Type: `Function`  
Default: `noop`

`prop5` description.

Function arguments:

* **arg1** `String` arg1 description
* **arg2** `Number` arg2 description
* **arg3** `Element` `Boolean` arg3 description

> Alternative approach

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `prop1` | `String` | `'3'` | `prop1` description. |
| `prop2` | `Number` | `3` | `prop2` description. |
| `prop3` | `Number[]` | `[1, 2, 3]` | `prop3` description. |
| `prop4` | `Number[]` `String[]` | `['1', '2', '3']` | `prop4` description. |
| `prop5` | `Function` | `noop` | `prop5` description. (No function arguments description) |

---

<% if ( manualTests && browserModule && !sassModule ) { %>## Test

For manual tests, run `npm test -- --watch` and open <http://localhost:9000/> in your browser.

<% } %><% if ( browserModule ) { %>## Browser support

Tested in IE8+ and all modern browsers.

<% } %>## License

MIT © [<%= humanName %>](<%= website %>)<% if ( automatedTests ) { %>

[ci]: https://travis-ci.org/<%= username %>/<%= cleanModuleName %>
[ci-img]: https://img.shields.io/travis/<%= username %>/<%= cleanModuleName %>.svg<% } %><% if ( (automatedTests && browserModule && !sassModule) || integrationTests ) { %>
[browserstack]: https://www.browserstack.com/
[browserstack-img]: https://cdn.rawgit.com/niksy/c73069b66d20e2e0005dc8479c125fbd/raw/f644159e3f5f07291f98f59a44146735e9962e0d/browserstack.svg<% } %><% if ( codeCoverageService ) { %>
[coveralls]: https://coveralls.io/r/<%= username %>/<%= cleanModuleName %>
[coveralls-img]: https://img.shields.io/coveralls/<%= username %>/<%= cleanModuleName %>.svg<% } %>
