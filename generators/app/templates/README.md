# <%= cleanModuleName %><% if ( automatedTests ) { %>

[![Build Status][ci-img]][ci]<% } %><% if ( cloudBrowsers && ( (automatedTests && browserModule && !sassModule) || integrationTests ) ) { %> [![BrowserStack Status][browserstack-img]][browserstack]<% } %><% if ( codeCoverageService ) { %> [![Coverage report][coverage-img]][coverage]<% } %>

<%= moduleDescription %>

## Install

```sh
<% if ( !cli ) { %>npm install <%= moduleName %> --save<% } else { %>npm install -g <%= moduleName %><% } %>
```

## Usage

<% if ( cli ) { %>```sh
<%= cliCommandName %>
```

``` sh
<%= cliCommandName %>

  <%= moduleDescription %>

  Usage
    $ <%= cliCommandName %> [options]

  Options
    -a, --option-1  Option
    -b, --option-2 [optional argument]  Option 2 description
    -c, --option-3  Option 3 description [value-1|value-2] (Default: value-1)
```<% } else if ( browserModule && styles || sassModule ) { %><% if ( sassModule ) { %>```scss
/* Module style usage */
```<% } else { %>```js
// Module usage<% if ( esModules ) { %> (ES Module)<% } %>
```

```css
/* Module style usage */
```<% } %><% } else { %>```js
// Module usage
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

<% if ( browserModule ) { %>## Browser support

Tested in <% if ( browserSupport.ie ) { %>IE <%= browserSupport.ie %><% } %><% if ( browserSupport.edge ) { %>, Edge <%= browserSupport.edge %><% } %><% if ( browserSupport.chrome ) { %>, Chrome <%= browserSupport.chrome %><% } %><% if ( browserSupport.firefox ) { %> and Firefox <%= browserSupport.firefox %><% } %>, and should work in all modern browsers.

<% } %><% if ( (automatedTests || manualTests || integrationTests) && browserModule && !sassModule ) { %>## Test<% if ( automatedTests ) { %>

For automated tests, run `npm run test:automated` (append `:watch` for watcher support).<% } %><% if ( integrationTests ) { %>

For integration tests, run `npm run test:integration` (append `:watch` for watcher support).<% } %><% if ( manualTests ) { %>

For manual tests, run `npm run test:manual`.<% } %>

<% } %>## License

MIT © [<%= humanName %>](<%= website %>)<% if ( automatedTests ) { %><% if ( prettier ) { %>

<!-- prettier-ignore-start --><% } %>

[ci]: <% if ( ciService === 'travis' ) { %>https://travis-ci.com/<%= username %>/<%= cleanModuleName %><% } else { %>https://github.com/<%= username %>/<%= cleanModuleName %>/actions?query=workflow%3ACI<% } %>
[ci-img]: <% if ( ciService === 'travis' ) { %>https://travis-ci.com/<%= username %>/<%= cleanModuleName %>.svg?branch=master<% } else { %>https://github.com/<%= username %>/<%= cleanModuleName %>/workflows/CI/badge.svg?branch=master<% } %><% } %><% if ( cloudBrowsers && ( (automatedTests && browserModule && !sassModule) || integrationTests ) ) { %>
[browserstack]: https://www.browserstack.com/
[browserstack-img]: https://www.browserstack.com/automate/badge.svg?badge_key=<badge_key><% } %><% if ( codeCoverageService ) { %>
[coverage]: https://coveralls.io/github/<%= username %>/<%= cleanModuleName %>?branch=master
[coverage-img]: https://coveralls.io/repos/github/<%= username %>/<%= cleanModuleName %>/badge.svg?branch=master<% } %><% if ( prettier ) { %>

<!-- prettier-ignore-end --><% } %>
