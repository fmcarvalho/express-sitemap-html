const express = require('express')
const router = express.Router()

router.get('/', function (req, res) {
    res.send(`cat`)
})

router.post('/', function (req, res) {
    console.log(`cat "${req.body.cat}" Created`)
    res.send(`cat "${req.body.cat}" Created`)
})


router.get('/:cat', function (req, res) {
    console.log(`Sending cat "${req.params.cat}"`)
    res.send(req.params.cat)
})

router.put('/:cat', function (req, res) {
    console.log(`cat "${req.params.cat}" Updated to:
${req.body.cat}`)
    res.send(`cat "${req.params.cat}" Updated`)
})

router.delete('/:cat', function (req, res) {
    console.log(`cat "${req.params.cat}" Deleted`)
    res.send(`cat "${req.params.cat}" Deleted`)
})

module.exports = router