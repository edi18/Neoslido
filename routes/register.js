var express = require('express');
var router = express.Router();

const bcrypt = require('bcrypt');

const db = require('../db');

router.get('/', function(req, res, next) {

    res.render('register', { title: 'NeoSlido', });

});

router.post('/', function(req, res, next) {

    let userEmail = req.body['email'];
    let userFirstname = req.body['firstname'];
    let userLastName = req.body['lastname'];
    let plaintextPassword = req.body['pass'];

    db.query('select count(*) as cnt from lecturers where email = $1', [userEmail], function (err, query) {

        if (err) {
            console.log(err.stack);
        }

        // email already exists in db
        if (query.rows[0].cnt > 0) {

            //client.end();

            res.send({ emailExists: true });

        } else {

            const saltRounds = 10;

            bcrypt.genSalt(saltRounds, function(err, salt) {
                bcrypt.hash(plaintextPassword, salt, function(err, hash) {
                    db.query('insert into lecturers(email, firstname, lastname, hash) values ($1, $2, $3, $4)', [userEmail, userFirstname, userLastName, hash], function (err, query2) {
                        if (err) console.error((err.stack));
                        //client.end();
                        res.send({ emailExists: false });
                    });
                });
            });

        }

    });

});

module.exports = router;