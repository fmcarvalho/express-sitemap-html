'use strict'

const fs = require('fs')
const handlebars = require('handlebars')
const { pathToRegexp } = require('path-to-regexp')

const view = handlebars.compile(
    fs.readFileSync(__dirname + '/sitemap.hbs').toString())

handlebars.registerHelper('includes', (arr, word) => arr.includes(word))

/**
 * Exports a function that builds a middleware to render an HTML sitemap
 * for an express application.
 * This function also has a property parseRoutes, which is a function
 * that returns an array of Endpoint objects for a given express app.
 */
module.exports = sitemap
sitemap.parseRoutes = parseRoutes
sitemap.swaggerJson = swaggerJson

const swaggerDocument = {
    'openapi': '3.0.0',
    'paths': {}
}

/**
 * @param {Express} app An express instance
 */
function swaggerJson(name, app) {
    const routes = swaggerRoutes(app)
    routes
        .forEach(r => {
            swaggerDocument.paths[r.path] = {}
            r.methods.split(' ').forEach(verb => {
                swaggerDocument.paths[r.path][verb] = {
                    'tags': [name],
                    'parameters': [],
                    'responses': {}
                }
                r.keys.forEach(arg => {
                    swaggerDocument.paths[r.path][verb].parameters.push({
                        'in': 'path',
                        'name': arg.name,
                        'required': 'true'
                    })
                })
            })
        })
    return swaggerDocument
}

/**
 * @param {Express} app An express instance
 */
function swaggerRoutes(app) {
    const endpoints = parseRoutes(app)
    endpoints
        .forEach(route => {
            const keys = []
            pathToRegexp(route.path, keys)
            route.keys = keys
            if(keys.length == 0) return
            keys.forEach(arg => route.path = route.path.replace(`:${arg.name}`, `{${arg.name}}`))
        })
    return endpoints
}

/**
 * Builds an express middleware that renders an HTML sitemap based
 * on the routes of app parameter.
 * @param {Express} app An express instance
 */
function sitemap(app) {
    let html
    return (req, res) => {
        if(!html) html = view(parseRoutes(app))
        res.set({
            'Content-Type': 'text/html',
            'Content-Length': html.length
        })
        res.send(html)
    }
}

/**
 * Returns an array of Endpoint objects containing: the methods; and
 * the path for each route of app parameter.
 * @param {Express} app An express instance.
 * @returns {Array<Endpoint>} An array of Enpoint objects
 */
function parseRoutes(app) {
    return parseStack('', app._router.stack)
}

/**
 * @param {String} prev The path of the parent route containing the stack parameter.
 * @param {Array} stack An  array of express routes.
 */
function parseStack(prev, stack) {
    const routes = stack
        .map(item => {
            if(item.route) return buildEndpoint(prev, item.route)
            const next = buildPrev(prev, item.regexp, item.path)
            if(item.handle && item.handle.stack) 
                return parseStack(next, item.handle.stack)
            return next == ''? undefined : new Endpoint('get', next)
        })
        .filter(item => item != undefined)
        .reduce(concat, [])
        .groupBy('path')

    return Object
        .keys(routes)
        .map(k => {
            const methods = routes[k].map(ep => ep.methods).join(' ')
            return new Endpoint(methods, k)
        })
}

function buildEndpoint(prev, route) {
    const methods = route.methods
    return new Endpoint(
        Object.keys(methods).join(' '),
        prev + route.path)
}


/**
 * @typedef Endpoint
 * @property {String} methods The HTTP methods available for the path of this endpoint.
 * @property {String} path The path for this endpoint.
 */
class Endpoint {
    constructor(methods, path) {
        this.methods = methods
        this.path = path
    }
}

function buildPrev(prev, regexp, path) {
    if(path) return prev + path
    regexp = regexp.toString().replace('/^\\/', '')
    regexp = regexp.replace('?(?=\\/|$)/i', '')
    regexp = regexp.replace('\\/', '')
    regexp = regexp.replace('/^', '')
    return prev + regexp
}

function concat(arr, curr){
    if(curr instanceof Array) return arr.concat(curr)
    arr.push(curr)
    return arr
}

Array.prototype.groupBy = function(key) {
    return this.reduce((rv, x) => {
        (rv[x[key]] = rv[x[key]] || []).push(x)
        return rv
    }, {})
}