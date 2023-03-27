var express = require('express');
var router = express.Router();

router.get('/:code', function(req, res, next) {
    res.render('share', { title: 'NeoSlido', user: req.cookies.user, code: req.params.code });
});

module.exports = router;