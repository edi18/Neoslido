var express = require('express');
var router = express.Router();

const bcrypt = require('bcrypt');

const db = require('../db');

router.get('/', function(req, res, next) {

    let cookie = req.cookies.user;
    if (!cookie) {
        res.render('login', { title: 'NeoSlido' });
    }
    else {
        res.send('You are already logged in.');
    }

});

router.post('/', function(req, res, next) {

    let email = req.body.email;
    let pass = req.body.pass;

    db.query('select * from lecturers where email = $1', [email], function(err, query) {

        if (err) {
            console.error(err);
        }

        // found specified email
        if (query.rows.length !== 0) {

            bcrypt.compare(pass, query.rows[0].hash, function (err, cmp) {

                if (cmp === true) {

                    res.cookie('user', {
                        email: query.rows[0].email,
                        firstname: query.rows[0].firstname,
                        lastname: query.rows[0].lastname
                    });

                    //client.end();

                    res.send({failed: false});

                    //res.redirect('courses');

                } else {

                    //client.end();

                    res.send({failed: true});

                }

            });

        } else {  // didn't find email

            //client.end();

            res.send({ failed: true });

        }

    });

});

module.exports = router;