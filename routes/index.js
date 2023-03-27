var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'NeoSlido', user: req.cookies.user });
});

router.post('/', function (req, res, next) {
    res.redirect('course/' + req.body.code);
});

module.exports = router;
