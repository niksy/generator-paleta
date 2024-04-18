# <%= cleanModuleName %><% if ( automatedTests ) { %>

[![Build Status][ci-img]][ci]<% } %><% if ( cloudBrowsers && ( (automatedTests && browserModule && !sassModule) || integrationTests ) ) { %> [![Browser testing by BrowserStack][browserstack-img]][browserstack]<% } %><% if ( codeCoverageService ) { %> [![Coverage report][coverage-img]][coverage]<% } %>

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
// Module usage
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

Tested in <%= cloudBrowsersToTest.map((browser) => `${browser.longName} ${browser.version}`).join(', ') %> and should work in all modern browsers ([support based on Browserslist configuration](https://browserslist.dev/?q=<%= browserslistDevQuery %>)).

<% } %><% if ( (automatedTests || manualTests || integrationTests) && browserModule && !sassModule ) { %>## Test<% if ( automatedTests ) { %>

For automated tests, run `npm run test:automated` (append `:watch` for watcher support).<% } %><% if ( integrationTests ) { %>

For integration tests, run `npm run test:integration` (append `:watch` for watcher support).<% } %><% if ( manualTests ) { %>

For manual tests, run `npm run test:manual`.<% } %>

<% } %>## License

MIT © [<%= humanName %>](<%= website %>)<% if ( prettier ) { %>

<!-- prettier-ignore-start --><% } %><% if ( automatedTests ) { %>

[ci]: <% if ( ciService === 'travis' ) { %>https://travis-ci.com/<%= username %>/<%= cleanModuleName %><% } else { %>https://github.com/<%= username %>/<%= cleanModuleName %>/actions?query=workflow%3ACI<% } %>
[ci-img]: <% if ( ciService === 'travis' ) { %>https://travis-ci.com/<%= username %>/<%= cleanModuleName %>.svg?branch=master<% } else { %>https://github.com/<%= username %>/<%= cleanModuleName %>/actions/workflows/ci.yml/badge.svg?branch=master<% } %><% } %><% if ( cloudBrowsers && ( (automatedTests && browserModule && !sassModule) || integrationTests ) ) { %>
[browserstack]: https://www.browserstack.com/
[browserstack-img]: https://img.shields.io/badge/browser%20testing-BrowserStack-informational?logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+CiAgPGRlZnMvPgogIDxyYWRpYWxHcmFkaWVudCBpZD0iYSIgY3g9IjIwLjk0Mjk3NiIgY3k9IjI4LjA5NDY3ODczIiByPSIzLjc5MTM0MTQxIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CiAgICA8c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiM3OTc5NzkiLz4KICAgIDxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzRjNGM0YyIvPgogIDwvcmFkaWFsR3JhZGllbnQ+CiAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTI5LjcyOTIwNCAtNTcuMTg3NjExKSBzY2FsZSgyLjk3MjkyKSI+CiAgICA8Y2lyY2xlIGN4PSIyMC43ODkiIGN5PSIzMC4wMjUiIHI9IjEwLjczOSIgZmlsbD0iI2Y0Yjk2MCIvPgogICAgPGNpcmNsZSBjeD0iMTkuNyIgY3k9IjI4LjkzNiIgcj0iOS43IiBmaWxsPSIjZTY2ZjMyIi8+CiAgICA8Y2lyY2xlIGN4PSIyMS4wMzYiIGN5PSIyNy42OTkiIHI9IjguNDEzIiBmaWxsPSIjZTQzYzQxIi8+CiAgICA8Y2lyY2xlIGN4PSIyMS42NzkiIGN5PSIyOC4zNDIiIHI9IjcuNzIiIGZpbGw9IiNiZGQwNDEiLz4KICAgIDxjaXJjbGUgY3g9IjIxLjEzNSIgY3k9IjI4LjkzNiIgcj0iNy4xNzYiIGZpbGw9IiM2ZGI1NGMiLz4KICAgIDxjaXJjbGUgY3g9IjE5Ljk5NyIgY3k9IjI3Ljc0OCIgcj0iNS45ODgiIGZpbGw9IiNhZWRhZTYiLz4KICAgIDxjaXJjbGUgY3g9IjIwLjkzNyIgY3k9IjI2Ljc1OCIgcj0iNS4wNDgiIGZpbGw9IiM1NmI4ZGUiLz4KICAgIDxjaXJjbGUgY3g9IjIxLjU4IiBjeT0iMjcuNDUxIiByPSI0LjQwNSIgZmlsbD0iIzAwYjFkNSIvPgogICAgPGNpcmNsZSBjeD0iMjAuOTM3IiBjeT0iMjguMDQ1IiByPSIzLjc2MSIgZmlsbD0idXJsKCNhKSIvPgogICAgPGNpcmNsZSBjeD0iMjAuOTM3IiBjeT0iMjguMDQ1IiByPSIzLjc2MSIgZmlsbD0iIzIyMWYxZiIvPgogICAgPGVsbGlwc2UgY3g9Ii0xNS4xNTkiIGN5PSIzMS40MDEiIGZpbGw9IiNmZmYiIHJ4PSIxLjE4OCIgcnk9Ii43NDIiIHRyYW5zZm9ybT0icm90YXRlKC02NS44MzQpIi8+CiAgPC9nPgo8L3N2Zz4K<% } %><% if ( codeCoverageService ) { %>
[coverage]: https://coveralls.io/github/<%= username %>/<%= cleanModuleName %>?branch=master
[coverage-img]: https://coveralls.io/repos/github/<%= username %>/<%= cleanModuleName %>/badge.svg?branch=master<% } %><% if ( prettier ) { %>

<!-- prettier-ignore-end --><% } %>
