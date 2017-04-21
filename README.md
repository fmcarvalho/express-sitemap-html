# express-sitemap-html

[![Build](https://travis-ci.org/fmcarvalho/express-sitemap-html.svg?branch=master)](https://travis-ci.org/fmcarvalho/express-sitemap-html)
[![Coverage Status](https://coveralls.io/repos/github/fmcarvalho/express-sitemap-html/badge.svg?branch=master)](https://coveralls.io/github/fmcarvalho/express-sitemap-html?branch=master)
[![Version npm](https://img.shields.io/npm/v/express-sitemap-html.svg)](https://www.npmjs.com/package/express-sitemap-html)

[express-sitemap-html](https://www.npmjs.com/package/express-sitemap-html)
is a middleware builder, which renders an HTML sitemap dynamically for
an express application.
  
## Installation

    $ npm install express-sitemap-html

## Usage

```js
const express = require('express')
const sitemap = require('express-sitemap-html')

const app = express()
//... configure routes for the app express

// Add a route to the sitemap
app.get('/sitemap', sitemap(app))
```

## License

[MIT](https://github.com/fmcarvalho/express-sitemap-html/blob/master/LICENSE)
