var express = require('express');
const bcrypt = require("bcrypt");
var router = express.Router();

const db = require('../db');

/* GET home page. */
router.get('/', function(req, res, next) {

    let cookie = req.cookies.admin;
    if (!cookie) {
        res.render('admin', { title: 'NeoSlido' });
    }
    else {
        res.send('You are already logged in as a superuser.');
    }

});

router.post('/', function (req, res, next) {

    let username = req.body.username;
    let pass = req.body.pass;

    db.query('select * from admins where username = $1', [username], function (err, query) {
        if (err) {
            console.log(err.stack);
        }

        if (query.rows.length !== 0) {
            bcrypt.compare(pass, query.rows[0].hash, function (err, cmp) {
                if (cmp === true) {
                    res.cookie('admin', {username: query.rows[0].username, pass: query.rows[0].hash});
                    //client.end();
                    res.send({ failed: false });
                } else {
                    //client.end();
                    res.send({ failed: true });
                }
            });
        } else {
            //client.end();
            res.send({ failed: true });
        }
    });

});

module.exports = router;
