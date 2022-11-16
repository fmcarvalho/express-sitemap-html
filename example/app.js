'use strict'

const sitemap = require('./../index')
const express = require('express')

const app = express()
const core = new express.Router()
const other = new express.Router()
const departmentsRouter = new express.Router()

app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use('/core', core)
app.use(other)

departmentsRouter.get('/', (req, res) => res.send('hello /api/departments/'))
departmentsRouter.get('/html', (req, res) => res.send('hello /api/departments/html'))
departmentsRouter.get('/:departmentNumber', (req, res) => res.send('hello /api/departments/:number ' + req.params.departmentNumber))
app.use('/api/departments', departmentsRouter)

// express routing
core.get('/', function(req, res) {
    res.send('hello /')
}).get('/admin', function(req, res) {
    res.send('hello /admin')
}).post('/admin', function(req, res) {
    res.send('hello /admin')
}).get('/duplicate', function(req, res) {
    const master = req.query.master
    res.send(`hello /duplicate with:
        master = ${master} and  ${req.query.boss}`)
}).get('/duplicate/:id', function(req, res) {
    res.send(`hello /duplicate with id = ${req.params.id}`)
})
other.post('/foo', function(req, res) {
    res.send(`hello /foo with:
        master = ${req.body.master} and  ${req.body.boss}`)
}).put('/nooo', function(req, res) {
    res.send('hello /nooo')
}).get('/zas', function(req, res) {
    res.end('hello /zas')
})

/*
 * sitemap
 */
app.get('/sitemap', sitemap(app))
/**
 * Auto generated Swagger UI
 */
sitemap.swagger('Demo', app)

// server starting
app.listen(3000)
console.log('starting "sitemap example" on port 3000')