'use strict'

const sitemap = require('./../index')
const app = require('express')()

// express routing
app.get('/', function(req, res) {
    res.send('hello /')
}).get('/admin', function(req, res) {
    res.send('hello /admin')
}).post('/admin', function(req, res) {
    res.send('hello /admin')
}).get('/duplicate', function(req, res) {
    res.send('hello /duplicate')
}).get('/duplicate/:id', function(req, res) {
    res.send('hello /duplicate')
}).post('/foo', function(req, res) {
    res.send('hello /foo')
}).put('/nooo', function(req, res) {
    res.send('hello /nooo')
})

/*
 * sitemap
 */
app.get('/sitemap', sitemap(app))

// server starting
app.listen(3000)
console.log('starting "sitemap example" on port 3000')