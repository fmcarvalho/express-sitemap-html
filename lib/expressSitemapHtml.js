'use strict'

const fs = require('fs')
const handlebars = require('handlebars')
const { pathToRegexp } = require('path-to-regexp')
const swaggerUi = require('swagger-ui-express')
const {
    Endpoint,
    swaggerPathMethod, 
    swaggerQueryParam, 
    swaggerPathParam
} = require('./typedefs')

const view = handlebars.compile(
    fs.readFileSync(__dirname + '/sitemap.hbs').toString())

handlebars.registerHelper('includes', (arr, word) => arr.includes(word))

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

let swaggerTag

/**
 * @param {String} name Name to group endpoints on same tag.
 * @param {Express} app An express instance
 */
function swagger(name, app) {
    if(swaggerTag) return // We have already included swagger middlewares
    swaggerTag = name
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
            const pathMethod = swaggerPathMethod(name, r.bodyParams.length != 0)
            swaggerDocument.paths[r.path][r.method] = pathMethod
            r.routeParams.forEach(arg => pathMethod.parameters.push(swaggerPathParam(arg)))
            r.queryParams.forEach(arg => pathMethod.parameters.push(swaggerQueryParam(arg)))
            r.bodyParams.forEach(arg => {
                pushBodyParam(pathMethod, 'x-www-form-urlencoded', arg)
                pushBodyParam(pathMethod, 'json', arg)
            })
        })
    return swaggerDocument
}

/**
 * @param {SwaggerPathMethod} pathMethod 
 * @param {('x-www-form-urlencoded'|'json')} kind 
 * @param {String} argName Argument name
 */
function pushBodyParam(pathMethod, kind, argName) {
    pathMethod
        .requestBody
        .content[`application/${kind}`]
        .schema
        .properties[argName] = { 'type': 'string' }
}

/**
 * Returns an array of Endpoint objects containing: the methods;
 * the path for each route of app parameter; and the parameters names;
 * @param {Express} app An express instance
 * @returns {Array<Endpoint>} An array of Enpoint objects
 */
function swaggerRoutes(app) {
    const endpoints = parseRoutes(app)
    parseAndAddQueryParameters(endpoints)
    parseAndAddBodyParameters(endpoints)
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
            keys.forEach(arg => route.path = route.path.replace(`:${arg.name}`, `{${arg.name}}`))
        })
}
/**
 * @param {Array<Endpoint>} endpoints array of Enpoint objects
 */
function parseAndAddQueryParameters(endpoints) {
    endpoints
        .forEach(route => {
            if(!route.handles) return
            const keys = route.handles.flatMap(h => parseParams(h, 'req', 'query'))
            route.addQueryParams(keys)
        })
}
/**
 * @param {Array<Endpoint>} endpoints array of Enpoint objects
 */
function parseAndAddBodyParameters(endpoints) {
    endpoints
        .forEach(route => {
            if(!route.handles) return
            const keys = route.handles.flatMap(h => parseParams(h, 'req', 'body'))
            route.addBodyParams(keys)
        })
}

/**
 * @param {Function} handle Express router handler function.
 * @param {String} reqParam The name of the request parameter in Express handler funciton.
 * @param {('query'|'body')} kind The property to lookup in request parameter.
 * @returns {Array<String>} Names of the parameters.
 */
function parseParams(handle, reqParam, kind) {
    const args = new RegExp(`${reqParam}\\.${kind}\\.(\\w*)\\W`, 'g')
    const input = removeComments(handle.toString())
    const keys = []
    let match
    while (match = args.exec(input))
        keys.push(match[1])
    return keys
}

/**
 * Builds an express middleware that renders an HTML sitemap based
 * on the routes of app parameter.
 * @param {Express} app An express instance
 */
function sitemap(app) {
    swagger('sitemap', app)
    let html
    return (req, res) => {
        if(!html) {
            const routes = parseRoutes(app)
            html = view({routes})
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
    const routes = parseStack('', app._router.stack).filter(r => !r.path.includes('api-docs'))
    /**
     * Add begining slash if absent on every route
     */
    routes.forEach(r => { if(!r.path.startsWith('/'))  r.path = '/' + r.path })
    /**
     * Infer route parameters from path definition.
     */
    parseAndAddRouteParameters(routes)
    /**
     * Add swaggerPath for each route.
     */
    routes.forEach(r => {
        const path = r
            .routeParams
            .reduce((p, arg) => p.replace(`{${arg}}`, `_${arg}_`), r.path)
            .replaceAll('/', '_')
        r.swaggerPath = `/api-docs/#/${swaggerTag}/${r.method}${path}`
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
    const methods = route.methods
    return new Endpoint(
        Object.keys(methods).join(' '),
        prev + route.path,
        route.stack.map(r => r.handle))
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

function removeComments(str) {
    return str.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1')
}

String.prototype.replaceAll = function(search, replacement) {
    const target = this
    return target.replace(new RegExp(search, 'g'), replacement)
}