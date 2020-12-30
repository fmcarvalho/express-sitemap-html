'use strict'

const express = require('express')
const fs = require('fs')
const handlebars = require('handlebars')
const sitemap = require('../index')

const app = setupWebApp()
const expected = [
    {methods: 'get', path: '/bar'},
    {methods: 'get post', path: '/foo'},
    {methods: 'get', path: 'zaz'},
    {methods: 'get post', path: '/admin'},
    {methods: 'get', path: '/duplicate'},
    {methods: 'get', path: '/duplicate/:id'},
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
    expect(endpoints.length).toBe(expected.length)
    expect(endpoints).toEqual(expected)
})


function setupWebApp() {
    const app = express()
    const router = express.Router()
    app.use(router)
    router.get('/bar', () => {})
    router.get('/foo', () => {})
    app.use('/zaz', () => {})
    app
        .get('/admin',  () => {})
        .post('/admin', () => {})
        .get('/duplicate', () => {})
        .get('/duplicate/:id', () => {})
        .post('/foo', () => {})
        .put('/noo', () => {})
    return app
}