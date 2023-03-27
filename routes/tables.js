var express = require('express');
var router = express.Router();

const db = require('../db');

router.get('/', function (req, res, next) {

    db.query('select * from lecturers', function (err, query) {

        db.query('select code, lecturer, title, startdate, enddate from courses where current_date <= enddate', function (err, query2) {

            db.query('select * from forbidden', function (err, query3) {

                res.render('tables', { title: 'Neoslido', admin: req.cookies.admin, lecturers: query.rows, courses: query2.rows, forbidden: query3.rows });

                //client.end();

            });

        });

    });

});

router.post('/newword', function(req, res, next) {

    let word = req.body.word;

    db.query('select forbidden_insert($1) as exists', [word], function (err, query) {

        if (err) {
            console.log(err.stack);
        }

        let exists = query.rows[0].exists;

        //client.end();

        res.send({ inserted: !exists });

    });

});

router.post('/delword', function(req, res, next) {

    let word = req.body.word;

    db.query('delete from forbidden where word = $1', [word], function (err, query) {

        if (err) {
            console.log(err.stack);
        }

        res.sendStatus(201);

    });

});

router.post('/delcourse', function(req, res, next) {

    let course = req.body.course;

    db.query('delete from courses where code = $1', [course], function (err, query) {

        if (err) {
            console.log(err.stack);
        }

        //client.end();

        res.sendStatus(201);

    });

});

router.post('/dellecturer', function(req, res, next) {

    let lecturer = req.body.lecturer;

    db.query('delete from lecturers where email = $1', [lecturer], function (err, query) {

        if (err) {
            console.log(err.stack);
        }

        //client.end();

        res.sendStatus(201);

    });

});

router.post('/ban15', function (req, res, next) {

    let lecturer = req.body.lecturer;

    let date = new Date();
    // 15 day ban from current date
    date.setDate(15 + date.getDate());

    db.query('update lecturers set banned = $1 where email = $2', [date, lecturer], function (err, query) {

        if (err) {
            console.log(err.stack);
        }

        //client.end();

        res.send({ date: date });

    });

});

router.post('/ban30', function (req, res, next) {
    
    let lecturer = req.body.lecturer;

    let date = new Date();
    // 30 day ban from current date
    date.setDate(30 + date.getDate());

    db.query('update lecturers set banned = $1 where email = $2', [date, lecturer], function (err, query) {

        if (err) {
            console.log(err.stack);
        }

        //client.end();

        res.send({ date: date });

    });

});

module.exports = router;