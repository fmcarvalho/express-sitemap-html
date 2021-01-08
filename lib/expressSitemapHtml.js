'use strict'

const fs = require('fs')
const handlebars = require('handlebars')
const { pathToRegexp } = require('path-to-regexp')
const swaggerUi = require('swagger-ui-express')

const view = handlebars.compile(
    fs.readFileSync(__dirname + '/sitemap.hbs').toString())

handlebars.registerHelper('includes', (arr, word) => arr.includes(word))

/**
 * @typedef Endpoint
 * @property {String} methods The HTTP methods available for the path of this endpoint.
 * @property {String} path The path for this endpoint.
 * @property {Function} handle The middleware function associated to this route.
 * @property {Array<String>} routeParams An array with route parameters names.
 * @property {Array<String>} queryParams An array with query parameters names.
 * @property {Array<String>} bodyParams An array with body parameters names.
 */
class Endpoint {
    /**
     * @param {String} methods The HTTP methods available for the path of this endpoint.
     * @param {String} path The path for this endpoint.
     * @param {Function} handle The middleware function associated to this route.
     */
    constructor(methods, path, handle) {
        this.methods = methods
        this.path = path
        this.handle = handle
        this.routeParams = []
        this.queryParams = []
        this.bodyParams = []
    }
    /**
     * @param {Array<String>} keys Array of strings with parameters names.
     */
    addRouteParams(keys) {
        this.routeParams.push.apply(this.routeParams, keys)
    }
}
/**
 * Exports a function that builds a middleware to render an HTML sitemap
 * for an express application.
 * This function also has properties:
 *   * parseRoutes() - a function that returns an array of Endpoint objects for a
 *     given express app.
 *   * swaggerJson() - a function that return an Open API specification for an
 *     express instance.
 *   * swagger() - a function that installs two middleware handlers on app express
 *     instance to provide a swagger UI for all routes of that app.
 */
module.exports = sitemap
sitemap.parseRoutes = parseRoutes
sitemap.swaggerJson = swaggerJson
sitemap.swagger = swagger
sitemap.Endpoint = Endpoint

/**
 * @param {String} name Name to group endpoints on same tag.
 * @param {Express} app An express instance
 */
function swagger(name, app) {
    app.use('/api-docs', swaggerUi.serve)
    app.get('/api-docs', swaggerUi.setup(swaggerJson(name, app)))
}

/**
 * @param {String} name Name to group endpoints on same tag.
 * @param {Express} app An express instance
 */
function swaggerJson(name, app) {
    const routes = swaggerRoutes(app)
    const swaggerDocument = {
        'openapi': '3.0.0',
        'paths': {}
    }    
    routes
        .forEach(r => {
            if(!swaggerDocument.paths[r.path]) 
                swaggerDocument.paths[r.path] = {}
            const pathMethod = swaggerPathMethod(name)
            swaggerDocument.paths[r.path][r.methods] = pathMethod
            r.routeParams.forEach(arg => pathMethod.parameters.push(swaggerPathParam(arg.name)))
        })
    return swaggerDocument
}

/**
 * Returns an array of Endpoint objects containing: the methods;
 * the path for each route of app parameter; amd the parameters names;
 * @param {Express} app An express instance
 * @returns {Array<Endpoint>} An array of Enpoint objects
 */
function swaggerRoutes(app) {
    const endpoints = parseRoutes(app)
    parseAndAddRouteParameters(endpoints)
    return endpoints
}

/**
 * @param {Array<Endpoint>} endpoints array of Enpoint objects
 */
function parseAndAddRouteParameters(endpoints) {
    endpoints
        .forEach(route => {
            const keys = []
            pathToRegexp(route.path, keys)
            route.addRouteParams(keys)
            if(keys.length == 0) return
            keys.forEach(arg => route.path = route.path.replace(`:${arg.name}`, `{${arg.name}}`))
        })
}
/**
 * @param {Array<Endpoint>} endpoints array of Enpoint objects
 */
function parseAndAddBodyParameters(endpoints) {
    endpoints
        .forEach(route => {
            
        })
}

function parseParams(handle, reqParam) {
    const args = new RegExp(`${reqParam}\\.body\\.(\\w*)\\W`, 'g')
    const input = handle.toString()
    const keys = []
    let match
    while (match = args.exec(input))
        keys.push(match[1])
}

/**
 * Builds an express middleware that renders an HTML sitemap based
 * on the routes of app parameter.
 * @param {Express} app An express instance
 */
function sitemap(app) {
    let html
    return (req, res) => {
        if(!html) {
            const routes = parseRoutes(app)
            html = view(routes)
        }
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
    const routes = parseStack('', app._router.stack)
    routes.forEach(r => {
        if(!r.path.startsWith('/')) 
            r.path = '/' + r.path
    })
    return routes
}

/**
 * @param {String} prev The path of the parent route containing the stack parameter.
 * @return {Array<Endpoint>} stack An  array of express routes.
 */
function parseStack(prev, stack) {
    return stack
        .map(item => {
            if(item.route) {
                const ep = buildEndpoint(prev, item.route)
                return ep
            }
            const next = buildPrev(prev, item.regexp, item.path)
            if(item.handle && item.handle.stack) 
                return parseStack(next, item.handle.stack)
            return next == ''? undefined : new Endpoint('get', next)
        })
        .filter(item => item != undefined)
        .reduce(concat, [])
}

function buildEndpoint(prev, route) {
    let handle
    if(route.stack && route.stack[0])
        handle = route.stack[0].handle
    const methods = route.methods
    return new Endpoint(
        Object.keys(methods).join(' '),
        prev + route.path,
        handle)
}

/**
 * @typedef SwaggerPathMethod
 * @property {Array<String>} tags
 * @property {Array} parameters
 * @property {Array} responses
 */
/**
 * @param {String} tag 
 * @returns {SwaggerPathMethod}
 */
function swaggerPathMethod(tag) {
    return {
        'tags': [tag],
        'parameters': [],
        'responses': {}
    }
}

/**
 * @typedef SwaggerPathParam
 * @property {String} in
 * @property {String} name
 * @property {Boolean} required
 */
function swaggerPathParam(name) {
    return {
        'in': 'path',
        'name': name,
        'required': 'true'
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