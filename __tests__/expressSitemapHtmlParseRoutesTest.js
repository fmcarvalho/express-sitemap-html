'use strict'

const express = require('express')
const fs = require('fs')
const handlebars = require('handlebars')
const frisby = require('frisby')
const sitemap = require('../index')
const expectedSwagger = require('./expectedSwagger.json')

const app = setupWebApp()
const expected = [
    {methods: 'post get', path: '/api/foo'},
    {methods: 'get', path: '/api/bar'},
    {methods: 'get', path: '/zaz'},
    {methods: 'get post', path: '/admin'},
    {methods: 'put', path: '/duplicate/:id/group/:nick'},
    {methods: 'get', path: '/duplicate/:id'},
    {methods: 'get', path: '/duplicate'},
    {methods: 'post', path: '/foo'},
    {methods: 'put', path: '/noo'},
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
    router.post('/foo', () => {})
    router.get('/bar', () => {})
    router.get('/foo', () => {})
    app.use('/zaz', () => {})
    app
        .get('/admin',  () => {})
        .post('/admin', () => {})
        .put('/duplicate/:id/group/:nick', () => {})
        .get('/duplicate/:id', () => {})
        .get('/duplicate', () => {})
        .post('/foo', () => {})
        .put('/noo', () => {})
    return app
}