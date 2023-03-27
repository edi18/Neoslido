var express = require('express');
var router = express.Router();

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const db = require('../db');

router.get('/', function(req, res, next) {

    // check if user is banned
    db.query('select banned from lecturers where email = $1', [req.cookies.user.email], (err, query) => {
        if (err) {
            console.log(err);
        }
        let banned = false;
        let currentDate = new Date();
        //console.log(query.rows);
        let banDuration = query.rows[0].banned;
        if (banDuration !== null && currentDate < banDuration) {
            banned = true;
        }
        res.render('create', { title: 'NeoSlido', user: req.cookies.user, banned: banned });
        //client.end();
    })
});

router.post('/', upload.single('img'), function(req, res, next) {

    let img = req.file;

    // mail report to do
    // let dayInMilliseconds = 1000 * 60 * 60 * 24;
    // setInterval(function () {
    //
    // }, dayInMilliseconds);

    if (img) {
        db.query('insert into courses(lecturer, title, img, startdate, enddate) values($1, $2, $3, $4, $5)', [req.cookies.user.email, req.body.title, img, req.body.start, req.body.end], function (err, query) {
            if (err) {
                console.error(err);
            }

            res.redirect('courses');

            //client.end();
        });
    } else {
        db.query('insert into courses(lecturer, title, img, startdate, enddate) values($1, $2, null, $3, $4)', [req.cookies.user.email, req.body.title, req.body.start, req.body.end], function (err, query) {
            if (err) {
                console.error(err);
            }

            res.redirect('courses');

            //client.end();
        });
    }

});

module.exports = router;
