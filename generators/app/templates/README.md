# <%= moduleName %><% if ( automatedTests ) { %>

[![Build Status][ci-img]][ci]<% } %>

<%= moduleDescription %>

## Install

```sh
npm install <%= moduleName %> --save
```

## Usage

```js
// Module usage
```

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
Default: `prop1Value`

`prop1` description.

##### prop2

Type: `Number`  
Default: `prop2Value`

`prop2` description.

> Alternative approach

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `prop1` | `String` | `prop1Value` | `prop1` description. |
| `prop2` | `Number` | `prop2Value` | `prop2` description. |

---

## License

MIT © [Ivan Nikolić](http://ivannikolic.com)<% if (automatedTests) { %>

[ci]: https://travis-ci.org/niksy/<%= moduleName %>
[ci-img]: https://img.shields.io/travis/niksy/<%= moduleName %>/master.svg<% } %>
