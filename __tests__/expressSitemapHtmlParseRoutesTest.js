'use strict'

const express = require('express')
const fs = require('fs')
const handlebars = require('handlebars')
const frisby = require('frisby')
const sitemap = require('../index')
const Endpoint = sitemap.Endpoint
/**
 * Expected results.
 */
const expectedSwagger = require('./expectedSwagger.json')
const app = setupWebApp()
const expected = [
    new Endpoint('post', '/api/foo', [isAuthenticated, apiFooPostHandler]),
    new Endpoint('get', '/api/bar', [apiBarGetHandler]),
    new Endpoint('get', '/api/foo', [apiFooGetHandler]),
    new Endpoint('get', '/zaz', undefined),
    new Endpoint('get', '/admin', [adminGetHandler]),
    new Endpoint('post', '/admin', [adminPostHandler]),
    new Endpoint('put', '/duplicate/:id/group/:nick', [duplicateGroupPutHandler]),
    new Endpoint('get', '/duplicate/:id', [duplicateGetByIdHandler]),
    new Endpoint('get', '/duplicate', [duplicateGetHandler]),
    new Endpoint('post', '/foo', [fooPostHandler]),
    new Endpoint('put', '/noo', [nooPutHandler])
]

test('Test sitemap', () => {
    const view = handlebars.compile(
        fs.readFileSync(process.cwd() + '/lib/sitemap.hbs').toString())
    const expectedHtml = view(expected)
    const req = null
    const sitemapMw = sitemap(app) // sitemap returns an express Middleware handler
    sitemapMw(req, { // invoke Middleware handler Synchronously
        set: (headers) => {
            expect(headers['Content-Type']).toBe('text/html')
            expect(headers['Content-Length']).toBe(expectedHtml.length)
        },
        send: (data) => {
            expect(data).toEqual(expectedHtml)
        }
    })
})

test('Test parse routes', () => {
    const endpoints = sitemap.parseRoutes(app)
    expect(endpoints).toEqual(expected)
})

test('Test swagger OpenAPI json definition', () => {
    const endpointsJson = sitemap.swaggerJson('vinyl', app)
    expect(endpointsJson).toEqual(expectedSwagger)
})

test('Test swagger', (done) => {
    sitemap.swagger('vinyl', app)
    const server = app.listen(7654, () => {
        frisby
            .get('http://localhost:7654/api-docs')
            .expect('status', 200)
            .then(() => {
                server.close()
                done()
            })
    })
})


function setupWebApp() {
    const app = express()
    const router = express.Router()
    app.use('/api', router)
    router.post('/foo', isAuthenticated, apiFooPostHandler)
    router.get('/bar', apiBarGetHandler)
    router.get('/foo', apiFooGetHandler)
    app.use('/zaz', zasHandler)
    app
        .get('/admin',  adminGetHandler)
        .post('/admin', adminPostHandler)
        .put('/duplicate/:id/group/:nick', duplicateGroupPutHandler)
        .get('/duplicate/:id', duplicateGetByIdHandler)
        .get('/duplicate', duplicateGetHandler)
        .post('/foo', fooPostHandler)
        .put('/noo', nooPutHandler)
    return app
}

function apiFooPostHandler(req, res) {
    const user = req.body.username
    const size = req.body.group.length
    res.send(user + size)
}
function apiBarGetHandler(req, res) {
    const master = req.query.master
    res.send(`hello with master = ${master} and  ${req.query.boss}`)
}
function apiFooGetHandler(req, res) {
    /* Next usages of master and boss should not be infered because they live inside comments.
     *
     */
    
    // const master = req.query.master
    /*
        res.send(`hello with master = ${master} and  ${req.query.boss}`)
    */
}
function isAuthenticated(req, res, next) {
    if(req.user) next()
    else res.status(400).send('Bad Request')
}
function zasHandler(req, res) {} // !!! This function is not captued in Endpoint
function adminGetHandler(req, res) {}
function adminPostHandler(req, res) {}
function duplicateGroupPutHandler(req, res) {}
function duplicateGetByIdHandler(req, res) {}
function duplicateGetHandler(req, res) {}
function fooPostHandler(req, res) {}
function nooPutHandler(req, res) {}