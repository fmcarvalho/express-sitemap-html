'use strict'

const fs = require('fs')
const handlebars = require('handlebars')
const view = handlebars.compile(
    fs.readFileSync(__dirname + '/sitemap.hbs').toString())

handlebars.registerHelper('includes', (arr, word) => arr.includes(word))

sitemap.parseRoutes = parseRoutes

/**
 * Exports a function that builds a middleware to render a html sitemap
 * for an express application.
 * This function also has a property parseRoutes, which is a function
 * that returns an array of Endpoint objects for a given express app.
 */
module.exports = sitemap

/**
 * Builds an express middleware that renders a html sitemap based
 * on the routes of app parameter.
 * @param {Express} app An express instance
 */
function sitemap(app) {
    let toc
    return (req, res) => {
        if(!toc) toc = parseRoutes(app)
        const html = view(toc)
        res.set({
            'Content-Type': 'text/html',
            'Content-Length': html.length
        })
        res.send(html)
    }
}

/**
 * Returns an array of Enddpoint objects containing: the methods; and
 * the path for each route of app parameter.
 * @param {Express} app An express instance.
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