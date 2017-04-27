# express-sitemap-html

[![Build](https://travis-ci.org/fmcarvalho/express-sitemap-html.svg?branch=master)](https://travis-ci.org/fmcarvalho/express-sitemap-html)
[![Coverage Status](https://coveralls.io/repos/github/fmcarvalho/express-sitemap-html/badge.svg?branch=master)](https://coveralls.io/github/fmcarvalho/express-sitemap-html?branch=master)
[![Version npm](https://img.shields.io/npm/v/express-sitemap-html.svg)](https://www.npmjs.com/package/express-sitemap-html)

An express middleware that builds an HTML sitemap dynamically.
This is not an alternative to [sitemap.xml](https://en.wikipedia.org/wiki/Site_map),
but an additional feature that helps users (and developers) to find and test
routes of an express application.

## Usage

[express-sitemap-html](https://www.npmjs.com/package/express-sitemap-html)
offers an easy way to get an up-to-date HTML index with the endpoints
of an express application. 
It renders a snapshot of all paths of your express application, as links
to the corresponding pages, which you can easily navigate.
Something that you can get from `/sitemap` path (or any other specified path)
as a table of contents of your application -- a listing of all available paths
corresponding to the routes configured on an express application.
Not as XML, but as a user friendly HTML view.
And, whenever a route has a different method from `GET` (e.g. `PUT`, `POST`)
you can easily pass arguments and a body and perform the corresponding HTTP
request (TBD).
This is particularly useful for developers that need to run, navigate
and check a couple of paths without a corresponding UI.

```js
const express = require('express')
const sitemap = require('express-sitemap-html')

const app = express()
//... configure routes for the app express

// Add a route to the sitemap
app.get('/sitemap', sitemap(app))
```

## Installation

    $ npm install express-sitemap-html

## License

[MIT](https://github.com/fmcarvalho/express-sitemap-html/blob/master/LICENSE)
