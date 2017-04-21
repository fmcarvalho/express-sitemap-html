'use strict'

const express = require('express')
const fs = require('fs')
const handlebars = require('handlebars')
const sitemap = require('./../index')

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

module.exports.testSiteMap = function(test) {
    const view = handlebars.compile(
        fs.readFileSync(__dirname + './../lib/sitemap.hbs').toString())
    const expectedHtml = view(expected)
    const req = null
    sitemap(app)(req, {
        set: (headers) => {
            test.equal(headers['Content-Type'], 'text/html')
            test.equal(headers['Content-Length'], expectedHtml.length)
        },
        send: (data) => {
            test.deepEqual(data, expectedHtml)
            test.done()
        }
    })
}

module.exports.testParseRoutes = function(test) {
    const endpoints = sitemap.parseRoutes(app)
    test.equal(endpoints.length, expected.length)
    expected.forEach((ep, index) => test.deepEqual(endpoints[index], ep))
    test.done()
}

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