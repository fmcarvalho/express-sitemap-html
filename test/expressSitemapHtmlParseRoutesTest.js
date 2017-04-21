'use strict'

const express = require('express')
const sitemap = require('./../index')

module.exports.testParseRoutes = function(test) {
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