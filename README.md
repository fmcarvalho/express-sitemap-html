# express-sitemap-html

[![Build](https://travis-ci.org/fmcarvalho/express-sitemap-html.svg?branch=master)](https://travis-ci.org/fmcarvalho/express-sitemap-html)
[![Coverage Status](https://coveralls.io/repos/github/fmcarvalho/express-sitemap-html/badge.svg?branch=master)](https://coveralls.io/github/fmcarvalho/express-sitemap-html?branch=master)
[![Version npm](https://img.shields.io/npm/v/express-sitemap-html.svg)](https://www.npmjs.com/package/express-sitemap-html)

An express middleware that builds an HTML sitemap dynamically.
This is **NOT** an alternative to [sitemap.xml](https://en.wikipedia.org/wiki/Site_map),
but an additional feature that helps users (and developers) to find and test
routes of an express application.

## Usage

[express-sitemap-html](https://www.npmjs.com/package/express-sitemap-html)
offers an easy way to get an up-to-date HTML index with the endpoints
of an express application. 
It renders a snapshot of all paths of your express application, as links
to the corresponding pages, which you can easily navigate
(such as a table of contents of your application).

Alternatively you may generate a minimalistic Swagger UI with additional
capabilities for route parameters inferred from installed express routes.


```js
const express = require('express')
const sitemap = require('express-sitemap-html')

const app = express()
//... configure routes for the app express

// Add a route to the sitemap
app.get('/sitemap', sitemap(app))

// Alternatively auto generate and install a swagger UI for given express app:
sitemap.swagger('Your app name', app) // available at /api-docs
```

## Installation

    $ npm install express-sitemap-html

## License

[MIT](https://github.com/fmcarvalho/express-sitemap-html/blob/master/LICENSE)
