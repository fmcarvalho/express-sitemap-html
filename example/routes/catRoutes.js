const express = require('express')
const router = express.Router()

router.get('/', apiCatGetAllHandler)
router.post('/', apiCatPostHandler)
router.get('/:cat', apiCatGetHandler)
router.put('/:cat', apiCatPutHandler)
router.delete('/:cat', apiCatDeleteHandler)



function apiCatGetAllHandler(req, res) {
    res.send(`cat`)
}

function apiCatPostHandler(req, res) {
    console.log(`cat "${req.body.cat}" Created`)
    res.send(`cat "${req.body.cat}" Created`)
}

function apiCatGetHandler(req, res) {
    console.log(`Sending cat "${req.params.cat}"`)
    res.send(req.params.cat)
}

function apiCatPutHandler(req, res) {
    console.log(`cat "${req.params.cat}" Updated to:
${req.body.cat}`)
    res.send(`cat "${req.params.cat}" Updated`)
}

function apiCatDeleteHandler(req, res) {
    console.log(`cat "${req.params.cat}" Deleted`)
    res.send(`cat "${req.params.cat}" Deleted`)
}

module.exports = router